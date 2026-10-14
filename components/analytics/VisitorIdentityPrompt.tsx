"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAnalytics } from "./AnalyticsProvider";

export function VisitorIdentityPrompt() {
  const { identityPromptOpen, recruiterMode, dismissIdentity, identify } = useAnalytics();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!identityPromptOpen) return;
    const focusTimer = window.setTimeout(() => nameInput.current?.focus({ preventScroll: true }), recruiterMode && !reduceMotion ? 360 : 0);
    return () => window.clearTimeout(focusTimer);
  }, [identityPromptOpen, recruiterMode, reduceMotion]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !company.trim()) {
      setError("Enter your name and company, or choose Skip.");
      nameInput.current?.focus();
      return;
    }
    setError("");
    void identify({ name, company, email, phone });
  }

  return (
    <AnimatePresence>
      {identityPromptOpen && (
        <motion.div
          className={`identity-prompt-layer ${recruiterMode ? "recruiter-handshake-layer" : ""}`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, delay: recruiterMode && !reduceMotion ? 0.12 : 0 }}
        >
          <motion.aside
            className={`identity-prompt ${recruiterMode ? "identity-prompt-centered" : ""}`}
            aria-label="Optional visitor introduction"
            initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, delay: recruiterMode && !reduceMotion ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="identity-close" type="button" onClick={dismissIdentity} aria-label="Skip introduction"><X size={15} /></button>
            <span className="eyebrow">OPTIONAL HANDSHAKE</span>
            <strong>Welcome 👋</strong>
            <blockquote className="identity-quote">“I’d like to know who you are.”</blockquote>
            <p>Share your name and company, or skip and continue exploring.</p>
            <form onSubmit={submit}>
              <label><span>Your name</span><input ref={nameInput} value={name} onChange={(event) => { setName(event.target.value); if (error) setError(""); }} maxLength={80} autoComplete="name" aria-invalid={Boolean(error)} aria-describedby={error ? "identity-error" : undefined} /></label>
              <label><span>Company</span><input value={company} onChange={(event) => { setCompany(event.target.value); if (error) setError(""); }} maxLength={120} autoComplete="organization" aria-invalid={Boolean(error)} aria-describedby={error ? "identity-error" : undefined} /></label>
              <label><span>Email (optional)</span><input type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} autoComplete="email" /></label>
              <label><span>Phone (optional)</span><input type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={40} autoComplete="tel" /></label>
              {error && <p className="identity-error" id="identity-error" role="alert">{error}</p>}
              <div><button className="button button-primary" type="submit">Continue</button><button className="identity-skip" type="button" onClick={dismissIdentity}>Skip</button></div>
            </form>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
