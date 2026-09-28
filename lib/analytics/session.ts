import { analyticsConfigured, requestEngagementNotification, sendEvent, submitIdentity, touchSession } from "./client";
import type { AnalyticsEvent, AnalyticsMetadata, VisitorIdentity } from "./types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function getStored(storage: "local" | "session", key: string) {
  try { return (storage === "local" ? window.localStorage : window.sessionStorage).getItem(key); }
  catch { return null; }
}
export function setStored(storage: "local" | "session", key: string, value: string) {
  try { (storage === "local" ? window.localStorage : window.sessionStorage).setItem(key, value); }
  catch { /* Storage is optional. */ }
}
export function trackingAllowed() {
  return analyticsConfigured && navigator.doNotTrack !== "1"
    && (window as Window & { doNotTrack?: string }).doNotTrack !== "1"
    && !/bot|crawler|spider|headless|lighthouse|pagespeed|preview/i.test(navigator.userAgent);
}

// One coordinator per document survives Strict Mode effect replay and component remounts.
let session: ReturnType<typeof createSession> | undefined;
let ready = false;
let pendingTouch: Promise<boolean> | undefined;
let tail: Promise<unknown> = Promise.resolve();
const completed = new Set<string>();
const inFlight = new Map<string, Promise<boolean>>();
const eventIds = new Map<string, string>();

function createSession() {
  const previousId = getStored("session", "portfolio-session-id");
  const existing = previousId && uuid.test(previousId) ? previousId : null;
  const previousReturning = getStored("session", "portfolio-session-returning");
  // Capture the previous visit BEFORE setting the persistent flag. Keep it for this session.
  const returning = existing ? previousReturning === "1" : getStored("local", "portfolio-returning") === "1";
  const id = existing || crypto.randomUUID();
  setStored("session", "portfolio-session-id", id);
  setStored("session", "portfolio-session-returning", returning ? "1" : "0");
  setStored("local", "portfolio-returning", "1");
  const ua = navigator.userAgent;
  const params = new URLSearchParams(window.location.search);
  let referrer = "";
  try { referrer = new URL(document.referrer).origin; } catch { /* Direct visit. */ }
  return {
    sessionId: id, isNew: !existing, returning, referrer,
    path: window.location.pathname.slice(0, 300),
    device: /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "desktop",
    browser: /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Other",
    utm: { source: params.get("utm_source")?.slice(0,100) ?? "", medium: params.get("utm_medium")?.slice(0,100) ?? "", campaign: params.get("utm_campaign")?.slice(0,100) ?? "" },
  };
}
export function isReturningSession() { return session?.returning ?? false; }

async function ensureSession(heartbeat = false): Promise<boolean> {
  if (!trackingAllowed()) return false;
  session ??= createSession();
  if (pendingTouch) return pendingTouch;
  if (ready && !heartbeat) return true;
  pendingTouch = touchSession(session).then(result => {
    ready = result?.accepted === true;
    return ready;
  }).finally(() => { pendingTouch = undefined; });
  return pendingTouch;
}

// Serialize writes so a notification never overtakes its triggering activity/identity.
function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const result = tail.then(work);
  tail = result.catch(() => undefined);
  return result;
}
export function recordAnalytics(event: AnalyticsEvent, metadata: AnalyticsMetadata = {}, onceKey?: string): Promise<boolean> {
  if (!trackingAllowed()) return Promise.resolve(false);
  const key = onceKey ?? crypto.randomUUID();
  if (completed.has(key)) return Promise.resolve(true);
  const pending = inFlight.get(key);
  if (pending) return pending;
  if (inFlight.size >= 120) return Promise.resolve(false);
  const eventId = eventIds.get(key) ?? crypto.randomUUID();
  eventIds.set(key, eventId);
  const path = window.location.pathname.slice(0, 300);
  const work = enqueue(async () => {
    if (!await ensureSession() || !session) return false;
    let result = await sendEvent(session.sessionId, event, path, metadata, eventId);
    // Retry a lost acknowledgement with the SAME event ID; SQL deduplicates it.
    if (!result) result = await sendEvent(session.sessionId, event, path, metadata, eventId);
    if (!result?.accepted) return false;
    if (onceKey) completed.add(key);
    eventIds.delete(key);
    if (event === "engaged_visitor") await requestEngagementNotification(session.sessionId);
    return true;
  }).catch(() => false).finally(() => { inFlight.delete(key); if (!onceKey) eventIds.delete(key); });
  inFlight.set(key, work);
  return work;
}
export async function startAnalytics() {
  if (!await ensureSession()) return false;
  await recordAnalytics("session_started", { returning: isReturningSession() }, "session-start");
  return recordAnalytics("page_view", { title: document.title }, "page-view");
}
export async function heartbeatAnalytics() {
  if (document.visibilityState !== "visible") return false;
  if (!await ensureSession(true)) return false;
  return startAnalytics();
}
export function identifyAnalytics(identity: VisitorIdentity) {
  return enqueue(async () => {
    if (!await ensureSession() || !session) return;
    const result = await submitIdentity(session.sessionId, identity);
    if (!result?.accepted) return;
    // The database records visitor_identified in the same transaction as identity storage.
    await requestEngagementNotification(session.sessionId);
  }).catch(() => undefined);
}
