"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";

function CountMetric({ value, prefix = "", suffix = "", active }: { value: number; prefix?: string; suffix?: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  // Render the real value on the server and before the section is visible.
  // The animation is an enhancement, never the only way to see the metric.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const controls = animate(value === 1 ? 1 : 0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate(latest) { setDisplay(Math.round(latest)); },
      onComplete() { setDisplay(value); },
    });
    return () => controls.stop();
  }, [active, reduceMotion, value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export function Metrics() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="section-shell metrics-section" aria-label="Engineering impact metrics">
      <div className="metrics-head">
        <span className="eyebrow">ENGINEERING IMPACT</span>
        <span className="mono-muted">RESULTS / ENGINEERING IMPACT</span>
      </div>
      <div className="metrics-grid">
        {portfolio.metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <strong><CountMetric value={metric.value} prefix={"prefix" in metric ? metric.prefix : ""} suffix={metric.suffix} active={isInView} /></strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
