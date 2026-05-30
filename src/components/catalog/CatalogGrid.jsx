import ProductCard from './ProductCard.jsx';

export default function CatalogGrid({ products, onView }) {
  return (
    <div className="catalog-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onView={onView} />
      ))}
    </div>
  );
}
