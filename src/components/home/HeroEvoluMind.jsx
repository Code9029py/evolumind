import { Clock, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { heroContent } from '../../theme/evolumindTheme.js';

const indicators = [
  { label: 'PDF Interactivo', icon: ShieldCheck },
  { label: '100% Digital y Privado', icon: Lock },
  { label: 'Acceso Inmediato', icon: Clock },
];

export default function HeroEvoluMind() {
  return (
    <section className="section hero">
      <div className="hero-copy">
        <span className="badge">
          <Sparkles size={14} />
          {heroContent.badge}
        </span>
        <h1>{heroContent.title}</h1>
        <p className="hero-subtitle">{heroContent.subtitle}</p>

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

      <div className="hero-visual">
        <div className="logo-orb">
          <img
            src="/logo.jpeg"
            alt="EvoluMind - Salud Mental y Bienestar Digital"
            fetchPriority="high"
            decoding="async"
            width="280"
            height="280"
          />
          <div className="neural-rings" />
        </div>
        <div className="floating-chip chip-a">
          <span>100% Confidencial</span>
        </div>
        <div className="floating-chip chip-b">
          <span>A tu propio ritmo</span>
        </div>
      </div>
    </section>
  );
}
