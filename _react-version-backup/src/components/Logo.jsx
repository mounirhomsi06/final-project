/**
 * The Atelier Horo mark: a minimal watch face (case, crown, hour + minute
 * hands, cardinal tick marks) paired with the wordmark. Renders in
 * `currentColor` so it inherits the surrounding text color.
 */
export function Logo({
  className,
  iconClassName = "size-7 text-primary",
  wordmarkClassName = "font-display text-xl uppercase tracking-[0.3em]",
  showWordmark = true
}) {
  return <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" className={iconClassName} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* crown */}
        <rect x="26.5" y="14" width="3.5" height="4.4" rx="1.2" fill="currentColor" />
        {/* case */}
        <circle cx="16" cy="16.2" r="10.4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="16.2" r="8.6" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        {/* cardinal ticks */}
        <path d="M16 7.4V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M16 23.4V25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6.6 16.2H8.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M23.8 16.2H25.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        {/* hands, set to a classic ten-past-ten */}
        <path d="M16 16.2L16 10.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 16.2L20.6 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="16" cy="16.2" r="1.3" fill="currentColor" />
      </svg>
      {showWordmark && <span className={wordmarkClassName}>
          Atelier<span className="text-primary">·</span>Horo
        </span>}
    </span>;
}
