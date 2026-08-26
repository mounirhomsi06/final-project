// Renders the exploded-view watch SVG — a photoreal-leaning port of the
// <ExplodedWatch> React component: brushed-metal case, sunray-brushed dial
// with lumed hands and applied indices, a jewelled gear train, leather-grain
// straps and a fluted, sapphire-topped bezel. Each part (crystal, bezel,
// dial, case, strap, clasp) can be animated apart via `explode` (0 =
// assembled, 1 = fully exploded) and dimmed/highlighted via `activePart`.

import { dialColor, isMetalStrap, metalColors, strapColor } from "./watch-data.js";

export const WATCH_PARTS = [
  { id: "crystal", label: "Sapphire crystal", dx: 0, dy: -520 },
  { id: "bezel", label: "Bezel", dx: 0, dy: -350 },
  { id: "dial", label: "Dial", dx: 0, dy: -175 },
  { id: "case", label: "Case & movement", dx: 0, dy: 0 },
  { id: "strap", label: "Strap", dx: 0, dy: 0 },
  { id: "clasp", label: "Clasp", dx: 160, dy: 330 },
];

const STRAP_UPPER = { dx: -160, dy: 120 };
const STRAP_LOWER = { dx: 160, dy: 120 };

const CX = 200;
const CY = 276;
const LUME = "#c9f2df";

const r = (n) => Math.round(n * 100) / 100;

// polar point relative to the dial centre
const P = (angleDeg, radius) => ({
  x: r(CX + Math.sin((angleDeg * Math.PI) / 180) * radius),
  y: r(CY - Math.cos((angleDeg * Math.PI) / 180) * radius),
});

let instanceCounter = 0;

