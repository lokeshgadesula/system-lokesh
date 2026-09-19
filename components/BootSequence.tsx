"use client";

import { motion } from "motion/react";

const services = ["AI_ENGINE", "DATA_PIPELINES", "BACKEND_SYSTEMS", "CLOUD_INFRA"];

export function BootSequence() {
  return (
    <motion.div
      className="boot-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.35 }}
      role="status"
      aria-label="Initializing portfolio system"
    >
      <div className="boot-panel">
        <p className="eyebrow">SYSTEM://LOKESH</p>
        <p className="boot-copy">Initializing distributed runtime...</p>
        <div className="boot-services" aria-hidden="true">
          {services.map((service, index) => (
            <motion.div
              key={service}
              className="boot-row"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.18, duration: 0.25 }}
            >
              <span>{service}</span><span className="boot-dots" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + index * 0.18 }}
                className="online"
              >ONLINE</motion.span>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="boot-ready"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          SYSTEM READY
        </motion.p>
      </div>
    </motion.div>
  );
}
