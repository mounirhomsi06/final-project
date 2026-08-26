import { initSite } from "./site.js";
import { DEFAULT_CONFIG } from "./watch-data.js";
import { mountExplodedWatch } from "./exploded-watch.js";

const session = initSite();
if (session) {
  const container = document.getElementById("hero-watch");
  const reflection = document.getElementById("hero-watch-reflection");
  const watch = mountExplodedWatch(container, { config: DEFAULT_CONFIG, explode: 0 }, null, reflection);

  // The hero watch breathes apart shortly after arrival — the "door opening".
  setTimeout(() => watch.update({ explode: 0.42 }), 900);
  setTimeout(() => watch.update({ explode: 0.12 }), 3200);

  const wrap = document.getElementById("hero-watch-wrap");
  window.addEventListener(
    "scroll",
    () => {
      wrap.style.transform = `translateY(${Math.min(window.scrollY * 0.12, 70)}px)`;
    },
    { passive: true },
  );
}
