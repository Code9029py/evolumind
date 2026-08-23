import { useEffect, useState } from 'react';
import PageShell from './components/layout/PageShell.jsx';
import Admin from './pages/Admin.jsx';
import Catalog from './pages/Catalog.jsx';
import Contact from './pages/Contact.jsx';
import Faq from './pages/Faq.jsx';
import Home from './pages/Home.jsx';

const routes = {
  '/': Home,
  '/catalogo': Catalog,
  '/contacto': Contact,
  '/faq': Faq,
  '/preguntas-frecuentes': Faq,
  '/admin': Admin,
};

function getCurrentPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/opcion-1' || path === '/opcion-3') {
    return '/';
  }
  return path;
}

export default function App() {
  const [path, setPath] = useState(getCurrentPath);
  const Page = routes[path] || Home;

  useEffect(() => {
    const handleNavigation = () => setPath(getCurrentPath());
    window.addEventListener('popstate', handleNavigation);

    const handleClick = (event) => {
      const anchor = event.target.closest('a[href^="/"]');
      if (!anchor || anchor.target || event.metaKey || event.ctrlKey) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      event.preventDefault();
      window.history.pushState({}, '', href);
      handleNavigation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <PageShell currentPath={path}>
      <Page />
    </PageShell>
  );
}
