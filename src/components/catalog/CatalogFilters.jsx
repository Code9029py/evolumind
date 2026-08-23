import { Filter, Search } from 'lucide-react';

export default function CatalogFilters({
  search,
  setSearch,
  theme,
  setTheme,
  status,
  setStatus,
  themes,
}) {
  return (
    <div className="catalog-filters-wrap">
      <div className="catalog-filters">
        <label className="filter-group search-group">
          <span className="filter-label">
            <Search size={16} />
            Buscar cuadernillo
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, tema o palabra clave..."
            className="filter-input"
          />
        </label>

        <label className="filter-group">
          <span className="filter-label">
            <Filter size={16} />
            Área / Tema
          </span>
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los temas</option>
            {themes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-group">
          <span className="filter-label">Disponibilidad</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponibles ahora</option>
            <option value="próximamente">Próximos lanzamientos</option>
          </select>
        </label>
      </div>
    </div>
  );
}
