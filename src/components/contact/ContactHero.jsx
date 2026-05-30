import { MessageCircleHeart } from 'lucide-react';

export default function ContactHero() {
  return (
    <section className="page-hero contact-hero">
      <div>
        <span className="badge">Contacto</span>
        <h1>Hablemos de tu bienestar</h1>
        <p>
          Elegí el canal que te resulte más cómodo para consultar por cuadernillos, disponibilidad
          o próximos lanzamientos de EvoluMind.
        </p>
      </div>
      <MessageCircleHeart size={76} />
    </section>
  );
}
