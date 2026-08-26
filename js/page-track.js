import { initSite } from "./site.js";
import { getOrder, orderStageIndex, STAGES } from "./orders.js";
import { money } from "./watch-data.js";

const session = initSite();
if (session) {
  const form = document.getElementById("track-form");
  const input = document.getElementById("track-input");
  const errorBox = document.getElementById("track-error");
  const result = document.getElementById("track-result");

  let pollTimer = null;

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    result.hidden = true;
    if (pollTimer) clearInterval(pollTimer);
  }

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

  function render(order) {
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

    errorBox.hidden = true;
    result.hidden = false;
  }

  function lookup(rawId) {
    const id = rawId.trim();
    if (!id) return;
    const order = getOrder(id);
    if (pollTimer) clearInterval(pollTimer);
    if (!order) {
      showError("We couldn't find that order in this browser. Orders are only remembered on the device and browser you paid with.");
      return;
    }
    render(order);
    pollTimer = setInterval(() => {
      const fresh = getOrder(id);
      if (fresh) render(fresh);
    }, 15000);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    lookup(input.value);
  });

  const fromQuery = new URLSearchParams(location.search).get("order");
  if (fromQuery) {
    input.value = fromQuery;
    lookup(fromQuery);
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
