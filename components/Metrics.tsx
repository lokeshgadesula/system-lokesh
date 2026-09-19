"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";

function CountMetric({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate(latest) { setDisplay(Math.round(latest)); },
    });
    return () => controls.stop();
  }, [isInView, reduceMotion, value]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export function Metrics() {
  return (
    <section className="section-shell metrics-section" aria-label="Engineering impact metrics">
      <div className="metrics-head">
        <span className="eyebrow">ENGINEERING IMPACT</span>
        <span className="mono-muted">RESULTS / ENGINEERING IMPACT</span>
      </div>
      <div className="metrics-grid">
        {portfolio.metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <strong><CountMetric value={metric.value} prefix={"prefix" in metric ? metric.prefix : ""} suffix={metric.suffix} /></strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
