// Fades/slides ".reveal" elements in once they scroll into view — a port
// of the React <Reveal> component. `data-from` picks the entry direction:
// up (default), left, right or scale.

const HIDDEN = {
  up: ["opacity-0", "translate-y-8"],
  left: ["opacity-0", "-translate-x-10"],
  right: ["opacity-0", "translate-x-10"],
  scale: ["opacity-0", "scale-95"],
};
const SHOWN = ["translate-x-0", "translate-y-0", "scale-100", "opacity-100"];

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove(...HIDDEN[entry.target.dataset.from || "up"]);
          entry.target.classList.add(...SHOWN);
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );

  els.forEach((el) => {
    el.classList.add("transition-all", "duration-[900ms]", "ease-[cubic-bezier(0.22,1,0.36,1)]");
    el.classList.add(...HIDDEN[el.dataset.from || "up"]);
    io.observe(el);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReveal);
} else {
  initReveal();
}
