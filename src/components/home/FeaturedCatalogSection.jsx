import SectionHeader from '../common/SectionHeader.jsx';
import ProductCard from '../catalog/ProductCard.jsx';
import { fallbackCatalog } from '../../data/fallbackCatalog.js';

export default function FeaturedCatalogSection({ compact = false }) {
  const featured = fallbackCatalog.filter((product) => product.featured).slice(0, 3);

  return (
    <section className={`section featured-section ${compact ? 'compact' : ''}`}>
      <SectionHeader
        eyebrow="Catálogo destacado"
        title="Áreas emocionales para comenzar tu recorrido."
        description="Cada cuadernillo combina reflexión guiada, ejercicios prácticos y formato PDF interactivo."
      />
      <div className="catalog-grid featured-grid">
        {featured.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
      <a href="/catalogo" className="button secondary">
        Ver todos los cuadernillos
      </a>
    </section>
  );
}
