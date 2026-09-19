"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";

const categories = ["All", "Languages", "Data", "AI", "Cloud"] as const;
const visibleCategories = ["Languages", "Data", "AI", "Cloud"] as const;

type Category = (typeof categories)[number];

export function TechnologyGraph() {
  const [category, setCategory] = useState<Category>("All");
  const [selected, setSelected] = useState("Python");
  const reduceMotion = useReducedMotion();

  const groups = useMemo(() => {
    const allowed = category === "All" ? visibleCategories : [category];
    return allowed.map((group) => ({
      name: group,
      items: portfolio.technologies.filter((tech) => tech.category === group),
    }));
  }, [category]);

  const active = portfolio.technologies.find((tech) => tech.name === selected) ?? portfolio.technologies[0];

  return (
    <section id="stack" className="section-shell content-section">
      <SectionIntro
        index="03"
        eyebrow="TECHNOLOGY GRAPH"
        title="Skills, traced to real work."
        copy="Each technology links back to the systems and projects where it was used. Explore the evidence behind the stack."
      />
      <div className="graph-toolbar" role="group" aria-label="Filter technologies">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="tech-layout">
        <div className="tech-map" aria-label="Interactive technology evidence map">
          <div className="tech-map-head">
            <span className="mono-muted">CAPABILITY MAP</span>
            <span className="mono-muted">SELECT A NODE / TRACE EVIDENCE</span>
          </div>
          <div className={`tech-groups ${category !== "All" ? "single" : ""}`}>
            {groups.map((group, groupIndex) => (
              <motion.section
                className="tech-group"
                key={group.name}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: groupIndex * 0.04 }}
                aria-label={`${group.name} technologies`}
              >
                <div className="tech-group-title">
                  <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                  <strong>{group.name.toUpperCase()}</strong>
                  <i />
                </div>
                <div className="tech-node-grid">
                  {group.items.map((tech) => (
                    <button
                      key={tech.name}
                      className={`tech-node ${selected === tech.name ? "active" : ""}`}
                      onClick={() => setSelected(tech.name)}
                      data-cursor="INSPECT"
                      aria-pressed={selected === tech.name}
                    >
                      <span>{tech.name}</span>
                      <small>{tech.links.length} traces</small>
                    </button>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>
        <aside className="tech-inspector" aria-live="polite">
          <div className="inspector-signal"><i /><span>TRACE ACTIVE</span></div>
          <span className="eyebrow">EVIDENCE / {active.category.toUpperCase()}</span>
          <h3>{active.name}</h3>
          <p className="tech-inspector-copy">Where this technology appears in my work:</p>
          <div className="trace-tree">
            {active.links.map((link, index) => (
              <div key={link}><span>{index === active.links.length - 1 ? "└──" : "├──"}</span><p>{link}</p></div>
            ))}
          </div>
          <p className="mono-muted">CONNECTED EVIDENCE / {active.links.length}</p>
        </aside>
      </div>
    </section>
  );
}
