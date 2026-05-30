import { MessageCircle, X } from 'lucide-react';

export default function ProductDetailDialog({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="product-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar detalle">
          <X size={20} />
        </button>
        <div className="product-art dialog-art" style={{ '--accent': product.accent }}>
          <span>{product.theme}</span>
        </div>
        <div>
          <span className="eyebrow">{product.category}</span>
          <h2 id="product-dialog-title">{product.title}</h2>
          <p>{product.longDescription}</p>
          <dl className="detail-list">
            <div>
              <dt>Precio</dt>
              <dd>{product.price}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{product.status}</dd>
            </div>
            <div>
              <dt>Formato</dt>
              <dd>{product.format}</dd>
            </div>
          </dl>
          <div className="dialog-actions">
            <a className="button primary" href="/contacto">
              Consultar
            </a>
            <a className="button ghost" href="https://wa.me/595981000000">
              <MessageCircle size={18} />
              Solicitar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
