"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Command, Search, TerminalSquare, X } from "lucide-react";
import { portfolio } from "@/portfolio.config";

const playful = [
  ["system status", "#lab"],
  ["inspect experience", "#experience"],
  ["trace kafka", "#stack"],
  ["run project-demo", "#projects"],
  ["whoami", "#overview"],
  ["uptime", "#contact"],
  ["skills --list", "#stack"],
  ["projects --featured", "#projects"],
] as const;

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const commands = useMemo(() => [...portfolio.commandPalette, ...playful], []);
  const filtered = commands.filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));

  function navigate(href: string) {
    onClose();
    requestAnimationFrame(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }));
  }

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => filtered.length ? (current + 1) % filtered.length : 0);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => filtered.length ? (current - 1 + filtered.length) % filtered.length : 0);
      }
      if (event.key === "Enter" && filtered[activeIndex]) {
        event.preventDefault();
        navigate(filtered[activeIndex][1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, filtered, activeIndex]);

  useEffect(() => setActiveIndex(0), [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="palette-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            className="palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="palette-input"><Search size={17} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search system commands..." /><button onClick={onClose} aria-label="Close command palette"><X size={17} /></button></div>
            <div className="palette-list">
              {filtered.map(([label, href], index) => (
                <button
                  key={`${label}-${href}`}
                  className={index === activeIndex ? "active" : ""}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigate(href)}
                >
                  {portfolio.commandPalette.some(([name]) => name === label) ? <Command size={15} /> : <TerminalSquare size={15} />}
                  <span>{label}</span><kbd>↵</kbd>
                </button>
              ))}
              {!filtered.length && <p>No command matched “{query}”.</p>}
            </div>
            <div className="palette-footer"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span><span>cmd/ctrl + k toggle</span></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
