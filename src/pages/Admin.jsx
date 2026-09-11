import { useState, useEffect, useMemo, useRef } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  LogOut,
  Maximize2,
  Palette,
  Pipette,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  User,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import ProductDetailDialog from '../components/catalog/ProductDetailDialog.jsx';
import {
  subscribeCatalog,
  saveProductOnline,
  deleteProductOnline,
  subscribeThemes,
  saveThemesOnline,
  subscribeCategories,
  saveCategoriesOnline,
} from '../services/catalogService.js';
import { isFirebaseConfigured } from '../services/firebase.js';

const COLOR_PRESETS = [
  { name: 'Azul Primario', value: '#0057d9' },
  { name: 'Verde Menta', value: '#2ec4b6' },
  { name: 'Azul Real', value: '#1689e8' },
  { name: 'Púrpura Profundo', value: '#061b8f' },
  { name: 'Coral Cálido', value: '#ff7a70' },
  { name: 'Ámbar Energético', value: '#d97706' },
];

const initialProductForm = {
  id: '',
  title: '',
  theme: 'Ansiedad',
  category: 'Regulación Emocional',
  shortDescription: '',
  longDescription: '',
  pages: '',
  targetAudience: '',
  price: '',
  status: 'disponible',
  format: 'PDF interactivo',
  featured: false,
  accent: '#0057d9',
  images: [],
  imageUrl: '',
};

