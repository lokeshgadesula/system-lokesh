import { portfolio } from "@/portfolio.config";

const systems = ["Applied AI", "Backend Engineering", "Distributed Systems", "Data Engineering", "Cloud Infrastructure"];

export function SystemStatus() {
  return (
    <section className="section-shell status-section" aria-labelledby="system-status-title">
      <div className="status-console">
        <div>
          <span className="eyebrow">SYSTEM STATUS</span>
          <h2 id="system-status-title">Working across the stack.</h2>
        </div>
        <div className="status-lines">
          {systems.map((system) => (
            <div key={system}><span>{system}</span><i /><strong>ACTIVE</strong></div>
          ))}
        </div>
        <div className="status-objective">
          <span>CURRENT OBJECTIVE</span>
          <strong>Building intelligent infrastructure that stays reliable in production.</strong>
        </div>
        <div className="target-roles">
          <span>TARGET ROLES</span>
          <div>{portfolio.targetRoles.map((role) => <b key={role}>{role}</b>)}</div>
        </div>
      </div>
    </section>
  );
}
