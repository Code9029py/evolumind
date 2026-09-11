import { useState, useEffect } from 'react';
import { Maximize2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import ImageLightbox from '../common/ImageLightbox.jsx';

export default function ProductDetailDialog({ product, onClose, isPreview = false }) {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedImgIndex(0);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          setIsZoomOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose, isZoomOpen]);

  if (!product) return null;

  const imagesList = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : []
  ).filter(Boolean);

  const currentImage = imagesList[selectedImgIndex] || imagesList[0];

  const isSoon = product.status === 'próximamente';
  const isOut = product.status === 'agotado';
  const isAvailable = product.status === 'disponible' || (!isSoon && !isOut && product.status !== 'oculto');

  let dialogWhatsappText = `Hola EvoluMind, quiero adquirir el *${product.title}* (${product.price}). ¿Podrían darme los datos para transferir y recibir el PDF interactivo?`;
  if (isSoon) {
    dialogWhatsappText = `Hola EvoluMind, me interesa tener más información sobre el próximo lanzamiento de *${product.title}*.`;
  } else if (isOut) {
    dialogWhatsappText = `Hola EvoluMind, quisiera consultar sobre la disponibilidad del *${product.title}*.`;
  }

  const whatsappMessage = encodeURIComponent(dialogWhatsappText);
  const whatsappUrl = `https://wa.me/595981597595?text=${whatsappMessage}`;

  const coverScale = Number(product.coverScale) || 90;
  const coverOffsetY = Number(product.coverOffsetY) || 0;
  const coverOffsetX = Number(product.coverOffsetX) || 0;
  const coverStyle = {
    '--cover-zoom': `${coverScale / 100}`,
    '--cover-tx': `${coverOffsetX}px`,
    '--cover-ty': `${coverOffsetY}px`,
  };

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

        <div className="product-dialog-body">
          <div className="dialog-top-grid">
            <div className="dialog-left-col">
              <div
                className="product-art dialog-art interactive-art"
                style={{ '--accent': product.accent || '#0057d9' }}
                onClick={() => currentImage && setIsZoomOpen(true)}
                title={currentImage ? 'Clic para ampliar a pantalla completa' : undefined}
              >
                {currentImage ? (
                  <>
                    <img src={currentImage} alt="" className="product-art-backdrop" aria-hidden="true" />
                    <img
                      src={currentImage}
                      alt={product.title}
                      className="product-cover-img"
                      style={coverStyle}
                    />
                    <div className="zoom-hint-pill">
                      <Maximize2 size={13} />
                      <span>Ampliar</span>
                    </div>
                  </>
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

              {imagesList.length > 1 && (
                <div className="dialog-thumbnails-row">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      className={`dialog-thumb-btn ${selectedImgIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedImgIndex(idx)}
                      aria-label={`Ver imagen ${idx + 1}`}
                    >
                      <img src={imgUrl} alt={`Vista ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="dialog-right-col">
              <div className="dialog-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="eyebrow" style={{ marginBottom: 0 }}>{product.category}</span>
                  {isPreview && (
                    <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.72rem' }}>
                      👁️ Modo Vista Previa
                    </span>
                  )}
                </div>
                <h2 id="product-dialog-title">{product.title}</h2>
              </div>

              {/* BARRA ELEGANTE Y PROPORCIONADA DE METADATOS Y PRECIO */}
              <div className="dialog-specs-banner">
                <div className="dialog-spec-item price-spec">
                  <span className="spec-label">Precio</span>
                  <strong className="spec-value price">{product.price}</strong>
                </div>
                <div className="dialog-spec-sep" />
                <div className="dialog-spec-item">
                  <span className="spec-label">Formato</span>
                  <strong className="spec-value">{product.format || 'PDF interactivo'}</strong>
                </div>
                <div className="dialog-spec-sep" />
                <div className="dialog-spec-item">
                  <span className="spec-label">Extensión</span>
                  <strong className="spec-value">{product.pages || '40+ págs'}</strong>
                </div>
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

          <div className="dialog-actions-footer">
            {isPreview ? (
              <>
                <button
                  type="button"
                  className="button primary whatsapp-cta"
                  title="Modo vista previa: en la tienda real esto abre WhatsApp"
                  onClick={() =>
                    alert('ℹ️ Modo Vista Previa: en la tienda pública este botón abrirá WhatsApp con el mensaje de pedido configurado.')
                  }
                >
                  <MessageCircle size={18} />
                  {isAvailable ? `Solicitar por WhatsApp (${product.price})` : 'Consultar por WhatsApp'}
                  <small style={{ opacity: 0.8, fontSize: '0.72rem', marginLeft: '0.35rem' }}>(Vista previa)</small>
                </button>
                <button
                  type="button"
                  className="button ghost"
                  title="Modo vista previa: en la tienda real esto abre el formulario"
                  onClick={() =>
                    alert('ℹ️ Modo Vista Previa: en la tienda pública este botón redirige a /contacto con este cuadernillo preseleccionado.')
                  }
                >
                  <Send size={18} />
                  Consultar por Formulario
                  <small style={{ opacity: 0.8, fontSize: '0.72rem', marginLeft: '0.35rem' }}>(Vista previa)</small>
                </button>
              </>
            ) : (
              <>
                <a
                  className="button primary whatsapp-cta"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={18} />
                  {isAvailable ? `Solicitar por WhatsApp (${product.price})` : 'Consultar por WhatsApp'}
                </a>
                <a className="button ghost" href={`/contacto?producto=${product.id}`} onClick={onClose}>
                  <Send size={18} />
                  Consultar por Formulario
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      <ImageLightbox
        isOpen={isZoomOpen}
        images={imagesList}
        currentIndex={selectedImgIndex}
        onIndexChange={setSelectedImgIndex}
        onClose={() => setIsZoomOpen(false)}
        title={product.title}
        backdropColor={product.lightboxBg === 'accent' ? product.accent : product.lightboxBg}
        initialScale={(Number(product.lightboxScale) || 100) / 100}
        initialOffsetX={Number(product.lightboxOffsetX) || 0}
        initialOffsetY={Number(product.lightboxOffsetY) || 0}
      />
    </div>
  );
}
