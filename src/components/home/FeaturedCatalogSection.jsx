import { BookOpen, Sparkles } from 'lucide-react';
import SectionHeader from '../common/SectionHeader.jsx';
import ProductCard from '../catalog/ProductCard.jsx';

export default function FeaturedCatalogSection({
  products = [],
  onViewProduct,
  onOrderProduct,
}) {
  const featured = products
    .filter((product) => product.featured)
    .slice(0, 3);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="section featured-catalog-section" id="cuadernillos">
      <SectionHeader
        eyebrow="Materiales Destacados"
        title="Nuestros cuadernillos terapéuticos"
        description="Cada cuadernillo combina rigor psicológico, ejercicios de autorregistro y formato digital interactivo."
        align="left"
      />

      <div className="catalog-grid">
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={onViewProduct}
            onOrder={onOrderProduct}
          />
        ))}
      </div>

      <div className="featured-catalog-cta">
        <a className="button primary" href="/catalogo">
          <BookOpen size={18} />
          Explorar todo el catálogo
        </a>
      </div>
    </section>
  );
}
