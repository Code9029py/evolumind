import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * Full-screen responsive image lightbox modal for inspecting booklet covers in high resolution.
 */
export default function ImageLightbox({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onIndexChange,
  title = '',
  backdropColor,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1 && onIndexChange) {
        onIndexChange((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight' && images.length > 1 && onIndexChange) {
        onIndexChange((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const currentUrl = images[currentIndex] || images[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    if (onIndexChange) {
      onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (onIndexChange) {
      onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
    }
  };

  return (
    <div
      className="image-lightbox-overlay"
      style={backdropColor ? { '--lightbox-bg': backdropColor } : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${title || 'Portada'}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Cerrar imagen ampliada"
        title="Cerrar (Esc)"
      >
        <X size={24} />
      </button>

      <div className="lightbox-image-wrap" onClick={(e) => e.stopPropagation()}>
        <img
          src={currentUrl}
          alt={title || 'Portada ampliada'}
          className="lightbox-zoom-image"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="lightbox-nav-btn left"
              onClick={handlePrev}
              aria-label="Foto anterior"
              title="Anterior (Flecha izquierda)"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className="lightbox-nav-btn right"
              onClick={handleNext}
              aria-label="Foto siguiente"
              title="Siguiente (Flecha derecha)"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        {(title || images.length > 1) && (
          <div className="lightbox-info-bar">
            {title && <span className="lightbox-title">{title}</span>}
            {images.length > 1 && (
              <span className="lightbox-count">
                {currentIndex + 1} de {images.length}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
