import { BookDashed, RotateCcw } from 'lucide-react';
import ProductCard from './ProductCard.jsx';

export default function CatalogGrid({ products, onView, onReset }) {
  if (products.length === 0) {
    return (
      <div className="catalog-empty-state">
        <BookDashed size={48} />
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
