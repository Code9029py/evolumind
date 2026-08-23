import { MessageCircleHeart } from 'lucide-react';

export default function ContactHero() {
  return (
    <section className="page-hero contact-hero">
      <div className="page-hero-content">
        <span className="badge">Atención y Consultas</span>
        <h1>Hablemos de tu bienestar</h1>
        <p>
          Canales directos para resolver dudas sobre los materiales y acompañamiento en tu proceso.
        </p>
      </div>
      <div className="page-hero-icon-orb">
        <MessageCircleHeart size={40} />
      </div>
    </section>
  );
}
