"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BootSequence } from "./BootSequence";
import { Navigation } from "./Navigation";
import { Hero } from "./Hero";
import { SystemOverview } from "./SystemOverview";
import { Metrics } from "./Metrics";
import { EngineeringLog } from "./EngineeringLog";
import { TechnologyGraph } from "./TechnologyGraph";
import { ProjectLab } from "./ProjectLab";
import { PacketRouterGame } from "./PacketRouterGame";
import { SystemStatus } from "./SystemStatus";
import { Terminal } from "./Terminal";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { CommandPalette } from "./CommandPalette";
import { CustomCursor } from "./CustomCursor";
import { DebugOverlay } from "./DebugOverlay";

export function PortfolioExperience() {
  const reduceMotion = useReducedMotion();
  const [booting, setBooting] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setBooting(false);
      return;
    }
    const seen = sessionStorage.getItem("system-lokesh-booted");
    if (seen) {
      setBooting(false);
      return;
    }
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("system-lokesh-booted", "1");
      setBooting(false);
    }, 1250);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let position = 0;
    const onKey = (event: KeyboardEvent) => {
      const expected = konami[position];
      if (event.key === expected || event.key.toLowerCase() === expected?.toLowerCase()) {
        position += 1;
        if (position === konami.length) {
          setDebug((v) => !v);
          position = 0;
        }
      } else {
        position = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <CustomCursor />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <DebugOverlay enabled={debug} />
      <AnimatePresence>{booting && <BootSequence />}</AnimatePresence>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: booting ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        aria-hidden={booting}
      >
        <Navigation onOpenPalette={() => setPaletteOpen(true)} />
        <main id="main">
          <Hero />
          <SystemOverview />
          <Metrics />
          <EngineeringLog />
          <TechnologyGraph />
          <ProjectLab />
          <PacketRouterGame />
          <SystemStatus />
          <Terminal />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </>
  );
}
