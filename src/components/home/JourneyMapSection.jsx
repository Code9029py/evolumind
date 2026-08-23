import { ArrowDown, MapPinned, Sparkles } from 'lucide-react';
import { coreContent } from '../../theme/evolumindTheme.js';

export default function JourneyMapSection() {
  return (
    <section className="section journey-section" id="recorrido">
      <div className="journey-title-wrap">
        <div className="journey-icon-orb">
          <MapPinned size={32} />
        </div>
        <div>
          <span className="eyebrow">Recorrido EvoluMind</span>
          <h2>Un mapa visual para avanzar desde el autoconocimiento hacia la acción.</h2>
          <p className="journey-subtitle">
            Un proceso paso a paso para acompañar tu bienestar con autonomía y herramientas validadas.
          </p>
        </div>
      </div>

      <div className="journey-path-container">
        <div className="journey-timeline-line" aria-hidden="true" />
        
        <div className="journey-nodes-list">
          {coreContent.steps.map((item, index) => (
            <article className={`journey-node-card ${index % 2 === 0 ? 'node-left' : 'node-right'}`} key={item.step}>
              <div className="journey-node-badge">
                <span>{item.step}</span>
              </div>
              <div className="journey-node-content">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <div className="journey-node-arrow" aria-hidden="true">
                <ArrowDown size={18} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
