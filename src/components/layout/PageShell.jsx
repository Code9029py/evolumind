import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

export default function PageShell({ children, currentPath }) {
  return (
    <div className="app-shell">
      <Navbar currentPath={currentPath} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
