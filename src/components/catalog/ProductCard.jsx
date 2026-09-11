import { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Maximize2, MessageCircle, Sparkles } from 'lucide-react';
import ImageLightbox from '../common/ImageLightbox.jsx';

export default function ProductCard({ product, onView }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const isSoon = product.status === 'próximamente';
  const isOut = product.status === 'agotado';
  const isAvailable = product.status === 'disponible' || (!isSoon && !isOut && product.status !== 'oculto');

  const statusLabel = isAvailable ? 'Disponible' : isOut ? 'Sin Stock' : 'Próximamente';
  const statusClass = isAvailable ? 'available' : isOut ? 'out' : 'soon';

  const imagesList = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : []
  ).filter(Boolean);

  const currentImage = imagesList[currentImgIndex] || imagesList[0];

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (e, index) => {
    e.stopPropagation();
    setCurrentImgIndex(index);
  };

  const handleCardArtClick = () => {
    if (onView) {
      onView(product);
    }
  };

  let defaultMsg = `Hola EvoluMind, me interesa solicitar el *${product.title}* (${product.price}). ¿Podrían indicarme los pasos para el pago y la entrega del PDF?`;
  if (isSoon) {
    defaultMsg = `Hola EvoluMind, me interesa tener más información sobre el próximo lanzamiento de *${product.title}*.`;
  } else if (isOut) {
    defaultMsg = `Hola EvoluMind, quisiera consultar sobre la disponibilidad del *${product.title}*.`;
  }

  const whatsappMessage = encodeURIComponent(defaultMsg);
  const whatsappUrl = `https://wa.me/595981597595?text=${whatsappMessage}`;

  return (
    <article className="product-card">
      <div
        className="product-art interactive-art"
        style={{ '--accent': product.accent || '#0057d9' }}
        onClick={handleCardArtClick}
        title="Clic para ver detalle completo"
      >
        {currentImage ? (
          <>
            <img src={currentImage} alt="" className="product-art-backdrop" aria-hidden="true" />
            <img src={currentImage} alt={product.title} className="product-cover-img" loading="lazy" />
            <button
              type="button"
              className="card-quick-zoom-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomOpen(true);
              }}
              title="Ampliar portada a pantalla completa"
              aria-label="Ampliar portada"
            >
              <Maximize2 size={15} />
            </button>
          </>
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

        {/* FLECHAS LATERALES Y PUNTOS DE PAGINACIÓN SI TIENE MÁS DE 1 FOTO */}
        {imagesList.length > 1 && (
          <>
            <button
              type="button"
              className="card-side-arrow left"
              onClick={handlePrevImg}
              aria-label="Foto anterior"
              title="Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="card-side-arrow right"
              onClick={handleNextImg}
              aria-label="Siguiente foto"
              title="Siguiente"
            >
              <ChevronRight size={16} />
            </button>

            <div className="card-pagination-dots" onClick={(e) => e.stopPropagation()}>
              {imagesList.map((_, i) => (
                <span
                  key={i}
                  className={`card-dot ${currentImgIndex === i ? 'active' : ''}`}
                  onClick={(e) => handleDotClick(e, i)}
                  aria-label={`Ver foto ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <span className={`product-status-pill ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-pages">{product.pages || 'PDF Interactivo'}</span>
        </div>

        <h3 className="product-title" onClick={handleCardArtClick} style={{ cursor: 'pointer' }}>
          {product.title}
        </h3>
        <p className="product-desc">{product.shortDescription}</p>

        <div className="product-footer">
          <div className="product-price-box">
            <span className="price-label">Precio</span>
            <strong className="product-price">{product.price}</strong>
          </div>
          <span className="product-format-badge">{product.format || '100% Digital'}</span>
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
          aria-label={`${isAvailable ? 'Solicitar' : 'Consultar'} ${product.title} por WhatsApp`}
        >
          <MessageCircle size={17} />
          {isAvailable ? 'Solicitar' : 'Consultar'}
        </a>
      </div>

      <ImageLightbox
        isOpen={isZoomOpen}
        images={imagesList}
        currentIndex={currentImgIndex}
        onIndexChange={setCurrentImgIndex}
        onClose={() => setIsZoomOpen(false)}
        title={product.title}
        backdropColor={product.lightboxBg === 'accent' ? product.accent : product.lightboxBg}
      />
    </article>
  );
}
