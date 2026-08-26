import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ExplodedWatch } from "@/components/ExplodedWatch";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useBasket } from "@/lib/basket";
import { money } from "@/lib/watch";
const PIECES = [{
  id: "horo-meridian",
  line: "Meridian",
  model: "Meridian 39 Steel",
  price: 4200,
  blurb: "Brushed steel, onyx lacquer dial, 39mm.",
  config: {
    metal: "silver",
    dial: "onyx",
    strap: "metal-silver",
    clasp: "folding",
    engraving: ""
  }
}, {
  id: "horo-solaire",
  line: "Solaire",
  model: "Solaire 36 Or",
  price: 9800,
  blurb: "Yellow gold with a champagne sunburst.",
  config: {
    metal: "gold",
    dial: "champagne",
    strap: "metal-gold",
    clasp: "butterfly",
    engraving: ""
  }
}, {
  id: "horo-nocturne",
  line: "Nocturne",
  model: "Nocturne 41 Graphite",
  price: 3650,
  blurb: "Sandblasted graphite case, black calf strap.",
  config: {
    metal: "graphite",
    dial: "onyx",
    strap: "leather-black",
    clasp: "pin",
    engraving: ""
  }
}, {
  id: "horo-aurore",
  line: "Aurore",
  model: "Aurore 34 Rose",
  price: 6900,
  blurb: "Rose gold, ivory dial, oxblood alligator.",
  config: {
    metal: "rose",
    dial: "ivory",
    strap: "leather-oxblood",
    clasp: "deployant",
    engraving: ""
  }
}, {
  id: "horo-abysse",
  line: "Abysse",
  model: "Abysse 42 Marine",
  price: 5400,
  blurb: "Midnight dial, 200m, integrated bracelet.",
  config: {
    metal: "silver",
    dial: "midnight",
    strap: "metal-silver",
    clasp: "folding",
    engraving: ""
  }
}, {
  id: "horo-jardin",
  line: "Jardin",
  model: "Jardin 38 Vert",
  price: 7600,
  blurb: "Emerald lacquer under gold, tan calf.",
  config: {
    metal: "gold",
    dial: "emerald",
    strap: "leather-tan",
    clasp: "deployant",
    engraving: ""
  }
}];
export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [{
      title: "The Collection — Atelier Horo In-Stock Timepieces"
    }, {
      name: "description",
      content: "Six finished Atelier Horo references in stock: Meridian, Solaire, Nocturne, Aurore, Abysse and Jardin. Delivered in 48 hours."
    }, {
      property: "og:title",
      content: "The Collection — Atelier Horo"
    }, {
      property: "og:description",
      content: "Six finished in-house references, ready to ship in 48 hours."
    }]
  }),
  component: Collection
});
function Collection() {
  const basket = useBasket();
  const [hovered, setHovered] = useState(null);
  return <main className="mx-auto max-w-7xl px-6 py-20">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.42em] text-primary">In the safe</p>
        <h1 className="mt-3 text-5xl tracking-tight">The Collection</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Every piece here is finished and numbered. Hover one to see it come apart — the same watch
          you can rebuild yourself at the bench.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PIECES.map((p, i) => <Reveal key={p.id} delay={i % 3 * 110} from="up">
            <article onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)} className="group flex h-full flex-col rounded-lg border border-border bg-card/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-lux">
              <div className="stage overflow-hidden rounded-md">
                <ExplodedWatch config={p.config} explode={hovered === p.id ? 0.35 : 0} className="mx-auto h-64 w-full" />
              </div>
              <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-primary">{p.line}</p>
              <h2 className="mt-1 text-2xl">{p.model}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <span className="font-display text-xl">{money(p.price)}</span>
                <Button variant="outline" onClick={() => {
              basket.add({
                id: p.id,
                name: p.model,
                subtitle: p.blurb,
                price: p.price,
                kind: "brand"
              });
              toast.success("Added to your basket", {
                description: p.model
              });
            }}>
                  Add to basket
                </Button>
              </div>
            </article>
          </Reveal>)}
      </div>

      <Reveal className="mt-20">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-8">
          <p className="max-w-md text-sm text-muted-foreground">
            None of them quite yours? Sit at the bench and choose every part — case, dial, strap and
            clasp.
          </p>
          <Button asChild>
            <Link to="/customise">Build your own</Link>
          </Button>
        </div>
      </Reveal>
    </main>;
}