function defs(id, m, dial, linkMetal) {
  return `<defs>
    <linearGradient id="metal-${id}" x1="0.08" y1="0" x2="0.92" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" /><stop offset="12%" stop-color="${m.light}" />
      <stop offset="34%" stop-color="${m.mid}" /><stop offset="50%" stop-color="${m.dark}" />
      <stop offset="66%" stop-color="${m.mid}" /><stop offset="86%" stop-color="${m.light}" /><stop offset="100%" stop-color="${m.dark}" />
    </linearGradient>
    <linearGradient id="metalv-${id}" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0%" stop-color="${m.dark}" /><stop offset="22%" stop-color="${m.mid}" /><stop offset="46%" stop-color="${m.light}" />
      <stop offset="70%" stop-color="${m.mid}" /><stop offset="100%" stop-color="${m.dark}" />
    </linearGradient>
    <linearGradient id="bezel-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${m.light}" /><stop offset="18%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="38%" stop-color="${m.mid}" /><stop offset="55%" stop-color="${m.dark}" /><stop offset="74%" stop-color="${m.mid}" />
      <stop offset="90%" stop-color="${m.light}" /><stop offset="100%" stop-color="${m.dark}" />
    </linearGradient>

    <filter id="brush-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.02" numOctaves="3" seed="7" result="n" />
      <feColorMatrix in="n" type="saturate" values="0" result="g" />
      <feComponentTransfer in="g" result="soft"><feFuncA type="linear" slope="0.16" intercept="0" /></feComponentTransfer>
      <feComposite in="soft" in2="SourceGraphic" operator="atop" />
    </filter>
    <filter id="grain-${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="n" />
      <feColorMatrix in="n" type="saturate" values="0" result="g" />
      <feComponentTransfer in="g" result="soft"><feFuncA type="linear" slope="0.1" /></feComponentTransfer>
      <feComposite in="soft" in2="SourceGraphic" operator="atop" />
    </filter>
    <filter id="leather-${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.22 0.5" numOctaves="4" seed="11" result="n" />
      <feDiffuseLighting in="n" lighting-color="#ffffff" surfaceScale="1.4" result="li"><feDistantLight azimuth="235" elevation="58" /></feDiffuseLighting>
      <feComposite in="li" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="tex" />
      <feComposite in="tex" in2="SourceGraphic" operator="in" />
    </filter>

    <radialGradient id="dial-${id}" cx="36%" cy="26%" r="86%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" /><stop offset="22%" stop-color="${dial}" stop-opacity="0.92" />
      <stop offset="62%" stop-color="${dial}" /><stop offset="100%" stop-color="#000" stop-opacity="0.62" />
    </radialGradient>
    <radialGradient id="dialvig-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="58%" stop-color="#000" stop-opacity="0" /><stop offset="100%" stop-color="#000" stop-opacity="0.58" />
    </radialGradient>

    <radialGradient id="glass-${id}" cx="35%" cy="25%" r="85%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34" /><stop offset="40%" stop-color="#cfe6ff" stop-opacity="0.07" />
      <stop offset="78%" stop-color="#ffffff" stop-opacity="0.02" /><stop offset="100%" stop-color="#bcd8ff" stop-opacity="0.22" />
    </radialGradient>
    <linearGradient id="sheen-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" /><stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>

    <linearGradient id="strap-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.5" /><stop offset="22%" stop-color="#fff" stop-opacity="0.06" />
      <stop offset="50%" stop-color="#fff" stop-opacity="0.16" /><stop offset="78%" stop-color="#000" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#000" stop-opacity="0.55" />
    </linearGradient>
    <linearGradient id="link-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${linkMetal.dark}" /><stop offset="16%" stop-color="${linkMetal.mid}" /><stop offset="30%" stop-color="${linkMetal.light}" />
      <stop offset="46%" stop-color="${linkMetal.mid}" /><stop offset="62%" stop-color="${linkMetal.light}" /><stop offset="80%" stop-color="${linkMetal.mid}" />
      <stop offset="100%" stop-color="${linkMetal.dark}" />
    </linearGradient>

    <filter id="shadow-${id}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.5" /></filter>
    <filter id="softshadow-${id}" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity="0.45" /></filter>
    <filter id="lumeglow-${id}" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="caseblur-${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5" /></filter>

    <radialGradient id="caseao-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="78%" stop-color="#000" stop-opacity="0" /><stop offset="94%" stop-color="#000" stop-opacity="0" /><stop offset="100%" stop-color="#000" stop-opacity="0.55" />
    </radialGradient>

    <clipPath id="dialclip-${id}"><circle cx="${CX}" cy="${CY}" r="84" /></clipPath>
  </defs>`;
}

// A soft studio-light sweep across the polished bezel/case rim, plus a
// darker ambient-occlusion ring at the outer edge — sells the case as
// rounded metal rather than a flat disc.
function caseGloss(id) {
  const hiA = P(-70, 99);
  const hiB = P(-20, 99);
  const loA = P(110, 99);
  const loB = P(150, 99);
  return `<circle cx="${CX}" cy="${CY}" r="98" fill="url(#caseao-${id})" />
    <path d="M${hiA.x} ${hiA.y} A99 99 0 0 1 ${hiB.x} ${hiB.y}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#caseblur-${id})" />
    <path d="M${loA.x} ${loA.y} A99 99 0 0 1 ${loB.x} ${loB.y}" stroke="#ffffff" stroke-opacity="0.16" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#caseblur-${id})" />`;
}

// Two studio-light catches on the sapphire: a soft hotspot and a crisp
// plus-shaped reflection, the way a ring light or softbox shows up in
// real watch macro photography.
function crystalGlints(id) {
  const hot = P(-42, 44);
  const cross = P(-15, 60);
  return `<circle cx="${hot.x}" cy="${hot.y}" r="7" fill="#ffffff" opacity="0.16" />
    <circle cx="${hot.x}" cy="${hot.y}" r="2.4" fill="#ffffff" opacity="0.85" />
    <line x1="${cross.x}" y1="${r(cross.y - 9)}" x2="${cross.x}" y2="${r(cross.y + 9)}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2.2" stroke-linecap="round" />
    <line x1="${r(cross.x - 9)}" y1="${cross.y}" x2="${r(cross.x + 9)}" y2="${cross.y}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2.2" stroke-linecap="round" />`;
}

