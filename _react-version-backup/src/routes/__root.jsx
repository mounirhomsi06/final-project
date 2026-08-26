import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthGate } from "@/components/AuthGate";
import { Logo } from "@/components/Logo";
import { PageTransition } from "@/components/PageTransition";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { BasketProvider, useBasket } from "@/lib/basket";
import { reportLovableError } from "../lib/lovable-error-reporting";
function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>;
}
function ErrorComponent({
  error,
  reset
}) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component"
    });
  }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => {
          router.invalidate();
          reset();
        }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>;
}
export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [{
      charSet: "utf-8"
    }, {
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    }, {
      title: "Atelier Horo — Bespoke & Iconic Timepieces"
    }, {
      name: "description",
      content: "A small Swiss watch house. Wear a finished piece from our collection, or build your own part by part."
    }, {
      name: "author",
      content: "Atelier Horo"
    }, {
      property: "og:title",
      content: "Atelier Horo — Bespoke & Iconic Timepieces"
    }, {
      property: "og:description",
      content: "Wear a finished piece from our collection, or build your own part by part."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary_large_image"
    }],
    links: [{
      rel: "stylesheet",
      href: appCss
    }, {
      rel: "preconnect",
      href: "https://fonts.googleapis.com"
    }, {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous"
    }, {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Karla:wght@300;400;500;600&display=swap"
    }, {
      rel: "icon",
      href: "/favicon.ico",
      type: "image/x-icon"
    }]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({
  children
}) {
  return <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>;
}
function RootComponent() {
  const {
    queryClient
  } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BasketProvider>
          <Gate />
          <Toaster position="bottom-right" />
        </BasketProvider>
      </AuthProvider>
    </QueryClientProvider>;
}
function Gate() {
  const {
    session,
    ready
  } = useAuth();

  // Wait for the client-only session check before deciding what to show —
  // this keeps the first client render identical to the server's, so React
  // doesn't hydrate-mismatch.
  if (!ready) return null;
  if (!session) return <AuthGate />;
  return <>
      <SiteHeader />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <PageTransition>
        <Outlet />
      </PageTransition>
      <SiteFooter />
    </>;
}
function SiteHeader() {
  const basket = useBasket();
  const auth = useAuth();
  const linkClass = "relative text-muted-foreground transition-colors duration-300 hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100";
  return <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="transition-opacity duration-300 hover:opacity-80">
          <Logo />
        </Link>
        <nav className="flex items-center gap-7 text-xs uppercase tracking-[0.22em]">
          <Link to="/" activeOptions={{
          exact: true
        }} className={linkClass} activeProps={{
          className: "text-primary"
        }}>
            Home
          </Link>
          <Link to="/collection" className={linkClass} activeProps={{
          className: "text-primary"
        }}>
            Collection
          </Link>
          <Link to="/customise" className={linkClass} activeProps={{
          className: "text-primary"
        }}>
            Customise
          </Link>
          <Link to="/checkout" className={`${linkClass} flex items-center gap-2`} activeProps={{
          className: "text-primary"
        }}>
            Basket
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground transition-transform duration-300">
              {basket.count}
            </span>
          </Link>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <span className="normal-case tracking-normal text-muted-foreground">
            {auth.session?.name.split(" ")[0]}
          </span>
          <button onClick={auth.logout} aria-label="Log out" className="text-muted-foreground transition-colors duration-300 hover:text-foreground">
            <LogOut className="size-4" />
          </button>
        </nav>
      </div>
    </header>;
}
function SiteFooter() {
  return <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        <span>© {new Date().getFullYear()} Atelier Horo</span>
        <span>Geneva · London · Beirut</span>
      </div>
    </footer>;
}
