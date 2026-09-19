"use client";

import { ArrowDownRight, FileText, Github, Linkedin, MoveRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { portfolio } from "@/portfolio.config";
import { HeroTopology } from "./HeroTopology";

export function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="hero section-shell" id="home" aria-labelledby="hero-title">
      <div className="hero-grid" />
      <div className="hero-copy-wrap">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <p className="eyebrow hero-eyebrow"><span className="status-dot" /> SYSTEM://LOKESH / PRODUCTION ENGINEERING</p>
          <h1 id="hero-title">
            <span>LOKESHPRASANTH</span>
            <span>GADESULA</span>
          </h1>
          <p className="hero-role">{portfolio.identity.role}</p>
          <p className="hero-specialties">{portfolio.identity.specialties.join(" • ")}</p>
          <p className="hero-statement">{portfolio.identity.statement}</p>
          <p className="hero-substatement">{portfolio.identity.alternateStatements[0]}</p>

          <div className="hero-proof" aria-label="Selected engineering impact">
            {portfolio.identity.proof.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="hero-stack" aria-label="Core technologies">
            {portfolio.identity.stackLine.map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="hero-ctas">
            <a className="button button-primary" href="#overview" data-cursor="EXECUTE">
              Explore My System <MoveRight size={17} />
            </a>
            <a className="button button-ghost" href="#projects" data-cursor="OPEN">View Engineering Work</a>
          </div>
          <div className="hero-links" aria-label="Profile links">
            <a
              href={portfolio.links.resumeTerminal} target="_blank" rel="noopener noreferrer" data-cursor="CONNECT"
            >
              <FileText size={15} />
              Resume
            </a>
            <a href={portfolio.links.github} target="_blank" rel="noreferrer" data-cursor="CONNECT"><Github size={15} /> GitHub</a>
            <a href={portfolio.links.linkedin} target="_blank" rel="noreferrer" data-cursor="CONNECT"><Linkedin size={15} /> LinkedIn</a>
          </div>
        </motion.div>
      </div>
      <div className="hero-viz-wrap">
        <HeroTopology />
      </div>
      <a className="scroll-cue" href="#overview" aria-label="Scroll to system overview">
        <span>SCROLL / INSPECT</span><ArrowDownRight size={16} />
      </a>
    </section>
  );
}
