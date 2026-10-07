"use client";

import { FormEvent, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAnalytics } from "./AnalyticsProvider";

export function VisitorIdentityPrompt() {
  const { identityPromptOpen, dismissIdentity, identify } = useAnalytics();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);

  if (!identityPromptOpen) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !company.trim()) {
      setError("Enter your name and company, or choose Skip.");
      nameInput.current?.focus();
      return;
    }
    setError("");
    void identify({ name, company });
  }

  return (
    <aside className="identity-prompt" aria-label="Optional visitor introduction">
      <button className="identity-close" type="button" onClick={dismissIdentity} aria-label="Skip introduction"><X size={15} /></button>
      <span className="eyebrow">OPTIONAL HANDSHAKE</span>
      <strong>Welcome 👋</strong>
      <p>If you’re a recruiter or hiring manager, I’d love to know who stopped by.</p>
      <form onSubmit={submit}>
        <label><span>Your name</span><input ref={nameInput} value={name} onChange={(event) => { setName(event.target.value); if (error) setError(""); }} maxLength={80} autoComplete="name" aria-invalid={Boolean(error)} aria-describedby={error ? "identity-error" : undefined} /></label>
        <label><span>Company</span><input value={company} onChange={(event) => { setCompany(event.target.value); if (error) setError(""); }} maxLength={120} autoComplete="organization" aria-invalid={Boolean(error)} aria-describedby={error ? "identity-error" : undefined} /></label>
        {error && <p className="identity-error" id="identity-error" role="alert">{error}</p>}
        <div><button className="button button-primary" type="submit">Continue</button><button className="identity-skip" type="button" onClick={dismissIdentity}>Skip</button></div>
      </form>
    </aside>
  );
}