function claspMarkup(config, m, id) {
  if (config.clasp === "pin") {
    return `<rect x="-30" y="-17" width="60" height="34" rx="9" fill="none" stroke="url(#metalv-${id})" stroke-width="7" />
      <rect x="-30" y="-17" width="60" height="34" rx="9" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="1" />
      <rect x="-3.5" y="-27" width="7" height="54" rx="3" fill="url(#metalv-${id})" />
      <circle cx="0" cy="-24" r="3" fill="${m.light}" opacity="0.8" />`;
  }
  const extra =
    config.clasp === "butterfly"
      ? `<rect x="-46" y="-2.5" width="41" height="5" rx="2.5" fill="${m.light}" opacity="0.75" />
         <rect x="5" y="-2.5" width="41" height="5" rx="2.5" fill="${m.light}" opacity="0.75" />
         <circle cx="-24" cy="0" r="2" fill="${m.dark}" opacity="0.7" />
         <circle cx="24" cy="0" r="2" fill="${m.dark}" opacity="0.7" />`
      : config.clasp === "folding"
        ? `<circle cx="0" cy="0" r="7.5" fill="${m.light}" opacity="0.9" />
           <circle cx="0" cy="0" r="3.4" fill="${m.dark}" opacity="0.7" />`
        : `<rect x="-20" y="-4" width="40" height="8" rx="4" fill="${m.light}" opacity="0.5" />
           <rect x="-47" y="14" width="94" height="4" rx="2" fill="#000" opacity="0.3" />`;
  return `<rect x="-47" y="-19" width="94" height="38" rx="11" fill="url(#metalv-${id})" />
    <rect x="-47" y="-19" width="94" height="38" rx="11" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="1" />
    <rect x="-38" y="-10" width="76" height="20" rx="7" fill="#000" opacity="0.26" />
    <rect x="-38" y="-10" width="76" height="6" rx="3" fill="#fff" opacity="0.14" />
    ${extra}`;
}

function metalLinks(id, yStart, dir) {
  return [0, 1, 2, 3]
    .map((i) => {
      const y = yStart + dir * i * 30;
      const w = 88 - i * 3;
      const x = r(CX - w / 2);
      return `<g>
        <rect x="${x}" y="${y}" width="${w}" height="25" rx="7" fill="url(#link-${id})" />
        <rect x="${x}" y="${y}" width="${w}" height="25" rx="7" fill="none" stroke="#000" stroke-opacity="0.4" stroke-width="0.8" />
        <rect x="${r(x + w * 0.31)}" y="${y + 1.5}" width="${r(w * 0.38)}" height="22" rx="5" fill="#fff" opacity="0.1" />
        <rect x="${r(x + 4)}" y="${y + 2}" width="${r(w - 8)}" height="3" rx="1.5" fill="#fff" opacity="0.22" />
      </g>`;
    })
    .join("");
}

function strapHalf({ id, strap, metalStrap, rubberStrap, path, lace1, lace2, studY, plainY, endLine, linksY, linksDir }) {
  if (metalStrap) {
    return `<g filter="url(#softshadow-${id})">${metalLinks(id, linksY, linksDir)}</g>`;
  }
  const texture = rubberStrap ? "" : `<path d="${path}" fill="${strap}" filter="url(#leather-${id})" opacity="0.55" />`;
  const studs = rubberStrap
    ? studY.map((y) => `<rect x="166" y="${y}" width="68" height="5" rx="2.5" fill="#000" opacity="0.3" />`).join("")
    : plainY.map((y) => `<rect x="167" y="${y}" width="66" height="2.5" rx="1.25" fill="#000" opacity="0.2" />`).join("");
  return `<g filter="url(#softshadow-${id})">
    <path d="${path}" fill="${strap}" />
    ${texture}
    <path d="${path}" fill="url(#strap-${id})" />
    <path d="${lace1}" stroke="#f4e3c8" stroke-opacity="0.5" stroke-width="1.6" stroke-dasharray="5 5" fill="none" />
    <path d="${lace2}" stroke="#f4e3c8" stroke-opacity="0.5" stroke-width="1.6" stroke-dasharray="5 5" fill="none" />
    ${studs}
    <path d="${endLine}" stroke="#000" stroke-opacity="0.35" stroke-width="2" />
  </g>`;
}

