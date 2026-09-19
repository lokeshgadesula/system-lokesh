"use client";

import { useEffect, useState } from "react";
import { Command, Menu, Moon, Sun, X } from "lucide-react";
import { portfolio } from "@/portfolio.config";

export function Navigation({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = portfolio.nav.map((item) => item.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -55%", threshold: [0.05, 0.25, 0.6] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { window.localStorage.setItem("portfolio-theme", next); } catch { /* Storage may be unavailable. */ }
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: light)");
    const syncSystemTheme = () => {
      try { if (window.localStorage.getItem("portfolio-theme")) return; } catch { /* Follow the browser theme. */ }
      document.documentElement.dataset.theme = preference.matches ? "light" : "dark";
    };
    preference.addEventListener("change", syncSystemTheme);
    return () => preference.removeEventListener("change", syncSystemTheme);
  }, []);

  return (
    <header className={`site-nav ${compact ? "is-compact" : ""}`}>
      <a className="brand" href="#main" data-cursor="CONNECT">SYSTEM://LOKESH</a>
      <nav className="nav-links" aria-label="Primary navigation">
        {portfolio.nav.map((item) => (
          <a key={item.href} className={active === item.href.slice(1) ? "active" : ""} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle light and dark theme" title="Toggle light and dark theme">
          <Sun className="theme-icon-light" size={15} aria-hidden="true" />
          <Moon className="theme-icon-dark" size={15} aria-hidden="true" />
          <span className="theme-label-light">LIGHT</span><span className="theme-label-dark">DARK</span>
        </button>
        <button className="cmd-button" onClick={onOpenPalette} aria-label="Open command palette">
          <Command size={14} /> <span>CMD K</span>
        </button>
        <span className="status-chip"><i /> ONLINE</span>
        <button className="mobile-menu" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mobile-nav">
          {portfolio.nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
          <button onClick={() => { setOpen(false); onOpenPalette(); }}>Command palette</button>
        </div>
      )}
    </header>
  );
}
