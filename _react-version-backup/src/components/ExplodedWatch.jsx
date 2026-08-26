import { useId } from "react";
import { dialColor, isMetalStrap, metalColors, strapColor } from "@/lib/watch";
const PARTS = [{
  id: "crystal",
  label: "Sapphire crystal",
  dx: 0,
  dy: -520
}, {
  id: "bezel",
  label: "Bezel",
  dx: 0,
  dy: -350
}, {
  id: "dial",
  label: "Dial",
  dx: 0,
  dy: -175
}, {
  id: "case",
  label: "Case & movement",
  dx: 0,
  dy: 0
}, {
  id: "strap",
  label: "Strap",
  dx: 0,
  dy: 0
}, {
  id: "clasp",
  label: "Clasp",
  dx: 160,
  dy: 330
}];
const STRAP_UPPER = {
  dx: -160,
  dy: 120
};
const STRAP_LOWER = {
  dx: 160,
  dy: 120
};

// Round to keep SSR and client markup byte-identical.
const r = n => Math.round(n * 100) / 100;
export function ExplodedWatch({
  config,
  explode,
  activePart,
  onPartHover,
  className
}) {
  const uid = useId().replace(/:/g, "");
  const m = metalColors(config.metal);
  const dial = dialColor(config.dial);
  const strap = strapColor(config.strap);
  const metalStrap = isMetalStrap(config.strap);
  const lightDial = config.dial === "ivory" || config.dial === "champagne";
  const t = id => {
    const p = PARTS.find(x => x.id === id);
    return `translate(${r(p.dx * explode)} ${r(p.dy * explode)})`;
  };
  const move = o => `translate(${r(o.dx * explode)} ${r(o.dy * explode)})`;
  const dim = id => activePart && activePart !== id ? 0.22 : 1;
  const hover = id => ({
    onMouseEnter: () => onPartHover?.(id),
    onMouseLeave: () => onPartHover?.(null),
    style: {
      opacity: dim(id),
      transition: "transform 900ms cubic-bezier(.22,1,.36,1), opacity 400ms ease",
      cursor: onPartHover ? "pointer" : "default"
    }
  });
  return <svg viewBox="0 -150 400 860" className={className} role="img" aria-label="Exploded view of a customisable wristwatch">
      <defs>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={m.light} />
          <stop offset="45%" stopColor={m.mid} />
          <stop offset="100%" stopColor={m.dark} />
        </linearGradient>
        <linearGradient id={`metalv-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={m.light} />
          <stop offset="100%" stopColor={m.dark} />
        </linearGradient>
        <radialGradient id={`dial-${uid}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={dial} stopOpacity="0.75" />
          <stop offset="55%" stopColor={dial} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={`strap-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <filter id={`shadow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      <g transform={`translate(200 276) scale(1 ${r(1 - 0.26 * explode)}) translate(-200 -276)`} style={{
      transition: "transform 900ms cubic-bezier(.22,1,.36,1)"
    }}>
      {/* ground shadow */}
      <ellipse cx="200" cy="600" rx={120 - explode * 30} ry={16 - explode * 6} fill="#000" opacity={0.35 - explode * 0.15} />

      {/* CLASP */}
      <g transform={t("clasp")} {...hover("clasp")}>
        <g transform="translate(200 470)">
          {config.clasp === "pin" ? <>
              <rect x="-30" y="-16" width="60" height="32" rx="8" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="7" />
              <rect x="-4" y="-26" width="8" height="52" rx="3" fill={`url(#metalv-${uid})`} />
            </> : <>
              <rect x="-46" y="-18" width="92" height="36" rx="10" fill={`url(#metal-${uid})`} />
              <rect x="-36" y="-9" width="72" height="18" rx="6" fill="#000" opacity="0.22" />
              {config.clasp === "butterfly" && <>
                  <rect x="-46" y="-2" width="40" height="4" rx="2" fill={m.light} opacity="0.7" />
                  <rect x="6" y="-2" width="40" height="4" rx="2" fill={m.light} opacity="0.7" />
                </>}
              {config.clasp === "folding" && <circle cx="0" cy="0" r="7" fill={m.light} opacity="0.85" />}
            </>}
        </g>
      </g>

      {/* STRAP — upper and lower halves slide out of the lugs */}
      <g {...hover("strap")}>
        <g transform={move(STRAP_UPPER)} style={{
          transition: "transform 900ms cubic-bezier(.22,1,.36,1)"
        }}>
          {metalStrap ? [0, 1, 2, 3].map(i => <rect key={`u${i}`} x="156" y={196 - i * 30} width="88" height="24" rx="6" fill={strap} />) : <>
              <path d="M158 200 L242 200 L236 96 Q200 84 164 96 Z" fill={strap} />
              <path d="M158 200 L242 200 L236 96 Q200 84 164 96 Z" fill={`url(#strap-${uid})`} />
              <path d="M168 194 L232 194" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="6 6" />
              {[120, 148].map(y => <rect key={y} x="164" y={y} width="72" height="3" rx="1.5" fill="#000" opacity="0.18" />)}
            </>}
        </g>
        <g transform={move(STRAP_LOWER)} style={{
          transition: "transform 900ms cubic-bezier(.22,1,.36,1)"
        }}>
          {metalStrap ? [0, 1, 2, 3].map(i => <rect key={`d${i}`} x="156" y={352 + i * 30} width="88" height="24" rx="6" fill={strap} />) : <>
              <path d="M158 352 L242 352 L238 460 Q200 470 162 460 Z" fill={strap} />
              <path d="M158 352 L242 352 L238 460 Q200 470 162 460 Z" fill={`url(#strap-${uid})`} />
              <path d="M170 358 L230 358" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="6 6" />
            </>}
        </g>
      </g>

      {/* CASE */}
      <g transform={t("case")} {...hover("case")}>
        <g filter={`url(#shadow-${uid})`}>
          <rect x="150" y="188" width="100" height="30" rx="10" fill={`url(#metalv-${uid})`} />
          <rect x="150" y="334" width="100" height="30" rx="10" fill={`url(#metalv-${uid})`} />
          <circle cx="200" cy="276" r="98" fill={`url(#metal-${uid})`} />
          <circle cx="200" cy="276" r="84" fill="#0b0c0e" opacity="0.85" />
          <rect x="296" y="264" width="22" height="24" rx="6" fill={`url(#metalv-${uid})`} />
          <circle cx="200" cy="276" r="70" fill="#16181c" />
          <circle cx="200" cy="276" r="46" fill="#26292f" opacity="0.6" />
          <circle cx="176" cy="258" r="16" fill={m.mid} opacity="0.5" />
          <circle cx="224" cy="296" r="12" fill={m.mid} opacity="0.4" />
        </g>
      </g>

      {/* DIAL */}
      <g transform={t("dial")} {...hover("dial")}>
        <g filter={`url(#shadow-${uid})`}>
          <circle cx="200" cy="276" r="84" fill={`url(#dial-${uid})`} />
          {Array.from({
            length: 12
          }).map((_, i) => {
            const a = i * 30 * Math.PI / 180;
            const r1 = 70;
            const r2 = i % 3 === 0 ? 56 : 62;
            return <line key={i} x1={r(200 + Math.sin(a) * r1)} y1={r(276 - Math.cos(a) * r1)} x2={r(200 + Math.sin(a) * r2)} y2={r(276 - Math.cos(a) * r2)} stroke={lightDial ? m.dark : m.light} strokeWidth={i % 3 === 0 ? 5 : 2.5} strokeLinecap="round" />;
          })}
          {/* hands */}
          <line x1="200" y1="276" x2="200" y2="220" stroke={lightDial ? "#22252a" : m.light} strokeWidth="6" strokeLinecap="round" />
          <line x1="200" y1="276" x2="240" y2="304" stroke={lightDial ? "#22252a" : m.light} strokeWidth="5" strokeLinecap="round" />
          <line x1="200" y1="276" x2="172" y2="316" stroke="#c8503c" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="200" cy="276" r="5" fill={m.mid} />
          <text x="200" y="240" textAnchor="middle" fontSize="11" letterSpacing="3" fill={lightDial ? "#3a3d43" : m.light} opacity="0.85" fontFamily="var(--font-display, serif)">
            ATELIER
          </text>
          {config.engraving.trim() && <text x="200" y="330" textAnchor="middle" fontSize="10" letterSpacing="2" fill={lightDial ? "#3a3d43" : m.light} opacity="0.75">
              {config.engraving.trim().slice(0, 18).toUpperCase()}
            </text>}
        </g>
      </g>

      {/* BEZEL */}
      <g transform={t("bezel")} {...hover("bezel")}>
        <g filter={`url(#shadow-${uid})`}>
          <circle cx="200" cy="276" r="98" fill="none" stroke={`url(#metal-${uid})`} strokeWidth="16" />
          {Array.from({
            length: 36
          }).map((_, i) => {
            const a = i * 10 * Math.PI / 180;
            return <line key={i} x1={r(200 + Math.sin(a) * 92)} y1={r(276 - Math.cos(a) * 92)} x2={r(200 + Math.sin(a) * 104)} y2={r(276 - Math.cos(a) * 104)} stroke={m.dark} strokeWidth="1.6" opacity="0.6" />;
          })}
        </g>
      </g>

      {/* CRYSTAL */}
      <g transform={t("crystal")} {...hover("crystal")}>
        <circle cx="200" cy="276" r="86" fill={`url(#glass-${uid})`} stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
        <path d="M148 236 A86 86 0 0 1 244 204" stroke="#fff" strokeOpacity="0.5" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
      </g>
    </svg>;
}
export const WATCH_PARTS = PARTS;
