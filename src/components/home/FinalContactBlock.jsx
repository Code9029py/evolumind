import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

export default function FinalContactBlock() {
  return (
    <section className="section final-cta-wrap">
      <div className="final-cta">
        <div className="final-cta-text">
          <span className="final-cta-eyebrow">
            <Sparkles size={16} />
            Hablemos de tu bienestar
          </span>
          <h2>Elegí el próximo paso con calma, privacidad y acompañamiento.</h2>
          <p>
            Consultanos por WhatsApp o redes sociales para adquirir tu cuadernillo o despejar cualquier duda sobre nuestros materiales psicoeducativos.
          </p>
        </div>
        <div className="final-cta-buttons">
          <a
            className="button primary white-btn"
            href="https://wa.me/595992574146?text=Hola%20EvoluMind,%20me%20gustar%C3%ADa%20adquirir%20un%20cuadernillo%20digital."
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Solicitar por WhatsApp
          </a>
          <a className="button ghost transparent-btn" href="/catalogo">
            Ver Todos los Libros
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
