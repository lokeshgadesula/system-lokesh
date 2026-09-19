"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";

export function EngineeringLog() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = portfolio.experience[active];

  return (
    <section id="experience" className="section-shell content-section">
      <SectionIntro
        index="02"
        eyebrow="ENGINEERING LOG"
        title="The work behind the systems."
        copy="The systems built in each role, the measurable improvements made, and the tools used along the way."
      />
      <div className="log-layout">
        <div className="build-rail" role="tablist" aria-label="Experience builds">
          {portfolio.experience.map((item, index) => (
            <button
              key={item.build}
              className={`build-tab ${active === index ? "active" : ""}`}
              role="tab"
              aria-selected={active === index}
              onClick={() => setActive(index)}
              data-cursor="INSPECT"
            >
              <span className="build-node" />
              <span className="build-meta">SYSTEM BUILD {item.build}</span>
              <strong>{item.company}</strong>
              <small>{item.dates}</small>
            </button>
          ))}
        </div>
        <motion.article
          key={current.build}
          className="build-detail"
          initial={reduceMotion ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="build-detail-head">
            <div>
              <span className="eyebrow">DEPLOYMENT / {current.build}</span>
              <h3>{current.role}</h3>
              <p>{current.company} · {current.dates}</p>
            </div>
            <span className="status-chip"><i /> DEPLOYED</span>
          </div>
          <ol className="achievement-list">
            {current.achievements.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
            ))}
          </ol>
          <div className="tag-row" aria-label="Technologies used">
            {current.technologies.map((tech) => <span key={tech}>{tech}</span>)}
          </div>
        </motion.article>
      </div>
    </section>
  );
}
