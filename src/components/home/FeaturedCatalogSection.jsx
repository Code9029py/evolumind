import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import SectionHeader from '../common/SectionHeader.jsx';
import ProductCard from '../catalog/ProductCard.jsx';
import ProductDetailDialog from '../catalog/ProductDetailDialog.jsx';
import { getCatalog } from '../../services/sheetsApi.js';

export default function FeaturedCatalogSection() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getCatalog().then(setProducts);

    const handleCatalogUpdate = () => {
      getCatalog().then(setProducts);
    };
    window.addEventListener('evolumind_catalog_updated', handleCatalogUpdate);
    return () => window.removeEventListener('evolumind_catalog_updated', handleCatalogUpdate);
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const displayProducts = featured.length > 0 ? featured : products.slice(0, 3);

  return (
    <section className="section featured-section" id="destacados">
      <SectionHeader
        eyebrow="Catálogo Destacado"
        title="Áreas emocionales para comenzar tu recorrido."
        description="Cada cuadernillo combina rigor psicológico, ejercicios de autorregistro y formato digital rellenable."
        align="left"
      />

      <div className="catalog-grid featured-grid">
        {displayProducts.map((product) => (
          <ProductCard product={product} key={product.id} onView={setSelectedProduct} />
        ))}
      </div>

      <div className="featured-bottom-cta">
        <a href="/catalogo" className="button secondary">
          <BookOpen size={18} />
          Ver Todos los Cuadernillos Disponibles
          <ArrowRight size={18} />
        </a>
      </div>

      <ProductDetailDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
