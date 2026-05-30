import { ArrowRight, MessageCircle } from 'lucide-react';

export default function FinalContactBlock() {
  return (
    <section className="section final-cta">
      <div>
        <span>Hablemos de tu bienestar</span>
        <h2>Elegí el próximo paso con calma, privacidad y acompañamiento.</h2>
      </div>
      <a className="button primary" href="/contacto">
        <MessageCircle size={18} />
        Contactar
        <ArrowRight size={18} />
      </a>
    </section>
  );
}
