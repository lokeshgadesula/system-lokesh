"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [pointer, setPointer] = useState({ x: -100, y: -100, label: "" });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const active = media.matches && !reduceMotion;
    setEnabled(active);
    document.documentElement.classList.toggle("has-custom-cursor", active);

    const onMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const cursorTarget = target?.closest?.("[data-cursor]") as HTMLElement | null;
      setPointer({ x: event.clientX, y: event.clientY, label: cursorTarget?.dataset.cursor ?? "" });
    };

    if (active) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduceMotion]);

  if (!enabled) return null;
  return (
    <motion.div
      className={`custom-cursor ${pointer.label ? "active" : ""}`}
      animate={{ x: pointer.x, y: pointer.y }}
      transition={{ type: "spring", stiffness: 900, damping: 60, mass: 0.08 }}
      aria-hidden="true"
    >
      {pointer.label && <span>{pointer.label}</span>}
    </motion.div>
  );
}
