import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SectionHeader from '../common/SectionHeader.jsx';
import { faqList } from '../../data/fallbackContact.js';

export default function FaqSection({ hideHeader = false }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="section faq-section" id="preguntas-frecuentes">
      {!hideHeader && (
        <SectionHeader
          eyebrow="Preguntas Frecuentes"
          title="Respuestas a tus dudas sobre los cuadernillos"
          description="Información detallada sobre formatos, entregas y pagos en Paraguay."
          align="left"
        />
      )}

      <div className="faq-accordion-list">
        {faqList.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <article className={`faq-item ${isOpen ? 'open' : ''}`} key={item.question}>
              <button
                className="faq-question-btn"
                type="button"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
              >
                <div className="faq-question-title">
                  <HelpCircle size={20} className="faq-icon" />
                  <span>{item.question}</span>
                </div>
                <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'rotated' : ''}`} />
              </button>

              {isOpen && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
