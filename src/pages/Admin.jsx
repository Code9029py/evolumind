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
  Sliders,
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
import ImageLightbox from '../components/common/ImageLightbox.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
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

const LIGHTBOX_BG_PRESETS = [
  { name: 'Negro Puro', value: '#000000' },
  { name: 'Gris Grafito', value: '#1e293b' },
  { name: 'Azul Medianoche', value: '#07134f' },
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
  coverScale: 90,
  coverOffsetY: 0,
  coverOffsetX: 0,
  lightboxBg: 'default',
  lightboxScale: 100,
  lightboxOffsetY: 0,
  lightboxOffsetX: 0,
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
          const maxDim = 1400;
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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.type === 'image/png';
          const format = isPng ? 'image/png' : 'image/webp';
          const quality = isPng ? 0.90 : 0.88;
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
  const [isAdminLightboxOpen, setIsAdminLightboxOpen] = useState(false);

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
  const lightboxColorInputRef = useRef(null);

  const [firebaseOnline, setFirebaseOnline] = useState(isFirebaseConfigured());
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('evolumind_admin_auth');
    if (sessionAuth === 'true') {
      setAuthenticated(true);
    }

    const unsubCatalog = subscribeCatalog(
      (items) => {
        setProducts(items);
        setIsLoadingCatalog(false);
      },
      () => {
        setIsLoadingCatalog(false);
      }
    );
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
      coverScale: product.coverScale !== undefined ? product.coverScale : 90,
      coverOffsetY: product.coverOffsetY !== undefined ? product.coverOffsetY : 0,
      coverOffsetX: product.coverOffsetX !== undefined ? product.coverOffsetX : 0,
      lightboxBg: product.lightboxBg || 'default',
      lightboxScale: product.lightboxScale !== undefined ? product.lightboxScale : 100,
      lightboxOffsetY: product.lightboxOffsetY !== undefined ? product.lightboxOffsetY : 0,
      lightboxOffsetX: product.lightboxOffsetX !== undefined ? product.lightboxOffsetX : 0,
    });
  };

  const handleToggleVisibility = async (product) => {
    const isCurrentlyHidden = product.status === 'oculto';
    const nextStatus = isCurrentlyHidden ? (product.previousStatus || 'disponible') : 'oculto';
    const updated = {
      ...product,
      status: nextStatus,
    };
    if (!isCurrentlyHidden) {
      updated.previousStatus = product.status || 'disponible';
    } else if (product.previousStatus) {
      updated.previousStatus = product.previousStatus;
    } else {
      delete updated.previousStatus;
    }

    const res = await saveProductOnline(updated);
    if (res && !res.success && res.error) {
      showToast('Error al actualizar visibilidad en Firebase');
    } else {
      showToast(isCurrentlyHidden ? 'Cuadernillo visible en catálogo' : 'Cuadernillo ocultado del catálogo');
    }
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
      images: finalImages,
      imageUrl: primaryImage,
    };

    if (isCurrentlyHidden) {
      updatedProduct.previousStatus = finalCommercialStatus;
    } else if (editingProduct.previousStatus) {
      updatedProduct.previousStatus = editingProduct.previousStatus;
    } else {
      delete updatedProduct.previousStatus;
    }
    delete updatedProduct.wasHidden;

    setIsSavingProduct(true);
    try {
      const res = await saveProductOnline(updatedProduct);
      setEditingProduct(null);
      if (res && res.online) {
        showToast(isNew ? '¡Nuevo cuadernillo publicado en la nube!' : '¡Cambios sincronizados en línea!');
      } else if (res && !res.success && res.error) {
        console.error('Error guardando en Firebase:', res.error);
        showToast('Error al sincronizar con Firebase: ' + (res.error.message || 'Error'));
        alert('Atención: Los cambios se guardaron localmente pero falló la sincronización con Firebase:\n' + (res.error.message || 'Verifica la consola'));
      } else {
        showToast(isNew ? '¡Nuevo cuadernillo guardado!' : '¡Cambios guardados con éxito!');
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

      {isLoadingCatalog ? (
        <div className="admin-card-container">
          <LoadingSpinner
            size="lg"
            message="Cargando catálogo en tiempo real..."
            submessage="Conectando con la base de datos de Firebase"
            minHeight="280px"
            withIcon
          />
        </div>
      ) : showTrash ? (
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

          {activeProducts.length === 0 ? (
            <div className="admin-empty-box">No hay cuadernillos activos. Haz clic en "Nuevo Cuadernillo" para publicar uno.</div>
          ) : (
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
          )}
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

                  <div className="form-row form-row-3">
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

                  {/* CONFIGURACIÓN DE TAMAÑO Y ENCUADRE EN TARJETA DE CATÁLOGO */}
                  <div className="color-picker-box" style={{ marginTop: '0.75rem' }}>
                    <div className="color-picker-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Sliders size={15} />
                        <span>Encuadre y Tamaño en Tarjeta de Catálogo</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontWeight: 600 }}>
                          Zoom: {editingProduct.coverScale || 90}%
                        </span>
                        <button
                          type="button"
                          className="button ghost"
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: 'var(--color-muted)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              coverScale: 90,
                              coverOffsetY: 0,
                              coverOffsetX: 0,
                            })
                          }
                          title="Restablecer tamaño y posición de la tarjeta"
                        >
                          <RotateCcw size={11} />
                          <span>Restablecer Tarjeta</span>
                        </button>
                      </div>
                    </div>

                    {/* Tamaño / Zoom en Tarjeta (Escala real sin límites de contenedor) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <small style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Tamaño / Zoom en Tarjeta:
                        </small>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {[
                            { label: '70% (Chico)', val: 70 },
                            { label: '90% (Estándar)', val: 90 },
                            { label: '120% (Grande)', val: 120 },
                            { label: '150% (Llenar Marco)', val: 150 },
                          ].map((preset) => (
                            <button
                              key={preset.val}
                              type="button"
                              style={{
                                padding: '0.15rem 0.45rem',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                border:
                                  (Number(editingProduct.coverScale) || 90) === preset.val
                                    ? '1px solid var(--color-primary)'
                                    : '1px solid var(--color-border)',
                                background:
                                  (Number(editingProduct.coverScale) || 90) === preset.val
                                    ? 'var(--color-primary)'
                                    : '#fff',
                                color:
                                  (Number(editingProduct.coverScale) || 90) === preset.val
                                    ? '#fff'
                                    : 'inherit',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              onClick={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  coverScale: preset.val,
                                })
                              }
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          step="5"
                          value={Number(editingProduct.coverScale) || 90}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              coverScale: Number(e.target.value),
                            })
                          }
                          style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
                          {Number(editingProduct.coverScale) || 90}%
                        </span>
                      </div>
                    </div>

                    {/* Desplazamiento Vertical y Horizontal en Tarjeta */}
                    <div
                      style={{
                        marginTop: '0.45rem',
                        paddingTop: '0.45rem',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <small style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Posición en Tarjeta (Vertical y Horizontal):
                        </small>
                        {((Number(editingProduct.coverOffsetX) || 0) !== 0 || (Number(editingProduct.coverOffsetY) || 0) !== 0) && (
                          <button
                            type="button"
                            className="button ghost"
                            style={{
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.7rem',
                              borderRadius: '4px',
                              border: '1px solid var(--color-primary)',
                              background: 'rgba(0, 87, 217, 0.08)',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                coverOffsetX: 0,
                                coverOffsetY: 0,
                              })
                            }
                            title="Centrar posición horizontal y vertical (0, 0)"
                          >
                            Centrar Imagen (0, 0)
                          </button>
                        )}
                      </div>

                      {/* Eje Vertical Y */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                            Vertical Y (Mover Arriba / Abajo):
                          </span>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {[
                              { label: 'Arriba (-20px)', val: -20 },
                              { label: 'Centro (0px)', val: 0 },
                              { label: 'Abajo (+20px)', val: 20 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                style={{
                                  padding: '0.1rem 0.4rem',
                                  fontSize: '0.68rem',
                                  borderRadius: '4px',
                                  border:
                                    (Number(editingProduct.coverOffsetY) || 0) === preset.val
                                      ? '1px solid var(--color-primary)'
                                      : '1px solid var(--color-border)',
                                  background:
                                    (Number(editingProduct.coverOffsetY) || 0) === preset.val
                                      ? 'var(--color-primary)'
                                      : '#fff',
                                  color:
                                    (Number(editingProduct.coverOffsetY) || 0) === preset.val
                                      ? '#fff'
                                      : 'inherit',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    coverOffsetY: preset.val,
                                  })
                                }
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="range"
                            min="-80"
                            max="80"
                            step="2"
                            value={Number(editingProduct.coverOffsetY) || 0}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                coverOffsetY: Number(e.target.value),
                              })
                            }
                            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
                            {(Number(editingProduct.coverOffsetY) || 0) > 0 ? '+' : ''}
                            {Number(editingProduct.coverOffsetY) || 0}px
                          </span>
                        </div>
                      </div>

                      {/* Eje Horizontal X */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                            Horizontal X (Izquierda / Derecha):
                          </span>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {[
                              { label: 'Izq (-20px)', val: -20 },
                              { label: 'Centro (0px)', val: 0 },
                              { label: 'Der (+20px)', val: 20 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                style={{
                                  padding: '0.1rem 0.4rem',
                                  fontSize: '0.68rem',
                                  borderRadius: '4px',
                                  border:
                                    (Number(editingProduct.coverOffsetX) || 0) === preset.val
                                      ? '1px solid var(--color-primary)'
                                      : '1px solid var(--color-border)',
                                  background:
                                    (Number(editingProduct.coverOffsetX) || 0) === preset.val
                                      ? 'var(--color-primary)'
                                      : '#fff',
                                  color:
                                    (Number(editingProduct.coverOffsetX) || 0) === preset.val
                                      ? '#fff'
                                      : 'inherit',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    coverOffsetX: preset.val,
                                  })
                                }
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="range"
                            min="-60"
                            max="60"
                            step="2"
                            value={Number(editingProduct.coverOffsetX) || 0}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                coverOffsetX: Number(e.target.value),
                              })
                            }
                            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
                            {(Number(editingProduct.coverOffsetX) || 0) > 0 ? '+' : ''}
                            {Number(editingProduct.coverOffsetX) || 0}px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONFIGURACIÓN DE MODO AMPLIADO (PANTALLA COMPLETA) */}
                  <div className="color-picker-box" style={{ marginTop: '0.75rem' }}>
                    <div className="color-picker-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Maximize2 size={15} />
                        <span>Configuración de Modo Ampliado (Pantalla Completa)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontWeight: 600 }}>
                          Inicial: {editingProduct.lightboxScale || 100}%
                        </span>
                        <button
                          type="button"
                          className="button ghost"
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: 'var(--color-muted)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              lightboxScale: 100,
                              lightboxOffsetY: 0,
                              lightboxOffsetX: 0,
                              lightboxBg: 'default',
                            })
                          }
                          title="Restablecer valores iniciales del modo ampliado"
                        >
                          <RotateCcw size={11} />
                          <span>Restablecer Visor</span>
                        </button>
                      </div>
                    </div>

                    {/* Color de Fondo del Visor */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <small style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Color de fondo al ampliar:
                        </small>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                          {(!editingProduct.lightboxBg || editingProduct.lightboxBg === 'default')
                            ? 'Predeterminado (Oscuro)'
                            : editingProduct.lightboxBg === 'accent'
                            ? 'Mismo de la Portada'
                            : editingProduct.lightboxBg}
                        </span>
                      </div>

                      <div className="color-swatches-row">
                        {/* Opción Predeterminada */}
                        <button
                          type="button"
                          className={`color-swatch-btn ${
                            !editingProduct.lightboxBg || editingProduct.lightboxBg === 'default'
                              ? 'active-swatch'
                              : ''
                          }`}
                          style={{
                            background: 'linear-gradient(135deg, #060a18 0%, #162038 100%)',
                            border: '2px solid rgba(255, 255, 255, 0.5)',
                          }}
                          onClick={() =>
                            setEditingProduct({ ...editingProduct, lightboxBg: 'default' })
                          }
                          title="Predeterminado (Oscuro Obsidiana)"
                        >
                          {(!editingProduct.lightboxBg || editingProduct.lightboxBg === 'default') && (
                            <Check size={14} color="#fff" />
                          )}
                        </button>

                        {/* Presets específicos */}
                        {LIGHTBOX_BG_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            className={`color-swatch-btn ${
                              editingProduct.lightboxBg === preset.value ? 'active-swatch' : ''
                            }`}
                            style={{
                              backgroundColor: preset.value,
                              border: preset.value === '#000000' ? '2px solid #475569' : '2.5px solid white',
                            }}
                            onClick={() =>
                              setEditingProduct({ ...editingProduct, lightboxBg: preset.value })
                            }
                            title={preset.name}
                          >
                            {editingProduct.lightboxBg === preset.value && (
                              <Check size={14} color="#fff" />
                            )}
                          </button>
                        ))}

                        {/* Opción Mismo de la Portada */}
                        <button
                          type="button"
                          className={`color-swatch-btn ${
                            editingProduct.lightboxBg === 'accent' ? 'active-swatch' : ''
                          }`}
                          style={{
                            backgroundColor: editingProduct.accent || '#0057d9',
                          }}
                          onClick={() =>
                            setEditingProduct({ ...editingProduct, lightboxBg: 'accent' })
                          }
                          title="Mismo color que la portada"
                        >
                          {editingProduct.lightboxBg === 'accent' && <Check size={14} color="#fff" />}
                        </button>

                        {/* Botón Personalizado con cuentagotas */}
                        <button
                          type="button"
                          className="custom-color-picker-btn"
                          onClick={() => lightboxColorInputRef.current?.click()}
                          title="Seleccionar color de fondo personalizado..."
                        >
                          <Pipette size={14} />
                          <span>Personalizado</span>
                          <input
                            ref={lightboxColorInputRef}
                            type="color"
                            value={
                              editingProduct.lightboxBg &&
                              editingProduct.lightboxBg.startsWith('#')
                                ? editingProduct.lightboxBg
                                : '#060a18'
                            }
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                lightboxBg: e.target.value,
                              })
                            }
                            className="hidden-color-input"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Zoom Inicial al Ampliar */}
                    <div
                      style={{
                        marginTop: '0.45rem',
                        paddingTop: '0.45rem',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <small style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Zoom Inicial al Abrir en Pantalla Completa:
                        </small>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {[
                            { label: '100% (Normal)', val: 100 },
                            { label: '130% (Medio)', val: 130 },
                            { label: '160% (Grande)', val: 160 },
                            { label: '200% (Detalle)', val: 200 },
                          ].map((preset) => (
                            <button
                              key={preset.val}
                              type="button"
                              style={{
                                padding: '0.15rem 0.45rem',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                border:
                                  (Number(editingProduct.lightboxScale) || 100) === preset.val
                                    ? '1px solid var(--color-primary)'
                                    : '1px solid var(--color-border)',
                                background:
                                  (Number(editingProduct.lightboxScale) || 100) === preset.val
                                    ? 'var(--color-primary)'
                                    : '#fff',
                                color:
                                  (Number(editingProduct.lightboxScale) || 100) === preset.val
                                    ? '#fff'
                                    : 'inherit',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              onClick={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  lightboxScale: preset.val,
                                })
                              }
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="range"
                          min="80"
                          max="250"
                          step="5"
                          value={Number(editingProduct.lightboxScale) || 100}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              lightboxScale: Number(e.target.value),
                            })
                          }
                          style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
                          {Number(editingProduct.lightboxScale) || 100}%
                        </span>
                      </div>
                    </div>

                    {/* Posición Inicial en Modo Ampliado */}
                    <div
                      style={{
                        marginTop: '0.45rem',
                        paddingTop: '0.45rem',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <small style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Posición Inicial al Abrir (Vertical y Horizontal):
                        </small>
                        {((Number(editingProduct.lightboxOffsetX) || 0) !== 0 || (Number(editingProduct.lightboxOffsetY) || 0) !== 0) && (
                          <button
                            type="button"
                            className="button ghost"
                            style={{
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.7rem',
                              borderRadius: '4px',
                              border: '1px solid var(--color-primary)',
                              background: 'rgba(0, 87, 217, 0.08)',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                            onClick={() =>
                              setEditingProduct({
                                ...editingProduct,
                                lightboxOffsetX: 0,
                                lightboxOffsetY: 0,
                              })
                            }
                            title="Centrar posición inicial del visor (0, 0)"
                          >
                            Centrar Visor (0, 0)
                          </button>
                        )}
                      </div>

                      {/* Eje Vertical Lightbox */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                            Vertical Y Inicial (Mover Arriba / Abajo):
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="range"
                            min="-150"
                            max="150"
                            step="5"
                            value={Number(editingProduct.lightboxOffsetY) || 0}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                lightboxOffsetY: Number(e.target.value),
                              })
                            }
                            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
                            {(Number(editingProduct.lightboxOffsetY) || 0) > 0 ? '+' : ''}
                            {Number(editingProduct.lightboxOffsetY) || 0}px
                          </span>
                        </div>
                      </div>

                      {/* Eje Horizontal Lightbox */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                            Horizontal X Inicial (Izquierda / Derecha):
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="range"
                            min="-150"
                            max="150"
                            step="5"
                            value={Number(editingProduct.lightboxOffsetX) || 0}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                lightboxOffsetX: Number(e.target.value),
                              })
                            }
                            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '42px', textAlign: 'right' }}>
                            {(Number(editingProduct.lightboxOffsetX) || 0) > 0 ? '+' : ''}
                            {Number(editingProduct.lightboxOffsetX) || 0}px
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón para Probar Modo Ampliado en vivo */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="button secondary small-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.75rem',
                        }}
                        onClick={() => setIsAdminLightboxOpen(true)}
                        disabled={!livePreviewProduct?.images || livePreviewProduct.images.length === 0}
                        title="Abrir el visor a pantalla completa con estos ajustes para probarlo"
                      >
                        <Eye size={13} />
                        <span>Probar cómo se ve ampliado</span>
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
                        {isUploadingImages ? (
                          <LoadingSpinner inline size="sm" message="Procesando..." />
                        ) : (
                          <>
                            <Upload size={15} />
                            Elegir Fotos
                          </>
                        )}
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
                      {isSavingProduct ? (
                        <LoadingSpinner inline size="sm" message="Guardando en la nube..." />
                      ) : (
                        <>
                          <Save size={18} />
                          Guardar Cuadernillo
                        </>
                      )}
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      disabled={isSavingProduct}
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
                          <>
                            <img
                              src={
                                livePreviewProduct.images[previewImgIndex] ||
                                livePreviewProduct.images[0]
                              }
                              alt=""
                              className="product-art-backdrop"
                              aria-hidden="true"
                            />
                            <img
                              src={
                                livePreviewProduct.images[previewImgIndex] ||
                                livePreviewProduct.images[0]
                              }
                              alt={livePreviewProduct?.title}
                              className="product-cover-img"
                              style={{
                                '--cover-zoom': `${(Number(editingProduct.coverScale) || 90) / 100}`,
                                '--cover-tx': `${editingProduct.coverOffsetX || 0}px`,
                                '--cover-ty': `${editingProduct.coverOffsetY || 0}px`,
                              }}
                            />
                          </>
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
                          <span className="product-format-badge">{livePreviewProduct?.format || '100% Digital'}</span>
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

      {/* MODAL LIGHTBOX PREVIEW EN MODO ADMIN */}
      {isAdminLightboxOpen && livePreviewProduct?.images && livePreviewProduct.images.length > 0 && (
        <ImageLightbox
          isOpen={isAdminLightboxOpen}
          images={livePreviewProduct.images}
          currentIndex={previewImgIndex}
          onIndexChange={setPreviewImgIndex}
          onClose={() => setIsAdminLightboxOpen(false)}
          title={livePreviewProduct.title}
          backdropColor={
            editingProduct.lightboxBg === 'accent'
              ? editingProduct.accent
              : editingProduct.lightboxBg
          }
          initialScale={(Number(editingProduct.lightboxScale) || 100) / 100}
          initialOffsetX={Number(editingProduct.lightboxOffsetX) || 0}
          initialOffsetY={Number(editingProduct.lightboxOffsetY) || 0}
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
