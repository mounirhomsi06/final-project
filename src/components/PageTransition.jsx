import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * Fades each route in and sweeps a soft gold curtain across the screen
 * whenever the pathname changes.
 */
export function PageTransition({
  children
}) {
  const pathname = useRouterState({
    select: s => s.location.pathname
  });
  const [sweeping, setSweeping] = useState(false);
  useEffect(() => {
    setSweeping(true);
    const t = window.setTimeout(() => setSweeping(false), 520);
    return () => window.clearTimeout(t);
  }, [pathname]);
  return <>
      <div key={pathname} className="animate-page-in">
        {children}
      </div>
      <div aria-hidden className={`pointer-events-none fixed inset-0 z-50 ${sweeping ? "animate-curtain" : "hidden"}`} />
    </>;
}
