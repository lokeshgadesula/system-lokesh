"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Router, Trophy } from "lucide-react";
import { SectionIntro } from "./SectionIntro";

const workloads = [
  {
    name: "Streaming Event",
    hint: "High-volume event stream requiring distributed processing.",
    correct: "Kafka → Spark → Redshift",
    routes: ["Kafka → Spark → Redshift", "API → Agent → Evaluator", "S3 → Airflow → Spark"],
  },
  {
    name: "AI Tool Request",
    hint: "A user request needs an agent, a tool, and output validation.",
    correct: "API → Agent → Tool → Evaluator",
    routes: ["API → Agent → Tool → Evaluator", "Kafka → Spark → Database", "S3 → Lambda → Redshift"],
  },
  {
    name: "Batch ETL",
    hint: "Scheduled data transformation with orchestration and warehouse output.",
    correct: "S3 → Airflow → Spark → Redshift",
    routes: ["S3 → Airflow → Spark → Redshift", "API → Kafka → Agent", "Worker → Redis → Browser"],
  },
  {
    name: "Evaluation Regression",
    hint: "A model build must be checked against known scenarios and telemetry.",
    correct: "Scenarios → LLM → Validator → Telemetry",
    routes: ["Scenarios → LLM → Validator → Telemetry", "Kafka → S3 → CDN", "API → Spark → Browser"],
  },
] as const;

export function PacketRouterGame() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("ROUTER READY");
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);
  const workload = workloads[index];
  const achievement = useMemo(() => {
    if (!completed) return "";
    if (score === workloads.length) return "ZERO-DOWNTIME ENGINEER";
    if (score >= 3) return "PACKET WHISPERER";
    return "SYSTEM RECOVERY OPERATOR";
  }, [completed, score]);

  function choose(route: string) {
    if (completed || locked) return;
    setLocked(true);
    const correct = route === workload.correct;
    setAttempts((v) => v + 1);
    if (correct) setScore((v) => v + 1);
    setMessage(correct ? "THROUGHPUT +1" : "BOTTLENECK DETECTED");
    window.setTimeout(() => {
      if (index === workloads.length - 1) {
        setCompleted(true);
      } else {
        setIndex((v) => v + 1);
        setMessage("NEXT WORKLOAD INGRESS");
        setLocked(false);
      }
    }, 650);
  }

  function reset() {
    setIndex(0); setScore(0); setAttempts(0); setMessage("ROUTER READY"); setCompleted(false); setLocked(false);
  }

  return (
    <section id="lab" className="section-shell content-section">
      <SectionIntro
        index="05"
        eyebrow="PACKET ROUTER"
        title="Route the workload."
        copy="A short routing challenge based on the architecture decisions I make when building production systems."
      />
      <div className="game-shell">
        <div className="game-console">
          <div className="game-head">
            <div><Router size={18} /><span>WORKLOAD ROUTER / SESSION {String(index + 1).padStart(2, "0")}</span></div>
            <strong>{score} / {workloads.length}</strong>
          </div>
          {!completed ? (
            <>
              <div className="workload-card">
                <span className="eyebrow">INCOMING REQUEST</span>
                <h3>{workload.name}</h3>
                <p>{workload.hint}</p>
              </div>
              <div className="route-options">
                {workload.routes.map((route, routeIndex) => (
                  <button key={route} onClick={() => choose(route)} data-cursor="EXECUTE" disabled={locked}>
                    <span>PATH {String(routeIndex + 1).padStart(2, "0")}</span><strong>{route}</strong>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="game-complete">
              <Trophy size={30} />
              <span className="eyebrow">ACHIEVEMENT UNLOCKED</span>
              <h3>{achievement}</h3>
              <p>{score} correct routes across {attempts} attempts.</p>
              <button className="button button-primary" onClick={reset}><RotateCcw size={15} /> Run again</button>
            </div>
          )}
        </div>
        <aside className="game-telemetry">
          <span className="eyebrow">LIVE TELEMETRY</span>
          <div><span>STATUS</span><strong className={message.includes("BOTTLENECK") ? "warn" : "online"}>{message}</strong></div>
          <div><span>THROUGHPUT</span><strong>{score}</strong></div>
          <div><span>ATTEMPTS</span><strong>{attempts}</strong></div>
          <div><span>HEALTH</span><strong>{Math.max(0, 100 - Math.max(0, attempts - score) * 15)}%</strong></div>
          <p>Optional simulation / portfolio content remains fully accessible without playing.</p>
        </aside>
      </div>
    </section>
  );
}
