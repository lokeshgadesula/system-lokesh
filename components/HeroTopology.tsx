"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const nodes = [
  { id: "client", label: "CLIENT", x: 50, y: 6, detail: "Request origin" },
  { id: "api", label: "API GATEWAY", x: 50, y: 23, detail: "Traffic entry + routing" },
  { id: "bus", label: "EVENT BUS", x: 50, y: 40, detail: "Async workload coordination" },
  { id: "kafka", label: "KAFKA", x: 24, y: 58, detail: "High-throughput event streaming" },
  { id: "agent", label: "AI AGENT", x: 76, y: 58, detail: "Tool-augmented LLM workflows" },
  { id: "spark", label: "SPARK", x: 24, y: 75, detail: "Distributed processing" },
  { id: "eval", label: "EVALUATOR", x: 76, y: 75, detail: "Automated model validation" },
  { id: "obs", label: "OBSERVABILITY", x: 50, y: 92, detail: "Metrics, traces, telemetry" },
] as const;

const links = [
  ["client", "api"], ["api", "bus"], ["bus", "kafka"], ["bus", "agent"],
  ["kafka", "spark"], ["agent", "eval"], ["spark", "obs"], ["eval", "obs"],
] as const;

export function HeroTopology() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map((node) => [node.id, node])), []);

  return (
    <div className="topology-card" data-cursor="TRACE" onPointerLeave={() => setActive(null)}>
      <div className="topology-head">
        <div><span className="eyebrow">LIVE TOPOLOGY</span><strong>PRODUCTION PATH</strong></div>
        <span className="topology-status"><i /> HEALTHY</span>
      </div>
      <div className="topology-canvas" role="img" aria-label="Interactive distributed system diagram connecting client requests, API gateway, event bus, Kafka, AI agent, Spark, evaluator, and observability.">
        <svg viewBox="0 0 100 104" preserveAspectRatio="none" aria-hidden="true">
          {links.map(([from, to], index) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            return (
              <g key={`${from}-${to}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={active === from || active === to ? "topology-line active" : "topology-line"} />
                {!reduceMotion && (
                  <motion.circle
                    r="0.85"
                    className="packet-dot"
                    initial={{ cx: a.x, cy: a.y }}
                    animate={{ cx: [a.x, b.x], cy: [a.y, b.y] }}
                    transition={{ duration: 1.8 + index * 0.08, delay: index * 0.16, repeat: Infinity, repeatDelay: 1.7, ease: "linear" }}
                  />
                )}
              </g>
            );
          })}
        </svg>
        {nodes.map((node, index) => (
          <button
            key={node.id}
            className={`topology-node ${active === node.id ? "active" : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onPointerEnter={() => setActive(node.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(node.id)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(node.id)}
            data-cursor="INSPECT"
            aria-label={`${node.label}: ${node.detail}`}
          >
            <span className="node-index">{String(index + 1).padStart(2, "0")}</span>
            <span>{node.label}</span>
            {active === node.id && <span className="node-tooltip">{node.detail}</span>}
          </button>
        ))}
      </div>
      <div className="topology-foot mono-row"><span>TRACE MODE / INTERACTIVE</span><span>PATHS / 08</span></div>
    </div>
  );
}
