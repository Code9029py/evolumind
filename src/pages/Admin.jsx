import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Edit2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  getStoredCatalog,
  saveStoredCatalog,
  resetCatalogToDefault,
} from '../services/catalogStorage.js';

const initialProductForm = {
  id: '',
  title: '',
  theme: '',
  category: '',
  shortDescription: '',
  longDescription: '',
  modules: [],
  modulesText: '',
  pages: '40 páginas',
  targetAudience: '',
  price: '50.000 Gs.',
  status: 'disponible', // 'disponible' | 'oculto' | 'eliminado'
  format: 'PDF interactivo',
  featured: false,
  accent: '#0057d9',
  imageUrl: '',
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('evolumind_admin_auth');
    if (sessionAuth === 'true') {
      setAuthenticated(true);
    }
    setProducts(getStoredCatalog());
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const isUserValid = cleanUser === 'admin' || cleanUser === 'evolumind';
    const isPassValid = cleanPass === 'admin' || cleanPass === 'evolumind2026' || cleanPass === '1234';

    if (isUserValid && isPassValid) {
      setAuthenticated(true);
      sessionStorage.setItem('evolumind_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Credenciales incorrectas. (Usuario: admin | Clave: admin)');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('evolumind_admin_auth');
  };

  const handleStartNew = () => {
    setIsNew(true);
    setEditingProduct({
      ...initialProductForm,
      id: `cuadernillo-${Date.now()}`,
    });
  };

  const handleStartEdit = (product) => {
    setIsNew(false);
    setEditingProduct({
      ...product,
      modulesText: Array.isArray(product.modules) ? product.modules.join('\n') : '',
    });
  };

  const handleToggleVisibility = (product) => {
    const nextStatus = product.status === 'disponible' ? 'oculto' : 'disponible';
    const updated = products.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p));
    setProducts(updated);
    saveStoredCatalog(updated);
    showToast(`Cuadernillo marcado como ${nextStatus}`);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!editingProduct.title.trim()) {
      alert('El título es obligatorio.');
      return;
    }

    const modulesList = editingProduct.modulesText
      ? editingProduct.modulesText
          .split('\n')
          .map((m) => m.trim())
          .filter(Boolean)
      : editingProduct.modules || [];

    const updatedProduct = {
      ...editingProduct,
      modules: modulesList,
    };
    delete updatedProduct.modulesText;

    let newProductsList;
    if (isNew) {
      newProductsList = [updatedProduct, ...products];
    } else {
      newProductsList = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    }

    setProducts(newProductsList);
    saveStoredCatalog(newProductsList);
    setEditingProduct(null);
    showToast(isNew ? '¡Cuadernillo creado!' : '¡Cambios guardados!');
  };

  // Soft delete (moves to status: 'eliminado')
  const handleSoftDelete = (id, title) => {
    if (confirm(`¿Mover "${title}" a la papelera?`)) {
      const updated = products.map((p) => (p.id === id ? { ...p, status: 'eliminado' } : p));
      setProducts(updated);
      saveStoredCatalog(updated);
      showToast('Cuadernillo movido a la papelera');
    }
  };

  // Restore from trash
  const handleRestore = (id) => {
    const updated = products.map((p) => (p.id === id ? { ...p, status: 'disponible' } : p));
    setProducts(updated);
    saveStoredCatalog(updated);
    showToast('Cuadernillo restaurado');
  };

  // Permanent delete
  const handlePermanentDelete = (id, title) => {
    if (confirm(`¿Eliminar definitivamente "${title}"? Esta acción no se puede deshacer.`)) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveStoredCatalog(updated);
      showToast('Cuadernillo eliminado permanentemente');
    }
  };

  const activeProducts = products.filter((p) => p.status !== 'eliminado');
  const deletedProducts = products.filter((p) => p.status === 'eliminado');

  if (!authenticated) {
    return (
      <div className="page admin-login-page">
        <div className="admin-login-box">
          <div className="admin-login-header">
            <div className="admin-lock-badge">
              <Lock size={26} />
            </div>
            <h2>Panel de Control</h2>
            <p>Acceso administrativo de EvoluMind</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-field">
              <label>Usuario</label>
              <div className="input-icon-wrap">
                <User size={18} />
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Contraseña</label>
              <div className="input-icon-wrap">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {authError && <div className="admin-error-box">{authError}</div>}

            <button className="button primary full-width admin-submit-btn" type="submit">
              Ingresar al Panel
            </button>
          </form>

          <div className="admin-login-footer">
            <a href="/" className="admin-back-btn">
              <ArrowLeft size={15} />
              Volver al sitio web
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-dashboard-page">
      {toastMessage && <div className="admin-toast">{toastMessage}</div>}

      <header className="admin-topbar">
        <div>
          <span className="badge">Administración V-Tech</span>
          <h1>Catálogo de Cuadernillos</h1>
          <p>Gestiona el estado, precios e información de cada libro digital.</p>
        </div>

        <div className="admin-topbar-actions">
          <button className="button primary" type="button" onClick={handleStartNew}>
            <Plus size={18} />
            Nuevo Cuadernillo
          </button>
          <button
            className={`button ghost ${showTrash ? 'active-trash' : ''}`}
            type="button"
            onClick={() => setShowTrash(!showTrash)}
          >
            <Trash2 size={16} />
            Papelera ({deletedProducts.length})
          </button>
          <button className="icon-button logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {showTrash ? (
        <div className="admin-card-container">
          <div className="admin-section-header">
            <h3>Papelera de Cuadernillos Eliminados ({deletedProducts.length})</h3>
            <p>Los productos aquí no son visibles en la tienda.</p>
          </div>

          {deletedProducts.length === 0 ? (
            <div className="admin-empty-box">La papelera está vacía.</div>
          ) : (
            <div className="admin-products-table">
              {deletedProducts.map((product) => (
                <div className="admin-row-item deleted-row" key={product.id}>
                  <div className="admin-row-info">
                    <strong>{product.title}</strong>
                    <span>{product.theme} • {product.price}</span>
                  </div>
                  <div className="admin-row-actions">
                    <button
                      className="button ghost small-btn"
                      type="button"
                      onClick={() => handleRestore(product.id)}
                    >
                      <RotateCcw size={14} />
                      Restaurar
                    </button>
                    <button
                      className="button danger-ghost small-btn"
                      type="button"
                      onClick={() => handlePermanentDelete(product.id, product.title)}
                    >
                      <Trash2 size={14} />
                      Borrar Definitivo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="admin-card-container">
          <div className="admin-section-header">
            <h3>Cuadernillos Activos ({activeProducts.length})</h3>
          </div>

          <div className="admin-products-table">
            {activeProducts.map((product) => {
              const isHidden = product.status === 'oculto';
              return (
                <div className={`admin-row-item ${isHidden ? 'hidden-row' : ''}`} key={product.id}>
                  <div className="admin-row-badge" style={{ '--accent': product.accent || '#0057d9' }}>
                    <Sparkles size={18} />
                  </div>

                  <div className="admin-row-info">
                    <div className="admin-row-title-line">
                      <strong>{product.title}</strong>
                      <span className={`status-pill ${isHidden ? 'pill-hidden' : 'pill-visible'}`}>
                        {isHidden ? 'Oculto' : 'Disponible'}
                      </span>
                      {product.featured && <span className="status-pill pill-featured">Destacado</span>}
                    </div>
                    <p>{product.shortDescription}</p>
                    <small>{product.category} • <strong>{product.price}</strong> • {product.pages}</small>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      className="icon-button view-toggle-btn"
                      type="button"
                      onClick={() => handleToggleVisibility(product)}
                      title={isHidden ? 'Hacer visible en catálogo' : 'Ocultar del catálogo'}
                    >
                      {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      {isHidden ? 'Oculto' : 'Visible'}
                    </button>
                    <button
                      className="icon-button edit-btn"
                      type="button"
                      onClick={() => handleStartEdit(product)}
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      className="icon-button delete-btn"
                      type="button"
                      onClick={() => handleSoftDelete(product.id, product.title)}
                      title="Mover a papelera"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="dialog-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNew ? 'Nuevo Cuadernillo' : `Editar: ${editingProduct.title}`}</h3>
              <button
                className="dialog-close"
                type="button"
                onClick={() => setEditingProduct(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-row">
                <label>
                  <span>Título del Cuadernillo *</span>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, title: e.target.value })
                    }
                    placeholder="Ej. Cuadernillo de Ansiedad"
                    required
                  />
                </label>

                <label>
                  <span>Área / Tema *</span>
                  <input
                    type="text"
                    value={editingProduct.theme}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, theme: e.target.value })
                    }
                    placeholder="Ej. Ansiedad, Estrés, Autoestima..."
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Categoría</span>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    placeholder="Ej. Regulación Emocional"
                  />
                </label>

                <label>
                  <span>Precio en Guaraníes</span>
                  <input
                    type="text"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: e.target.value })
                    }
                    placeholder="Ej. 50.000 Gs."
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Estado</span>
                  <select
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, status: e.target.value })
                    }
                  >
                    <option value="disponible">Disponible</option>
                    <option value="oculto">Oculto (no visible al público)</option>
                  </select>
                </label>

                <label>
                  <span>Color de Acento</span>
                  <input
                    type="color"
                    value={editingProduct.accent || '#0057d9'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, accent: e.target.value })
                    }
                  />
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.featured)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, featured: e.target.checked })
                    }
                  />
                  <span>Destacado</span>
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Extensión</span>
                  <input
                    type="text"
                    value={editingProduct.pages || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, pages: e.target.value })
                    }
                    placeholder="Ej. 46 páginas"
                  />
                </label>

                <label>
                  <span>URL de Imagen (Opcional)</span>
                  <input
                    type="url"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                    }
                    placeholder="https://... o vacío para portada vectorial"
                  />
                </label>
              </div>

              <label>
                <span>Descripción Corta</span>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                  }
                  placeholder="Resumen para la tarjeta"
                />
              </label>

              <label>
                <span>Descripción Larga</span>
                <textarea
                  rows={3}
                  value={editingProduct.longDescription || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, longDescription: e.target.value })
                  }
                  placeholder="Explicación detallada del contenido"
                />
              </label>

              <label>
                <span>Público Objetivo</span>
                <input
                  type="text"
                  value={editingProduct.targetAudience || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, targetAudience: e.target.value })
                  }
                  placeholder="Ej. Personas que buscan..."
                />
              </label>

              <label>
                <span>Módulos y Actividades (Uno por línea)</span>
                <textarea
                  rows={4}
                  value={editingProduct.modulesText || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, modulesText: e.target.value })
                  }
                  placeholder="Módulo 1: ...&#10;Módulo 2: ...&#10;Módulo 3: ..."
                />
              </label>

              <div className="admin-modal-actions">
                <button className="button primary" type="submit">
                  <Save size={18} />
                  Guardar Cuadernillo
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
