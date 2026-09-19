export function DebugOverlay({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <aside className="debug-overlay" aria-live="polite">
      <strong>DEBUG MODE</strong>
      <span>grid: 12col</span>
      <span>motion: semantic</span>
      <span>topology: svg/runtime</span>
      <span>data: portfolio.config.ts</span>
    </aside>
  );
}