// Helper: robust price sanitizer
function sanitizePrice(rawPrice) {
  if (!rawPrice) return '';
  const digits = String(rawPrice).replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  if (isNaN(num) || num === 0) return '';
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} Gs.`;
}

// Helper: robust pages sanitizer
function sanitizePages(rawPages) {
  if (!rawPages) return '';
  const digits = String(rawPages).replace(/\D/g, '');
  if (!digits) return '';
  return `${digits} páginas`;
}

// Compress and optimize image to keep localStorage light & prevent quota errors
function processImageFile(file) {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);

  return new Promise((resolve) => {
    // If it's SVG, keep as is
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.type === 'image/png';
          const format = isPng ? 'image/png' : 'image/webp';
          const quality = isPng ? 0.85 : 0.82;
          const dataUrl = canvas.toDataURL(format, quality);
          resolve(dataUrl);
        } catch (e) {
          resolve(event.target?.result);
        }
      };
      img.onerror = () => resolve(null);
      img.src = event.target?.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [products, setProducts] = useState([]);
  const [themes, setThemes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Live full-screen detail preview modal
  const [fullDetailPreview, setFullDetailPreview] = useState(null);
  const [previewImgIndex, setPreviewImgIndex] = useState(0);

  // Manage themes / categories modal
  const [managerModalType, setManagerModalType] = useState(null); // 'themes' | 'categories' | null
  const [itemToDeleteConfirm, setItemToDeleteConfirm] = useState(null); // { type, name } | null

  // Form custom selectors state
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [customThemeValue, setCustomThemeValue] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryValue, setCustomCategoryValue] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  const [firebaseOnline, setFirebaseOnline] = useState(isFirebaseConfigured());
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('evolumind_admin_auth');
    if (sessionAuth === 'true') {
      setAuthenticated(true);
    }

    const unsubCatalog = subscribeCatalog(setProducts);
    const unsubThemes = subscribeThemes(setThemes);
    const unsubCategories = subscribeCategories(setCategories);

    const handleConfigChange = () => {
      setFirebaseOnline(isFirebaseConfigured());
    };
    window.addEventListener('evolumind_firebase_config_changed', handleConfigChange);

    return () => {
      if (typeof unsubCatalog === 'function') unsubCatalog();
      if (typeof unsubThemes === 'function') unsubThemes();
      if (typeof unsubCategories === 'function') unsubCategories();
      window.removeEventListener('evolumind_firebase_config_changed', handleConfigChange);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status !== 'eliminado');
  }, [products]);

  const deletedProducts = useMemo(() => {
    return products.filter((p) => p.status === 'eliminado');
  }, [products]);

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
      setAuthError('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('evolumind_admin_auth');
  };

  const handleStartNew = () => {
    setIsNew(true);
    setIsCustomTheme(false);
    setCustomThemeValue('');
    setIsCustomCategory(false);
    setCustomCategoryValue('');
    setNewImageUrl('');
    setPreviewImgIndex(0);

    setEditingProduct({
      ...initialProductForm,
      id: `cuadernillo-${Date.now()}`,
      theme: themes[0] || 'Ansiedad',
      category: categories[0] || 'Regulación Emocional',
    });
  };

  const handleStartEdit = (product) => {
    setIsNew(false);
    setIsCustomTheme(false);
    setCustomThemeValue('');
    setIsCustomCategory(false);
    setCustomCategoryValue('');
    setNewImageUrl('');
    setPreviewImgIndex(0);

    const imgList = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];

    const isHidden = product.status === 'oculto';
    const commercialStatus = isHidden ? (product.previousStatus || 'disponible') : (product.status || 'disponible');

    setEditingProduct({
      ...product,
      status: commercialStatus,
      wasHidden: isHidden,
      images: imgList,
    });
  };

  const handleToggleVisibility = async (product) => {
    const isCurrentlyHidden = product.status === 'oculto';
    const nextStatus = isCurrentlyHidden ? (product.previousStatus || 'disponible') : 'oculto';
    const updated = {
      ...product,
      status: nextStatus,
      previousStatus: isCurrentlyHidden ? product.previousStatus : (product.status || 'disponible'),
    };
    await saveProductOnline(updated);
    showToast(isCurrentlyHidden ? 'Cuadernillo visible en catálogo' : 'Cuadernillo ocultado del catálogo');
  };

  // Local Device Files Upload Handler (Desktop & Mobile)
  const handleProcessFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    try {
      const promises = files.map(processImageFile);
      const results = await Promise.all(promises);
      const validImages = results.filter(Boolean);

      if (validImages.length > 0) {
        const currentImages = editingProduct.images || [];
        setEditingProduct({
          ...editingProduct,
          images: [...currentImages, ...validImages],
        });
        showToast(`¡${validImages.length} foto(s) agregada(s) con éxito!`);
      } else {
        alert('No se pudieron procesar los archivos seleccionados. Asegúrate de elegir imágenes válidas (JPG, PNG, WebP).');
      }
    } catch (err) {
      console.error('Error procesando imágenes:', err);
      alert('Hubo un error al procesar las fotos del dispositivo.');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Multiple Images Management: Add URL, Remove, Move Left, Move Right
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const currentImages = editingProduct.images || [];
    setEditingProduct({
      ...editingProduct,
      images: [...currentImages, newImageUrl.trim()],
    });
    setNewImageUrl('');
    showToast('Imagen agregada a la galería');
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentImages = editingProduct.images || [];
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    setEditingProduct({
      ...editingProduct,
      images: updated,
    });
    if (previewImgIndex >= updated.length) {
      setPreviewImgIndex(Math.max(0, updated.length - 1));
    }
    showToast('Imagen eliminada');
  };

  const handleMoveImageLeft = (index) => {
    if (index <= 0) return;
    const currentImages = [...(editingProduct.images || [])];
    const temp = currentImages[index - 1];
    currentImages[index - 1] = currentImages[index];
    currentImages[index] = temp;
    setEditingProduct({
      ...editingProduct,
      images: currentImages,
    });
  };

  const handleMoveImageRight = (index) => {
    const currentImages = [...(editingProduct.images || [])];
    if (index >= currentImages.length - 1) return;
    const temp = currentImages[index + 1];
    currentImages[index + 1] = currentImages[index];
    currentImages[index] = temp;
    setEditingProduct({
      ...editingProduct,
      images: currentImages,
    });
  };

  // Delete theme or category with confirmation
  const handleConfirmDeleteItem = async () => {
    if (!itemToDeleteConfirm) return;
    const { type, name } = itemToDeleteConfirm;

    if (type === 'themes') {
      const updated = themes.filter((t) => t !== name);
      setThemes(updated);
      await saveThemesOnline(updated);
      if (editingProduct && editingProduct.theme === name) {
        setEditingProduct({ ...editingProduct, theme: updated[0] || 'Ansiedad' });
      }
      showToast(`Tema "${name}" eliminado de la lista.`);
    } else if (type === 'categories') {
      const updated = categories.filter((c) => c !== name);
      setCategories(updated);
      await saveCategoriesOnline(updated);
      if (editingProduct && editingProduct.category === name) {
        setEditingProduct({ ...editingProduct, category: updated[0] || 'Regulación Emocional' });
      }
      showToast(`Categoría "${name}" eliminada de la lista.`);
    }

    setItemToDeleteConfirm(null);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.title.trim()) {
      alert('Por favor ingresa un título para el cuadernillo.');
      return;
    }

    let finalTheme = isCustomTheme ? customThemeValue.trim() : editingProduct.theme;
    if (!finalTheme) {
      alert('Por favor especifica el Área / Tema del cuadernillo.');
      return;
    }

    // If custom theme was entered, persist it to themes list if not already present
    if (isCustomTheme && finalTheme && !themes.includes(finalTheme)) {
      const updatedThemes = [...themes, finalTheme];
      setThemes(updatedThemes);
      await saveThemesOnline(updatedThemes);
    }

    let finalCategory = isCustomCategory ? customCategoryValue.trim() : editingProduct.category;
    if (!finalCategory) {
      finalCategory = 'Psicología y Bienestar';
    }

    // If custom category was entered, persist it to categories list if not already present
    if (isCustomCategory && finalCategory && !categories.includes(finalCategory)) {
      const updatedCats = [...categories, finalCategory];
      setCategories(updatedCats);
      await saveCategoriesOnline(updatedCats);
    }

    const finalImages = editingProduct.images || [];
    const primaryImage = finalImages[0] || editingProduct.imageUrl || '';

    const formattedPrice = sanitizePrice(editingProduct.price) || '50.000 Gs.';
    const formattedPages = sanitizePages(editingProduct.pages) || '40 páginas';

    const finalCommercialStatus = editingProduct.status || 'disponible';
    const isCurrentlyHidden = Boolean(editingProduct.wasHidden);

    const updatedProduct = {
      ...editingProduct,
      title: editingProduct.title.trim(),
      theme: finalTheme,
      category: finalCategory,
      price: formattedPrice,
      pages: formattedPages,
      format: editingProduct.format?.trim() || 'PDF interactivo',
      status: isCurrentlyHidden ? 'oculto' : finalCommercialStatus,
      previousStatus: isCurrentlyHidden ? finalCommercialStatus : undefined,
      images: finalImages,
      imageUrl: primaryImage,
    };
    delete updatedProduct.wasHidden;

    setIsSavingProduct(true);
    try {
      const res = await saveProductOnline(updatedProduct);
      setEditingProduct(null);
      if (res && res.online) {
        showToast(isNew ? '¡Nuevo cuadernillo publicado en la nube!' : '¡Cambios sincronizados en línea!');
      } else {
        showToast(isNew ? '¡Nuevo cuadernillo publicado!' : '¡Cambios guardados con éxito!');
      }
    } catch (err) {
      console.error('Error guardando:', err);
      showToast('Error al guardar cuadernillo.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Soft delete (moves to status: 'eliminado')
  const handleSoftDelete = async (id, title) => {
    if (confirm(`¿Mover "${title}" a la papelera?`)) {
      await deleteProductOnline(id, false);
      showToast('Cuadernillo movido a la papelera');
    }
  };

  // Restore from trash
  const handleRestore = async (id) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      await saveProductOnline({ ...product, status: product.previousStatus || 'disponible' });
      showToast('Cuadernillo restaurado al catálogo activo');
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (id, title) => {
    if (confirm(`¿Eliminar definitivamente "${title}"? Esta acción no se puede deshacer.`)) {
      await deleteProductOnline(id, true);
      showToast('Cuadernillo eliminado permanentemente');
    }
  };

  // Build live preview object from form state
  const livePreviewProduct = useMemo(() => {
    if (!editingProduct) return null;
    const finalTheme = isCustomTheme && customThemeValue.trim() ? customThemeValue.trim() : editingProduct.theme;
    const finalCat = isCustomCategory && customCategoryValue.trim() ? customCategoryValue.trim() : editingProduct.category;

    const imgList = editingProduct.images && editingProduct.images.length > 0
      ? editingProduct.images
      : editingProduct.imageUrl
      ? [editingProduct.imageUrl]
      : [];

    return {
      ...editingProduct,
      title: editingProduct.title || 'Título del Cuadernillo',
      theme: finalTheme || 'Tema Principal',
      category: finalCat || 'Categoría',
      price: editingProduct.price ? sanitizePrice(editingProduct.price) || editingProduct.price : '50.000 Gs.',
      pages: editingProduct.pages ? sanitizePages(editingProduct.pages) || editingProduct.pages : '40 páginas',
      format: editingProduct.format || 'PDF interactivo',
      shortDescription: editingProduct.shortDescription || 'Resumen breve para la tarjeta de catálogo...',
      longDescription: editingProduct.longDescription || 'Explicación detallada del contenido del cuadernillo...',
      targetAudience: editingProduct.targetAudience || 'Público objetivo y recomendaciones...',
      images: imgList,
      imageUrl: imgList[0] || '',
    };
  }, [editingProduct, isCustomTheme, customThemeValue, isCustomCategory, customCategoryValue]);

  if (!authenticated) {
    return (
      <div className="page admin-login-page">
        <div className="admin-login-box">
          <div className="admin-login-header">
            <div className="admin-lock-badge">
              <Lock size={28} />
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
                  placeholder="Ingresa tu usuario"
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
          <div className="admin-header-badge-row">
            <span className="badge">Administración</span>
            <span
              className={`firebase-status-pill ${firebaseOnline ? 'online' : 'offline'}`}
              title={firebaseOnline ? 'Base de datos en la nube conectada y funcionando' : 'Modo local'}
            >
              {firebaseOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
              <span>{firebaseOnline ? 'En Línea' : 'Modo Local'}</span>
            </span>
          </div>
          <h1>Catálogo de Cuadernillos</h1>
          <p>Gestiona el estado, precios, imágenes e información sincronizados en tiempo real.</p>
        </div>

        <div className="admin-topbar-actions">
          {showTrash ? (
            <button className="button secondary" type="button" onClick={() => setShowTrash(false)}>
              <ArrowLeft size={18} />
              Volver al Catálogo
            </button>
          ) : (
            <>
              <button className="button primary" type="button" onClick={handleStartNew}>
                <Plus size={18} />
                Nuevo Cuadernillo
              </button>
              <button
                className="button ghost"
                type="button"
                onClick={() => setShowTrash(true)}
              >
                <Trash2 size={16} />
                Papelera ({deletedProducts.length})
              </button>
            </>
          )}
          <button className="button secondary logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {showTrash ? (
        <div className="admin-card-container">
          <div className="admin-section-header">
            <h3>Papelera de Cuadernillos ({deletedProducts.length})</h3>
            <p>Los libros aquí están dados de baja y no son visibles para los clientes.</p>
          </div>

          {deletedProducts.length === 0 ? (
            <div className="admin-empty-box">La papelera está vacía. No hay cuadernillos eliminados.</div>
          ) : (
            <div className="admin-products-table">
              {deletedProducts.map((product) => (
                <div className="admin-row-item deleted-row" key={product.id}>
                  <div className="admin-row-badge" style={{ '--accent': product.accent || '#0057d9' }}>
                    <Sparkles size={20} />
                  </div>

                  <div className="admin-row-info">
                    <div className="admin-row-title-line">
                      <strong>{product.title}</strong>
                      <span className="status-pill pill-trash">En Papelera</span>
                    </div>
                    <p>{product.shortDescription || 'Sin descripción corta.'}</p>
                    <small>
                      {product.theme} • {product.category} • <strong>{product.price}</strong> • {product.pages || '40 págs'}
                    </small>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      className="button secondary small-btn"
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
              const coverImg = (Array.isArray(product.images) && product.images[0]) || product.imageUrl;

              return (
                <div className={`admin-row-item ${isHidden ? 'hidden-row' : ''}`} key={product.id}>
                  <div className="admin-row-badge" style={{ '--accent': product.accent || '#0057d9' }}>
                    {coverImg ? (
                      <img src={coverImg} alt={product.title} className="admin-badge-thumb" />
                    ) : (
                      <Sparkles size={20} />
                    )}
                  </div>

                  <div className="admin-row-info">
                    <div className="admin-row-title-line">
                      <strong>{product.title}</strong>
                      {product.status === 'disponible' && (
                        <span className="status-pill pill-visible">Disponible</span>
                      )}
                      {product.status === 'próximamente' && (
                        <span className="status-pill pill-soon">Próximamente</span>
                      )}
                      {product.status === 'agotado' && (
                        <span className="status-pill pill-out">Sin Stock</span>
                      )}
                      {product.status === 'oculto' && (
                        <span className="status-pill pill-hidden">Oculto</span>
                      )}
                      {product.featured && <span className="status-pill pill-featured">Destacado</span>}
                    </div>
                    <p>{product.shortDescription || 'Sin descripción corta'}</p>
                    <small>
                      {product.theme} • {product.category} • <strong>{product.price}</strong> • {product.pages || '40 págs'}
                    </small>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      className="button secondary small-btn"
                      type="button"
                      onClick={() => handleToggleVisibility(product)}
                      title={isHidden ? 'Publicar en catálogo (Disponible)' : 'Ocultar del catálogo'}
                    >
                      {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                      {isHidden ? 'Mostrar' : 'Ocultar'}
                    </button>
                    <button
                      className="button secondary small-btn"
                      type="button"
                      onClick={() => handleStartEdit(product)}
                    >
                      <Edit2 size={15} />
                      Editar
                    </button>
                    <button
                      className="button danger-ghost small-btn"
                      type="button"
                      onClick={() => handleSoftDelete(product.id, product.title)}
                      title="Mover a papelera"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN / CREACIÓN A ANCHO COMPLETO CON BORDES REDONDEADOS Y VISTA PREVIA */}
      {editingProduct && (
        <div className="dialog-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="badge">{isNew ? 'Nuevo Registro' : 'Editor de Contenido'}</span>
                <h3>{isNew ? 'Crear Nuevo Cuadernillo' : `Editar: ${editingProduct.title}`}</h3>
              </div>
              <button
                className="dialog-close"
                type="button"
                onClick={() => setEditingProduct(null)}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-modal-layout-grid">
                {/* COLUMNA IZQUIERDA: FORMULARIO */}
                <form onSubmit={handleSaveProduct} className="admin-form-col">
                  <div className="form-row">
                    <label className="form-field">
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

                    <div className="form-field">
                      <div className="field-header-row">
                        <span>Área / Tema Principal *</span>
                        <button
                          type="button"
                          className="manage-options-btn"
                          onClick={() => setManagerModalType('themes')}
                        >
                          <Settings size={12} />
                          Gestionar Temas
                        </button>
                      </div>

                      {!isCustomTheme ? (
                        <select
                          value={editingProduct.theme}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomTheme(true);
                              setCustomThemeValue('');
                            } else {
                              setEditingProduct({ ...editingProduct, theme: e.target.value });
                            }
                          }}
                        >
                          {themes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                          <option value="__custom__">+ Crear nuevo tema...</option>
                        </select>
                      ) : (
                        <div className="custom-input-with-cancel">
                          <input
                            type="text"
                            placeholder="Escribe el nuevo tema..."
                            value={customThemeValue}
                            onChange={(e) => {
                              setCustomThemeValue(e.target.value);
                              setEditingProduct({ ...editingProduct, theme: e.target.value });
                            }}
                            autoFocus
                            required
                          />
                          <button
                            type="button"
                            className="cancel-custom-btn"
                            onClick={() => {
                              setIsCustomTheme(false);
                              setEditingProduct({ ...editingProduct, theme: themes[0] || 'Ansiedad' });
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <div className="field-header-row">
                        <span>Categoría</span>
                        <button
                          type="button"
                          className="manage-options-btn"
                          onClick={() => setManagerModalType('categories')}
                        >
                          <Settings size={12} />
                          Gestionar Categorías
                        </button>
                      </div>

                      {!isCustomCategory ? (
                        <select
                          value={editingProduct.category}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomCategory(true);
                              setCustomCategoryValue('');
                            } else {
                              setEditingProduct({ ...editingProduct, category: e.target.value });
                            }
                          }}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                          <option value="__custom__">+ Crear nueva categoría...</option>
                        </select>
                      ) : (
                        <div className="custom-input-with-cancel">
                          <input
                            type="text"
                            placeholder="Escribe la nueva categoría..."
                            value={customCategoryValue}
                            onChange={(e) => {
                              setCustomCategoryValue(e.target.value);
                              setEditingProduct({ ...editingProduct, category: e.target.value });
                            }}
                            autoFocus
                            required
                          />
                          <button
                            type="button"
                            className="cancel-custom-btn"
                            onClick={() => {
                              setIsCustomCategory(false);
                              setEditingProduct({
                                ...editingProduct,
                                category: categories[0] || 'Regulación Emocional',
                              });
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>

                    <label className="form-field">
                      <span>Precio en Guaraníes</span>
                      <input
                        type="text"
                        value={editingProduct.price}
                        onChange={(e) => {
                          setEditingProduct({ ...editingProduct, price: e.target.value });
                        }}
                        onBlur={(e) => {
                          const formatted = sanitizePrice(e.target.value);
                          setEditingProduct({ ...editingProduct, price: formatted });
                        }}
                        placeholder="Ej. 50.000 Gs."
                      />
                    </label>
                  </div>

                  <div className="form-row">
                    <label className="form-field">
                      <span>Extensión (Páginas)</span>
                      <input
                        type="text"
                        value={editingProduct.pages || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, pages: e.target.value })
                        }
                        onBlur={(e) => {
                          const formatted = sanitizePages(e.target.value);
                          setEditingProduct({ ...editingProduct, pages: formatted });
                        }}
                        placeholder="Ej. 46 páginas"
                      />
                    </label>

                    <label className="form-field">
                      <span>Formato</span>
                      <input
                        type="text"
                        value={editingProduct.format || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, format: e.target.value })
                        }
                        placeholder="Ej. PDF interactivo"
                      />
                    </label>

                    <label className="form-field">
                      <span>Estado en Catálogo</span>
                      <select
                        value={editingProduct.status || 'disponible'}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, status: e.target.value })
                        }
                      >
                        <option value="disponible">✅ Disponible (A la venta)</option>
                        <option value="próximamente">⏳ Próximamente (Próximo lanzamiento)</option>
                        <option value="agotado">⛔ Sin Stock / Agotado</option>
                      </select>
                      {editingProduct.wasHidden && (
                        <small style={{ color: '#b45309', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                          🔒 Actualmente oculto. Puedes volver a mostrarlo en la tienda usando el botón "Mostrar" de la lista.
                        </small>
                      )}
                    </label>
                  </div>

                  {/* COLOR DE PORTADA CON PALETA Y BOTÓN PERSONALIZADO ELEGANTE */}
                  <div className="color-picker-box">
                    <div className="color-picker-label">
                      <Palette size={16} />
                      <span>Color de Portada / Tarjeta</span>
                    </div>
                    <div className="color-swatches-row">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          className={`color-swatch-btn ${
                            editingProduct.accent === preset.value ? 'active-swatch' : ''
                          }`}
                          style={{ backgroundColor: preset.value }}
                          onClick={() => setEditingProduct({ ...editingProduct, accent: preset.value })}
                          title={preset.name}
                        >
                          {editingProduct.accent === preset.value && <Check size={14} color="#fff" />}
                        </button>
                      ))}

                      {/* Botón de color personalizado con degradado visual */}
                      <button
                        type="button"
                        className="custom-color-picker-btn"
                        onClick={() => colorInputRef.current?.click()}
                        title="Seleccionar color personalizado..."
                      >
                        <Pipette size={14} />
                        <span>Personalizado</span>
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={editingProduct.accent || '#0057d9'}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, accent: e.target.value })
                          }
                          className="hidden-color-input"
                        />
                      </button>
                    </div>
                  </div>

                  {/* DESTACADO CHECKBOX */}
                  <label className="admin-checkbox-card">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.featured)}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, featured: e.target.checked })
                      }
                    />
                    <div>
                      <strong>Marcar como Destacado</strong>
                      <small>Se priorizará en la parte superior del catálogo público</small>
                    </div>
                  </label>

                  {/* IMÁGENES MÚLTIPLES: SUBIR DESDE ESTE DISPOSITIVO, REORDENAR Y ELIMINAR */}
                  <div className="admin-images-section">
                    <div className="images-section-header">
                      <span className="images-section-title">
                        <ImageIcon size={16} /> Fotos del Cuadernillo (Portada y Vistas)
                      </span>
                      <span className="images-counter-badge">
                        {(editingProduct.images || []).length} foto(s)
                      </span>
                    </div>

                    {/* INPUT OCULTO QUE ABRE EL SELECTOR NATIVO DE ARCHIVOS / CÁMARA */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleProcessFiles(Array.from(e.target.files));
                        }
                      }}
                    />

                    {/* ZONA DE CARGA CON BOTÓN NATIVO Y ARRASTRE DE ARCHIVOS */}
                    <div
                      className={`admin-image-dropzone ${isDragging ? 'dragging' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleProcessFiles(Array.from(e.dataTransfer.files));
                        }
                      }}
                    >
                      <UploadCloud size={32} className="dropzone-icon" />
                      <div className="dropzone-text">
                        <strong>
                          {isUploadingImages
                            ? 'Procesando y optimizando fotos...'
                            : 'Toca aquí para seleccionar fotos desde este dispositivo'}
                        </strong>
                        <small>Funciona en computadora y celular (JPG, WebP, PNG). La primera foto será la portada.</small>
                      </div>
                      <button
                        type="button"
                        className="button primary small-btn dropzone-btn"
                        disabled={isUploadingImages}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload size={15} />
                        {isUploadingImages ? 'Cargando...' : 'Elegir Fotos'}
                      </button>
                    </div>

                    {editingProduct.images && editingProduct.images.length > 0 ? (
                      <div className="images-thumbs-grid advanced-gallery-manager">
                        {editingProduct.images.map((url, idx) => {
                          const isCover = idx === 0;
                          return (
                            <div className={`thumb-item ${isCover ? 'cover-item' : ''}`} key={url.substring(0, 32) + idx}>
                              <img src={url} alt={`Foto ${idx + 1}`} />
                              <span className="thumb-index-tag">
                                {isCover ? '★ Portada' : `#${idx + 1}`}
                              </span>

                              {/* Acciones directas y limpias: <, > y Eliminar */}
                              <div className="thumb-actions-overlay">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    className="thumb-action-btn"
                                    onClick={() => handleMoveImageLeft(idx)}
                                    title="Mover hacia la izquierda"
                                  >
                                    <ChevronLeft size={13} />
                                  </button>
                                )}
                                {idx < editingProduct.images.length - 1 && (
                                  <button
                                    type="button"
                                    className="thumb-action-btn"
                                    onClick={() => handleMoveImageRight(idx)}
                                    title="Mover hacia la derecha"
                                  >
                                    <ChevronRight size={13} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="thumb-action-btn delete-btn"
                                  onClick={() => handleRemoveImage(idx)}
                                  title="Eliminar foto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="no-images-help">
                        <ImageIcon size={14} /> Si no agregas imágenes, se generará automáticamente la portada vectorial con el color seleccionado.
                      </p>
                    )}

                    {/* OPCIONAL: PEGAR ENLACE DIRECTO O RUTA SI SE DESEA */}
                    <details className="manual-url-details">
                      <summary>¿Deseas agregar una imagen mediante enlace web o ruta local?</summary>
                      <div className="add-image-bar" style={{ marginTop: '0.6rem' }}>
                        <input
                          type="text"
                          placeholder="https://... o pega el enlace directo de la foto"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className="button secondary small-btn"
                          onClick={handleAddImage}
                        >
                          <Plus size={15} />
                          Agregar Enlace
                        </button>
                      </div>
                    </details>
                  </div>

                  <label className="form-field">
                    <span>Descripción Corta (Tarjeta del Catálogo)</span>
                    <textarea
                      rows={2}
                      value={editingProduct.shortDescription || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, shortDescription: e.target.value })
                      }
                      placeholder="Resumen conciso para la tarjeta del catálogo..."
                    />
                  </label>

                  <label className="form-field">
                    <span>Descripción Larga (Detalle del Modal)</span>
                    <textarea
                      rows={3}
                      value={editingProduct.longDescription || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, longDescription: e.target.value })
                      }
                      placeholder="Explicación detallada del contenido del cuadernillo..."
                    />
                  </label>

                  <label className="form-field">
                    <span>Público Objetivo</span>
                    <input
                      type="text"
                      value={editingProduct.targetAudience || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, targetAudience: e.target.value })
                      }
                      placeholder="Ej. Personas que desean mejorar su regulación emocional..."
                    />
                  </label>

                  <div className="admin-form-sticky-footer">
                    <button className="button primary" type="submit" disabled={isSavingProduct}>
                      <Save size={18} />
                      {isSavingProduct ? 'Guardando en la nube...' : 'Guardar Cuadernillo'}
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

                {/* COLUMNA DERECHA: VISTA PREVIA EN VIVO (GENERAL + ACCESO A MODAL DETALLADO) */}
                <div className="admin-preview-col">
                  <div className="preview-sticky-box">
                    <div className="preview-header">
                      <Sparkles size={16} />
                      <span>Vista Previa en Vivo (Catálogo)</span>
                    </div>

                    {/* TARJETA EXACTA DE CATÁLOGO CON FLECHAS LATERALES Y PUNTOS */}
                    <div className="product-card preview-card">
                      <div
                        className="product-art interactive-art"
                        style={{ '--accent': editingProduct.accent || '#0057d9' }}
                        onClick={() => setFullDetailPreview(livePreviewProduct)}
                        title="Clic para previsualizar modal completo"
                      >
                        {livePreviewProduct?.images && livePreviewProduct.images.length > 0 ? (
                          <img
                            src={
                              livePreviewProduct.images[previewImgIndex] ||
                              livePreviewProduct.images[0]
                            }
                            alt={livePreviewProduct?.title}
                            className="product-cover-img"
                          />
                        ) : (
                          <div className="product-book-visual">
                            <div className="book-spine" />
                            <div className="book-cover-content">
                              <span className="book-tag">EvoluMind</span>
                              <Sparkles size={24} className="book-icon" />
                              <h4 className="book-cover-title">
                                {livePreviewProduct?.theme}
                              </h4>
                              <small className="book-format-tag">PDF</small>
                            </div>
                          </div>
                        )}

                        {livePreviewProduct?.images && livePreviewProduct.images.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="card-side-arrow left"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImgIndex((prev) =>
                                  prev > 0 ? prev - 1 : livePreviewProduct.images.length - 1
                                );
                              }}
                              aria-label="Foto anterior"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              className="card-side-arrow right"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImgIndex((prev) =>
                                  prev < livePreviewProduct.images.length - 1 ? prev + 1 : 0
                                );
                              }}
                              aria-label="Foto siguiente"
                            >
                              <ChevronRight size={16} />
                            </button>

                            <div className="card-pagination-dots" onClick={(e) => e.stopPropagation()}>
                              {livePreviewProduct.images.map((_, i) => (
                                <span
                                  key={i}
                                  className={`card-dot ${previewImgIndex === i ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImgIndex(i);
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        <span
                          className={`product-status-pill ${
                            editingProduct.status === 'disponible'
                              ? 'available'
                              : editingProduct.status === 'agotado'
                              ? 'out'
                              : 'soon'
                          }`}
                        >
                          {editingProduct.status === 'disponible'
                            ? 'Disponible'
                            : editingProduct.status === 'agotado'
                            ? 'Sin Stock'
                            : editingProduct.status === 'oculto'
                            ? 'Oculto'
                            : 'Próximamente'}
                        </span>
                      </div>

                      <div className="product-body">
                        <div className="product-meta">
                          <span className="product-category">
                            {livePreviewProduct?.category}
                          </span>
                          <span className="product-pages">
                            {livePreviewProduct?.pages}
                          </span>
                        </div>

                        <h3 className="product-title" onClick={() => setFullDetailPreview(livePreviewProduct)} style={{ cursor: 'pointer' }}>
                          {livePreviewProduct?.title}
                        </h3>
                        <p className="product-desc">
                          {livePreviewProduct?.shortDescription}
                        </p>

                        <div className="product-footer">
                          <div className="product-price-box">
                            <span className="price-label">Precio</span>
                            <strong className="product-price">
                              {livePreviewProduct?.price}
                            </strong>
                          </div>
                          <span className="product-format-badge">100% Digital</span>
                        </div>
                      </div>

                      <div className="product-actions">
                        <button
                          className="icon-button view-btn"
                          type="button"
                          onClick={() => setFullDetailPreview(livePreviewProduct)}
                          title="Abrir vista previa del modal detallado"
                        >
                          <Eye size={16} />
                          Ver Detalle
                        </button>
                        <span
                          className="icon-button whatsapp-btn preview-cta-pill"
                          title="Simulador: En la tienda real este botón abre WhatsApp"
                          style={{ cursor: 'default' }}
                        >
                          Solicitar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLADO PREVIEW REAL (PANTALLA COMPLETA EN MODO SIMULADOR) */}
      {fullDetailPreview && (
        <ProductDetailDialog
          product={fullDetailPreview}
          onClose={() => setFullDetailPreview(null)}
          isPreview={true}
        />
      )}

      {/* MODAL PARA GESTIONAR Y ELIMINAR TEMAS O CATEGORÍAS CON CONFIRMACIÓN */}
      {managerModalType && (
        <div className="dialog-backdrop" onClick={() => setManagerModalType(null)}>
          <div className="options-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="badge">Configuración de Listas</span>
                <h3>
                  Gestionar {managerModalType === 'themes' ? 'Áreas / Temas' : 'Categorías'}
                </h3>
              </div>
              <button
                className="dialog-close"
                type="button"
                onClick={() => setManagerModalType(null)}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <div className="options-manager-body">
              <p className="options-manager-hint">
                Haz clic en la <strong>X</strong> de cualquier opción que desees borrar de la lista desplegable.
              </p>

              <div className="options-tags-wrap">
                {(managerModalType === 'themes' ? themes : categories).map((item) => (
                  <div className="option-tag-pill" key={item}>
                    <span>{item}</span>
                    <button
                      type="button"
                      className="option-tag-delete-btn"
                      onClick={() =>
                        setItemToDeleteConfirm({ type: managerModalType, name: item })
                      }
                      title={`Eliminar "${item}"`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="options-manager-footer">
              <button
                type="button"
                className="button primary small-btn"
                onClick={() => setManagerModalType(null)}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE BORRADO DE TEMA / CATEGORÍA */}
      {itemToDeleteConfirm && (
        <div className="dialog-backdrop sub-modal-backdrop" onClick={() => setItemToDeleteConfirm(null)}>
          <div className="confirm-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-box">
              <AlertTriangle size={28} />
            </div>
            <h4>¿Eliminar opción?</h4>
            <p>
              ¿Estás seguro de que deseas eliminar <strong>"{itemToDeleteConfirm.name}"</strong> de la lista de{' '}
              {itemToDeleteConfirm.type === 'themes' ? 'temas' : 'categorías'}?
            </p>
            <div className="confirm-buttons-row">
              <button
                type="button"
                className="button ghost small-btn"
                onClick={() => setItemToDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button danger-ghost small-btn"
                onClick={handleConfirmDeleteItem}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
