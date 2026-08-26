// Watch part catalogue, pricing and small colour helpers shared by the
// collection grid, the exploded-view SVG and the customiser.

export const METALS = [
  { id: "gold", name: "18k Yellow Gold", price: 4200, swatch: "#d7a53a", swatch2: "#8a6413", hint: "Warm, unmistakable" },
  { id: "silver", name: "Brushed Steel", price: 0, swatch: "#d9dde2", swatch2: "#7d8590", hint: "The classic" },
  { id: "rose", name: "Rose Gold", price: 3400, swatch: "#e8b49a", swatch2: "#9c5f45", hint: "Softly modern" },
  { id: "graphite", name: "Graphite DLC", price: 1600, swatch: "#4a4d52", swatch2: "#212328", hint: "Stealth finish" },
];

export const DIALS = [
  { id: "onyx", name: "Onyx", price: 0, swatch: "#15171b" },
  { id: "champagne", name: "Champagne", price: 450, swatch: "#e3cf9d" },
  { id: "midnight", name: "Midnight Blue", price: 380, swatch: "#16305c" },
  { id: "emerald", name: "Emerald", price: 620, swatch: "#0f4d3a" },
  { id: "ivory", name: "Ivory Lacquer", price: 340, swatch: "#f2ece0" },
];

export const STRAPS = [
  { id: "leather-tan", name: "Tan Calf Leather", price: 240, swatch: "#a86a3c", hint: "Hand-stitched" },
  { id: "leather-black", name: "Black Alligator", price: 780, swatch: "#221f1d", hint: "Hand-stitched" },
  { id: "leather-oxblood", name: "Oxblood Leather", price: 320, swatch: "#5e1f21", hint: "Hand-stitched" },
  { id: "metal-gold", name: "Gold Oyster Link", price: 3900, swatch: "#d7a53a", hint: "Solid links" },
  { id: "metal-silver", name: "Steel Oyster Link", price: 900, swatch: "#c8ced6", hint: "Solid links" },
  { id: "rubber-black", name: "Vulcanised Rubber", price: 180, swatch: "#1c1e22", hint: "Dive-ready" },
];

export const CLASPS = [
  { id: "deployant", name: "Deployant", price: 260, swatch: "#b9bfc7" },
  { id: "butterfly", name: "Butterfly", price: 420, swatch: "#b9bfc7" },
  { id: "pin", name: "Classic Pin Buckle", price: 0, swatch: "#b9bfc7" },
  { id: "folding", name: "Folding Safety", price: 340, swatch: "#b9bfc7" },
];

export const BASE_PRICE = 2900;

export const DEFAULT_CONFIG = {
  metal: "silver",
  dial: "midnight",
  strap: "leather-tan",
  clasp: "deployant",
  engraving: "",
};

const find = (list, id) => list.find((o) => o.id === id);

export function metalColors(id) {
  switch (id) {
    case "gold":
      return { light: "#f6dd9a", mid: "#d7a53a", dark: "#8a6413" };
    case "rose":
      return { light: "#f7d3c2", mid: "#dda182", dark: "#95563d" };
    case "graphite":
      return { light: "#6a6e75", mid: "#3d4046", dark: "#1a1c20" };
    default:
      return { light: "#f1f4f7", mid: "#c3cad2", dark: "#767d87" };
  }
}

export function configPrice(config) {
  return (
    BASE_PRICE +
    find(METALS, config.metal).price +
    find(DIALS, config.dial).price +
    find(STRAPS, config.strap).price +
    find(CLASPS, config.clasp).price +
    (config.engraving.trim() ? 120 : 0)
  );
}

export function configSummary(config) {
  return [
    find(METALS, config.metal).name,
    find(DIALS, config.dial).name + " dial",
    find(STRAPS, config.strap).name,
    find(CLASPS, config.clasp).name + " clasp",
  ].join(" · ");
}

export function strapColor(id) {
  return find(STRAPS, id).swatch;
}

export function isMetalStrap(id) {
  return id.startsWith("metal");
}

export function dialColor(id) {
  return find(DIALS, id).swatch;
}

export const money = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
