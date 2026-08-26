import { useEffect, useRef, useState } from "react";
const HIDDEN = {
  up: "opacity-0 translate-y-8",
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
  scale: "opacity-0 scale-95"
};
export function Reveal({
  children,
  delay = 0,
  className = "",
  from = "up"
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      }
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px"
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{
    transitionDelay: `${delay}ms`
  }} className={`transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${shown ? "translate-x-0 translate-y-0 scale-100 opacity-100" : HIDDEN[from]} ${className}`}>
      {children}
    </div>;
}
