import type { AnalyticsEvent, AnalyticsMetadata, VisitorIdentity, VisitorStats } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const analyticsConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function headers() {
  return {
    apikey: supabaseAnonKey ?? "",
    Authorization: `Bearer ${supabaseAnonKey ?? ""}`,
    "Content-Type": "application/json",
  };
}
async function rpc<T>(name: string, body: Record<string, unknown>, keepalive = false): Promise<T | null> {
  if (!analyticsConfigured || !supabaseUrl) return null;
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      keepalive,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export function touchSession(input: {
  sessionId: string;
  isNew: boolean;
  returning: boolean;
  referrer: string;
  path: string;
  device: string;
  browser: string;
  utm: Record<string, string>;
}) {
  return rpc<{ accepted: boolean }>("portfolio_session_touch", {
    p_session_id: input.sessionId,
    p_is_new: input.isNew,
    p_returning: input.returning,
    p_referrer: input.referrer,
    p_path: input.path,
    p_device_category: input.device,
    p_browser_category: input.browser,
    p_utm_source: input.utm.source || null,
    p_utm_medium: input.utm.medium || null,
    p_utm_campaign: input.utm.campaign || null,
  }, true);
}

export function sendEvent(sessionId: string, event: AnalyticsEvent, path: string, metadata: AnalyticsMetadata = {}, eventId: string = crypto.randomUUID()) {
  return rpc<{ accepted: boolean; newly_engaged?: boolean }>("portfolio_record_event", {
    p_session_id: sessionId,
    p_event_type: event,
    p_event_id: eventId,
    p_path: path,
    p_metadata: metadata,
  }, true);
}

export function submitIdentity(sessionId: string, identity: VisitorIdentity) {
  return rpc<{ accepted: boolean }>("portfolio_identify_visitor", {
    p_session_id: sessionId,
    p_name: identity.name?.trim() || null,
    p_company: identity.company?.trim() || null,
  }, true);
}

export async function getVisitorStats(): Promise<VisitorStats> {
  const result = await rpc<Array<{ live_sessions: number; total_visits: number }> | { live_sessions: number; total_visits: number }>("portfolio_public_stats", {});
  const row = Array.isArray(result) ? result[0] : result;
  return {
    liveSessions: typeof row?.live_sessions === "number" ? row.live_sessions : null,
    totalVisits: typeof row?.total_visits === "number" ? row.total_visits : null,
  };
}

export async function requestEngagementNotification(sessionId: string) {
  if (!analyticsConfigured || !supabaseUrl) return;
  try {
    await fetch(`${supabaseUrl}/functions/v1/portfolio-notify`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ sessionId }),
      keepalive: true,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Analytics must never interfere with the portfolio.
  }
}
