import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Mail, MessageSquare, RotateCcw, ShieldCheck } from 'lucide-react';
import { subscribeCatalog } from '../../services/catalogService.js';

const fallbackTopicOptions = [
  { value: 'ansiedad', label: 'Cuadernillo de Ansiedad (50.000 Gs.)' },
  { value: 'estres', label: 'Cuadernillo de Estrés y Sobrecarga (50.000 Gs.)' },
  { value: 'autoestima', label: 'Cuadernillo de Autoestima y Autoconcepto (50.000 Gs.)' },
  { value: 'duelo', label: 'Cuadernillo de Duelo y Pérdida (50.000 Gs.)' },
  { value: 'relaciones', label: 'Cuadernillo de Relaciones Interpersonales (50.000 Gs.)' },
  { value: 'varios', label: 'Consulta general sobre varios cuadernillos' },
  { value: 'orientacion', label: 'Orientación para elegir un cuadernillo' },
  { value: 'academico', label: 'Consulta académica o institucional' },
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);

  useEffect(() => {
    const unsub = subscribeCatalog((items) => {
      if (Array.isArray(items)) {
        setCatalogProducts(items.filter((p) => p.status !== 'eliminado' && p.status !== 'oculto'));
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('producto');
    if (productParam) {
      setFormData((prev) => ({ ...prev, topic: productParam }));
    }
  }, []);

  const combinedTopicOptions = [
    ...(catalogProducts.length > 0
      ? catalogProducts.map((p) => ({
          value: p.id,
          label: `${p.title} (${p.price || 'Consultar'})`,
        }))
      : fallbackTopicOptions.slice(0, 5)),
    { value: 'varios', label: 'Consulta general sobre varios cuadernillos' },
    { value: 'orientacion', label: 'Orientación para elegir un cuadernillo' },
    { value: 'academico', label: 'Consulta académica o institucional' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitWeb = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Por favor, completa al menos tu nombre y correo electrónico.');
      return;
    }

    setSubmittedSummary({ ...formData });
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      topic: '',
      message: '',
    });
    setSubmitted(false);
    setSubmittedSummary(null);
  };

  return (
    <section className="section contact-panel-wrap compact-gap" id="formulario">
      <div className="contact-panel">
        <div className="contact-panel-info">
          <span className="eyebrow">Formulario de Contacto</span>
          <h2>Envíanos tu mensaje o consulta</h2>
          <p>
            ¿Tienes alguna duda sobre las actividades de los cuadernillos o deseas saber cuál se adapta mejor a tu momento actual? Escríbenos y te responderemos por correo con gusto.
          </p>

          <div className="contact-perks">
            <div className="perk-item">
              <Clock size={18} />
              <span>Respuesta en menos de 24 horas</span>
            </div>
            <div className="perk-item">
              <MessageSquare size={18} />
              <span>Orientación personalizada para elegir tu material</span>
            </div>
            <div className="perk-item">
              <ShieldCheck size={18} />
              <span>Privacidad y confidencialidad en tus consultas</span>
            </div>
          </div>
        </div>

        <div className="contact-panel-form-box">
          {submitted ? (
            <div className="form-success-card">
              <div className="success-icon-orb">
                <CheckCircle2 size={40} />
              </div>
              <h3>¡Mensaje Enviado con Éxito!</h3>
              <p>
                Gracias <strong>{submittedSummary?.name}</strong>. Hemos recibido tu mensaje y te responderemos a la brevedad a <strong>{submittedSummary?.email}</strong>.
              </p>
              <div className="success-actions">
                <button className="button primary" type="button" onClick={handleReset}>
                  <RotateCcw size={16} />
                  Enviar otro mensaje
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitWeb} className="interactive-contact-form">
              <div className="form-row">
                <label>
                  <span>Nombre completo *</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                </label>
                <label>
                  <span>Correo electrónico *</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Teléfono (Opcional)</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ej. 0981 123 456"
                  />
                </label>
                <label>
                  <span>Tema de tu consulta</span>
                  <select name="topic" value={formData.topic} onChange={handleChange}>
                    <option value="">Selecciona un tema o cuadernillo...</option>
                    {combinedTopicOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                    {formData.topic && !combinedTopicOptions.some((o) => o.value === formData.topic) && (
                      <option value={formData.topic}>Cuadernillo seleccionado ({formData.topic})</option>
                    )}
                  </select>
                </label>
              </div>

              <label className="form-full-label">
                <span>Tu mensaje *</span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Escribe aquí tu consulta o lo que desees comentarnos..."
                  rows={4}
                  required
                />
              </label>

              <div className="form-buttons-group">
                <button className="button primary full-width" type="submit">
                  <Mail size={18} />
                  Enviar Consulta por Correo
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
