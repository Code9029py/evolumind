import { ShieldCheck, Smartphone, Sparkles, Timer } from 'lucide-react';
import { heroContent } from '../../theme/evolumindTheme.js';
import LogoOrb from '../common/LogoOrb.jsx';

const indicators = [
  { label: 'PDF Interactivo rellenable', icon: ShieldCheck },
  { label: '100% Digital y Privado', icon: Smartphone },
  { label: 'Acceso Inmediato', icon: Timer },
];

export default function HeroEvoluMind() {
  return (
    <section className="hero hero-platform">
      <div className="hero-copy">
        <span className="badge">
          <Sparkles size={14} />
          {heroContent.badge}
        </span>
        <h1>{heroContent.title}</h1>
        <h2 className="hero-subtitle">{heroContent.subtitle}</h2>
        <p>{heroContent.description}</p>

        <div className="hero-indicators">
          {indicators.map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.label}>
                <Icon size={16} />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="hero-visual" aria-label="Identidad visual de EvoluMind">
        <LogoOrb variant="card" />
        <div className="floating-chip chip-a">100% Confidencial</div>
        <div className="floating-chip chip-b">A tu propio ritmo</div>
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
