"use client";

import { motion, useReducedMotion } from "motion/react";

export function SectionIntro({ index, eyebrow, title, copy }: { index: string; eyebrow: string; title: string; copy?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="section-intro"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="section-code"><span>{index}</span><i /></div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {copy && <p className="section-copy">{copy}</p>}
      </div>
    </motion.div>
  );
}
