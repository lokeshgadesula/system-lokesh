"use client";

import { useState } from "react";
import { ExternalLink, Github } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";

export function ProjectLab() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"architecture" | "details">("architecture");
  const reduceMotion = useReducedMotion();
  const project = portfolio.projects[active];

  return (
    <section id="projects" className="section-shell content-section">
      <SectionIntro
        index="04"
        eyebrow="ENGINEERING LAB"
        title="Projects built for real workloads."
        copy="Each project shows the data flow, failure paths, and engineering choices behind the architecture."
      />
      <div className="project-selector" role="tablist" aria-label="Featured projects">
        {portfolio.projects.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={active === index}
            className={active === index ? "active" : ""}
            onClick={() => { setActive(index); setMode("architecture"); }}
            data-cursor="OPEN"
          >
            <span>0{index + 1}</span>{item.title}
          </button>
        ))}
      </div>
      <motion.article
        key={project.id}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="project-console"
      >
        <div className="project-copy">
          <span className="eyebrow">PROJECT / {project.id.toUpperCase()}</span>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div className="tag-row">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
          <div className="project-actions">
            <button className={mode === "architecture" ? "active" : ""} onClick={() => setMode("architecture")}>Architecture</button>
            <button className={mode === "details" ? "active" : ""} onClick={() => setMode("details")}>Technical Details</button>
            <a href={project.github} target="_blank" rel="noreferrer"><Github size={15} /> GitHub <ExternalLink size={13} /></a>
          </div>
        </div>
        <div className="project-visual" data-cursor="TRACE">
          {mode === "architecture" ? (
            <div className="architecture-flow" aria-label={`${project.title} architecture`}>
              {project.architecture.map((step, index) => (
                <div className="architecture-step" key={step}>
                  <div className="architecture-node"><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>
                  {index < project.architecture.length - 1 && (
                    <div className="architecture-link" aria-hidden="true">
                      <i />
                      {!reduceMotion && (
                        <motion.b
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: 18, opacity: [0, 1, 0] }}
                          transition={{ duration: 1.2, delay: index * 0.15, repeat: Infinity, repeatDelay: 1.6 }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="technical-notes">
              <span className="eyebrow">PRODUCTION NOTES</span>
              {project.technical.map((item, index) => (
                <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>
              ))}
              <div className="technical-foot">DESIGN GOAL / RELIABLE UNDER REAL WORKLOADS</div>
            </div>
          )}
        </div>
      </motion.article>
    </section>
  );
}
