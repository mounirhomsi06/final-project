import { initSite, refreshBasketCount } from "./site.js";
import { mountExplodedWatch } from "./exploded-watch.js";
import { addItem } from "./basket.js";
import { money } from "./watch-data.js";
import { toastSuccess } from "./toast.js";

const PIECES = [
  {
    id: "horo-meridian",
    line: "Meridian",
    model: "Meridian 39 Steel",
    price: 4200,
    blurb: "Brushed steel, onyx lacquer dial, 39mm.",
    config: { metal: "silver", dial: "onyx", strap: "metal-silver", clasp: "folding", engraving: "" },
  },
  {
    id: "horo-solaire",
    line: "Solaire",
    model: "Solaire 36 Or",
    price: 9800,
    blurb: "Yellow gold with a champagne sunburst.",
    config: { metal: "gold", dial: "champagne", strap: "metal-gold", clasp: "butterfly", engraving: "" },
  },
  {
    id: "horo-nocturne",
    line: "Nocturne",
    model: "Nocturne 41 Graphite",
    price: 3650,
    blurb: "Sandblasted graphite case, black calf strap.",
    config: { metal: "graphite", dial: "onyx", strap: "leather-black", clasp: "pin", engraving: "" },
  },
  {
    id: "horo-aurore",
    line: "Aurore",
    model: "Aurore 34 Rose",
    price: 6900,
    blurb: "Rose gold, ivory dial, oxblood alligator.",
    config: { metal: "rose", dial: "ivory", strap: "leather-oxblood", clasp: "deployant", engraving: "" },
  },
  {
    id: "horo-abysse",
    line: "Abysse",
    model: "Abysse 42 Marine",
    price: 5400,
    blurb: "Midnight dial, 200m, integrated bracelet.",
    config: { metal: "silver", dial: "midnight", strap: "metal-silver", clasp: "folding", engraving: "" },
  },
  {
    id: "horo-jardin",
    line: "Jardin",
    model: "Jardin 38 Vert",
    price: 7600,
    blurb: "Emerald lacquer under gold, tan calf.",
    config: { metal: "gold", dial: "emerald", strap: "leather-tan", clasp: "deployant", engraving: "" },
  },
];

function addPieceToBasket(p) {
  const { capped } = addItem({ id: p.id, name: p.model, subtitle: p.blurb, price: p.price, kind: "brand" });
  refreshBasketCount();
  if (capped) {
    toastSuccess("Limited to two per design", "For exclusivity, this reference is capped at 2 per order.");
  } else {
    toastSuccess("Added to your basket", p.model);
  }
}

const session = initSite();
if (session) {
  const grid = document.getElementById("pieces-grid");
  const modal = document.getElementById("view-modal");
  const modalStage = document.getElementById("view-modal-stage");
  const modalLine = document.getElementById("view-modal-line");
  const modalModel = document.getElementById("view-modal-model");
  const modalBlurb = document.getElementById("view-modal-blurb");
  const modalPrice = document.getElementById("view-modal-price");
  const modalAdd = document.getElementById("view-modal-add");
  let modalWatch = null;
  let activePiece = null;

  function openModal(p) {
    activePiece = p;
    modalLine.textContent = p.line;
    modalModel.textContent = p.model;
    modalBlurb.textContent = p.blurb;
    modalPrice.textContent = money(p.price);
    if (modalWatch) {
      modalWatch.update({ config: p.config, explode: 0 });
    } else {
      modalWatch = mountExplodedWatch(modalStage, { config: p.config, explode: 0, uid: "view-modal" });
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    activePiece = null;
  }

  document.getElementById("view-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
  modalAdd.addEventListener("click", () => {
    if (activePiece) addPieceToBasket(activePiece);
  });

  PIECES.forEach((p, i) => {
    const article = document.createElement("div");
    article.className = "reveal";
    article.dataset.from = "up";
    article.style.transitionDelay = `${(i % 3) * 110}ms`;
    article.innerHTML = `
      <article class="group flex h-full flex-col rounded-lg border border-border bg-card/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-lux">
        <div class="stage view-btn cursor-pointer overflow-hidden rounded-md">
          <div class="watch-stage mx-auto h-64 w-full"></div>
        </div>
        <p class="mt-5 text-[11px] uppercase tracking-[0.3em] text-primary">${p.line}</p>
        <h2 class="mt-1 text-2xl">${p.model}</h2>
        <p class="mt-1 text-sm text-muted-foreground">${p.blurb}</p>
        <div class="mt-auto flex items-center justify-between border-t border-border pt-4">
          <span class="font-display text-xl">${money(p.price)}</span>
          <div class="flex items-center gap-2">
            <button class="view-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">View</button>
            <button class="add-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">Add to basket</button>
          </div>
        </div>
      </article>
    `;
    grid.appendChild(article);

    const stageEl = article.querySelector(".watch-stage");
    const watch = mountExplodedWatch(stageEl, { config: p.config, explode: 0, uid: `piece-${i}` });
    article.addEventListener("mouseenter", () => watch.update({ explode: 0.35 }));
    article.addEventListener("mouseleave", () => watch.update({ explode: 0 }));

    article.querySelectorAll(".view-btn").forEach((el) => el.addEventListener("click", () => openModal(p)));
    article.querySelector(".add-btn").addEventListener("click", () => addPieceToBasket(p));
  });
}
