import { useEffect, useMemo, useState } from 'react';
import CatalogFilters from '../components/catalog/CatalogFilters.jsx';
import CatalogGrid from '../components/catalog/CatalogGrid.jsx';
import CatalogHeader from '../components/catalog/CatalogHeader.jsx';
import ProductDetailDialog from '../components/catalog/ProductDetailDialog.jsx';
import { getCatalog } from '../services/sheetsApi.js';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getCatalog().then(setProducts);
  }, []);

  const themes = useMemo(() => [...new Set(products.map((product) => product.theme))], [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products
      .filter((product) => {
        const matchesSearch =
          !query ||
          [product.title, product.theme, product.category, product.shortDescription]
            .join(' ')
            .toLowerCase()
            .includes(query);
        const matchesTheme = theme === 'todos' || product.theme === theme;
        const matchesStatus = status === 'todos' || product.status === status;
        return matchesSearch && matchesTheme && matchesStatus;
      })
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [products, search, theme, status]);

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
        <CatalogGrid products={filteredProducts} onView={setSelected} />
      </section>
      <ProductDetailDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
