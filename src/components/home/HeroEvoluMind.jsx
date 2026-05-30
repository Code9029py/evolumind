import { ArrowRight, MessageCircle, ShieldCheck, Smartphone, Timer } from 'lucide-react';
import { heroContent } from '../../theme/evolumindTheme.js';
import LogoOrb from '../common/LogoOrb.jsx';

const indicators = [
  { label: '100% digital', icon: Smartphone },
  { label: 'Disponible 24/7', icon: Timer },
  { label: 'PDF interactivo', icon: ShieldCheck },
];

export default function HeroEvoluMind({ variant = 'platform' }) {
  return (
    <section className={`hero hero-${variant}`}>
      <div className="hero-copy">
        <span className="badge">{heroContent.badge}</span>
        <h1>{heroContent.title}</h1>
        <p>{heroContent.description}</p>
        <div className="hero-actions">
          <a className="button primary" href="/catalogo">
            Ver catálogo
            <ArrowRight size={18} />
          </a>
          <a className="button ghost" href="/contacto">
            <MessageCircle size={18} />
            Contactar
          </a>
        </div>
        <div className="hero-indicators">
          {indicators.map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.label}>
                <Icon size={18} />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>
      <div className="hero-visual" aria-label="Identidad visual de EvoluMind">
        <LogoOrb variant={variant === 'map' ? 'map' : 'card'} />
        <div className="floating-chip chip-a">privado</div>
        <div className="floating-chip chip-b">accesible</div>
        <div className="node-field" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
