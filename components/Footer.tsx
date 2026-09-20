import { portfolio } from "@/portfolio.config";

export function Footer() {
  return (
    <footer className="section-shell footer">
      <div><strong>SYSTEM://LOKESH</strong><span>BUILD: 2026</span><span>STATUS: OPERATIONAL</span></div>
      <div><span>REGION: {portfolio.identity.location.toUpperCase()}</span><span>UPTIME: {portfolio.identity.experienceYears} YEARS ENGINEERING</span></div>
      <div><strong>Built by Lokeshprasanth · 2026</strong><span>© 2026 Lokeshprasanth. All rights reserved.</span></div>
    </footer>
  );
}
