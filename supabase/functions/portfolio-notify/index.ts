import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsForOrigin } from "./cors.ts";

type Notification = { title: string; lines: string[] };
// Escape visitor-controlled Slack markup, including mention/link syntax.
const plain = (value: string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/[\r\n]/g," ").slice(0,500);
async function deliverWebhook(webhook: string, notification: Notification) {
  const response = await fetch(webhook, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `${notification.title}\n${notification.lines.join("\n")}`, mrkdwn: false }),
    signal: AbortSignal.timeout(8000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Notification delivery failed");
}

async function deliverEmail(apiKey: string, to: string, from: string, notification: Notification, idempotencyKey: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ from, to: [to], subject: notification.title, text: notification.lines.join("\n") }),
    signal: AbortSignal.timeout(8000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Notification delivery failed");
}

Deno.serve(async (request: Request) => {
  const corsHeaders = corsForOrigin(request.headers.get("origin"),
    Deno.env.get("PORTFOLIO_ALLOWED_ORIGIN") ?? "https://imlokesh.me",
    Deno.env.get("PORTFOLIO_ALLOW_LOCALHOST") === "true");
  if (!corsHeaders) return new Response("Forbidden", { status: 403, headers: { Vary: "Origin" } });
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  const reply = (body: Record<string, unknown>, status = 200) => Response.json(body,{status,headers:corsHeaders});
  try {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return reply({error:"Expected JSON"},415);
    // Bound streamed bodies as well as Content-Length: do not buffer arbitrary public payloads.
    if (Number(request.headers.get("content-length")) > 1024) return reply({error:"Payload too large"},413);
    const reader = request.body?.getReader();
    if (!reader) return reply({error:"Invalid request"},400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024) { await reader.cancel(); return reply({error:"Payload too large"},413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
    let body: unknown;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply({error:"Invalid JSON"},400); }
    if (!body || typeof body !== "object" || !("sessionId" in body) || typeof body.sessionId !== "string"
      || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.sessionId)) return reply({error:"Invalid request"},400);
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail = Deno.env.get("PORTFOLIO_NOTIFICATION_EMAIL");
    const notificationFrom = Deno.env.get("PORTFOLIO_NOTIFICATION_FROM") ?? "Portfolio Alerts <onboarding@resend.dev>";
    const webhook = Deno.env.get("PORTFOLIO_NOTIFICATION_WEBHOOK_URL");
    const emailConfigured = Boolean(resendKey && notificationEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail!) && notificationEmail!.length <= 254);
    const webhookConfigured = Boolean(webhook && new URL(webhook).protocol === "https:");
    if (!emailConfigured && !webhookConfigured) return reply({delivered:false});
    const client = createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
    const [{data:session,error:sessionError},{data:events,error:eventsError},{data:identity,error:identityError}] = await Promise.all([
      client.from("portfolio_sessions").select("started_at,last_seen_at,referrer,utm_source,returning_session").eq("id",body.sessionId).maybeSingle(),
      client.from("portfolio_events").select("event_type").eq("session_id",body.sessionId).order("created_at",{ascending:true}).limit(120),
      client.from("portfolio_visitor_identity").select("name,company").eq("session_id",body.sessionId).maybeSingle(),
    ]);
    if (sessionError || eventsError || identityError) return reply({delivered:false},503);
    if (!session) return reply({delivered:false});
    const {data:kind,error} = await client.rpc("portfolio_claim_notification",{p_session_id:body.sessionId});
    if (error) return reply({delivered:false},503);
    if (!kind) return reply({delivered:false});
    // Identity may have arrived between the reads and the claim. Fetch its committed value.
    const identified = kind === "identity";
    let details = identity;
    if (identified && !details) {
      const result = await client.from("portfolio_visitor_identity").select("name,company").eq("session_id",body.sessionId).single();
      if (result.error) return reply({delivered:false},503);
      details = result.data;
    }
    const eventNames = (events ?? []).map((event: {event_type:string}) => event.event_type);
    const duration = Math.max(0,Math.round((new Date(session.last_seen_at).getTime()-new Date(session.started_at).getTime())/1000));
    const notification = {
      title:identified ? "👋 Recruiter / Visitor Identified" : "🔥 Engaged Portfolio Visitor",
      lines:[
        ...(identified && details?.name ? [`Name: ${plain(details.name)}`] : []),
        ...(identified && details?.company ? [`Company: ${plain(details.company)}`] : []),
        `Source: ${plain(session.utm_source || session.referrer || "Direct")}`,
        "Approx. Location: Unavailable", // No trusted geolocation integration is configured.
        `Activity: ${[...new Set(eventNames)].join(" → ")}`,
        `Time on site: ${Math.floor(duration/60)}m ${duration%60}s`,
        `Resume opened: ${eventNames.includes("resume_opened") ? "Yes" : "No"}`,
        `Returning session: ${session.returning_session ? "Yes" : "No"}`,
      ],
    };
    if (emailConfigured) {
      await deliverEmail(resendKey!,notificationEmail!,notificationFrom,notification,`portfolio/${body.sessionId}/${kind}`);
      return reply({delivered:true,provider:"email"});
    }
    await deliverWebhook(webhook!,notification);
    return reply({delivered:true,provider:"webhook"});
  } catch {
    // Keep the dispatch claim on failure: a timed-out webhook may already have delivered.
    // No automatic retry can flood the owner or duplicate an ambiguous delivery.
    return reply({delivered:false},502);
  }
});
