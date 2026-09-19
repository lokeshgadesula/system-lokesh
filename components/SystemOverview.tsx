"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";

export function SystemOverview() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const module = portfolio.modules[active];

  return (
    <section id="overview" className="section-shell content-section">
      <SectionIntro
        index="01"
        eyebrow="SYSTEM OVERVIEW"
        title="Three disciplines. One reliable system."
        copy="My work connects distributed systems, data engineering, and LLM evaluation to keep intelligent applications reliable at scale."
      />
      <div className="overview-layout">
        <div className="module-list" role="tablist" aria-label="Engineering domains">
          {portfolio.modules.map((item, index) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={active === index}
              className={`module-card ${active === index ? "active" : ""}`}
              onClick={() => setActive(index)}
              data-cursor="INSPECT"
            >
              <span className="module-index">{item.index}</span>
              <span className="module-body">
                <strong>{item.title}</strong>
                <small>{item.summary}</small>
              </span>
              <span className="module-arrow">↗</span>
            </button>
          ))}
        </div>
        <div className="module-inspector" role="tabpanel">
          <div className="inspector-head">
            <span className="eyebrow">MODULE / {module.id.toUpperCase()}</span>
            <span className="status-chip"><i /> ACTIVE</span>
          </div>
          <motion.div
            key={module.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flow-strip"
          >
            {module.flow.map((step, index) => (
              <div className="flow-step" key={step}>
                <span>{step}</span>
                {index < module.flow.length - 1 && <i aria-hidden="true" />}
              </div>
            ))}
          </motion.div>
          <ul className="inspector-list">
            {module.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
