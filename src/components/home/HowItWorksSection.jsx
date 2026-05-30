import { CheckCircle2 } from 'lucide-react';
import SectionHeader from '../common/SectionHeader.jsx';
import { coreContent } from '../../theme/evolumindTheme.js';

export default function HowItWorksSection({ mapMode = false }) {
  return (
    <section className={`section how-section ${mapMode ? 'map-mode' : ''}`}>
      <SectionHeader
        eyebrow="Cómo funciona"
        title="Un proceso simple para empezar a cuidarte."
        description="Elegís el área que querés trabajar y recibís un material digital diseñado para avanzar a tu ritmo."
        align="center"
      />
      <div className="steps-grid">
        {coreContent.steps.map((step, index) => (
          <article className="step-card" key={step}>
            <span>{index + 1}</span>
            <CheckCircle2 size={24} />
            <h3>{step}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
