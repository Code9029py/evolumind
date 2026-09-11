import { BookDashed, RotateCcw } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function CatalogGrid({ products = [], onView, onReset, loading = false }) {
  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        message="Cargando catálogo de cuadernillos..."
        submessage="Conectando con EvoluMind en tiempo real"
        withIcon
        minHeight="340px"
      />
    );
  }

  if (products.length === 0) {
    return (
      <div className="catalog-empty-state">
        <div className="catalog-empty-icon" aria-hidden="true">
          <BookDashed size={32} />
        </div>
        <h3>No se encontraron cuadernillos</h3>
        <p>No hay resultados que coincidan con los filtros o término de búsqueda aplicado.</p>
        {onReset && (
          <button className="button ghost" type="button" onClick={onReset}>
            <RotateCcw size={16} />
            Restablecer Filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onView={onView} />
      ))}
    </div>
  );
}

