import { initSite, refreshBasketCount } from "./site.js";
import { mountExplodedWatch, WATCH_PARTS } from "./exploded-watch.js";
import { addItem } from "./basket.js";
import { toastSuccess } from "./toast.js";
import { CLASPS, DEFAULT_CONFIG, DIALS, METALS, STRAPS, configPrice, configSummary, money } from "./watch-data.js";

const session = initSite();
if (session) {
  const config = { ...DEFAULT_CONFIG };
  let explode = 1;
  let activePart = null;

  const watch = mountExplodedWatch(
    document.getElementById("watch-stage"),
    { config, explode, activePart },
    (part) => {
      activePart = part;
      watch.update({ activePart });
      updatePartHint();
    },
    document.getElementById("watch-stage-reflection"),
  );

  const partHint = document.getElementById("part-hint");
  function updatePartHint() {
    const label = WATCH_PARTS.find((p) => p.id === activePart)?.label;
    partHint.textContent = label ?? (explode > 0.5 ? "Exploded" : "Assembled");
  }

  // Explode slider
  const slider = document.getElementById("explode-slider");
  slider.addEventListener("input", () => {
    explode = Number(slider.value) / 100;
    watch.update({ explode });
    updatePartHint();
  });

  // Part hover buttons
  const partButtonsEl = document.getElementById("part-buttons");
  WATCH_PARTS.forEach((p) => {
    const btn = document.createElement("button");
    btn.textContent = p.label;
    btn.className =
      "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors border-border text-muted-foreground hover:text-foreground";
    const setActive = (id) => {
      activePart = id;
      watch.update({ activePart });
      updatePartHint();
      partButtonsEl.querySelectorAll("button").forEach((b) => {
        const on = b === btn && id !== null;
        b.classList.toggle("border-primary", on);
        b.classList.toggle("text-primary", on);
        b.classList.toggle("border-border", !on);
        b.classList.toggle("text-muted-foreground", !on);
      });
    };
    btn.addEventListener("mouseenter", () => setActive(p.id));
    btn.addEventListener("mouseleave", () => setActive(null));
    btn.addEventListener("focus", () => setActive(p.id));
    btn.addEventListener("blur", () => setActive(null));
    partButtonsEl.appendChild(btn);
  });

  // Option rows: case metal, dial, strap, clasp
  const rows = [
    { label: "Case metal", options: METALS, key: "metal" },
    { label: "Dial", options: DIALS, key: "dial" },
    { label: "Strap", options: STRAPS, key: "strap" },
    { label: "Clasp", options: CLASPS, key: "clasp" },
  ];
  const rowsEl = document.getElementById("option-rows");

  function renderRow(row) {
    const wrap = document.createElement("div");
    wrap.className = "mt-6";
    const active = row.options.find((o) => o.id === config[row.key]);
    wrap.innerHTML = `
      <div class="flex items-baseline justify-between">
        <span class="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">${row.label}</span>
        <span class="text-xs text-muted-foreground" data-active-label>${active.name}${
          active.price > 0 ? ` · +${money(active.price)}` : " · included"
        }</span>
      </div>
      <div class="mt-3 flex flex-wrap gap-2.5" data-swatches></div>
    `;
    const swatchesEl = wrap.querySelector("[data-swatches]");
    const labelEl = wrap.querySelector("[data-active-label]");

    row.options.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.title = o.hint ? `${o.name} — ${o.hint}` : o.name;
      b.setAttribute("aria-label", o.name);
      b.setAttribute("aria-pressed", String(o.id === config[row.key]));
      b.className = `size-9 rounded-full ring-offset-2 ring-offset-card transition-all duration-300 hover:scale-110 ${
        o.id === config[row.key] ? "scale-110 ring-2 ring-primary" : "ring-1 ring-border"
      }`;
      b.style.backgroundColor = o.swatch;
      b.addEventListener("click", () => {
        config[row.key] = o.id;
        watch.update({ config });
        refreshPrice();
        swatchesEl.querySelectorAll("button").forEach((sb, i) => {
          const on = row.options[i].id === config[row.key];
          sb.classList.toggle("scale-110", on);
          sb.classList.toggle("ring-2", on);
          sb.classList.toggle("ring-primary", on);
          sb.classList.toggle("ring-1", !on);
          sb.classList.toggle("ring-border", !on);
          sb.setAttribute("aria-pressed", String(on));
        });
        const newActive = row.options.find((x) => x.id === config[row.key]);
        labelEl.textContent = `${newActive.name}${newActive.price > 0 ? ` · +${money(newActive.price)}` : " · included"}`;
      });
      swatchesEl.appendChild(b);
    });

    rowsEl.appendChild(wrap);
  }

  rows.forEach(renderRow);

  // Engraving
  const engravingInput = document.getElementById("engraving-input");
  engravingInput.addEventListener("input", () => {
    config.engraving = engravingInput.value;
    watch.update({ config });
    refreshPrice();
  });

  // Price + summary
  const priceEl = document.getElementById("build-price");
  const summaryEl = document.getElementById("build-summary");
  function refreshPrice() {
    priceEl.textContent = money(configPrice(config));
    summaryEl.textContent = configSummary(config);
  }
  refreshPrice();

  // Add to basket
  document.getElementById("add-to-basket").addEventListener("click", () => {
    const price = configPrice(config);
    const { capped } = addItem({
      id: `custom-${config.metal}-${config.dial}-${config.strap}-${config.clasp}-${config.engraving.trim()}`,
      name: "Bespoke Atelier Horo",
      subtitle: configSummary(config) + (config.engraving.trim() ? ` · "${config.engraving.trim()}"` : ""),
      price,
      kind: "custom",
    });
    refreshBasketCount();
    if (capped) {
      toastSuccess("Limited to two per build", "For exclusivity, this exact configuration is capped at 2 — try a variation.");
    } else {
      toastSuccess("Added to your basket", configSummary(config));
    }
  });
}
