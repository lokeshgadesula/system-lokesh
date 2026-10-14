"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";

export function SystemOverview() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeModule = portfolio.modules[active];

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
            <span className="eyebrow">MODULE / {activeModule.id.toUpperCase()}</span>
            <span className="status-chip"><i /> ACTIVE</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeModule.id}
              className="module-inspector-content"
              initial={reduceMotion ? false : { opacity: 0, y: 9, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flow-strip">
                {activeModule.flow.map((step, index) => (
                  <div className="flow-step" key={step}>
                    <span>{step}</span>
                    {index < activeModule.flow.length - 1 && <i aria-hidden="true" />}
                  </div>
                ))}
              </div>
              <ul className="inspector-list">
                {activeModule.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
