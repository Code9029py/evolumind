import { Send } from 'lucide-react';

export default function ContactForm() {
  return (
    <section className="section contact-panel">
      <div>
        <span className="eyebrow">Consulta rápida</span>
        <h2>Contanos qué cuadernillo te interesa.</h2>
        <p>Este formulario deja preparada la interfaz para una futura conexión con Sheets o CRM.</p>
      </div>
      <form>
        <input type="text" placeholder="Nombre" aria-label="Nombre" />
        <input type="email" placeholder="Correo" aria-label="Correo" />
        <select aria-label="Tema de interés" defaultValue="">
          <option value="" disabled>
            Tema de interés
          </option>
          <option>Ansiedad</option>
          <option>Estrés</option>
          <option>Autoestima</option>
          <option>Relaciones</option>
          <option>Duelo</option>
        </select>
        <textarea placeholder="Mensaje" aria-label="Mensaje" rows="4" />
        <button className="button primary" type="button">
          <Send size={18} />
          Preparar consulta
        </button>
      </form>
    </section>
  );
}
