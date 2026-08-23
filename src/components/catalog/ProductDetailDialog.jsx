import { useEffect } from 'react';
import { BookCheck, CheckCircle2, MessageCircle, Send, Sparkles, X } from 'lucide-react';

export default function ProductDetailDialog({ product, onClose }) {
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const whatsappMessage = encodeURIComponent(
    `Hola EvoluMind, quiero adquirir el *${product.title}* (${product.price}). ¿Podrían darme los datos para transferir y recibir el PDF interactivo?`
  );
  const whatsappUrl = `https://wa.me/595992574146?text=${whatsappMessage}`;

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="product-dialog wide-layout"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar detalle">
          <X size={20} />
        </button>

        <div className="dialog-top-grid">
          <div className="dialog-left-col">
            <div className="product-art dialog-art" style={{ '--accent': product.accent || '#0057d9' }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.title} className="product-cover-img" />
              ) : (
                <div className="product-book-visual dialog-book-visual">
                  <div className="book-spine" />
                  <div className="book-cover-content">
                    <span className="book-tag">EvoluMind</span>
                    <Sparkles size={32} className="book-icon" />
                    <h3 className="book-cover-title">{product.theme}</h3>
                    <small className="book-format-tag">PDF</small>
                  </div>
                </div>
              )}
            </div>

            <div className="dialog-quick-specs">
              <div className="spec-card">
                <small>Inversión</small>
                <strong>{product.price}</strong>
              </div>
              <div className="spec-card">
                <small>Formato</small>
                <strong>PDF Digital</strong>
              </div>
              <div className="spec-card">
                <small>Extensión</small>
                <strong>{product.pages || '40+ págs'}</strong>
              </div>
            </div>
          </div>

          <div className="dialog-right-col">
            <div className="dialog-header">
              <span className="eyebrow">{product.category}</span>
              <h2 id="product-dialog-title">{product.title}</h2>
            </div>

            <p className="dialog-description">{product.longDescription}</p>

            {product.targetAudience && (
              <div className="dialog-audience-box">
                <strong>¿Para quién es este cuadernillo?</strong>
                <p>{product.targetAudience}</p>
              </div>
            )}
          </div>
        </div>

        {product.modules && product.modules.length > 0 && (
          <div className="dialog-modules-fullwidth">
            <h4>
              <BookCheck size={18} />
              Estructura de Módulos y Actividades:
            </h4>
            <div className="modules-grid-2col">
              {product.modules.map((moduleItem) => (
                <div className="module-grid-item" key={moduleItem}>
                  <CheckCircle2 size={16} />
                  <span>{moduleItem}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dialog-actions-footer">
          <a
            className="button primary whatsapp-cta"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Solicitar por WhatsApp ({product.price})
          </a>
          <a className="button ghost" href={`/contacto?producto=${product.id}`} onClick={onClose}>
            <Send size={18} />
            Consultar por Formulario
          </a>
        </div>
      </section>
    </div>
  );
}
