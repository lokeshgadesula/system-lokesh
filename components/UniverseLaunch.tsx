"use client";

import { useEffect } from "react";
import { Rocket } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function UniverseLaunch() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  return (
    <motion.div
      className="universe-launch"
      role="status"
      aria-live="polite"
      aria-label="Preparing the interactive portfolio game"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24 }}
    >
      <motion.div
        className="universe-launch-card"
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.99 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="universe-launch-icon"
          animate={reduceMotion ? undefined : { y: [2, -4, 2] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        ><Rocket size={24} /></motion.span>
        <span className="eyebrow">GAME MODE / LAUNCH SEQUENCE</span>
        <strong>Preparing your universe…</strong>
        <p>Calibrating the star map, flight controls, and portfolio signals.</p>
        <div className="universe-launch-progress" aria-hidden="true"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 3.5, ease: "linear" }} /></div>
        <div className="universe-launch-status"><span>MAP ONLINE</span><span>CONTROLS READY</span><span>LAUNCHING</span></div>
      </motion.div>
    </motion.div>
  );
}
