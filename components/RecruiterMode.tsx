"use client";

import { useEffect } from "react";
import { Download, FileText, Github, Linkedin, Mail, MoveUpRight, X } from "lucide-react";
import { portfolio } from "@/portfolio.config";
import { useAnalytics } from "./analytics/AnalyticsProvider";

export function RecruiterMode() {
  const { recruiterMode, closeRecruiterMode, requestIdentity, track } = useAnalytics();
  useEffect(() => {
    if (!recruiterMode) return;
    const previous = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeRecruiterMode(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [closeRecruiterMode, recruiterMode]);
  if (!recruiterMode) return null;

  const leadExperience = portfolio.experience.slice(0, 2);

  return (
    <div className="recruiter-mode" role="dialog" aria-modal="true" aria-labelledby="recruiter-title">
      <div className="recruiter-shell">
        <header className="recruiter-head">
          <div><span className="eyebrow">RECRUITER MODE / HIRING BRIEF</span><strong>SYSTEM://LOKESH</strong></div>
          <button type="button" onClick={closeRecruiterMode}><X size={16} /> Exit Recruiter Mode</button>
        </header>

        <main className="recruiter-content">
          <section className="recruiter-hero">
            <div>
              <span className="status-chip"><i /> AVAILABLE FOR THE RIGHT ROLE</span>
              <h2 id="recruiter-title">{portfolio.identity.name}</h2>
              <h3>{portfolio.identity.role}</h3>
              <p>{portfolio.identity.statement} {portfolio.identity.alternateStatements[0]}</p>
            </div>
            <div className="recruiter-actions">
              <a className="button button-primary" href={portfolio.links.resumeTerminal} target="_blank" rel="noopener noreferrer" onClick={() => { track("resume_opened", { source: "recruiter_mode" }); requestIdentity(); }}><FileText size={16} /> Open Resume</a>
              <a className="button button-ghost" href={portfolio.links.resume} download onClick={() => track("resume_downloaded", { source: "recruiter_mode" })}><Download size={16} /> Download PDF</a>
            </div>
          </section>

          <section className="recruiter-proof" aria-label="Selected engineering impact">
            {portfolio.identity.proof.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
          </section>

          <section className="recruiter-grid">
            <div className="recruiter-panel">
              <span className="eyebrow">STRONGEST EXPERIENCE</span>
              {leadExperience.map((item) => (
                <article key={item.build}>
                  <small>{item.dates} / {item.company}</small>
                  <h3>{item.role}</h3>
                  <ul>{item.achievements.slice(0, 3).map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
                </article>
              ))}
            </div>
            <div className="recruiter-panel recruiter-capabilities">
              <span className="eyebrow">CORE CAPABILITIES</span>
              {portfolio.modules.map((module) => (
                <article key={module.id}>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                  <div className="tag-row">{module.items.slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>
                </article>
              ))}
            </div>
          </section>

          <section className="recruiter-projects">
            <span className="eyebrow">FEATURED SYSTEMS</span>
            {portfolio.projects.map((project) => (
              <article key={project.id}>
                <div><small>PROJECT / {project.id.toUpperCase()}</small><h3>{project.title}</h3><p>{project.description}</p></div>
                <div className="tag-row">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
            ))}
          </section>

          <section className="recruiter-contact">
            <div><span className="eyebrow">ESTABLISH CONNECTION</span><h2>Hiring for a role that fits my background?</h2><p>Let’s connect.</p></div>
            <div>
              <a href={portfolio.links.email} onClick={() => { track("contact_clicked", { channel: "email", source: "recruiter_mode" }); requestIdentity(); }}><Mail size={16} /> Email <MoveUpRight size={14} /></a>
              <a href={portfolio.links.linkedin} target="_blank" rel="noreferrer" onClick={() => track("linkedin_clicked", { source: "recruiter_mode" })}><Linkedin size={16} /> LinkedIn <MoveUpRight size={14} /></a>
              <a href={portfolio.links.github} target="_blank" rel="noreferrer" onClick={() => track("github_clicked", { source: "recruiter_mode" })}><Github size={16} /> GitHub <MoveUpRight size={14} /></a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
