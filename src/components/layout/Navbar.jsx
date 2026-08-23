import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/faq', label: 'Preguntas Frecuentes' },
];

export default function Navbar({ currentPath }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="navbar">
      <a href="/" className="brand" aria-label="EvoluMind inicio" onClick={closeMenu}>
        <span className="brand-text">EvoluMind</span>
      </a>

      <nav className="desktop-nav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={currentPath === item.href ? 'active' : ''}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <button
        className="mobile-toggle"
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMenu}>
          <div className="mobile-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-header">
              <span className="brand-text">EvoluMind</span>
              <button className="mobile-close-btn" type="button" onClick={closeMenu} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-nav-links">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={currentPath === item.href ? 'active' : ''}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
