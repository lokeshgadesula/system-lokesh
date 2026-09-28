"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useAnalytics } from "./AnalyticsProvider";

export function VisitorIdentityPrompt() {
  const { identityPromptOpen, dismissIdentity, identify } = useAnalytics();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  if (!identityPromptOpen) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    void identify({ name, company });
  }

  return (
    <aside className="identity-prompt" aria-label="Optional visitor introduction">
      <button className="identity-close" type="button" onClick={dismissIdentity} aria-label="Skip introduction"><X size={15} /></button>
      <span className="eyebrow">OPTIONAL HANDSHAKE</span>
      <strong>Welcome 👋</strong>
      <p>If you’re a recruiter or hiring manager, I’d love to know who stopped by.</p>
      <form onSubmit={submit}>
        <label><span>Your name — optional</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="name" autoFocus /></label>
        <label><span>Company — optional</span><input value={company} onChange={(event) => setCompany(event.target.value)} maxLength={120} autoComplete="organization" /></label>
        <div><button className="button button-primary" type="submit">Continue</button><button className="identity-skip" type="button" onClick={dismissIdentity}>Skip</button></div>
      </form>
    </aside>
  );
}
