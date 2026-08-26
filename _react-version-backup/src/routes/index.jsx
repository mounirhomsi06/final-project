import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExplodedWatch } from "@/components/ExplodedWatch";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { DEFAULT_CONFIG } from "@/lib/watch";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Atelier Horo — A Watch House, Made to Order"
    }, {
      name: "description",
      content: "Step inside Atelier Horo: a small Swiss watch house. Wear a piece from our in-house collection, or build your own part by part."
    }, {
      property: "og:title",
      content: "Atelier Horo — A Watch House, Made to Order"
    }, {
      property: "og:description",
      content: "Our in-house collection, or a bespoke watch built part by part in the atelier."
    }]
  }),
  component: Home
});
function Home() {
  const [explode, setExplode] = useState(0);
  const [scroll, setScroll] = useState(0);

  // The hero watch breathes apart shortly after arrival — the "door opening".
  useEffect(() => {
    const t1 = window.setTimeout(() => setExplode(0.42), 900);
    const t2 = window.setTimeout(() => setExplode(0.12), 3200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <main>
      {/* ── The doorway ─────────────────────────────────────────── */}
      <section className="stage relative flex min-h-[92vh] items-center overflow-hidden border-b border-border">
        <div aria-hidden className="animate-shimmer pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,var(--gold-soft),transparent_58%)] opacity-25" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="animate-fade-up text-[11px] uppercase tracking-[0.5em] text-primary" style={{
            animationDelay: "120ms"
          }}>
              Established Geneva · 1978
            </p>
            <h1 className="animate-fade-up mt-6 text-6xl leading-[0.98] tracking-tight sm:text-7xl" style={{
            animationDelay: "260ms"
          }}>
              The house of
              <br />
              <span className="text-gradient-gold">Atelier Horo</span>
            </h1>
            <p className="animate-fade-up mt-7 max-w-md text-sm leading-relaxed text-muted-foreground" style={{
            animationDelay: "420ms"
          }}>
              Fifty-two watches leave this workshop each year. Wear one from the collection as it
              was drawn, or sit at the bench with us and decide every part yourself.
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap gap-4" style={{
            animationDelay: "560ms"
          }}>
              <Button asChild size="lg">
                <Link to="/collection">Enter the collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/customise">Build your own</Link>
              </Button>
            </div>
          </div>

          <div className="relative" style={{
          transform: `translateY(${Math.min(scroll * 0.12, 70)}px)`
        }}>
            <ExplodedWatch config={DEFAULT_CONFIG} explode={explode} className="animate-float mx-auto h-[520px] w-full max-w-[380px] drop-shadow-2xl transition-[transform] duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
          Scroll to walk in
        </div>
      </section>

      {/* ── The room ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.42em] text-primary">The Atelier</p>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
            A room with six benches, one lathe and a very old clock.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {[{
          t: "01 — The case",
          d: "Turned from a single billet, then hand-brushed for four hours until the grain runs one way only."
        }, {
          t: "02 — The dial",
          d: "Lacquered in eleven coats. Each is left to settle overnight before the next is laid down."
        }, {
          t: "03 — The oath",
          d: "Nothing ships without a signature on the case-back and ten years of servicing behind it."
        }].map((s, i) => <Reveal key={s.t} delay={i * 140} from="up">
              <div className="border-t border-border pt-6 transition-colors duration-500 hover:border-primary">
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{s.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>)}
        </div>
      </section>

      {/* ── Two doors ───────────────────────────────────────────── */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-7xl gap-px sm:grid-cols-2">
          <Reveal from="left" className="h-full">
            <Link to="/collection" className="group flex h-full flex-col justify-between border-r border-border p-12 transition-colors duration-500 hover:bg-card/60">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-primary">In stock</p>
                <h3 className="mt-4 text-4xl">The Collection</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Six references, finished and waiting in the safe. Delivered within 48 hours.
                </p>
              </div>
              <span className="mt-10 inline-block text-xs uppercase tracking-[0.3em] text-foreground transition-transform duration-500 group-hover:translate-x-2">
                View pieces →
              </span>
            </Link>
          </Reveal>
          <Reveal from="right" delay={120} className="h-full">
            <Link to="/customise" className="group flex h-full flex-col justify-between p-12 transition-colors duration-500 hover:bg-card/60">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-primary">Made to order</p>
                <h3 className="mt-4 text-4xl">The Bench</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Take the watch apart on screen. Choose the metal, dial, strap and clasp, then have
                  it built.
                </p>
              </div>
              <span className="mt-10 inline-block text-xs uppercase tracking-[0.3em] text-foreground transition-transform duration-500 group-hover:translate-x-2">
                Start building →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="stage mx-auto max-w-7xl px-6 py-28 text-center">
        <Reveal from="scale">
          <p className="font-display text-3xl leading-snug sm:text-4xl">
            “A watch should outlive the person who chose it.”
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.42em] text-primary">
            Élise Roubaud · Head Watchmaker
          </p>
        </Reveal>
      </section>
    </main>;
}
