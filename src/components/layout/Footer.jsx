import { MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="footer-minimal">
        <p className="footer-copy">
          © 2026 EvoluMind. Herramientas digitales de salud mental y bienestar emocional.
        </p>
        <a
          className="footer-whatsapp-btn"
          href="https://wa.me/595992574146?text=Hola%20EvoluMind,%20me%20gustar%C3%ADa%20hacer%20una%20consulta."
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={17} />
          <span>Contáctanos por WhatsApp (+595 992 574 146)</span>
        </a>
      </div>
    </footer>
  );
}
