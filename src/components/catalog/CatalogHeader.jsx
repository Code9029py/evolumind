import { SearchCheck } from 'lucide-react';

export default function CatalogHeader() {
  return (
    <section className="page-hero catalog-hero">
      <div>
        <span className="badge">Catálogo digital</span>
        <h1>Cuadernillos terapéuticos para distintas áreas emocionales.</h1>
        <p>
          Recursos en PDF interactivo, pensados para trabajar ansiedad, estrés, autoestima,
          relaciones y duelo con ejercicios claros y privados.
        </p>
      </div>
      <SearchCheck size={72} />
    </section>
  );
}
