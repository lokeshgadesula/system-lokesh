"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { analyticsConfigured, getVisitorStats } from "@/lib/analytics/client";
import { getStored, setStored, trackingAllowed, startAnalytics, heartbeatAnalytics, recordAnalytics, identifyAnalytics, isReturningSession } from "@/lib/analytics/session";
import { isEngaged, isHighIntentEvent } from "@/lib/analytics/engagement";
import type { AnalyticsEvent, AnalyticsMetadata, VisitorIdentity, VisitorStats } from "@/lib/analytics/types";

type AnalyticsContextValue = {
  enabled: boolean;
  stats: VisitorStats;
  recruiterMode: boolean;
  identityPromptOpen: boolean;
  openRecruiterMode: () => void;
  closeRecruiterMode: () => void;
  requestIdentity: () => void;
  dismissIdentity: () => void;
  identify: (identity: VisitorIdentity) => Promise<void>;
  track: (event: AnalyticsEvent, metadata?: AnalyticsMetadata) => void;
};

const emptyStats: VisitorStats = { liveSessions: null, totalVisits: null };
const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<VisitorStats>(emptyStats);
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [identityPromptOpen, setIdentityPromptOpen] = useState(false);
  const enabled = useRef(false);
  const visibleSince = useRef(0);
  const visibleMilliseconds = useRef(0);
  const sections = useRef(new Set<string>());
  const highIntent = useRef(false);
  const engagementSent = useRef(false);

  const evaluateEngagement = useCallback(async () => {
    if (!enabled.current || engagementSent.current) return;
    const returning = isReturningSession();
    const seconds = Math.floor((visibleMilliseconds.current + (visibleSince.current ? Date.now() - visibleSince.current : 0)) / 1000);
    if (!isEngaged({ seconds, sections: sections.current.size, returning, highIntent: highIntent.current })) return;
    engagementSent.current = true;
    const result = await recordAnalytics("engaged_visitor", {
      seconds,
      sections: sections.current.size,
      returning,
    }, "engagement");
    if (!result) engagementSent.current = false;
  }, []);

  const track = useCallback((event: AnalyticsEvent, metadata: AnalyticsMetadata = {}) => {
    if (!enabled.current) return;
    if (event === "section_viewed" && typeof metadata.section === "string") {
      if (sections.current.has(metadata.section)) return;
      sections.current.add(metadata.section);
    }
    if (isHighIntentEvent(event)) highIntent.current = true;
    void recordAnalytics(event, metadata, event === "section_viewed" ? `section:${metadata.section}` : undefined).then((accepted) => {
      if (!accepted && event === "section_viewed" && typeof metadata.section === "string") sections.current.delete(metadata.section);
      if (enabled.current) void evaluateEngagement();
    });
  }, [evaluateEngagement]);

  useEffect(() => {
    enabled.current = trackingAllowed();
    if (!enabled.current) return;
    if (document.visibilityState === "visible") visibleSince.current = Date.now();
    let disposed = false;
    let heartbeatPending = false;
    void startAnalytics();

    const heartbeat = () => {
      if (document.visibilityState !== "visible" || heartbeatPending || disposed) return;
      heartbeatPending = true;
      void heartbeatAnalytics().then((accepted) => {
        if (accepted && !disposed) void evaluateEngagement();
      }).finally(() => { heartbeatPending = false; });
    };
    const interval = window.setInterval(heartbeat, 30_000);
    const onVisibility = () => {
      if (visibleSince.current) visibleMilliseconds.current += Date.now() - visibleSince.current;
      visibleSince.current = document.visibilityState === "visible" ? Date.now() : 0;
      heartbeat();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      if (visibleSince.current) visibleMilliseconds.current += Date.now() - visibleSince.current;
      visibleSince.current = 0;
      enabled.current = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [evaluateEngagement]);

  useEffect(() => {
    if (!analyticsConfigured) return;
    let disposed = false;
    let pending = false;
    const refresh = async () => {
      if (pending || document.visibilityState !== "visible") return;
      pending = true;
      const result = await getVisitorStats();
      if (!disposed) setStats(result);
      pending = false;
    };
    void refresh();
    const interval = window.setInterval(refresh, 45_000);
    return () => { disposed = true; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target.id) track("section_viewed", { section: entry.target.id });
      }
    }, { threshold: 0.45 });
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [track]);

  const value = useMemo<AnalyticsContextValue>(() => ({
    enabled: analyticsConfigured,
    stats,
    recruiterMode,
    identityPromptOpen,
    openRecruiterMode: () => {
      setRecruiterMode(true);
      track("recruiter_mode_opened");
      if (getStored("session", "portfolio-identity-prompted") !== "1") setIdentityPromptOpen(true);
    },
    closeRecruiterMode: () => setRecruiterMode(false),
    requestIdentity: () => {
      if (getStored("session", "portfolio-identity-prompted") !== "1") setIdentityPromptOpen(true);
    },
    dismissIdentity: () => {
      setStored("session", "portfolio-identity-prompted", "1");
      setIdentityPromptOpen(false);
    },
    identify: async (identity) => {
      setStored("session", "portfolio-identity-prompted", "1");
      setIdentityPromptOpen(false);
      if (!enabled.current || (!identity.name?.trim() && !identity.company?.trim())) return;
      await identifyAnalytics(identity);
    },
    track,
  }), [identityPromptOpen, recruiterMode, stats, track]);

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const value = useContext(AnalyticsContext);
  if (!value) throw new Error("useAnalytics must be used inside AnalyticsProvider");
  return value;
}
