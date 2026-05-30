import { useEffect, useState } from 'react';
import PageShell from './components/layout/PageShell.jsx';
import Catalog from './pages/Catalog.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import OptionOne from './pages/OptionOne.jsx';
import OptionThree from './pages/OptionThree.jsx';

const routes = {
  '/': Home,
  '/catalogo': Catalog,
  '/contacto': Contact,
  '/opcion-1': OptionOne,
  '/opcion-3': OptionThree,
};

function getCurrentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
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
      event.preventDefault();
      window.history.pushState({}, '', anchor.getAttribute('href'));
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
