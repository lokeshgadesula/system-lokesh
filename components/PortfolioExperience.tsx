"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
import { AnalyticsProvider, useAnalytics } from "./analytics/AnalyticsProvider";
import { VisitorIdentityPrompt } from "./analytics/VisitorIdentityPrompt";
import { RecruiterMode } from "./RecruiterMode";

const UniverseMode = dynamic(() => import("./UniverseMode").then((module) => module.UniverseMode), {
  ssr: false,
  loading: () => <div className="universe-loading" role="status">CALIBRATING STAR MAP…</div>,
});

export function PortfolioExperience() {
  return <AnalyticsProvider><PortfolioShell /></AnalyticsProvider>;
}

function PortfolioShell() {
  const reduceMotion = useReducedMotion();
  const { universeMode } = useAnalytics();
  const [booting, setBooting] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), reduceMotion ? 0 : 3450);
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
      <RecruiterMode />
      {universeMode && <UniverseMode />}
      <VisitorIdentityPrompt />
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
