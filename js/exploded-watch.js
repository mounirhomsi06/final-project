// Renders the exploded-view watch SVG — a direct port of the React
// <ExplodedWatch> component. Each part (crystal, bezel, dial, case, strap,
// clasp) can be animated apart via `explode` (0 = assembled, 1 = fully
// exploded) and dimmed/highlighted via `activePart`.

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

const r = (n) => Math.round(n * 100) / 100;

let instanceCounter = 0;

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
  const lightDial = config.dial === "ivory" || config.dial === "champagne";

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

  const claspInner =
    config.clasp === "pin"
      ? `<rect x="-30" y="-16" width="60" height="32" rx="8" fill="none" stroke="url(#metal-${id})" stroke-width="7" />
         <rect x="-4" y="-26" width="8" height="52" rx="3" fill="url(#metalv-${id})" />`
      : `<rect x="-46" y="-18" width="92" height="36" rx="10" fill="url(#metal-${id})" />
         <rect x="-36" y="-9" width="72" height="18" rx="6" fill="#000" opacity="0.22" />
         ${
           config.clasp === "butterfly"
             ? `<rect x="-46" y="-2" width="40" height="4" rx="2" fill="${m.light}" opacity="0.7" />
                <rect x="6" y="-2" width="40" height="4" rx="2" fill="${m.light}" opacity="0.7" />`
             : ""
         }
         ${config.clasp === "folding" ? `<circle cx="0" cy="0" r="7" fill="${m.light}" opacity="0.85" />` : ""}`;

  const strapUpperInner = metalStrap
    ? [0, 1, 2, 3].map((i) => `<rect x="156" y="${196 - i * 30}" width="88" height="24" rx="6" fill="${strap}" />`).join("")
    : `<path d="M158 200 L242 200 L236 96 Q200 84 164 96 Z" fill="${strap}" />
       <path d="M158 200 L242 200 L236 96 Q200 84 164 96 Z" fill="url(#strap-${id})" />
       <path d="M168 194 L232 194" stroke="#fff" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="6 6" />
       ${[120, 148].map((y) => `<rect x="164" y="${y}" width="72" height="3" rx="1.5" fill="#000" opacity="0.18" />`).join("")}`;

  const strapLowerInner = metalStrap
    ? [0, 1, 2, 3].map((i) => `<rect x="156" y="${352 + i * 30}" width="88" height="24" rx="6" fill="${strap}" />`).join("")
    : `<path d="M158 352 L242 352 L238 460 Q200 470 162 460 Z" fill="${strap}" />
       <path d="M158 352 L242 352 L238 460 Q200 470 162 460 Z" fill="url(#strap-${id})" />
       <path d="M170 358 L230 358" stroke="#fff" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="6 6" />`;

  const ticks = Array.from({ length: 12 })
    .map((_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const r1 = 70;
      const r2 = i % 3 === 0 ? 56 : 62;
      return `<line x1="${r(200 + Math.sin(a) * r1)}" y1="${r(276 - Math.cos(a) * r1)}" x2="${r(200 + Math.sin(a) * r2)}" y2="${r(
        276 - Math.cos(a) * r2,
      )}" stroke="${lightDial ? m.dark : m.light}" stroke-width="${i % 3 === 0 ? 5 : 2.5}" stroke-linecap="round" />`;
    })
    .join("");

  const bezelTicks = Array.from({ length: 36 })
    .map((_, i) => {
      const a = (i * 10 * Math.PI) / 180;
      return `<line x1="${r(200 + Math.sin(a) * 92)}" y1="${r(276 - Math.cos(a) * 92)}" x2="${r(200 + Math.sin(a) * 104)}" y2="${r(
        276 - Math.cos(a) * 104,
      )}" stroke="${m.dark}" stroke-width="1.6" opacity="0.6" />`;
    })
    .join("");

  const engravingText = config.engraving.trim()
    ? `<text x="200" y="330" text-anchor="middle" font-size="10" letter-spacing="2" fill="${
        lightDial ? "#3a3d43" : m.light
      }" opacity="0.75">${escapeXml(config.engraving.trim().slice(0, 18).toUpperCase())}</text>`
    : "";

  const svg = `<svg viewBox="0 -150 400 860" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Exploded view of a customisable wristwatch">
    <defs>
      <linearGradient id="metal-${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${m.light}" /><stop offset="45%" stop-color="${m.mid}" /><stop offset="100%" stop-color="${m.dark}" />
      </linearGradient>
      <linearGradient id="metalv-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${m.light}" /><stop offset="100%" stop-color="${m.dark}" />
      </linearGradient>
      <radialGradient id="dial-${id}" cx="38%" cy="30%" r="80%">
        <stop offset="0%" stop-color="${dial}" stop-opacity="0.75" /><stop offset="55%" stop-color="${dial}" /><stop offset="100%" stop-color="#000" stop-opacity="0.55" />
      </radialGradient>
      <linearGradient id="glass-${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" /><stop offset="45%" stop-color="#ffffff" stop-opacity="0.03" /><stop offset="100%" stop-color="#ffffff" stop-opacity="0.16" />
      </linearGradient>
      <linearGradient id="strap-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#000" stop-opacity="0.35" /><stop offset="50%" stop-color="#fff" stop-opacity="0.12" /><stop offset="100%" stop-color="#000" stop-opacity="0.35" />
      </linearGradient>
      <filter id="shadow-${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.45" />
      </filter>
    </defs>

    <g style="transform:translate(200px,276px) scale(1, ${r(1 - 0.26 * explode)}) translate(-200px,-276px);transition:transform 900ms cubic-bezier(.22,1,.36,1)">
      <ellipse cx="200" cy="600" rx="${120 - explode * 30}" ry="${16 - explode * 6}" fill="#000" opacity="${0.35 - explode * 0.15}" />

      <g transform="${t("clasp")}" ${partAttrs("clasp")}>
        <g transform="translate(200 470)">${claspInner}</g>
      </g>

      <g ${partAttrs("strap")}>
        <g style="transform:${move(STRAP_UPPER)};transition:transform 900ms cubic-bezier(.22,1,.36,1)">${strapUpperInner}</g>
        <g style="transform:${move(STRAP_LOWER)};transition:transform 900ms cubic-bezier(.22,1,.36,1)">${strapLowerInner}</g>
      </g>

      <g transform="${t("case")}" ${partAttrs("case")}>
        <g filter="url(#shadow-${id})">
          <rect x="150" y="188" width="100" height="30" rx="10" fill="url(#metalv-${id})" />
          <rect x="150" y="334" width="100" height="30" rx="10" fill="url(#metalv-${id})" />
          <circle cx="200" cy="276" r="98" fill="url(#metal-${id})" />
          <circle cx="200" cy="276" r="84" fill="#0b0c0e" opacity="0.85" />
          <rect x="296" y="264" width="22" height="24" rx="6" fill="url(#metalv-${id})" />
          <circle cx="200" cy="276" r="70" fill="#16181c" />
          <circle cx="200" cy="276" r="46" fill="#26292f" opacity="0.6" />
          <circle cx="176" cy="258" r="16" fill="${m.mid}" opacity="0.5" />
          <circle cx="224" cy="296" r="12" fill="${m.mid}" opacity="0.4" />
        </g>
      </g>

      <g transform="${t("dial")}" ${partAttrs("dial")}>
        <g filter="url(#shadow-${id})">
          <circle cx="200" cy="276" r="84" fill="url(#dial-${id})" />
          ${ticks}
          <line x1="200" y1="276" x2="200" y2="220" stroke="${lightDial ? "#22252a" : m.light}" stroke-width="6" stroke-linecap="round" />
          <line x1="200" y1="276" x2="240" y2="304" stroke="${lightDial ? "#22252a" : m.light}" stroke-width="5" stroke-linecap="round" />
          <line x1="200" y1="276" x2="172" y2="316" stroke="#c8503c" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="200" cy="276" r="5" fill="${m.mid}" />
          <text x="200" y="240" text-anchor="middle" font-size="11" letter-spacing="3" fill="${lightDial ? "#3a3d43" : m.light}" opacity="0.85" style="font-family:var(--font-display, serif)">ATELIER</text>
          ${engravingText}
        </g>
      </g>

      <g transform="${t("bezel")}" ${partAttrs("bezel")}>
        <g filter="url(#shadow-${id})">
          <circle cx="200" cy="276" r="98" fill="none" stroke="url(#metal-${id})" stroke-width="16" />
          ${bezelTicks}
        </g>
      </g>

      <g transform="${t("crystal")}" ${partAttrs("crystal")}>
        <circle cx="200" cy="276" r="86" fill="url(#glass-${id})" stroke="#fff" stroke-opacity="0.55" stroke-width="2" />
        <path d="M148 236 A86 86 0 0 1 244 204" stroke="#fff" stroke-opacity="0.5" stroke-width="8" fill="none" stroke-linecap="round" />
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
 */
export function mountExplodedWatch(container, initial, onPartHover) {
  let state = { ...initial };

  function render() {
    const { svg } = explodedWatchMarkup(state);
    container.innerHTML = svg;
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
