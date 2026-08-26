import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ExplodedWatch, WATCH_PARTS } from "@/components/ExplodedWatch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useBasket } from "@/lib/basket";
import { CLASPS, DEFAULT_CONFIG, DIALS, METALS, STRAPS, configPrice, configSummary, money } from "@/lib/watch";
export const Route = createFileRoute("/customise")({
  head: () => ({
    meta: [{
      title: "Atelier Horo — Build Your Watch, Part by Part"
    }, {
      name: "description",
      content: "Sit at the Atelier Horo bench: pull a mechanical watch apart and choose the case metal, dial, strap and clasp of your own bespoke piece."
    }, {
      property: "og:title",
      content: "Atelier Horo — Build Your Watch, Part by Part"
    }, {
      property: "og:description",
      content: "An interactive exploded watch configurator: choose metal, dial, strap and clasp, then checkout."
    }]
  }),
  component: Index
});
function Index() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [explode, setExplode] = useState(1);
  const [activePart, setActivePart] = useState(null);
  const basket = useBasket();
  const price = configPrice(config);
  const set = (key, value) => setConfig(c => ({
    ...c,
    [key]: value
  }));
  const partHint = WATCH_PARTS.find(p => p.id === activePart)?.label;
  const addToBasket = () => {
    basket.add({
      id: `custom-${config.metal}-${config.dial}-${config.strap}-${config.clasp}-${config.engraving.trim()}`,
      name: "Bespoke Atelier Horo",
      subtitle: configSummary(config) + (config.engraving.trim() ? ` · “${config.engraving.trim()}”` : ""),
      price,
      kind: "custom"
    });
    toast.success("Added to your basket", {
      description: configSummary(config)
    });
  };
  return <main>
      {/* Hero + exploded configurator */}
      <section className="stage relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          {/* Stage */}
          <div className="relative">
            <p className="animate-fade-up text-xs uppercase tracking-[0.42em] text-primary">
              The Exploded View
            </p>
            <h1 className="animate-fade-up mt-4 text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Every part of your
              <br />
              watch, <em className="text-primary not-italic">your choice</em>.
            </h1>
            <p className="animate-fade-up mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Pull the movement apart, swap the metal, the dial, the strap and the clasp — then
              watch it come back together as one piece.
            </p>

            <div className="relative mt-6 select-none">
              <div className="animate-fade-in">
                <ExplodedWatch config={config} explode={explode} activePart={activePart} onPartHover={setActivePart} className="mx-auto h-[540px] w-full max-w-[440px] drop-shadow-2xl" />
                <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {partHint ?? (explode > 0.5 ? "Exploded" : "Assembled")}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 flex max-w-md items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Assemble
              </span>
              <Slider value={[explode * 100]} onValueChange={v => setExplode((v[0] ?? 0) / 100)} max={100} step={1} aria-label="Explode the watch" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Explode
              </span>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {WATCH_PARTS.map(p => <button key={p.id} onMouseEnter={() => setActivePart(p.id)} onMouseLeave={() => setActivePart(null)} onFocus={() => setActivePart(p.id)} onBlur={() => setActivePart(null)} className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${activePart === p.id ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {p.label}
                </button>)}
            </div>

          </div>

          {/* Configurator */}
          <div className="lg:pt-14">
            <div className="rounded-lg border border-border bg-card/70 p-6 shadow-lux backdrop-blur">
              <h2 className="text-2xl">Configure</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Bespoke · 6 week lead time
              </p>

              <OptionRow label="Case metal" options={METALS} value={config.metal} onChange={v => set("metal", v)} />
              <OptionRow label="Dial" options={DIALS} value={config.dial} onChange={v => set("dial", v)} />
              <OptionRow label="Strap" options={STRAPS} value={config.strap} onChange={v => set("strap", v)} />
              <OptionRow label="Clasp" options={CLASPS} value={config.clasp} onChange={v => set("clasp", v)} />

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Case-back engraving
                  </span>
                  <span className="text-[11px] text-muted-foreground">+{money(120)}</span>
                </div>
                <Input value={config.engraving} maxLength={18} placeholder="Optional — 18 characters" onChange={e => set("engraving", e.target.value)} className="mt-2" />
              </div>

              <div className="mt-7 flex items-end justify-between border-t border-border pt-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Your build
                  </p>
                  <p className="mt-1 font-display text-3xl text-primary">{money(price)}</p>
                </div>
                <Button size="lg" onClick={addToBasket}>
                  Add to basket
                </Button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {configSummary(config)}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-border p-5">
              <p className="text-sm text-muted-foreground">
                Prefer something already finished? Six references wait in the safe.
              </p>
              <Button asChild variant="outline">
                <Link to="/collection">The collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:grid-cols-3">
        {[{
        t: "Swiss movements",
        d: "Chronometer-certified calibres, regulated in six positions before they leave the bench."
      }, {
        t: "Made to order",
        d: "Nothing is assembled until you choose. Every build is numbered and archived."
      }, {
        t: "Lifetime servicing",
        d: "Free servicing for the first ten years, wherever the watch travels with you."
      }].map(f => <div key={f.t} className="border-t border-border pt-5">
            <h3 className="text-xl">{f.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
          </div>)}
      </section>
    </main>;
}
function OptionRow({
  label,
  options,
  value,
  onChange
}) {
  const active = options.find(o => o.id === value);
  return <div className="mt-6">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {active.name}
          {active.price > 0 ? ` · +${money(active.price)}` : " · included"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {options.map(o => <button key={o.id} onClick={() => onChange(o.id)} title={`${o.name}${o.hint ? ` — ${o.hint}` : ""}`} aria-label={o.name} aria-pressed={o.id === value} className={`size-9 rounded-full ring-offset-2 ring-offset-card transition-all duration-300 hover:scale-110 ${o.id === value ? "scale-110 ring-2 ring-primary" : "ring-1 ring-border"}`} style={{
        backgroundColor: o.swatch
      }} />)}
      </div>
    </div>;
}
