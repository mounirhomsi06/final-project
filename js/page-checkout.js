import { initSite, refreshBasketCount } from "./site.js";
import { getItems, removeItem, setQty, clearBasket, basketTotal, MAX_QTY_PER_ITEM } from "./basket.js";
import { money } from "./watch-data.js";
import { toastSuccess } from "./toast.js";

const session = initSite();
if (session) {
  const listEl = document.getElementById("basket-list");
  const emptyEl = document.getElementById("checkout-empty");
  const filledEl = document.getElementById("checkout-filled");
  const payBtn = document.getElementById("pay-btn");

  function tax(total) {
    return Math.round(total * 0.08);
  }

  function render() {
    const items = getItems();

    if (items.length === 0) {
      emptyEl.hidden = false;
      filledEl.hidden = true;
      return;
    }
    emptyEl.hidden = true;
    filledEl.hidden = false;

    listEl.innerHTML = items
      .map(
        (i) => `
        <li class="flex gap-4 border-b border-border pb-5" data-id="${escapeAttr(i.id)}">
          <div class="flex-1">
            <p class="text-sm">${escapeHtml(i.name)}</p>
            <p class="mt-1 text-xs leading-relaxed text-muted-foreground">${escapeHtml(i.subtitle)}</p>
            <div class="mt-2 flex items-center gap-2">
              <button data-action="dec" class="size-6 rounded border border-border text-xs hover:border-primary" aria-label="Decrease quantity">−</button>
              <span class="w-5 text-center text-xs">${i.qty}</span>
              <button data-action="inc" class="size-6 rounded border text-xs ${i.qty >= MAX_QTY_PER_ITEM ? "cursor-not-allowed border-border/50 text-muted-foreground/50" : "border-border hover:border-primary"}" aria-label="Increase quantity" ${i.qty >= MAX_QTY_PER_ITEM ? "aria-disabled=\"true\"" : ""}>+</button>
              <button data-action="remove" class="ml-3 text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline">Remove</button>
            </div>
          </div>
          <span class="font-display text-lg">${money(i.price * i.qty)}</span>
        </li>`,
      )
      .join("");

    listEl.querySelectorAll("li").forEach((li) => {
      const id = li.dataset.id;
      const item = items.find((i) => i.id === id);
      li.querySelector('[data-action="dec"]').addEventListener("click", () => {
        setQty(id, item.qty - 1);
        render();
      });
      li.querySelector('[data-action="inc"]').addEventListener("click", () => {
        if (item.qty >= MAX_QTY_PER_ITEM) {
          toastSuccess("Limited to two per design", "For exclusivity, this piece is capped at 2 per order.");
          return;
        }
        setQty(id, item.qty + 1);
        render();
      });
      li.querySelector('[data-action="remove"]').addEventListener("click", () => {
        removeItem(id);
        render();
      });
    });

    const subtotal = basketTotal(items);
    const t = tax(subtotal);
    document.getElementById("row-subtotal").textContent = money(subtotal);
    document.getElementById("row-tax").textContent = money(t);
    document.getElementById("row-total").textContent = money(subtotal + t);
    payBtn.textContent = `Pay ${money(subtotal + t)}`;
  }

  document.getElementById("payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    payBtn.textContent = "Processing…";
    setTimeout(() => {
      clearBasket();
      refreshBasketCount();
      document.getElementById("checkout-body").hidden = true;
      document.getElementById("checkout-confirmed").hidden = false;
    }, 1400);
  });

  render();
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function escapeAttr(s) {
  return s.replace(/"/g, "&quot;");
}
