import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';

function formatBackdropColor(color) {
  if (!color || color === 'default') return undefined;
  if (color.startsWith('rgba') || color.startsWith('rgb')) return color;
  if (color.startsWith('#')) {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.94)`;
    }
  }
  return color;
}

/**
 * Full-screen responsive image lightbox modal for inspecting booklet covers in high resolution
 * with interactive zoom in / zoom out, drag to pan, and wheel zoom.
 */
export default function ImageLightbox({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onIndexChange,
  title = '',
  backdropColor,
  initialScale = 1,
  initialOffsetX = 0,
  initialOffsetY = 0,
}) {
  const baseScale = Number(initialScale) > 0 ? Number(initialScale) : 1;
  const basePosX = Number(initialOffsetX) || 0;
  const basePosY = Number(initialOffsetY) || 0;

  const [scale, setScale] = useState(baseScale);
  const [position, setPosition] = useState({ x: basePosX, y: basePosY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const containerRef = useRef(null);

  // Reset zoom and position when index changes, modal opens or configuration updates
  useEffect(() => {
    setScale(baseScale);
    setPosition({ x: basePosX, y: basePosY });
  }, [currentIndex, isOpen, baseScale, basePosX, basePosY]);

  const handleZoomIn = useCallback((e) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback((e) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(0.5, Number((prev - 0.25).toFixed(2)));
      return next;
    });
  }, []);

  const handleResetZoom = useCallback((e) => {
    e?.stopPropagation();
    setScale(baseScale);
    setPosition({ x: basePosX, y: basePosY });
  }, [baseScale, basePosX, basePosY]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (scale > baseScale) {
      handleResetZoom();
    } else {
      setScale(Math.max(2, Number((baseScale * 1.5).toFixed(2))));
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1 && onIndexChange) {
        onIndexChange((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight' && images.length > 1 && onIndexChange) {
        onIndexChange((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, images.length, onClose, onIndexChange, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Wheel zoom listener with passive: false to prevent background scroll
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setScale((prev) => {
        const next = Math.min(3.5, Math.max(0.6, Number((prev + delta).toFixed(2))));
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return next;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  const currentUrl = images[currentIndex] || images[0];
  const computedBg = formatBackdropColor(backdropColor);

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

  // Drag & Pan handlers
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + dx,
      y: dragStartRef.current.posY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan support
  const handleTouchStart = (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + dx,
      y: dragStartRef.current.posY + dy,
    });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="image-lightbox-overlay"
      style={computedBg ? { '--lightbox-bg': computedBg } : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${title || 'Portada'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        aria-label="Cerrar imagen ampliada"
        title="Cerrar (Esc)"
      >
        <X size={24} />
      </button>

      {/* Floating Zoom Controls Toolbar */}
      <div className="lightbox-zoom-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="lightbox-zoom-tool-btn"
          onClick={handleZoomOut}
          disabled={scale <= 0.6}
          title="Reducir zoom (-)"
          aria-label="Reducir zoom"
        >
          <ZoomOut size={18} />
        </button>

        <button
          type="button"
          className="lightbox-zoom-badge-btn"
          onClick={handleResetZoom}
          title="Clic para restablecer escala (0)"
          aria-label="Restablecer tamaño"
        >
          <span>{Math.round(scale * 100)}%</span>
        </button>

        <button
          type="button"
          className="lightbox-zoom-tool-btn"
          onClick={handleZoomIn}
          disabled={scale >= 4}
          title="Aumentar zoom (+)"
          aria-label="Aumentar zoom"
        >
          <ZoomIn size={18} />
        </button>

        {(scale !== baseScale || position.x !== basePosX || position.y !== basePosY) && (
          <button
            type="button"
            className="lightbox-zoom-tool-btn reset-btn"
            onClick={handleResetZoom}
            title={`Restablecer vista inicial (${Math.round(baseScale * 100)}%)`}
            aria-label="Restablecer zoom"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className={`lightbox-image-wrap ${scale > 1 ? 'is-zoomed' : ''} ${isDragging ? 'is-dragging' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <img
          src={currentUrl}
          alt={title || 'Portada ampliada'}
          className="lightbox-zoom-image"
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.18s ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          draggable={false}
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

        {images.length > 1 && (
          <div className="lightbox-info-bar">
            <span className="lightbox-count">
              {currentIndex + 1} de {images.length}
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