function strapLowerRivets(rubberStrap) {
  return rubberStrap
    ? [372, 392, 412, 432].map((y) => `<rect x="166" y="${y}" width="68" height="5" rx="2.5" fill="#000" opacity="0.3" />`).join("")
    : [388, 418].map((y) => `<ellipse cx="${CX}" cy="${y}" rx="7" ry="4.5" fill="#000" opacity="0.4" />`).join("");
}

function caseLugs(id, m) {
  return [
    { y: 182, flip: false },
    { y: 334, flip: true },
  ]
    .map((l) => {
      const path = l.flip
        ? "M152 334 Q150 366 158 372 L166 366 L166 336 Z M248 334 Q250 366 242 372 L234 366 L234 336 Z"
        : "M152 218 Q150 186 158 180 L166 186 L166 216 Z M248 218 Q250 186 242 180 L234 186 L234 216 Z";
      return `<g>
        <path d="${path}" fill="url(#metalv-${id})" />
        <rect x="152" y="${l.flip ? 338 : 190}" width="96" height="26" rx="9" fill="url(#metalv-${id})" />
        <rect x="158" y="${l.flip ? 356 : 186}" width="84" height="5" rx="2.5" fill="${m.dark}" opacity="0.85" />
        <rect x="158" y="${l.flip ? 356 : 186}" width="84" height="2" rx="1" fill="#fff" opacity="0.28" />
      </g>`;
    })
    .join("");
}

function gearTrain(m) {
  return [
    { x: 232, y: 300, rad: 15, teeth: 16 },
    { x: 206, y: 322, rad: 10, teeth: 12 },
    { x: 238, y: 244, rad: 8, teeth: 10 },
  ]
    .map((g) => {
      const teeth = Array.from({ length: g.teeth })
        .map((_, i) => {
          const a = (i * 360) / g.teeth;
          const p1 = { x: r(g.x + Math.sin((a * Math.PI) / 180) * g.rad), y: r(g.y - Math.cos((a * Math.PI) / 180) * g.rad) };
          const p2 = { x: r(g.x + Math.sin((a * Math.PI) / 180) * (g.rad + 3)), y: r(g.y - Math.cos((a * Math.PI) / 180) * (g.rad + 3)) };
          return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${m.mid}" stroke-width="1.6" />`;
        })
        .join("");
      return `<g opacity="0.6">
        <circle cx="${g.x}" cy="${g.y}" r="${g.rad}" fill="none" stroke="${m.mid}" stroke-width="2" />
        ${teeth}
        <circle cx="${g.x}" cy="${g.y}" r="2" fill="${m.light}" opacity="0.7" />
      </g>`;
    })
    .join("");
}

function sunrayBrushing() {
  return Array.from({ length: 60 })
    .map((_, i) => {
      const a = i * 6;
      const p = P(a, 92);
      return `<line x1="${CX}" y1="${CY}" x2="${p.x}" y2="${p.y}" stroke="${i % 2 === 0 ? "#ffffff" : "#000000"}" stroke-opacity="${i % 2 === 0 ? 0.07 : 0.09}" stroke-width="4" />`;
    })
    .join("");
}

