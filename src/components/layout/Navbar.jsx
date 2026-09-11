import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
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
      </header>

      {mobileOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="mobile-overlay"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeMenu();
            }}
          >
            <div className="mobile-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-header">
                <span className="brand-text">EvoluMind</span>
                <button
                  className="mobile-close-btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                  }}
                  aria-label="Cerrar"
                >
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
          </div>,
          document.body
        )}
    </>
  );
}
