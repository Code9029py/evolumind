import { BookOpen } from 'lucide-react';

export default function CatalogHeader() {
  return (
    <section className="page-hero catalog-hero">
      <div className="page-hero-content">
        <span className="badge">Catálogo Digital</span>
        <h1>Cuadernillos terapéuticos interactivos</h1>
        <p>
          Recursos de autoayuda técnica en PDF interactivo para trabajar a tu propio ritmo.
        </p>
      </div>
      <div className="page-hero-icon-orb">
        <BookOpen size={40} />
      </div>
    </section>
  );
}
