"use client";

import { Eye } from "lucide-react";
import { portfolio } from "@/portfolio.config";
import { useAnalytics } from "./analytics/AnalyticsProvider";

export function Footer() {
  const { enabled, stats } = useAnalytics();
  const live = stats.liveSessions === null ? "—" : stats.liveSessions.toLocaleString();
  const total = stats.totalVisits === null ? "—" : stats.totalVisits.toLocaleString();
  return (
    <footer className="section-shell footer">
      <div><strong>SYSTEM://LOKESH</strong><span>BUILD: 2026</span><span>STATUS: OPERATIONAL</span></div>
      <div className="visitor-counter" aria-label={enabled ? `${live} recently active sessions and ${total} total visits` : "Visitor analytics awaiting configuration"} title={enabled ? "LIVE means browser sessions active within the last 90 seconds." : "Connect Supabase to enable verified visitor counts."}>
        <span className="visitor-online"><i /> SYSTEM ONLINE</span><span><Eye size={13} aria-hidden="true" /> {live} LIVE</span><span>{total} VISITS</span>
      </div>
      <div><strong>Built by Lokeshprasanth · 2026</strong><span>© 2026 Lokeshprasanth. All rights reserved.</span></div>
      <span className="footer-region">REGION: {portfolio.identity.location.toUpperCase()} · UPTIME: {portfolio.identity.experienceYears} YEARS ENGINEERING</span>
    </footer>
  );
}
