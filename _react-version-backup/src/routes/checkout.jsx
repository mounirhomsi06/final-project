import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBasket } from "@/lib/basket";
import { money } from "@/lib/watch";
export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{
      title: "Checkout — Atelier Horo"
    }, {
      name: "description",
      content: "Review your basket and complete your Atelier Horo order securely."
    }, {
      property: "og:title",
      content: "Checkout — Atelier Horo"
    }, {
      property: "og:description",
      content: "Review your basket and complete your Atelier Horo order."
    }]
  }),
  component: Checkout
});
function Checkout() {
  const basket = useBasket();
  const [paid, setPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const shipping = basket.total > 0 ? 0 : 0;
  const tax = Math.round(basket.total * 0.08);
  if (paid) {
    return <main className="mx-auto flex min-h-[70vh] max-w-2xl animate-fade-up flex-col items-center justify-center px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border border-primary text-primary">✓</div>
        <h1 className="mt-6 text-4xl">Order confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A confirmation is on its way. Bespoke builds enter the workshop tomorrow morning.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Build another</Link>
        </Button>
      </main>;
  }
  return <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl tracking-tight">Checkout</h1>

      {basket.items.length === 0 ? <div className="mt-10 rounded-lg border border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">Your basket is empty.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/">Customise a watch</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/shop">Shop brands</Link>
            </Button>
          </div>
        </div> : <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <form className="space-y-5" onSubmit={e => {
        e.preventDefault();
        setProcessing(true);
        setTimeout(() => {
          setProcessing(false);
          setPaid(true);
          basket.clear();
          toast.success("Payment successful");
        }, 1400);
      }}>
            <h2 className="text-2xl">Delivery & payment</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Mounir Homsi" />
              <Field label="Email" name="email" type="email" placeholder="you@email.com" />
            </div>
            <Field label="Address" name="address" placeholder="Street, city, country" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Card number" name="card" placeholder="4242 4242 4242 4242" />
              <Field label="Expiry" name="exp" placeholder="12 / 29" />
              <Field label="CVC" name="cvc" placeholder="123" />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={processing}>
              {processing ? "Processing…" : `Pay ${money(basket.total + tax + shipping)}`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Demo checkout — no real card is charged. Connect a payment provider to go live.
            </p>
          </form>

          <aside className="h-fit rounded-lg border border-border bg-card/60 p-6">
            <h2 className="text-2xl">Your basket</h2>
            <ul className="mt-5 space-y-5">
              {basket.items.map(i => <li key={i.id} className="flex gap-4 border-b border-border pb-5">
                  <div className="flex-1">
                    <p className="text-sm">{i.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i.subtitle}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="size-6 rounded border border-border text-xs hover:border-primary" onClick={() => basket.setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">
                        −
                      </button>
                      <span className="w-5 text-center text-xs">{i.qty}</span>
                      <button className="size-6 rounded border border-border text-xs hover:border-primary" onClick={() => basket.setQty(i.id, i.qty + 1)} aria-label="Increase quantity">
                        +
                      </button>
                      <button className="ml-3 text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline" onClick={() => basket.remove(i.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-display text-lg">{money(i.price * i.qty)}</span>
                </li>)}
            </ul>
            <dl className="mt-5 space-y-2 text-sm">
              <Row label="Subtotal" value={money(basket.total)} />
              <Row label="Duties & tax" value={money(tax)} />
              <Row label="Insured delivery" value="Complimentary" />
              <div className="flex justify-between border-t border-border pt-3 font-display text-xl">
                <dt>Total</dt>
                <dd className="text-primary">{money(basket.total + tax)}</dd>
              </div>
            </dl>
          </aside>
        </div>}
    </main>;
}
function Row({
  label,
  value
}) {
  return <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>;
}
function Field({
  label,
  name,
  type = "text",
  placeholder
}) {
  return <div className="space-y-2">
      <Label htmlFor={name} className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required />
    </div>;
}
