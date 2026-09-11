import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import CatalogFilters from '../components/catalog/CatalogFilters.jsx';
import CatalogGrid from '../components/catalog/CatalogGrid.jsx';
import CatalogHeader from '../components/catalog/CatalogHeader.jsx';
import ProductDetailDialog from '../components/catalog/ProductDetailDialog.jsx';
import { subscribeCatalog } from '../services/catalogService.js';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeCatalog((newProducts) => {
      setProducts(newProducts);
    });

    // Parse URL params if present
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('q');
    const themeParam = params.get('tema');

    if (searchParam) setSearch(searchParam);
    if (themeParam) setTheme(themeParam);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Auto-open product detail if ?producto=... parameter was passed
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productParam = params.get('producto');
      if (productParam) {
        const found = products.find((p) => p.id === productParam);
        if (found) setSelected(found);
      }
    }
  }, [products]);

  // Only show active non-deleted and non-hidden products in public catalog
  const visibleProducts = useMemo(() => {
    return products.filter((p) => p.status !== 'oculto' && p.status !== 'eliminado');
  }, [products]);

  const themes = useMemo(() => {
    return [...new Set(visibleProducts.map((product) => product.theme).filter(Boolean))];
  }, [visibleProducts]);

  const hasActiveFilters = search || theme !== 'todos' || status !== 'todos';

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return visibleProducts
      .filter((product) => {
        const matchesSearch =
          !query ||
          [product.title, product.theme, product.category, product.shortDescription, product.longDescription]
            .join(' ')
            .toLowerCase()
            .includes(query);
        const matchesTheme = theme === 'todos' || product.theme === theme;
        const matchesStatus = status === 'todos' || product.status === status;
        return matchesSearch && matchesTheme && matchesStatus;
      })
      .sort((a, b) => {
        if (a.status === 'disponible' && b.status !== 'disponible') return -1;
        if (a.status !== 'disponible' && b.status === 'disponible') return 1;
        return Number(b.featured) - Number(a.featured);
      });
  }, [visibleProducts, search, theme, status]);

  const handleResetFilters = () => {
    setSearch('');
    setTheme('todos');
    setStatus('todos');
  };

  return (
    <div className="page catalog-page">
      <CatalogHeader />

      <section className="section catalog-panel">
        <CatalogFilters
          search={search}
          setSearch={setSearch}
          theme={theme}
          setTheme={setTheme}
          status={status}
          setStatus={setStatus}
          themes={themes}
        />

        <div className="catalog-status-bar">
          <span className="catalog-counter">
            Mostrando <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'cuadernillo' : 'cuadernillos'}
          </span>
          {hasActiveFilters && (
            <button className="catalog-clear-btn" type="button" onClick={handleResetFilters}>
              <RotateCcw size={14} />
              Limpiar filtros
            </button>
          )}
        </div>

        <CatalogGrid
          products={filteredProducts}
          onView={setSelected}
          onReset={handleResetFilters}
        />
      </section>

      <ProductDetailDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
