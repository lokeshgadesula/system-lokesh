"use client";

import { useState } from "react";
import { Check, Github, Globe2, Linkedin, Mail, MoveUpRight } from "lucide-react";
import { portfolio } from "@/portfolio.config";
import { SectionIntro } from "./SectionIntro";

export function Contact() {
  const [connected, setConnected] = useState(false);
  const links = [
    ["Email", portfolio.links.email, Mail],
    ["LinkedIn", portfolio.links.linkedin, Linkedin],
    ["GitHub", portfolio.links.github, Github],
    ["Website", portfolio.links.website, Globe2],
  ] as const;

  return (
    <section id="contact" className="section-shell content-section contact-section">
      <SectionIntro
        index="07"
        eyebrow="ESTABLISH CONNECTION"
        title="Let’s build something that has to work."
        copy="Backend platforms, data infrastructure, and production AI are the problems I like solving. If that sounds useful, let’s talk."
      />
      <div className="contact-panel">
        <div className="contact-links">
          {links.map(([label, href, Icon]) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-cursor="CONNECT">
              <Icon size={17} /><span>{label}</span><MoveUpRight size={15} />
            </a>
          ))}
          <a id="resume" href={portfolio.links.resumeTerminal} data-cursor="CONNECT" target="_blank" rel= "noopener noreferrer"><span>RES</span><span>Resume</span><MoveUpRight size={15} /></a>
        </div>
        <div className={`handshake ${connected ? "connected" : ""}`}>
          <div className="handshake-node"><span>YOU</span><i /></div>
          <div className="handshake-line"><b /><b /><b /></div>
          <div className="handshake-node"><i /><span>SYSTEM://LOKESH</span></div>
          <button
            className="button button-primary"
            onClick={() => { setConnected(true); window.setTimeout(() => { window.location.href = portfolio.links.email; }, 550); }}
            data-cursor="EXECUTE"
          >
            {connected ? <><Check size={16} /> CHANNEL OPEN</> : <>INITIATE CONNECTION <MoveUpRight size={16} /></>}
          </button>
        </div>
      </div>
    </section>
  );
}
