import { Eye, MessageCircle, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onView }) {
  const disabled = product.status !== 'disponible';
  return (
    <article className="product-card">
      <div className="product-art" style={{ '--accent': product.accent }}>
        <Sparkles size={26} />
        <span>{product.theme}</span>
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{product.category}</span>
          <strong className={disabled ? 'soon' : ''}>{product.status}</strong>
        </div>
        <h3>{product.title}</h3>
        <p>{product.shortDescription}</p>
        <div className="product-footer">
          <span>{product.price}</span>
          <small>{product.format}</small>
        </div>
      </div>
      <div className="product-actions">
        {onView && (
          <button className="icon-button" type="button" onClick={() => onView(product)}>
            <Eye size={18} />
            Detalle
          </button>
        )}
        <a className="icon-button whatsapp" href={`/contacto?producto=${product.id}`}>
          <MessageCircle size={18} />
          Solicitar
        </a>
      </div>
    </article>
  );
}