function minuteTrack(ink) {
  return Array.from({ length: 60 })
    .map((_, i) => {
      const a = i * 6;
      const outer = P(a, 76);
      const inner = P(a, i % 5 === 0 ? 70 : 73);
      return `<line x1="${outer.x}" y1="${outer.y}" x2="${inner.x}" y2="${inner.y}" stroke="${ink}" stroke-opacity="${i % 5 === 0 ? 0.75 : 0.4}" stroke-width="${i % 5 === 0 ? 1.6 : 0.9}" />`;
    })
    .join("");
}

function appliedIndices(m, lightDial) {
  return Array.from({ length: 12 })
    .map((_, i) => {
      if (i === 3) return ""; // date window at 3
      const a = i * 30;
      const outer = P(a, 68);
      const inner = P(a, i % 3 === 0 ? 52 : 58);
      const w = i % 3 === 0 ? 6 : 4;
      return `<g>
        <line x1="${r(outer.x + 1)}" y1="${r(outer.y + 1.5)}" x2="${r(inner.x + 1)}" y2="${r(inner.y + 1.5)}" stroke="#000" stroke-opacity="0.4" stroke-width="${w}" stroke-linecap="butt" />
        <line x1="${outer.x}" y1="${outer.y}" x2="${inner.x}" y2="${inner.y}" stroke="${lightDial ? m.dark : m.light}" stroke-width="${w}" stroke-linecap="butt" />
        <line x1="${outer.x}" y1="${outer.y}" x2="${inner.x}" y2="${inner.y}" stroke="${LUME}" stroke-opacity="0.55" stroke-width="${r(w - 2.2)}" stroke-linecap="butt" />
      </g>`;
    })
    .join("");
}

function bezelFluting(m) {
  return Array.from({ length: 48 })
    .map((_, i) => {
      const a = i * 7.5;
      const o = P(a, 105.5);
      const inn = P(a, 90.5);
      return `<line x1="${o.x}" y1="${o.y}" x2="${inn.x}" y2="${inn.y}" stroke="${i % 2 === 0 ? m.dark : "#ffffff"}" stroke-opacity="${i % 2 === 0 ? 0.55 : 0.22}" stroke-width="2.6" />`;
    })
    .join("");
}

/**
 * Returns { svg, uid } — svg is a markup string, uid is the unique id
 * suffix used for this instance's gradients/filter (needed so multiple
 * watches on one page, e.g. the collection grid, don't collide).
 */
