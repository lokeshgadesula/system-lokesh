"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { TerminalSquare } from "lucide-react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";

type Line = { type: "input" | "output"; text: string };

export function Terminal() {
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { type: "output", text: "Portfolio shell ready. Type `help` to inspect available commands." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Record<string, () => string>>(() => ({
    help: () => "help · whoami · skills · skills --ai · experience · projects · ai · backend · data · contact · resume · status · uptime · coffee · sudo hire lokesh · rm -rf experience · clear",
    whoami: () => `${portfolio.identity.name}\n${portfolio.identity.role}\nI build distributed infrastructure and production AI systems.`,
    skills: () => "Python · Go · TypeScript · SQL · Spark · Kafka · Airflow · PostgreSQL · AWS · Docker · Kubernetes · Terraform · LLM Evaluation · RAG · Agentic Workflows",
    "skills --ai": () => "LLM Evaluation\nAgentic Workflows\nRAG\nBenchmarking\nTool-Use Validation\nSynthetic Data\nAutomated Telemetry",
    experience: () => portfolio.experience.map((item) => `BUILD ${item.build} / ${item.company} / ${item.role}`).join("\n"),
    projects: () => portfolio.projects.map((item, index) => `${index + 1}. ${item.title}`).join("\n"),
    ai: () => "Evaluation benchmarks → synthetic scenarios → tool validation → regression scoring → telemetry.",
    backend: () => "Async APIs · REST/gRPC · distributed services · auth · database performance · observability.",
    data: () => "Kafka → Spark → Airflow → S3/Redshift with batch + streaming processing patterns.",
    contact: () => `Website: ${portfolio.links.website}\nGitHub: ${portfolio.links.github}\nLinkedIn: ${portfolio.links.linkedin}`,
    resume: () => {window.open(portfolio.links.resumeTerminal, "_blank");
  return [
    "Locating candidate artifact...",
    "RESUME.pdf ............... FOUND",
    "ACCESS ................... GRANTED",
    "",
    "Launching résumé loader..."
  ].join("\n");},
    status: () => "Applied AI ................. ACTIVE\nBackend Engineering ........ ACTIVE\nDistributed Systems ........ ACTIVE\nData Engineering ........... ACTIVE\nCloud Infrastructure ....... ACTIVE",
    uptime: () => `${portfolio.identity.experienceYears} years engineering runtime.`,
    coffee: () => "Dependency already installed.",
    "sudo hire lokesh": () => {
      window.location.href = `${portfolio.links.email}?subject=${encodeURIComponent("Let's work together")}`;
      return "Permission granted.\nOpening your email app...";
    },
    "rm -rf experience": () => "Operation rejected.\nProduction history is immutable.",
  }), []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const command = value.trim();
    if (!command) return;
    if (command === "clear") {
      setLines([]);
      setValue("");
      return;
    }
    const output = commands[command.toLowerCase()]?.() ?? `Command not found: ${command}. Try 'help'.`;
    setLines((current) => [...current, { type: "input", text: command }, { type: "output", text: output }]);
    setValue("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <section className="section-shell content-section terminal-section">
      <SectionIntro
        index="06"
        eyebrow="INTERACTIVE TERMINAL"
        title="Explore the work from the command line."
        copy="A small portfolio terminal for navigating my experience, projects, and engineering focus."
      />
      <div className="terminal-window" onClick={() => inputRef.current?.focus()}>
        <div className="terminal-titlebar"><TerminalSquare size={15} /><span>lokesh@system:~</span><i>portfolio shell</i></div>
        <div className="terminal-body" aria-live="polite">
          {lines.map((line, index) => (
            <pre key={`${line.type}-${index}`} className={line.type}>{line.type === "input" ? `$ ${line.text}` : line.text}</pre>
          ))}
          <form onSubmit={submit} className="terminal-input-row">
            <label htmlFor="terminal-input">lokesh@system:~$</label>
            <input
              ref={inputRef}
              id="terminal-input"
              value={value}
              style={{ width: `${Math.max(value.length, 0.5)}ch` }}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Portfolio terminal command"
            />
            <span className="terminal-caret" aria-hidden="true" />
          </form>
        </div>
      </div>
    </section>
  );
}
