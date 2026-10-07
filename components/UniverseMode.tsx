"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BriefcaseBusiness, CircleAlert, Code2,
  Crosshair, Database, Gem, GraduationCap, Mail, Rocket, RotateCcw, Satellite,
  Shield, Sparkles, Trophy, UserRoundSearch, X, Zap,
} from "lucide-react";
import { portfolio } from "@/portfolio.config";
import { useAnalytics } from "./analytics/AnalyticsProvider";

type DestinationId = "experience" | "ai" | "data" | "projects" | "skills" | "education" | "contact";
type Point = { x: number; y: number };
type GamePhase = "briefing" | "playing" | "crashed" | "complete";

const START_POSITION: Point = { x: 49, y: 47 };
const destinationLayout: Array<{ id: DestinationId; label: string; eyebrow: string; x: number; y: number; icon: typeof Rocket }> = [
  { id: "experience", label: "Experience Planet", eyebrow: "04 BUILDS", x: 15, y: 22, icon: BriefcaseBusiness },
  { id: "ai", label: "AI Systems Planet", eyebrow: "LLM / AGENTS", x: 47, y: 13, icon: Sparkles },
  { id: "data", label: "Data Planet", eyebrow: "STREAM / BATCH", x: 82, y: 27, icon: Database },
  { id: "projects", label: "Project Nebula", eyebrow: "02 SYSTEMS", x: 22, y: 68, icon: Code2 },
  { id: "skills", label: "Skills Galaxy", eyebrow: "TECH GRAPH", x: 61, y: 58, icon: Satellite },
  { id: "education", label: "Education Moon", eyebrow: "RESUME LOG", x: 84, y: 76, icon: GraduationCap },
  { id: "contact", label: "Contact Station", eyebrow: "FINAL DOCK", x: 49, y: 88, icon: Mail },
];
const dataCores = [
  { id: 0, x: 29, y: 34, label: "SYSTEM CORE" },
  { id: 1, x: 72, y: 43, label: "AI CORE" },
  { id: 2, x: 37, y: 79, label: "DATA CORE" },
] as const;
const hazards = [
  { id: 0, x: 54, y: 27, size: 34 }, { id: 1, x: 72, y: 67, size: 42 },
  { id: 2, x: 18, y: 48, size: 29 }, { id: 3, x: 89, y: 51, size: 25 },
] as const;
const clamp = (value: number) => Math.min(95, Math.max(5, value));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function UniverseMode() {
  const { closeUniverseMode, openRecruiterMode, track } = useAnalytics();
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const shipElementRef = useRef<HTMLDivElement>(null);
  const shipPosition = useRef<Point>({ ...START_POSITION });
  const velocity = useRef<Point>({ x: 0, y: 0 });
  const heading = useRef(45);
  const pressedKeys = useRef(new Set<string>());
  const collectedRef = useRef(new Set<number>());
  const visitedRef = useRef(new Set<DestinationId>());
  const shieldRef = useRef(100);
  const boostRef = useRef(100);
  const lastCollision = useRef(0);
  const lastDock = useRef<DestinationId | null>(null);
  const missionComplete = useRef(false);
  const lastHudUpdate = useRef(0);
  const [phase, setPhase] = useState<GamePhase>("briefing");
  const [hudPosition, setHudPosition] = useState<Point>({ ...START_POSITION });
  const [selected, setSelected] = useState<DestinationId>("experience");
  const [collected, setCollected] = useState<number[]>([]);
  const [visited, setVisited] = useState<DestinationId[]>([]);
  const [shield, setShield] = useState(100);
  const [boost, setBoost] = useState(100);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("Mission systems waiting for launch.");
  const [damageTick, setDamageTick] = useState(0);

  const resetGame = useCallback(() => {
    shipPosition.current = { ...START_POSITION };
    velocity.current = { x: 0, y: 0 };
    heading.current = 45;
    pressedKeys.current.clear();
    collectedRef.current = new Set();
    visitedRef.current = new Set();
    shieldRef.current = 100;
    boostRef.current = 100;
    lastCollision.current = 0;
    lastDock.current = null;
    missionComplete.current = false;
    setHudPosition({ ...START_POSITION });
    setCollected([]); setVisited([]); setShield(100); setBoost(100); setScore(0); setDamageTick(0);
    setSelected("experience");
    setStatus("Recover three data cores, avoid anomalies, then dock at Contact Station.");
    setPhase("playing");
    window.requestAnimationFrame(() => mapRef.current?.focus({ preventScroll: true }));
  }, []);

  const applyImpulse = useCallback((key: string) => {
    const impulse = 1.7;
    if (key === "arrowup" || key === "w") velocity.current.y -= impulse;
    if (key === "arrowdown" || key === "s") velocity.current.y += impulse;
    if (key === "arrowleft" || key === "a") velocity.current.x -= impulse;
    if (key === "arrowright" || key === "d") velocity.current.x += impulse;
    const direction = key === "arrowup" || key === "w" ? -45
      : key === "arrowdown" || key === "s" ? 135
        : key === "arrowleft" || key === "a" ? 225
          : key === "arrowright" || key === "d" ? 45
            : null;
    if (direction !== null) {
      heading.current = direction;
      if (shipElementRef.current) {
        shipElementRef.current.style.transform = `translate(-50%,-50%) rotate(${direction}deg)`;
        shipElementRef.current.dataset.thrusting = "true";
      }
    }
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => startButtonRef.current?.focus({ preventScroll: true }));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closeUniverseMode(); return; }
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "shift", " "].includes(key)) {
        event.preventDefault();
        if (!event.repeat) applyImpulse(key);
        pressedKeys.current.add(key);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => pressedKeys.current.delete(event.key.toLowerCase());
    const releaseControls = () => pressedKeys.current.clear();
    window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp); window.addEventListener("blur", releaseControls);
    return () => {
      document.body.style.overflow = previousOverflow; window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("blur", releaseControls);
    };
  }, [applyImpulse, closeUniverseMode]);

  useEffect(() => {
    if (phase !== "playing") return;
    let frame = 0;
    let previous = performance.now();
    const playFrame = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.04); previous = now;
      const keys = pressedKeys.current;
      const inputX = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
      const inputY = (keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0);
      const magnitude = Math.hypot(inputX, inputY) || 1;
      const boosting = (keys.has("shift") || keys.has(" ")) && boostRef.current > 2 && (inputX !== 0 || inputY !== 0);
      const acceleration = boosting ? 43 : 28;
      const maxSpeed = boosting ? 30 : 18;
      if (inputX || inputY) {
        velocity.current.x += (inputX / magnitude) * acceleration * dt;
        velocity.current.y += (inputY / magnitude) * acceleration * dt;
      }
      const friction = Math.pow(inputX || inputY ? 0.965 : 0.89, dt * 60);
      velocity.current.x *= friction; velocity.current.y *= friction;
      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      if (speed > maxSpeed) { velocity.current.x = (velocity.current.x / speed) * maxSpeed; velocity.current.y = (velocity.current.y / speed) * maxSpeed; }
      if (boosting) boostRef.current = Math.max(0, boostRef.current - 34 * dt);
      else boostRef.current = Math.min(100, boostRef.current + 17 * dt);

      const next = { x: clamp(shipPosition.current.x + velocity.current.x * dt), y: clamp(shipPosition.current.y + velocity.current.y * dt) };
      if (next.x <= 5 || next.x >= 95) velocity.current.x *= -0.45;
      if (next.y <= 5 || next.y >= 95) velocity.current.y *= -0.45;
      shipPosition.current = next;
      if (inputX || inputY) heading.current = Math.atan2(inputY, inputX) * 180 / Math.PI + 45;
      if (shipElementRef.current) {
        shipElementRef.current.style.left = `${next.x}%`; shipElementRef.current.style.top = `${next.y}%`;
        shipElementRef.current.style.transform = `translate(-50%,-50%) rotate(${heading.current}deg)`;
        shipElementRef.current.dataset.thrusting = inputX || inputY ? "true" : "false";
        shipElementRef.current.dataset.boosting = boosting ? "true" : "false";
      }

      for (const core of dataCores) {
        if (!collectedRef.current.has(core.id) && distance(next, core) < 4.5) {
          collectedRef.current.add(core.id); setCollected([...collectedRef.current]); setScore((value) => value + 150);
          setStatus(`${core.label} recovered. ${3 - collectedRef.current.size} core${collectedRef.current.size === 2 ? "" : "s"} remaining.`);
          if (collectedRef.current.size === 3) setStatus("All cores recovered. Contact Station is unlocked—dock there to complete the mission.");
        }
      }
      if (now - lastCollision.current > 950 && hazards.some((hazard) => distance(next, hazard) < 4.2 + hazard.size / 24)) {
        lastCollision.current = now; velocity.current.x *= -1.25; velocity.current.y *= -1.25;
        shieldRef.current = Math.max(0, shieldRef.current - 25); setShield(shieldRef.current); setDamageTick((value) => value + 1);
        setStatus(shieldRef.current > 0 ? `Anomaly impact. Shields at ${shieldRef.current}%.` : "Ship disabled by anomaly field.");
        if (shieldRef.current === 0) setPhase("crashed");
      }

      let docked: DestinationId | null = null;
      for (const destination of destinationLayout) {
        if (distance(next, destination) < 6.2) {
          docked = destination.id;
          if (lastDock.current !== destination.id) {
            lastDock.current = destination.id; setSelected(destination.id);
            if (!visitedRef.current.has(destination.id)) { visitedRef.current.add(destination.id); setVisited([...visitedRef.current]); setScore((value) => value + 50); }
            setStatus(`Docked at ${destination.label}. Portfolio data loaded.`);
          }
          if (destination.id === "contact" && collectedRef.current.size === 3 && !missionComplete.current) {
            missionComplete.current = true; setScore((value) => value + 500 + shieldRef.current * 2);
            setStatus("Mission complete. All portfolio systems are online."); setPhase("complete");
          }
          break;
        }
      }
      if (!docked && lastDock.current) lastDock.current = null;
      if (now - lastHudUpdate.current > 90) { lastHudUpdate.current = now; setHudPosition({ ...next }); setBoost(Math.round(boostRef.current)); }
      frame = window.requestAnimationFrame(playFrame);
    };
    frame = window.requestAnimationFrame(playFrame);
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  const selectedContent = useMemo<{ title: string; intro: string; rows: Array<{ title: string; detail?: string }> }>(() => {
    const portfolioModule = portfolio.modules.find((item) => item.id === selected);
    if (portfolioModule) return { title: portfolioModule.title, intro: portfolioModule.summary, rows: portfolioModule.items.slice(0, 6).map((item) => ({ title: item })) };
    if (selected === "experience") return { title: "Production Experience", intro: `${portfolio.identity.experienceYears} years across applied AI, distributed systems, data platforms, and backend engineering.`, rows: portfolio.experience.map((item) => ({ title: item.company, detail: `${item.dates} / ${item.role}` })) };
    if (selected === "projects") return { title: "Featured Systems", intro: "Two production-minded systems mapped from architecture to measurable behavior.", rows: portfolio.projects.map((item) => ({ title: item.title, detail: item.stack.slice(0, 4).join(" · ") })) };
    if (selected === "skills") { const categories = [...new Set(portfolio.technologies.map((item) => item.category))]; return { title: "Skills Galaxy", intro: "A connected toolkit spanning languages, data, AI, and cloud infrastructure.", rows: categories.map((category) => ({ title: category, detail: portfolio.technologies.filter((item) => item.category === category).slice(0, 5).map((item) => item.name).join(" · ") })) }; }
    if (selected === "education") return { title: "Education Log", intro: "My complete education history and credentials are available in the résumé.", rows: [{ title: "Open résumé", detail: "Review the full career and education record." }] };
    return { title: "Contact Station", intro: "Open a direct channel for roles, engineering conversations, or collaboration.", rows: [{ title: "Email", detail: "lokeshprasanth995@gmail.com" }, { title: "LinkedIn", detail: "Lokeshprasanth Gadesula" }, { title: "Base", detail: portfolio.identity.location }] };
  }, [selected]);

  const holdControl = (key: string) => { applyImpulse(key); pressedKeys.current.add(key); };
  const releaseControl = (key: string) => pressedKeys.current.delete(key);
  const openTerminal = () => { closeUniverseMode(); window.setTimeout(() => document.getElementById("terminal")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); };

  return (
    <div className="universe-mode" role="dialog" aria-modal="true" aria-labelledby="universe-title">
      <div className="universe-stars" aria-hidden="true" />
      <div className="universe-shell">
        <header className="universe-header">
          <div className="universe-brand"><span className="universe-kicker"><i /> PLAY / EXPLORE / DISCOVER</span><strong id="universe-title">LOKESH QUEST: PLAY MY PORTFOLIO</strong></div>
          <div className="universe-header-actions"><span className="universe-online"><i /> GAME ENGINE ONLINE</span><button ref={exitButtonRef} className="universe-exit" type="button" onClick={closeUniverseMode} aria-label="Exit Universe"><X size={16} aria-hidden="true" /> <span>Exit Game</span></button></div>
        </header>

        <main className="universe-content universe-game-layout">
          <section className="universe-map-panel" aria-label="Playable portfolio space mission">
            <div className="game-hud">
              <div><span>SCORE</span><strong>{score.toString().padStart(4, "0")}</strong></div><div><span>CORES</span><strong>{collected.length} / 3</strong></div>
              <div><span><Shield size={11} /> SHIELD</span><strong>{shield}%</strong></div><div><span><Zap size={11} /> BOOST</span><strong>{boost}%</strong></div>
              <div className="game-objective"><span><Crosshair size={11} /> CURRENT MISSION</span><strong>{collected.length < 3 ? "RECOVER DATA CORES" : "DOCK AT CONTACT STATION"}</strong></div>
            </div>

            <div ref={mapRef} className={`universe-map universe-game-map ${damageTick ? `damage-pulse-${damageTick % 2}` : ""}`} tabIndex={0} aria-label="Space mission. Hold W A S D or arrow keys to fly. Hold Shift or Space to boost.">
              <div className="universe-orbit orbit-one" aria-hidden="true" /><div className="universe-orbit orbit-two" aria-hidden="true" />
              {destinationLayout.map((destination) => {
                const Icon = destination.icon; const isVisited = visited.includes(destination.id); const isTarget = destination.id === "contact" && collected.length === 3;
                return <button key={destination.id} type="button" className={`universe-destination ${selected === destination.id ? "active" : ""} ${isVisited ? "visited" : ""} ${isTarget ? "mission-target" : ""}`} style={{ left: `${destination.x}%`, top: `${destination.y}%` }} onClick={() => { setSelected(destination.id); setStatus(`Navigation scan: fly to ${destination.label} to dock.`); }} aria-label={`Scan ${destination.label}${isVisited ? ", visited" : ""}`}><span className="destination-planet"><Icon size={15} aria-hidden="true" /></span><span><strong>{destination.label}</strong><small>{isVisited ? "DATA LOADED" : destination.eyebrow}</small></span></button>;
              })}
              {dataCores.map((core) => !collected.includes(core.id) && <div key={core.id} className="game-core" style={{ left: `${core.x}%`, top: `${core.y}%` }} aria-label={`${core.label} collectible`}><Gem size={16} /><span>{core.label}</span></div>)}
              {hazards.map((hazard) => <div key={hazard.id} className="game-hazard" style={{ left: `${hazard.x}%`, top: `${hazard.y}%`, width: hazard.size, height: hazard.size }} aria-hidden="true"><span /></div>)}
              <div ref={shipElementRef} className="universe-ship game-ship" style={{ left: `${START_POSITION.x}%`, top: `${START_POSITION.y}%`, transform: "translate(-50%,-50%) rotate(45deg)" }} data-thrusting="false" data-boosting="false" aria-label="Player ship"><i className="ship-trail" aria-hidden="true" /><Rocket size={21} aria-hidden="true" /></div>

              {phase === "briefing" && <div className="game-modal" role="document"><span className="game-modal-icon"><Rocket size={25} /></span><span className="eyebrow">MISSION 01 / DISCOVER LOKESH</span><h2>Ready to fly through my story?</h2><p>Explore my experience, skills, projects, and engineering impact in a fun way. Pilot the ship, recover three data cores, and dock at each planet to unlock more about me.</p><div className="game-key-guide"><span>WASD / ARROWS <b>STEER</b></span><span>SHIFT / SPACE <b>BOOST</b></span></div><button ref={startButtonRef} type="button" onClick={resetGame}><Rocket size={16} /> Start the Adventure</button></div>}
              {phase === "crashed" && <div className="game-modal game-result" role="status"><span className="game-modal-icon danger"><CircleAlert size={25} /></span><span className="eyebrow">MISSION INTERRUPTED</span><h2>Ship disabled.</h2><p>The anomaly field depleted your shields. Recalibrate and make another run.</p><strong className="result-score">SCORE / {score.toString().padStart(4, "0")}</strong><button type="button" onClick={resetGame}><RotateCcw size={16} /> Retry Mission</button></div>}
              {phase === "complete" && <div className="game-modal game-result complete" role="status"><span className="game-modal-icon success"><Trophy size={25} /></span><span className="eyebrow">MISSION COMPLETE</span><h2>Systems online.</h2><p>You recovered every core and reached the final station with {shield}% shields remaining.</p><strong className="result-score">FINAL SCORE / {score.toString().padStart(4, "0")}</strong><div className="result-actions"><button type="button" onClick={() => { setPhase("playing"); mapRef.current?.focus(); }}><Rocket size={16} /> Free Explore</button><button type="button" onClick={openRecruiterMode}><UserRoundSearch size={16} /> Recruiter Mission</button></div></div>}
            </div>

            <div className="game-status" aria-live="polite"><span><i /> MISSION LOG</span><p>{status}</p><small>POS {Math.round(hudPosition.x)}:{Math.round(hudPosition.y)}</small></div>
            <div className="universe-controls game-controls" aria-label="Touch ship controls" onContextMenu={(event) => event.preventDefault()}>
              <div className="direction-pad">
                <button type="button" onPointerDown={() => holdControl("arrowup")} onPointerUp={() => releaseControl("arrowup")} onPointerCancel={() => releaseControl("arrowup")} onPointerLeave={() => releaseControl("arrowup")} aria-label="Thrust up"><ArrowUp size={18} /></button>
                <button type="button" onPointerDown={() => holdControl("arrowleft")} onPointerUp={() => releaseControl("arrowleft")} onPointerCancel={() => releaseControl("arrowleft")} onPointerLeave={() => releaseControl("arrowleft")} aria-label="Thrust left"><ArrowLeft size={18} /></button>
                <button type="button" onPointerDown={() => holdControl("arrowdown")} onPointerUp={() => releaseControl("arrowdown")} onPointerCancel={() => releaseControl("arrowdown")} onPointerLeave={() => releaseControl("arrowdown")} aria-label="Thrust down"><ArrowDown size={18} /></button>
                <button type="button" onPointerDown={() => holdControl("arrowright")} onPointerUp={() => releaseControl("arrowright")} onPointerCancel={() => releaseControl("arrowright")} onPointerLeave={() => releaseControl("arrowright")} aria-label="Thrust right"><ArrowRight size={18} /></button>
              </div>
              <button className="boost-control" type="button" onPointerDown={() => holdControl("shift")} onPointerUp={() => releaseControl("shift")} onPointerCancel={() => releaseControl("shift")} onPointerLeave={() => releaseControl("shift")} aria-label="Hold Space to Boost"><Zap size={17} /> Space to Boost</button>
              <button className="restart-control" type="button" onClick={resetGame}><RotateCcw size={16} /> Restart</button>
            </div>
          </section>

          <aside className="universe-inspector" aria-live="polite">
            <div className="universe-inspector-head"><span>SHIP DATABASE / {visited.includes(selected) ? "DOCKED DATA" : "REMOTE SCAN"}</span><i /></div><h2>{selectedContent.title}</h2><p>{selectedContent.intro}</p>
            <div className="universe-manifest">{selectedContent.rows.map((row) => <div key={`${row.title}-${row.detail ?? ""}`}><strong>{row.title}</strong>{row.detail && <span>{row.detail}</span>}</div>)}</div>
            {selected === "education" && <a className="universe-inline-action" href={portfolio.links.resumeTerminal} target="_blank" rel="noopener noreferrer" onClick={() => track("resume_opened", { source: "universe" })}>Open résumé log</a>}
            {selected === "contact" && <a className="universe-inline-action" href={portfolio.links.email} onClick={() => track("contact_clicked", { channel: "email", source: "universe" })}>Open email channel</a>}
            <section className="universe-impact" aria-label="Engineering impact telemetry"><span>{"// ENGINEERING IMPACT"}</span><div>{portfolio.identity.proof.map((item) => <p key={item.label}><strong>{item.value}</strong><small>{item.label}</small></p>)}</div></section>
            <div className="universe-missions"><button type="button" onClick={openRecruiterMode}><UserRoundSearch size={15} /> Recruiter Mission</button><button type="button" onClick={openTerminal}><Code2 size={15} /> Terminal Relay</button></div>
          </aside>
        </main>
      </div>
    </div>
  );
}
