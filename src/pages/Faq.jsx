import { HelpCircle } from 'lucide-react';
import FaqSection from '../components/contact/FaqSection.jsx';

export default function Faq() {
  return (
    <div className="page faq-page">
      <section className="page-hero faq-hero">
        <div className="page-hero-content">
          <span className="badge">Centro de Ayuda</span>
          <h1>Preguntas Frecuentes</h1>
          <p>
            Información sobre los formatos digitales, entrega y medios de pago disponibles.
          </p>
        </div>
        <div className="page-hero-icon-orb">
          <HelpCircle size={40} />
        </div>
      </section>

      <FaqSection hideHeader />
    </div>
  );
}
