import { portfolio } from "@/portfolio.config";

export function Footer() {
  return (
    <footer className="section-shell footer">
      <div><strong>SYSTEM://LOKESH</strong><span>BUILD: 2026.x</span><span>STATUS: OPERATIONAL</span></div>
      <div><span>REGION: {portfolio.identity.location.toUpperCase()}</span><span>UPTIME: {portfolio.identity.experienceYears} YEARS ENGINEERING</span></div>
      <div><span>Next.js / TypeScript / Motion / distributed-systems thinking</span><strong>EOF_</strong></div>
    </footer>
  );
}
