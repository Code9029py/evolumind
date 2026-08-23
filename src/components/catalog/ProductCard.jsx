import { Eye, MessageCircle, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onView }) {
  const isAvailable = product.status === 'disponible';
  const coverImage = (Array.isArray(product.images) && product.images[0]) || product.imageUrl;

  const whatsappMessage = encodeURIComponent(
    `Hola EvoluMind, me interesa solicitar el *${product.title}* (${product.price}). ¿Podrían indicarme los pasos para el pago y la entrega del PDF?`
  );
  const whatsappUrl = `https://wa.me/595992574146?text=${whatsappMessage}`;

  return (
    <article className="product-card">
      <div className="product-art" style={{ '--accent': product.accent || '#0057d9' }}>
        {coverImage ? (
          <img src={coverImage} alt={product.title} className="product-cover-img" loading="lazy" />
        ) : (
          <div className="product-book-visual">
            <div className="book-spine" />
            <div className="book-cover-content">
              <span className="book-tag">EvoluMind</span>
              <Sparkles size={28} className="book-icon" />
              <h4 className="book-cover-title">{product.theme}</h4>
              <small className="book-format-tag">{product.format?.split(' ')[0] || 'PDF'}</small>
            </div>
          </div>
        )}
        <span className={`product-status-pill ${isAvailable ? 'available' : 'soon'}`}>
          {isAvailable ? 'Disponible' : 'Próximamente'}
        </span>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-pages">{product.pages || 'PDF Interactivo'}</span>
        </div>

        <h3 className="product-title">{product.title}</h3>
        <p className="product-desc">{product.shortDescription}</p>

        <div className="product-footer">
          <div className="product-price-box">
            <span className="price-label">Inversión</span>
            <strong className="product-price">{product.price}</strong>
          </div>
          <span className="product-format-badge">100% Digital</span>
        </div>
      </div>

      <div className="product-actions">
        {onView && (
          <button className="icon-button view-btn" type="button" onClick={() => onView(product)}>
            <Eye size={17} />
            Ver Detalle
          </button>
        )}
        <a
          className="icon-button whatsapp-btn"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Solicitar ${product.title} por WhatsApp`}
        >
          <MessageCircle size={17} />
          Solicitar
        </a>
      </div>
    </article>
  );
}
