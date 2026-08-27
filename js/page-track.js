import { initSite } from "./site.js";
import { getOrder, getOrders, orderStageIndex, STAGES } from "./orders.js";
import { money } from "./watch-data.js";

const session = initSite();
if (session) {
  const listView = document.getElementById("track-list-view");
  const detailView = document.getElementById("track-detail-view");
  const ordersList = document.getElementById("track-orders-list");
  const emptyEl = document.getElementById("track-empty");
  const backBtn = document.getElementById("track-back");

  let detailPollTimer = null;
  let listPollTimer = null;

  function renderStepper(stageIndex) {
    const container = document.getElementById("track-stepper");
    container.innerHTML = STAGES.map((s, i) => {
      const state = i < stageIndex ? "done" : i === stageIndex ? "active" : "pending";
      const circle =
        state === "pending"
          ? `<div class="flex size-8 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">${i + 1}</div>`
          : `<div class="flex size-8 items-center justify-center rounded-full border-2 border-primary text-xs ${state === "done" ? "bg-primary text-primary-foreground" : "text-primary"}">${state === "done" ? "✓" : i + 1}</div>`;
      const label = `<span class="mt-2 block max-w-[7rem] text-center text-[10px] uppercase tracking-[0.18em] ${state === "pending" ? "text-muted-foreground" : "text-foreground"}">${s.label}</span>`;
      const node = `<div class="flex flex-col items-center">${circle}${label}</div>`;
      if (i === 0) return node;
      const lineActive = i <= stageIndex;
      return `<div class="mx-2 mt-4 h-px flex-1 ${lineActive ? "bg-primary" : "bg-border"}"></div>${node}`;
    }).join("");
  }

  function renderDetail(order) {
    document.getElementById("track-order-id").textContent = order.id;
    document.getElementById("track-date").textContent = `Placed ${new Date(order.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;

    const stageIndex = orderStageIndex(order);
    renderStepper(stageIndex);
    document.getElementById("track-status-detail").textContent = STAGES[stageIndex].detail;

    document.getElementById("track-items").innerHTML = order.items
      .map(
        (i) => `
        <li class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm">${escapeHtml(i.name)} <span class="text-muted-foreground">× ${i.qty}</span></p>
            <p class="mt-0.5 text-xs text-muted-foreground">${escapeHtml(i.subtitle)}</p>
          </div>
          <span class="whitespace-nowrap font-display text-base">${money(i.price * i.qty)}</span>
        </li>`,
      )
      .join("");
    document.getElementById("track-total").textContent = money(order.total);
  }

  function stagePill(order) {
    const stage = STAGES[orderStageIndex(order)];
    return `<span class="inline-flex shrink-0 items-center rounded-full border border-primary/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-primary">${stage.label}</span>`;
  }

  function renderList() {
    const orders = getOrders();
    if (orders.length === 0) {
      emptyEl.hidden = false;
      ordersList.innerHTML = "";
      return;
    }
    emptyEl.hidden = true;
    ordersList.innerHTML = orders
      .map((o) => {
        const extra = o.items.length > 1 ? ` + ${o.items.length - 1} more` : "";
        const dateLabel = new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        return `
        <li>
          <button type="button" data-order-id="${o.id}" class="track-order-row flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-card/50 p-5 text-left transition-colors duration-300 hover:border-primary/50">
            <div class="min-w-0">
              <p class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">${o.id} · ${dateLabel}</p>
              <p class="mt-1 truncate text-sm">${escapeHtml(o.items[0].name)}${extra}</p>
            </div>
            <div class="flex shrink-0 items-center gap-4">
              <span class="font-display text-lg">${money(o.total)}</span>
              ${stagePill(o)}
            </div>
          </button>
        </li>`;
      })
      .join("");

    ordersList.querySelectorAll("[data-order-id]").forEach((btn) => {
      btn.addEventListener("click", () => openDetail(btn.dataset.orderId));
    });
  }

  function openDetail(id) {
    const order = getOrder(id);
    if (!order) return;

    renderDetail(order);
    listView.hidden = true;
    detailView.hidden = false;
    history.replaceState(null, "", `track.html?order=${encodeURIComponent(id)}`);

    if (detailPollTimer) clearInterval(detailPollTimer);
    detailPollTimer = setInterval(() => {
      const fresh = getOrder(id);
      if (fresh) renderDetail(fresh);
    }, 1000);
  }

  function showList() {
    if (detailPollTimer) clearInterval(detailPollTimer);
    detailView.hidden = true;
    listView.hidden = false;
    history.replaceState(null, "", "track.html");
    renderList();
  }

  backBtn.addEventListener("click", showList);

  renderList();
  listPollTimer = setInterval(() => {
    if (!listView.hidden) renderList();
  }, 2000);

  const fromQuery = new URLSearchParams(location.search).get("order");
  if (fromQuery) openDetail(fromQuery);
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
