"use client";

import { useEffect, useState } from "react";
import { portfolio } from "@/portfolio.config";

const steps = [
  "Gathering the details",
  "Cooking the highlights",
  "Checking the final touches",
  "Constructing my résumé",
] as const;

export default function ResumePage() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stepTimers = [750, 1500, 2250].map((delay, index) =>
      window.setTimeout(() => setActiveStep(index + 1), delay)
    );
    const redirectTimer = window.setTimeout(() => {
      window.location.assign(portfolio.links.resume);
    }, 7000);

    return () => {
      stepTimers.forEach(window.clearTimeout);
      window.clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <main className="resume-loader-page">
      <div className="resume-loader-card" role="status" aria-label="Preparing résumé">
        <div className="resume-loader-topline">
          <span>SYSTEM://LOKESH</span>
          <span className="resume-loader-signal"><i /> DOCUMENT REQUEST</span>
        </div>

        <div className="resume-loader-orbit" aria-hidden="true">
          <span className="resume-loader-core">RES</span>
          <span className="resume-loader-ring resume-loader-ring-one" />
          <span className="resume-loader-ring resume-loader-ring-two" />
        </div>

        <h1>Preparing my résumé</h1>
        <p className="resume-loader-current" aria-live="polite">
          {steps[activeStep]}<span className="resume-loader-ellipsis" aria-hidden="true" />
        </p>

        <ol className="resume-loader-steps" aria-label="Résumé loading progress">
          {steps.map((step, index) => (
            <li key={step} className={index < activeStep ? "complete" : index === activeStep ? "active" : "pending"}>
              <span className="resume-loader-step-icon" aria-hidden="true">{index < activeStep ? "✓" : String(index + 1).padStart(2, "0")}</span>
              <span>{step}</span>
              <span className="resume-loader-step-state">{index < activeStep ? "DONE" : index === activeStep ? "RUNNING" : "WAITING"}</span>
            </li>
          ))}
        </ol>

        <div className="resume-loader-progress" aria-hidden="true"><span /></div>
        <div className="resume-loader-foot"><span>RESUME.pdf</span><span>OPENING AUTOMATICALLY</span></div>
      </div>
    </main>
  );
}
