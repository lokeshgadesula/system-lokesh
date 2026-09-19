export function SectionIntro({ index, eyebrow, title, copy }: { index: string; eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="section-intro">
      <div className="section-code"><span>{index}</span><i /></div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {copy && <p className="section-copy">{copy}</p>}
      </div>
    </div>
  );
}
