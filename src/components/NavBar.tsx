import { NavLink } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { to: "/explore", label: "Explore" },
  { to: "/about", label: "About" },
];

export function NavBar() {
  return (
    <header className="relative z-50 flex h-14 shrink-0 items-center gap-4 border-b border-hairline bg-void/90 px-2.5 backdrop-blur sm:h-16 sm:gap-6 sm:px-5">
      {/* Logo also acts as the Home link — there's no separate Home nav item */}
      <NavLink to="/" className="flex shrink-0 items-center gap-2 self-center">
        <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
          <circle cx="9" cy="22" r="2.6" fill="#8AB4FF" />
          <circle cx="23" cy="10" r="2.6" fill="#FF9DB3" />
          <circle cx="22" cy="23" r="3.4" fill="#FFC857" />
          <line x1="9" y1="22" x2="22" y2="23" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" />
          <line x1="23" y1="10" x2="22" y2="23" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" />
          <line x1="9" y1="22" x2="23" y2="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.4" />
        </svg>
        <span className="font-display text-sm font-semibold translate-y-1px md:translate-y-1px leading-none tracking-tight text-ink">
          AI-Space
        </span>
      </NavLink>

      <nav className="flex items-center gap-0.5 translate-y-[1.5px] md:translate-y-1px  sm:gap-1">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `rounded-md px-2 py-1.5 font-display text-xs leading-none transition sm:px-3 sm:text-sm ${
                isActive ? "bg-panel text-ink" : "text-ink-muted hover:text-ink"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1 translate-y-[1.25px] sm:gap-2">
        <SearchBar />
        <ThemeToggle />
      </div>
    </header>
  );
}