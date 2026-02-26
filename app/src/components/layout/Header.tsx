import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className="
      relative z-10
      bg-gradient-to-b from-shadow to-leather/90
      border-b-2 border-gold/50
      shadow-[0_4px_20px_rgba(13,6,0,0.6)]
    ">
      {/* Top gold rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-2xl select-none">⚔️</span>
          <div>
            <div className="font-display text-display-sm text-gold text-shadow leading-none tracking-wide">
              Chronicles of the Realm
            </div>
            <div className="text-[10px] font-display uppercase tracking-[0.2em] text-stone leading-none mt-0.5">
              D&amp;D Character Creator
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <NavLink to="/" active={pathname === '/'}>Roster</NavLink>
          <NavLink to="/builder" active={pathname.startsWith('/builder')}>New Character</NavLink>
        </nav>
      </div>

      {/* Bottom gold rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </header>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`
        px-4 py-1.5 rounded font-display text-xs uppercase tracking-wider
        transition-all duration-150
        ${active
          ? 'bg-gold/20 text-gold border border-gold/50'
          : 'text-stone hover:text-gold hover:bg-gold/10 border border-transparent'}
      `}
    >
      {children}
    </Link>
  );
}
