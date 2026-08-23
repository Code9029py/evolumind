import FloatingWhatsApp from '../common/FloatingWhatsApp.jsx';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

export default function PageShell({ children, currentPath }) {
  const isAdmin = currentPath === '/admin';

  return (
    <div className="app-shell">
      <Navbar currentPath={currentPath} />
      <main>{children}</main>
      {!isAdmin && <FloatingWhatsApp />}
      <Footer />
    </div>
  );
}