export function explodedWatchMarkup({ config, explode, activePart, uid }) {
  const id = uid ?? `w${instanceCounter++}`;
  const m = metalColors(config.metal);
  const dial = dialColor(config.dial);
  const strap = strapColor(config.strap);
  const metalStrap = isMetalStrap(config.strap);
  const linkMetal = metalStrap ? metalColors(config.strap === "metal-gold" ? "gold" : "silver") : m;
  const rubberStrap = config.strap === "rubber-black";
  const lightDial = config.dial === "ivory" || config.dial === "champagne";
  const ink = lightDial ? "#2a2c31" : m.light;

  const t = (partId) => {
    const p = WATCH_PARTS.find((x) => x.id === partId);
    return `translate(${r(p.dx * explode)} ${r(p.dy * explode)})`;
  };
  const move = (o) => `translate(${r(o.dx * explode)} ${r(o.dy * explode)})`;
  const dim = (partId) => (activePart && activePart !== partId ? 0.22 : 1);
  const partAttrs = (partId) =>
    `data-part="${partId}" style="opacity:${dim(partId)};transition:transform 900ms cubic-bezier(.22,1,.36,1), opacity 400ms ease;cursor:${
      activePart !== undefined ? "pointer" : "default"
    }"`;

  const strapUpper = strapHalf({
    id,
    strap,
    metalStrap,
    rubberStrap,
    path: "M158 200 L242 200 L235 96 Q200 82 165 96 Z",
    lace1: "M166 198 L172 100",
    lace2: "M234 198 L228 100",
    studY: [112, 130, 148, 166],
    plainY: [122, 150],
    endLine: "M158 200 L242 200",
    linksY: 196,
    linksDir: -1,
  });
  const strapLower = metalStrap
    ? `<g filter="url(#softshadow-${id})">${metalLinks(id, 352, 1)}</g>`
    : `<g filter="url(#softshadow-${id})">
        <path d="M158 352 L242 352 L237 462 Q200 472 163 462 Z" fill="${strap}" />
        ${rubberStrap ? "" : `<path d="M158 352 L242 352 L237 462 Q200 472 163 462 Z" fill="${strap}" filter="url(#leather-${id})" opacity="0.55" />`}
        <path d="M158 352 L242 352 L237 462 Q200 472 163 462 Z" fill="url(#strap-${id})" />
        <path d="M166 356 L170 456" stroke="#f4e3c8" stroke-opacity="0.5" stroke-width="1.6" stroke-dasharray="5 5" fill="none" />
        <path d="M234 356 L230 456" stroke="#f4e3c8" stroke-opacity="0.5" stroke-width="1.6" stroke-dasharray="5 5" fill="none" />
        ${strapLowerRivets(rubberStrap)}
        <path d="M158 352 L242 352" stroke="#000" stroke-opacity="0.35" stroke-width="2" />
      </g>`;

  const engravingText = config.engraving.trim()
    ? `<text x="${CX}" y="326" text-anchor="middle" font-size="9" letter-spacing="2.4" fill="${ink}" opacity="0.7" style="font-family:var(--font-body, sans-serif)">${escapeXml(config.engraving.trim().slice(0, 18).toUpperCase())}</text>`
    : "";

  const svg = `<svg viewBox="0 -150 400 860" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Exploded view of a customisable wristwatch">
    ${defs(id, m, dial, linkMetal)}

    <g style="transform:translate(${CX}px,${CY}px) scale(1, ${r(1 - 0.26 * explode)}) translate(${-CX}px,${-CY}px);transition:transform 900ms cubic-bezier(.22,1,.36,1)">
      <ellipse cx="${CX}" cy="600" rx="${r(122 - explode * 30)}" ry="${r(17 - explode * 7)}" fill="#000" opacity="${r(0.4 - explode * 0.18)}" />

      <g transform="${t("clasp")}" ${partAttrs("clasp")}>
        <g transform="translate(${CX} 470)" filter="url(#softshadow-${id})">${claspMarkup(config, m, id)}</g>
      </g>

      <g ${partAttrs("strap")}>
        <g style="transform:${move(STRAP_UPPER)};transition:transform 900ms cubic-bezier(.22,1,.36,1)">${strapUpper}</g>
        <g style="transform:${move(STRAP_LOWER)};transition:transform 900ms cubic-bezier(.22,1,.36,1)">${strapLower}</g>
      </g>

      <g transform="${t("case")}" ${partAttrs("case")}>
        <g filter="url(#shadow-${id})">
          ${caseLugs(id, m)}

          <g>
            <rect x="296" y="266" width="9" height="20" rx="2" fill="${m.dark}" />
            <rect x="303" y="261" width="20" height="30" rx="6" fill="url(#metalv-${id})" />
            ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${r(305 + i * 3)}" y="263" width="1.3" height="26" rx="0.6" fill="#000" opacity="0.35" />`).join("")}
            <circle cx="323" cy="276" r="6" fill="url(#metal-${id})" />
            <circle cx="323" cy="276" r="2.4" fill="${m.dark}" opacity="0.6" />
          </g>

          <circle cx="${CX}" cy="${CY}" r="100" fill="url(#metal-${id})" />
          <circle cx="${CX}" cy="${CY}" r="100" fill="url(#metal-${id})" filter="url(#brush-${id})" opacity="0.9" />
          <circle cx="${CX}" cy="${CY}" r="100" fill="none" stroke="#000" stroke-opacity="0.4" stroke-width="1.4" />
          <circle cx="${CX}" cy="${CY}" r="93" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="1.2" />
          <line x1="106" y1="256" x2="294" y2="256" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2.4" />
          <line x1="106" y1="270" x2="294" y2="270" stroke="#000000" stroke-opacity="0.16" stroke-width="1.6" />
          <line x1="106" y1="300" x2="294" y2="300" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.8" />
          <circle cx="${CX}" cy="${CY}" r="86" fill="#08090b" opacity="0.9" />

          <circle cx="${CX}" cy="${CY}" r="78" fill="#191c21" />
          <circle cx="${CX}" cy="${CY}" r="78" fill="#191c21" filter="url(#brush-${id})" />
          <circle cx="${CX}" cy="${CY}" r="60" fill="none" stroke="#2f333a" stroke-width="10" opacity="0.7" />
          <circle cx="${CX}" cy="${CY}" r="42" fill="none" stroke="#2a2e34" stroke-width="16" opacity="0.55" />
          <g opacity="0.85">
            <circle cx="172" cy="252" r="20" fill="none" stroke="${m.mid}" stroke-width="3.5" opacity="0.6" />
            <circle cx="172" cy="252" r="12" fill="none" stroke="${m.light}" stroke-width="1.2" opacity="0.5" />
            <circle cx="172" cy="252" r="3" fill="${m.light}" opacity="0.7" />
          </g>
          ${gearTrain(m)}
          ${[
            [188, 300],
            [220, 262],
            [200, 236],
          ]
            .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#c8342f" opacity="0.75" />`)
            .join("")}
        </g>
      </g>

      <g transform="${t("dial")}" ${partAttrs("dial")}>
        <g filter="url(#shadow-${id})">
          <circle cx="${CX}" cy="${CY}" r="84" fill="${dial}" />
          <g clip-path="url(#dialclip-${id})">
            ${sunrayBrushing()}
            <circle cx="${CX}" cy="${CY}" r="84" fill="url(#dial-${id})" opacity="0.75" />
            <circle cx="${CX}" cy="${CY}" r="84" fill="url(#dialvig-${id})" />
            <circle cx="${CX}" cy="${CY}" r="84" fill="${dial}" opacity="0.001" filter="url(#grain-${id})" />
          </g>

          ${minuteTrack(ink)}
          ${appliedIndices(m, lightDial)}

          <g>
            <rect x="240" y="266" width="24" height="20" rx="3" fill="${lightDial ? "#ffffff" : "#f2f0eb"}" />
            <rect x="240" y="266" width="24" height="20" rx="3" fill="none" stroke="${lightDial ? m.dark : m.light}" stroke-width="1.6" />
            <text x="252" y="281" text-anchor="middle" font-size="13" fill="#22252a" style="font-family:var(--font-body, sans-serif)">24</text>
          </g>

          <text x="${CX}" y="234" text-anchor="middle" font-size="11.5" letter-spacing="3.4" fill="${ink}" opacity="0.9" style="font-family:var(--font-display, serif)">ATELIER</text>
          <text x="${CX}" y="248" text-anchor="middle" font-size="6.5" letter-spacing="2.6" fill="${ink}" opacity="0.6" style="font-family:var(--font-body, sans-serif)">AUTOMATIC · CHRONOMETER</text>
          ${engravingText}

          <g filter="url(#softshadow-${id})">
            <path d="M197 279 L197 226 Q200 218 203 226 L203 279 Z" fill="${lightDial ? "#23262b" : m.light}" transform="rotate(-58 ${CX} ${CY})" />
            <path d="M198.4 272 L198.4 230 Q200 224 201.6 230 L201.6 272 Z" fill="${LUME}" opacity="0.6" transform="rotate(-58 ${CX} ${CY})" filter="url(#lumeglow-${id})" />
            <line x1="200" y1="278" x2="200" y2="227" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.8" transform="rotate(-58 ${CX} ${CY})" />
            <path d="M197.8 280 L197.8 208 Q200 200 202.2 208 L202.2 280 Z" fill="${lightDial ? "#23262b" : m.light}" transform="rotate(52 ${CX} ${CY})" />
            <path d="M199 272 L199 212 Q200 207 201 212 L201 272 Z" fill="${LUME}" opacity="0.6" transform="rotate(52 ${CX} ${CY})" filter="url(#lumeglow-${id})" />
            <line x1="200" y1="279" x2="200" y2="209" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.8" transform="rotate(52 ${CX} ${CY})" />
            <g transform="rotate(210 ${CX} ${CY})">
              <rect x="199.3" y="200" width="1.4" height="94" fill="#c8503c" />
              <circle cx="${CX}" cy="222" r="4" fill="none" stroke="#c8503c" stroke-width="1.4" />
            </g>
          </g>
          <circle cx="${CX}" cy="${CY}" r="6" fill="url(#metal-${id})" />
          <circle cx="${CX}" cy="${CY}" r="2.4" fill="#0d0e11" opacity="0.8" />
        </g>
      </g>

      <g transform="${t("bezel")}" ${partAttrs("bezel")}>
        <g filter="url(#shadow-${id})">
          <circle cx="${CX}" cy="${CY}" r="98" fill="none" stroke="url(#bezel-${id})" stroke-width="18" />
          ${bezelFluting(m)}
          <circle cx="${CX}" cy="${CY}" r="106.5" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="1.4" />
          <circle cx="${CX}" cy="${CY}" r="89.5" fill="none" stroke="#000" stroke-opacity="0.4" stroke-width="1.4" />
          <circle cx="${CX}" cy="${CY}" r="103" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1" />
          ${caseGloss(id)}
        </g>
      </g>

      <g transform="${t("crystal")}" ${partAttrs("crystal")}>
        <circle cx="${CX}" cy="${CY}" r="88" fill="url(#glass-${id})" />
        <circle cx="${CX}" cy="${CY}" r="88" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.6" />
        <circle cx="${CX}" cy="${CY}" r="85.5" fill="none" stroke="#04101f" stroke-opacity="0.22" stroke-width="1" />
        <circle cx="${CX}" cy="${CY}" r="83" fill="none" stroke="#bcd8ff" stroke-opacity="0.28" stroke-width="1" />
        <path d="M144 232 A88 88 0 0 1 246 198" stroke="url(#sheen-${id})" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.6" />
        <path d="M150 330 A88 88 0 0 0 214 360" stroke="#ffffff" stroke-opacity="0.18" stroke-width="7" fill="none" stroke-linecap="round" />
        ${crystalGlints(id)}
      </g>
    </g>
  </svg>`;

  return { svg, uid: id };
}

function escapeXml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

/**
 * Mounts an exploded watch into `container` and wires up part hover
 * highlighting. Returns an update(partial) function to re-render with a
 * new config/explode/activePart without re-attaching listeners.
 *
 * `reflectionContainer`, if given, is kept in sync with the same markup —
 * pair it with a flipped, masked wrapper in CSS to get a ground reflection.
 */
export function mountExplodedWatch(container, initial, onPartHover, reflectionContainer) {
  let state = { ...initial };

  function render() {
    const { svg } = explodedWatchMarkup(state);
    container.innerHTML = svg;
    if (reflectionContainer) reflectionContainer.innerHTML = svg;
    if (onPartHover) {
      container.querySelectorAll("[data-part]").forEach((el) => {
        el.addEventListener("mouseenter", () => onPartHover(el.dataset.part));
        el.addEventListener("mouseleave", () => onPartHover(null));
      });
    }
  }

  render();

  return {
    update(partial) {
      state = { ...state, ...partial };
      render();
    },
  };
}
