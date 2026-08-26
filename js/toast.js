// Minimal toast notification, styled to match the app — a lightweight
// stand-in for the "sonner" toasts used in the React version.

export function toastSuccess(title, description) {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const el = document.createElement("div");
  el.className =
    "pointer-events-auto w-72 rounded-md border border-border bg-card px-4 py-3 text-card-foreground shadow-lux transition-all duration-300 translate-y-2 opacity-0";
  el.innerHTML = `
    <p class="text-sm font-medium">${escapeHtml(title)}</p>
    ${description ? `<p class="mt-0.5 text-xs text-muted-foreground">${escapeHtml(description)}</p>` : ""}
  `;
  root.appendChild(el);

  requestAnimationFrame(() => {
    el.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    el.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
