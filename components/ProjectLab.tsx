"use client";

import { useState } from "react";
import { ExternalLink, Github } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";
import { useAnalytics } from "./analytics/AnalyticsProvider";

export function ProjectLab() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"architecture" | "details">("architecture");
  const reduceMotion = useReducedMotion();
  const project = portfolio.projects[active];
  const { track } = useAnalytics();

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
            type="button"
            role="tab"
            aria-selected={active === index}
            className={active === index ? "active" : ""}
            onClick={() => { setActive(index); setMode("architecture"); track("project_viewed", { project: item.id }); }}
            data-cursor="OPEN"
          >
            {active === index && (
              <motion.i
                className="project-selector-indicator"
                layoutId="project-selector-indicator"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span>0{index + 1}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={project.id}
          initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -7, filter: "blur(2px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
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
            <a href={project.github} target="_blank" rel="noreferrer" onClick={() => track("github_clicked", { source: "project", project: project.id })}><Github size={15} /> GitHub <ExternalLink size={13} /></a>
          </div>
        </div>
          <div className="project-visual" data-cursor="TRACE">
            <AnimatePresence mode="wait" initial={false}>
            {mode === "architecture" ? (
              <motion.div
                key="architecture"
                className="project-visual-panel architecture-flow"
                aria-label={`${project.title} architecture`}
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="details"
                className="project-visual-panel technical-notes"
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                <span className="eyebrow">PRODUCTION NOTES</span>
                {project.technical.map((item, index) => (
                  <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>
                ))}
                <div className="technical-foot">DESIGN GOAL / RELIABLE UNDER REAL WORKLOADS</div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </motion.article>
      </AnimatePresence>
    </section>
  );
}
