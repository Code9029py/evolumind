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
    <div className="catalog-filters">
      <label>
        Buscar
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ansiedad, autoestima..."
        />
      </label>
      <label>
        Tema
        <select value={theme} onChange={(event) => setTheme(event.target.value)}>
          <option value="todos">Todos</option>
          {themes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        Estado
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="todos">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="próximamente">Próximamente</option>
        </select>
      </label>
    </div>
  );
}
