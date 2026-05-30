import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <span className="footer-mark">
          <Sparkles size={18} />
          EvoluMind
        </span>
        <p>Evolución humana a un clic de distancia.</p>
      </div>
      <div className="footer-links">
        <a href="/catalogo">Catálogo</a>
        <a href="/contacto">Contacto</a>
        <a href="/opcion-1">Opción 1</a>
        <a href="/opcion-3">Opción 3</a>
      </div>
    </footer>
  );
}
