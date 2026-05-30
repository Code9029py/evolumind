import { BrainCircuit, Menu } from 'lucide-react';
import logo from '../../assets/logo/EvoluMind_logo.jpeg';

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/opcion-1', label: 'Opción 1' },
  { href: '/opcion-3', label: 'Opción 3' },
];

export default function Navbar({ currentPath }) {
  return (
    <header className="navbar">
      <a href="/" className="brand" aria-label="EvoluMind inicio">
        <img src={logo} alt="EvoluMind" />
        <span>EvoluMind</span>
      </a>
      <nav className="desktop-nav" aria-label="Principal">
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
      <a href="/catalogo" className="nav-action">
        <BrainCircuit size={18} />
        Explorar
      </a>
      <details className="mobile-menu">
        <summary aria-label="Abrir navegación">
          <Menu size={22} />
        </summary>
        <div>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
      </details>
    </header>
  );
}
