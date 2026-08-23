import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const whatsappUrl =
    'https://wa.me/595992574146?text=Hola%20EvoluMind,%20me%20gustar%C3%ADa%20hacer%20una%20consulta%20sobre%20los%20cuadernillos.';

  return (
    <aside aria-label="Contacto directo por WhatsApp">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp-btn"
        title="Escríbenos por WhatsApp"
      >
        <span className="floating-whatsapp-tooltip">¿Consultas? Escríbenos</span>
        <div className="floating-whatsapp-icon-wrap">
          <MessageCircle size={26} />
          <span className="floating-whatsapp-ping" />
        </div>
      </a>
    </aside>
  );
}
