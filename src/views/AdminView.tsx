import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faPlus,
  faTrashCan,
  faPenToSquare,
  faArrowLeft,
  faCheck,
  faXmark,
  faImage,
  faBoxOpen,
  faReceipt,
  faArrowRotateLeft,
  faStar,
  faShieldHalved,
  faPaperPlane,
  faFileInvoice,
  faEye,
  faEyeSlash,
  faTicket,
  faTag,
  faSliders,
  faQrcode,
  faTruckFast,
  faBullhorn,
  faKey,
  faFloppyDisk
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { Product, Category, Order, Coupon, SiteSettings } from '../types';
import { Logo } from '../components/Logo';
import { InvoiceModal } from '../components/InvoiceModal';
import { compressImageFile } from '../utils/imageCompressor';
import { getSiteSettings, saveSiteSettings, DEFAULT_SITE_SETTINGS } from '../services/siteSettings';

interface AdminViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
  onExitAdmin: () => void;
  onViewInvoice?: (order: Order) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  onExitAdmin,
  onViewInvoice,
}) => {
  // Authentication & Brute-Force Defense State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('orchid_flame_admin_auth') === 'true';
  });
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Tab State: Includes the full real-time control center 'settings'
  const [activeTab, setActiveTab] = useState<'products' | 'add' | 'orders' | 'coupons' | 'settings'>('products');

  // Real-Time Site & Payment Settings State
  const [siteSettings, setLocalSiteSettings] = useState<SiteSettings>(() => getSiteSettings());
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Admin Password Change State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  // Search in Products
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  // Coupons State (Loaded from localStorage)
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('orchid_flame_coupons');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading coupons in admin', e);
    }
    return [
      { id: 'cpn-1', code: 'ORCHID10', discountType: 'percentage', discountValue: 10, isActive: true, description: '10% off entire artisanal order' },
      { id: 'cpn-2', code: 'FLAME100', discountType: 'fixed', discountValue: 100, minOrderAmount: 999, isActive: true, description: '₹100 flat discount on orders above ₹999' },
      { id: 'cpn-3', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, isActive: true, description: '10% welcome discount for patrons' },
    ];
  });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number | ''>('');
  const [newCouponMin, setNewCouponMin] = useState<number | ''>('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // Editing Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // In-Screen Confirmation Modal Cards State (No window.confirm)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmResetDefaults, setConfirmResetDefaults] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [orderToDeliverConfirm, setOrderToDeliverConfirm] = useState<Order | null>(null);
  const [viewingOrderDetails, setViewingOrderDetails] = useState<Order | null>(null);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Candles');
  const [newCollection, setNewCollection] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newOriginalPrice, setNewOriginalPrice] = useState<number | ''>('');
  const [newWeight, setNewWeight] = useState('250g / 8.8 oz');
  const [newBurnTime, setNewBurnTime] = useState('45+ Hours');
  const [newWicks, setNewWicks] = useState('Classic Single Wick');
  const [newDescription, setNewDescription] = useState('');
  const [newLongDescription, setNewLongDescription] = useState('');
  const [newTopNotes, setNewTopNotes] = useState('');
  const [newHeartNotes, setNewHeartNotes] = useState('');
  const [newBaseNotes, setNewBaseNotes] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newIsBestSeller, setNewIsBestSeller] = useState(false);
  const [newInStock, setNewInStock] = useState(true);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeAdminInvoice, setActiveAdminInvoice] = useState<Order | null>(null);

  // Load orders from localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem('orchid_flame_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (err) {
      console.error('Error reading orders in admin', err);
    }
  }, [activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (lockedUntil && now < lockedUntil) {
      const waitSeconds = Math.ceil((lockedUntil - now) / 1000);
      setLoginError(`Security lockout in effect to protect the atelier. Please wait ${waitSeconds}s.`);
      return;
    }

    const savedPass = localStorage.getItem('orchid_flame_admin_password') || 'Oc@1002';
    if (loginId.trim() === 'ocfl' && loginPass.trim() === savedPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem('orchid_flame_admin_auth', 'true');
      setLoginError('');
      setFailedAttempts(0);
      setLockedUntil(null);
    } else {
      const nextCount = failedAttempts + 1;
      setFailedAttempts(nextCount);
      if (nextCount >= 5) {
        setLockedUntil(now + 60000);
        setLoginError('Security alert: 5 consecutive failed attempts. Admin portal locked for 60 seconds.');
      } else {
        setLoginError(`Invalid Administrator credentials. (${5 - nextCount} attempt(s) remaining before security lockout).`);
      }
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveSiteSettings(siteSettings);
    setLocalSiteSettings(saved);
    setSettingsSuccessMsg('Store & payment configurations updated and broadcasted live across the site!');
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncementText.trim()) return;
    const updatedAnnouncements = [...siteSettings.announcements, newAnnouncementText.trim()];
    const updated = { ...siteSettings, announcements: updatedAnnouncements };
    setLocalSiteSettings(updated);
    saveSiteSettings(updated);
    setNewAnnouncementText('');
    setSettingsSuccessMsg('Announcement ticker added and live!');
    setTimeout(() => setSettingsSuccessMsg(''), 3000);
  };

  const handleRemoveAnnouncement = (indexToRemove: number) => {
    const updatedAnnouncements = siteSettings.announcements.filter((_, idx) => idx !== indexToRemove);
    const updated = { ...siteSettings, announcements: updatedAnnouncements };
    setLocalSiteSettings(updated);
    saveSiteSettings(updated);
  };

  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError('');
    setPassChangeSuccess('');

    const savedPass = localStorage.getItem('orchid_flame_admin_password') || 'Oc@1002';
    if (currentPassInput.trim() !== savedPass) {
      setPassChangeError('Current administrator password is incorrect.');
      return;
    }

    if (newPassInput.trim().length < 6) {
      setPassChangeError('New password must be at least 6 characters for security.');
      return;
    }

    if (newPassInput.trim() !== confirmNewPassInput.trim()) {
      setPassChangeError('New password and confirmation do not match.');
      return;
    }

    localStorage.setItem('orchid_flame_admin_password', newPassInput.trim());
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmNewPassInput('');
    setPassChangeSuccess('Admin security password changed successfully!');
    setTimeout(() => setPassChangeSuccess(''), 4000);
  };

  const handleConfirmLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('orchid_flame_admin_auth');
    setConfirmSignOut(false);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      const idToDelete = productToDelete.id;
      setProductToDelete(null);
      onDeleteProduct(idToDelete);
    }
  };

  const handleConfirmReset = () => {
    onResetProducts();
    setConfirmResetDefaults(false);
  };

  const handleConfirmCancelOrder = () => {
    if (orderToCancel) {
      const updated = orders.map((o) =>
        o.id === orderToCancel.id
          ? {
            ...o,
            status: 'cancelled' as const,
            cancelledAt: new Date().toISOString(),
            cancelReason: 'Cancelled by store administrator',
          }
          : o
      );
      setOrders(updated);
      localStorage.setItem('orchid_flame_orders', JSON.stringify(updated));
      setOrderToCancel(null);
    }
  };

  const [isImageCompressing, setIsImageCompressing] = useState(false);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImageCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        setNewImage(compressed);
      } catch (err) {
        console.error('Image compression error', err);
      } finally {
        setIsImageCompressing(false);
      }
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      setIsImageCompressing(true);
      try {
        const compressed = await compressImageFile(file);
        setEditingProduct({
          ...editingProduct,
          image: compressed,
        });
      } catch (err) {
        console.error('Image compression error', err);
      } finally {
        setIsImageCompressing(false);
      }
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublishing) return;

    if (!newName.trim() || !newPrice || !newDescription.trim()) {
      setFormError('Please enter product title, price, and description.');
      return;
    }

    setIsPublishing(true);
    setFormError('');

    const fallbackImage = newImage || '/bgof.png';
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newId = `${slug}-${Date.now().toString().slice(-4)}`;

    const productObj: Product = {
      id: newId,
      name: newName.trim(),
      category: newCategory,
      collectionName: newCollection.trim() || undefined,
      price: Number(newPrice),
      originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
      description: newDescription.trim(),
      longDescription: newLongDescription.trim() || newDescription.trim(),
      image: fallbackImage,
      additionalImages: [fallbackImage],
      weight: newWeight.trim(),
      burnTime: newBurnTime.trim(),
      noOfWicks: newWicks.trim(),
      fragranceNotes: {
        top: newTopNotes.trim() || undefined,
        heart: newHeartNotes.trim() || undefined,
        base: newBaseNotes.trim() || undefined,
      },
      ingredients: ['100% Natural Soy Wax', 'Botanical Fragrance Oils', 'Unbleached Organic Wick'],
      rating: 5.0,
      reviewsCount: 1,
      isBestSeller: newIsBestSeller,
      isNewArrival: true,
      inStock: newInStock,
      isVisible: true,
      countryOfOrigin: 'India',
    };

    onAddProduct(productObj);
    setPublishedProduct(productObj);
    setIsPublishing(false);

    // Reset form fields
    setNewName('');
    setNewCollection('');
    setNewPrice('');
    setNewOriginalPrice('');
    setNewDescription('');
    setNewLongDescription('');
    setNewTopNotes('');
    setNewHeartNotes('');
    setNewBaseNotes('');
    setNewImage('');
    setNewIsBestSeller(false);
    setNewInStock(true);
    setFormSuccess('');
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleToggleStock = (product: Product) => {
    const updated = {
      ...product,
      inStock: product.inStock === false ? true : false,
    };
    onUpdateProduct(updated);
  };

  const handleToggleBestseller = (product: Product) => {
    const updated = {
      ...product,
      isBestSeller: !product.isBestSeller,
    };
    onUpdateProduct(updated);
  };

  const ORDER_STATUS_HIERARCHY: Array<{ key: Order['status']; label: string }> = [
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const STATUS_RANK: Record<string, number> = {
    confirmed: 1,
    processing: 2,
    dispatched: 3,
    delivered: 4,
    cancelled: 99,
  };

  const handleConfirmDeliverOrder = () => {
    if (orderToDeliverConfirm) {
      const updated = orders.map((o) =>
        o.id === orderToDeliverConfirm.id
          ? {
              ...o,
              status: 'delivered' as const,
              deliveredAt: new Date().toISOString(),
            }
          : o
      );
      setOrders(updated);
      localStorage.setItem('orchid_flame_orders', JSON.stringify(updated));
      setOrderToDeliverConfirm(null);
    }
  };

  const handleStatusSelectChange = (order: Order, newStatus: Order['status']) => {
    // If order is already delivered, nothing can be changed
    if (order.status === 'delivered') return;

    // Prompt confirmation before marking as delivered
    if (newStatus === 'delivered') {
      setOrderToDeliverConfirm(order);
      return;
    }

    if (newStatus === 'cancelled') {
      setOrderToCancel(order);
      return;
    }

    // Strictly enforce forward-only status updates (cannot go backward)
    const currentRank = STATUS_RANK[order.status] || 1;
    const targetRank = STATUS_RANK[newStatus] || 1;
    if (targetRank < currentRank) return;

    handleUpdateOrderStatus(order.id, newStatus);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status === 'delivered') return;

    const currentRank = STATUS_RANK[targetOrder.status] || 1;
    const targetRank = STATUS_RANK[newStatus] || 1;
    if (newStatus !== 'cancelled' && targetRank < currentRank) return;

    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    localStorage.setItem('orchid_flame_orders', JSON.stringify(updated));
  };

  const handleToggleVisibility = (product: Product) => {
    const updated: Product = {
      ...product,
      isVisible: product.isVisible === false ? true : false,
    };
    onUpdateProduct(updated);
  };

  const saveCoupons = (updated: Coupon[]) => {
    setCoupons(updated);
    localStorage.setItem('orchid_flame_coupons', JSON.stringify(updated));
  };

  const handleToggleCouponStatus = (couponId: string) => {
    const updated = coupons.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c));
    saveCoupons(updated);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponValue) return;
    const newCoupon: Coupon = {
      id: `cpn-${Date.now().toString().slice(-4)}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minOrderAmount: newCouponMin ? Number(newCouponMin) : undefined,
      description: newCouponDesc.trim() || `${newCouponValue}${newCouponType === 'percentage' ? '%' : '₹'} off`,
      isActive: true,
    };
    saveCoupons([newCoupon, ...coupons]);
    setNewCouponCode('');
    setNewCouponValue('');
    setNewCouponMin('');
    setNewCouponDesc('');
  };

  const handleConfirmDeleteCoupon = () => {
    if (couponToDelete) {
      const updated = coupons.filter((c) => c.id !== couponToDelete.id);
      saveCoupons(updated);
      setCouponToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // 1. LOGIN GATE SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] bg-candle-wallpaper-faint flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-stone-300 p-8 shadow-2xl space-y-6 text-left">

          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-[#825936]/40 shadow-xs">
              <img src="/orchid-flame-logo.png" alt="Orchid Flame" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#825936] font-bold block pt-1">
              Atelier Portal Authentication
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Orchid Flame Admin
            </h1>
            <p className="text-stone-500 text-xs">
              Authorized personnel control center for store inventory & fulfillment.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Admin Identifier
              </label>
              <input
                type="text"
                required
                placeholder="Enter ID (ocfl)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-3 focus:outline-none focus:border-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-3 pr-10 focus:outline-none focus:border-stone-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  title={showLoginPass ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showLoginPass ? faEyeSlash : faEye} className="text-xs" />
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 border border-red-200 rounded font-medium">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={Boolean(lockedUntil && Date.now() < lockedUntil)}
              className={`w-full py-3.5 text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2 ${
                lockedUntil && Date.now() < lockedUntil
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-[#825936] cursor-pointer'
              }`}
            >
              <FontAwesomeIcon icon={faLock} className="text-xs" />
              <span>Unlock Admin Workspace</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-200 text-center">
            <button
              onClick={onExitAdmin}
              className="text-stone-500 hover:text-stone-900 text-xs font-medium cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
              <span>Return to Public Storefront</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 text-left pb-20">

      {/* Top Admin Navigation Header */}
      <header className="bg-[#1C1816] text-white border-b border-[#825936]/40 sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C29B64]">
            <img src="/orchid-flame-logo.png" alt="Orchid Flame" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold tracking-wider uppercase text-white">
                Orchid Flame Atelier
              </span>
              <span className="bg-[#C29B64] text-stone-950 text-[9px] font-bold px-1.5 py-0.2 uppercase rounded">
                Control Center
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
              Catalog & Live Inventory Operations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
            <span className="hidden sm:inline">View Storefront</span>
          </button>

          <button
            onClick={() => setConfirmSignOut(true)}
            className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-100 text-xs rounded transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">Total Products</span>
            <span className="font-serif text-2xl font-bold text-stone-900">{products.length}</span>
          </div>

          <div className="bg-white border border-stone-200 p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">Active In Stock</span>
            <span className="font-serif text-2xl font-bold text-emerald-700">
              {products.filter((p) => p.inStock !== false).length}
            </span>
          </div>

          <div className="bg-white border border-stone-200 p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">Sold Out Items</span>
            <span className="font-serif text-2xl font-bold text-red-700">
              {products.filter((p) => p.inStock === false).length}
            </span>
          </div>

          <div className="bg-white border border-stone-200 p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">Recorded Orders</span>
            <span className="font-serif text-2xl font-bold text-[#825936]">{orders.length}</span>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex border-b border-stone-300 gap-2 bg-white px-4 pt-2 shadow-2xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${activeTab === 'products'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
          >
            <FontAwesomeIcon icon={faBoxOpen} />
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${activeTab === 'add'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add New Product</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${activeTab === 'orders'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
          >
            <FontAwesomeIcon icon={faReceipt} />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${activeTab === 'coupons'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
          >
            <FontAwesomeIcon icon={faTicket} />
            <span>Store Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${activeTab === 'settings'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
          >
            <FontAwesomeIcon icon={faSliders} />
            <span>Store & Payment Controls</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT LIST & CONTROLS */}
        {activeTab === 'products' && (
          <div className="space-y-4">

            {/* Filter & Action Toolbar */}
            <div className="bg-white border border-stone-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Filter by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 text-xs font-sans bg-stone-50 border border-stone-300 rounded p-2 focus:outline-none focus:border-stone-900"
                />

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-44 text-xs bg-stone-50 border border-stone-300 rounded p-2 focus:outline-none focus:border-stone-900 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Candles">Candles</option>
                  <option value="Diffusers">Reed Diffusers</option>
                  <option value="Fresheners">Fresheners & Sachets</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Gift Sets">Gift Sets</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>New Product</span>
                </button>

                <button
                  onClick={() => setConfirmResetDefaults(true)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded border border-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset to initial default catalog"
                >
                  <FontAwesomeIcon icon={faArrowRotateLeft} className="text-xs" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-stone-200 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Visibility</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4">Bestseller</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-500">
                        No products match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">

                        {/* Item Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-1">
                                {prod.name}
                              </h4>
                              <span className="text-[10px] text-stone-500 block font-mono">
                                {prod.weight || 'Standard Size'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="bg-stone-100 text-stone-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-stone-200">
                            {prod.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-mono font-bold text-stone-900 text-sm">
                          ₹{prod.price}
                          {prod.originalPrice && (
                            <span className="text-[10px] text-stone-400 line-through block font-normal">
                              ₹{prod.originalPrice}
                            </span>
                          )}
                        </td>

                        {/* Visibility (Show / Hide) Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleVisibility(prod)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors flex items-center gap-1.5 ${prod.isVisible !== false
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                              }`}
                            title={prod.isVisible !== false ? 'Currently live in store. Click to hide.' : 'Currently hidden from store. Click to show.'}
                          >
                            <FontAwesomeIcon icon={prod.isVisible !== false ? faEye : faEyeSlash} className="text-[10px]" />
                            <span>{prod.isVisible !== false ? 'Visible' : 'Hidden'}</span>
                          </button>
                        </td>

                        {/* In Stock Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStock(prod)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors ${prod.inStock !== false
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                          >
                            {prod.inStock !== false ? 'In Stock ✓' : 'Sold Out ✕'}
                          </button>
                        </td>

                        {/* Bestseller Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleBestseller(prod)}
                            className={`p-1.5 text-xs cursor-pointer transition-colors ${prod.isBestSeller ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'
                              }`}
                            title="Toggle Bestseller Badge"
                          >
                            <FontAwesomeIcon icon={prod.isBestSeller ? faStar : faStarRegular} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer transition-colors"
                            title="Edit Product Details"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>

                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 text-red-600 hover:text-red-900 rounded hover:bg-red-50 cursor-pointer transition-colors"
                            title="Delete Product"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: ADD NEW PRODUCT FORM */}
        {activeTab === 'add' && (
          publishedProduct ? (
            <div className="bg-white border border-stone-200 p-8 sm:p-12 shadow-xs max-w-2xl mx-auto space-y-6 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shadow-xs">
                <FontAwesomeIcon icon={faCheck} />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-700 block">
                  Artisanal Creation Live
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Published Successfully!
                </h2>
                <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  "{publishedProduct.name}" is now live on the Orchid Flame public storefront for customer discovery and ordering.
                </p>
              </div>

              {/* Product Summary Preview */}
              <div className="flex items-center gap-4 bg-[#FAF8F5] border border-stone-200 p-4 rounded text-left max-w-md mx-auto">
                <div className="w-16 h-16 rounded overflow-hidden border border-stone-300 bg-white flex-shrink-0">
                  <img src={publishedProduct.image} alt={publishedProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">{publishedProduct.name}</h4>
                  <p className="text-xs font-mono text-stone-600">₹{publishedProduct.price} · {publishedProduct.category}</p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded">
                    Live on Website
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPublishedProduct(null);
                    setActiveTab('products');
                  }}
                  className="px-6 py-3 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  <span>Go Back to Products</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPublishedProduct(null);
                  }}
                  className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-300"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Publish Another Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPublishedProduct(null);
                    onExitAdmin();
                  }}
                  className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  <FontAwesomeIcon icon={faEye} />
                  <span>View Live on Store</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 p-6 sm:p-10 shadow-xs max-w-4xl mx-auto space-y-6">
              <div className="border-b border-stone-200 pb-4 space-y-1">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Publish a New Orchid Flame Creation
                </h2>
                <p className="text-stone-500 text-xs">
                  Fill in the creation specifications below. Upon publishing, the product will immediately go live on the storefront for purchasing.
                </p>
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheck} />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-bold rounded flex items-center gap-2">
                  <FontAwesomeIcon icon={faXmark} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">

                {/* Product Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amber Lotus Sanctuary Candle"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Category)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900 cursor-pointer"
                    >
                      <option value="Candles">Candles</option>
                      <option value="Diffusers">Reed Diffusers</option>
                      <option value="Fresheners">Fresheners & Sachets</option>
                      <option value="Accessories">Accessories & Trays</option>
                      <option value="Gift Sets">Gift Sets</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Price (INR ₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 549"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Original Price (Optional strikethrough)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 699"
                      value={newOriginalPrice}
                      onChange={(e) => setNewOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Weight / Net Content
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 260g / 9.1 oz"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Burn time & Wicks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Burn Time / Longevity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 45+ Hours"
                      value={newBurnTime}
                      onChange={(e) => setNewBurnTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Wick Structure
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Double Crackle Wooden Wick"
                      value={newWicks}
                      onChange={(e) => setNewWicks(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Collection Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paradise Collection"
                      value={newCollection}
                      onChange={(e) => setNewCollection(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Photo Upload & Preview */}
                <div className="space-y-2 border border-stone-200 p-4 bg-stone-50 rounded">
                  <label className="block font-bold text-stone-800 uppercase tracking-wider">
                    Product Photograph *
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {newImage ? (
                      <div className="w-24 h-24 bg-white border border-stone-300 rounded overflow-hidden flex-shrink-0">
                        <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-stone-200 border border-dashed border-stone-400 rounded flex items-center justify-center text-stone-400 flex-shrink-0">
                        <FontAwesomeIcon icon={faImage} className="text-2xl" />
                      </div>
                    )}

                    <div className="space-y-2 flex-grow w-full">
                      <label className={`inline-block px-4 py-2 border rounded font-bold uppercase tracking-wider transition-colors shadow-2xs ${isImageCompressing ? 'bg-amber-50 border-amber-400 text-amber-900 cursor-wait' : 'bg-white border-stone-300 hover:border-stone-900 text-stone-800 cursor-pointer'}`}>
                        <span>{isImageCompressing ? 'Optimizing Image...' : 'Choose Photo from Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isImageCompressing}
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-500 block">
                        Or paste an existing image URL below:
                      </span>
                      <input
                        type="text"
                        placeholder="https://... or /candlees.png"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Short Description (Product Card Snippet) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Brief description of the sensory experience and candle materials..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Full Atelier Formulation Narrative
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed craft narrative, artisan origin, and burning guidance..."
                      value={newLongDescription}
                      onChange={(e) => setNewLongDescription(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Fragrance Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-200 pt-4">
                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Top Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bergamot, Mandarin Peel"
                      value={newTopNotes}
                      onChange={(e) => setNewTopNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Heart Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wild Orchid, Cardamom"
                      value={newHeartNotes}
                      onChange={(e) => setNewHeartNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Base Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sandalwood, Warm Vanilla"
                      value={newBaseNotes}
                      onChange={(e) => setNewBaseNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded p-2 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={newInStock}
                      onChange={(e) => setNewInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900"
                    />
                    <span>Mark as In Stock Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={newIsBestSeller}
                      onChange={(e) => setNewIsBestSeller(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900"
                    />
                    <span>Mark as Signature Bestseller</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-5 py-3 border border-stone-300 text-stone-700 font-bold uppercase rounded cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-8 py-3 bg-stone-900 hover:bg-[#825936] disabled:opacity-50 text-white font-bold uppercase tracking-widest rounded transition-colors shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>{isPublishing ? 'Publishing Creation...' : 'Publish Product Live'}</span>
                  </button>
                </div>

              </form>
            </div>
          ))}

        {/* TAB 3: CUSTOMER ORDERS & INVOICES */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 p-4 flex items-center justify-between shadow-xs">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Storefront Order Book & Tax Receipts
                </h3>
                <p className="text-stone-500 text-xs">
                  Orders placed by customers via Express Checkout with WhatsApp sync.
                </p>
              </div>
            </div>

            <div className="bg-white border border-stone-200 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Items Ordered</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-500">
                        No orders have been recorded yet. Orders placed during checkout will appear here.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50 transition-colors">

                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-stone-900 block">#{ord.id}</span>
                          <span className="text-[10px] text-stone-500">{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-900 block">{ord.address.fullName}</span>
                          <span className="text-stone-600 block">{ord.address.phone}</span>
                          <span className="text-[10px] text-stone-500 block truncate max-w-xs">
                            {ord.address.city}, {ord.address.state} - {ord.address.pincode}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] text-stone-800">
                                <b>{item.quantity}x</b> {item.product.name}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-stone-900">
                          ₹{ord.grandTotal}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded block w-fit ${ord.paymentMethod === 'upi' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                            {ord.paymentMethod === 'upi' ? 'UPI Online' : 'Cash on Delivery'}
                          </span>
                          {ord.paymentMethod === 'upi' && (
                            <span className="text-[10px] font-mono text-stone-600 block mt-1 font-semibold">
                              UTR: {ord.upiTransactionId || 'Verified'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {ord.status === 'delivered' ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded inline-flex items-center gap-1.5 shadow-2xs">
                              <FontAwesomeIcon icon={faLock} className="text-[10px] text-emerald-700" />
                              <span>Delivered (Final)</span>
                            </span>
                          ) : ord.status === 'cancelled' ? (
                            <span className="bg-red-100 text-red-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-red-200">
                              Cancelled
                            </span>
                          ) : (
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusSelectChange(ord, e.target.value as Order['status'])}
                              className="bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded p-1.5 text-[11px] font-bold text-stone-800 cursor-pointer focus:outline-none focus:border-stone-900"
                            >
                              {ORDER_STATUS_HIERARCHY
                                .filter((s) => (STATUS_RANK[s.key] || 1) >= (STATUS_RANK[ord.status] || 1))
                                .map((s) => (
                                  <option key={s.key} value={s.key}>
                                    {s.label}
                                  </option>
                                ))}
                              <option value="cancelled">Cancel Order</option>
                            </select>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setViewingOrderDetails(ord)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-bold transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                            title="View full Order Details"
                          >
                            <FontAwesomeIcon icon={faEye} className="text-xs text-stone-600" />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveAdminInvoice(ord);
                              if (onViewInvoice) onViewInvoice(ord);
                            }}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-bold transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                            title="View and print Tax Invoice"
                          >
                            <FontAwesomeIcon icon={faFileInvoice} className="text-xs text-stone-600" />
                            <span>Invoice</span>
                          </button>

                          {ord.status !== 'cancelled' && ord.status !== 'delivered' && (
                            <button
                              onClick={() => setOrderToCancel(ord)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold transition-colors cursor-pointer text-[11px]"
                              title="Cancel Customer Order"
                            >
                              Cancel
                            </button>
                          )}

                          <a
                            href={`https://wa.me/91${ord.address.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${ord.address.fullName}, Orchid Flame concierge here regarding your Order #${ord.id}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold transition-colors inline-flex items-center gap-1 cursor-pointer text-[11px]"
                            title="Chat with customer on WhatsApp"
                          >
                            <FontAwesomeIcon icon={faPaperPlane} className="text-[10px]" />
                            <span>WhatsApp</span>
                          </a>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* TAB 4: STORE COUPONS & DISCOUNTS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">

            {/* Create Coupon Card */}
            <div className="bg-white border border-stone-200 p-6 shadow-xs text-left">
              <div className="border-b border-stone-200 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Create Promotional Coupon
                </h3>
                <p className="text-stone-500 text-xs">
                  Offer percentage discounts or flat fee vouchers to store patrons.
                </p>
              </div>

              <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 font-mono uppercase font-bold focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Discount Type *</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 font-bold focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {newCouponType === 'percentage' ? 'Discount % *' : 'Discount ₹ *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={newCouponType === 'percentage' ? 90 : 10000}
                    placeholder={newCouponType === 'percentage' ? 'e.g. 15' : 'e.g. 150'}
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Min Order ₹ (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 999"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2.5 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-stone-900 hover:bg-[#825936] text-white font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    <span>Add Coupon</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Coupons Table */}
            <div className="bg-white border border-stone-200 overflow-x-auto shadow-xs text-left">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Benefit</th>
                    <th className="py-3 px-4">Min. Spend</th>
                    <th className="py-3 px-4">Status (Click to toggle)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-500">
                        No coupons found. Add one above.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((cpn) => (
                      <tr key={cpn.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900 text-sm">
                          <span className="bg-stone-100 border border-stone-300 px-2.5 py-1 rounded">
                            {cpn.code}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-900">
                            {cpn.discountType === 'percentage' ? `${cpn.discountValue}% OFF` : `₹${cpn.discountValue} FLAT OFF`}
                          </span>
                          <span className="text-[10px] text-stone-500 block">{cpn.description}</span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-stone-700">
                          {cpn.minOrderAmount ? `₹${cpn.minOrderAmount}` : 'None'}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleCouponStatus(cpn.id)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors flex items-center gap-1.5 ${cpn.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            title={cpn.isActive ? 'Valid & Active. Click to make Invalid.' : 'Invalid & Inactive. Click to make Valid.'}
                          >
                            <span>{cpn.isActive ? 'Valid / Active ✓' : 'Invalid / Inactive ✕'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setCouponToDelete(cpn)}
                            className="p-1.5 text-red-600 hover:text-red-900 rounded hover:bg-red-50 cursor-pointer transition-colors"
                            title="Delete Coupon"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 5: REAL-TIME STORE & PAYMENT CONTROLS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">

            {settingsSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md shadow-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faCheck} className="text-emerald-600" />
                  <span className="text-xs font-bold">{settingsSuccessMsg}</span>
                </div>
              </div>
            )}

            {/* 1. Payment & UPI Configuration Card */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 text-left">
              <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faQrcode} className="text-[#825936] text-sm" />
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Official UPI Gateway & Banking Channels
                    </h3>
                  </div>
                  <p className="text-stone-500 text-xs pt-0.5">
                    Controls customer QR code generation, direct UPI payment apps, and instant WhatsApp booking.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                  Real-Time Live
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Official UPI Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.merchantUpiNumber}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, merchantUpiNumber: e.target.value.trim() })}
                    className="w-full text-xs font-mono font-bold bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400 block pt-1">
                    Customers pay strictly to this number. Default: <strong>7023377369</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Official UPI VPA ID
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.merchantUpiId}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, merchantUpiId: e.target.value.trim() })}
                    className="w-full text-xs font-mono font-semibold bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400 block pt-1">
                    Active Payment UPI ID & QR: <strong>{siteSettings.merchantUpiId}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Payee / Merchant Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.merchantName}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, merchantName: e.target.value })}
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400 block pt-1">
                    Displayed on banking apps as the receiver name.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Official WhatsApp Order Confirmation Number
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.whatsappPhone}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, whatsappPhone: e.target.value.trim() })}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400 block pt-1">
                    With country code (e.g. 919026006766). Receives instant customer receipts.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Official Support & Concierge Email
                  </label>
                  <input
                    type="email"
                    required
                    value={siteSettings.contactEmail}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, contactEmail: e.target.value.trim() })}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400 block pt-1">
                    Customer support inquiries email address.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Shipping & Threshold Rules Card */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 text-left">
              <div className="border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faTruckFast} className="text-[#825936] text-sm" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Delivery & Express Shipping Rules
                  </h3>
                </div>
                <p className="text-stone-500 text-xs pt-0.5">
                  Configure free shipping thresholds and standard cart delivery surcharges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Free Delivery Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.freeShippingThreshold}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400 block pt-1">
                    Carts with total equal or above this amount automatically receive FREE shipping.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                    Standard Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.shippingFee}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, shippingFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold bg-stone-50 border border-stone-300 rounded p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400 block pt-1">
                    Applied to orders below the free shipping threshold.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Announcement Ticker Management Card */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 text-left">
              <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBullhorn} className="text-[#825936] text-sm" />
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Storewide Announcement Bar Ticker
                    </h3>
                  </div>
                  <p className="text-stone-500 text-xs pt-0.5">
                    Controls the rotating banner shown at the very top of all pages.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                  <input
                    type="checkbox"
                    checked={siteSettings.announcementEnabled}
                    onChange={(e) => setLocalSiteSettings({ ...siteSettings, announcementEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-stone-900"
                  />
                  <span>Banner Active</span>
                </label>
              </div>

              {/* Add New Message */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter a new announcement message (e.g. Special Festive Offer...)"
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  className="flex-grow text-xs bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase rounded cursor-pointer transition-colors"
                >
                  Add Ticker
                </button>
              </div>

              {/* Current Announcements List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Active Messages ({siteSettings.announcements.length})
                </span>
                <div className="space-y-2">
                  {siteSettings.announcements.map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-stone-50 p-2.5 border border-stone-200 rounded text-xs"
                    >
                      <span className="text-stone-800 font-serif">{msg}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnnouncement(idx)}
                        className="text-red-600 hover:text-red-900 text-xs px-2 py-1 cursor-pointer"
                        title="Remove message"
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Administrator Security & Password Change */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 text-left">
              <div className="border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faKey} className="text-[#825936] text-sm" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Administrator Security & Credentials
                  </h3>
                </div>
                <p className="text-stone-500 text-xs pt-0.5">
                  Update the password required to unlock this control center.
                </p>
              </div>

              {passChangeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded font-bold">
                  {passChangeSuccess}
                </div>
              )}

              {passChangeError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded font-bold">
                  {passChangeError}
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    New Security Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmNewPassInput}
                    onChange={(e) => setConfirmNewPassInput(e.target.value)}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded p-2.5 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                  >
                    Update Admin Password
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Save All Configurations Bar */}
            <div className="sticky bottom-4 bg-[#1C1816] text-white p-4 rounded shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#825936]/40 z-30">
              <div>
                <span className="font-serif text-sm font-bold block text-white">Save Site Configurations</span>
                <span className="text-[11px] text-stone-400">
                  Updates will immediately sync across the website, checkout modal, QR payment, and customer receipts.
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-8 py-3 bg-[#C29B64] hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider rounded transition-colors shadow flex items-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                <span>Save & Broadcast Live</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-stone-300 p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl my-auto text-left">

            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Edit Product: {editingProduct.name}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as Category })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="Candles">Candles</option>
                    <option value="Diffusers">Reed Diffusers</option>
                    <option value="Fresheners">Fresheners & Sachets</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Gift Sets">Gift Sets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Weight</label>
                  <input
                    type="text"
                    value={editingProduct.weight}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded p-2"
                />
              </div>

              {/* Image Editor */}
              <div className="border border-stone-200 p-3 bg-stone-50 rounded space-y-2">
                <label className="block font-bold text-stone-800">Product Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded border border-stone-300 overflow-hidden bg-white flex-shrink-0">
                    <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1.5 flex-grow">
                    <label className="inline-block px-3 py-1 bg-white border border-stone-300 text-stone-800 text-[11px] font-bold rounded cursor-pointer hover:border-stone-900 transition-colors">
                      <span>Change Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-900">
                  <input
                    type="checkbox"
                    checked={editingProduct.isVisible !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded text-stone-900"
                  />
                  <span>Show in Store (Live on Website)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="w-4 h-4 rounded text-stone-900"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="w-4 h-4 rounded text-stone-900"
                  />
                  <span>Signature Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-stone-300 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 hover:bg-[#825936] text-white rounded font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 1. In-Screen Product Deletion Confirmation Modal Card */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border-2 border-[#825936]/40 max-w-md w-full p-6 sm:p-7 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900 leading-tight">
                    Confirm Product Deletion
                  </h3>
                  <span className="text-[10px] text-red-700 font-mono font-semibold uppercase">
                    Permanent Catalog Removal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setProductToDelete(null)}
                className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 border border-stone-200 rounded">
              <div className="w-14 h-14 rounded overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                <img src={productToDelete.image} alt={productToDelete.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">{productToDelete.name}</h4>
                <span className="text-stone-500 text-xs block font-mono">₹{productToDelete.price} · {productToDelete.category}</span>
                <span className="text-[10px] text-stone-400 block">{productToDelete.weight || 'Standard Size'}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete this artisanal creation from your store? This action cannot be undone.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer hover:bg-stone-100 transition-colors"
              >
                Keep Product
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmDelete();
                }}
                className="w-1/2 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. In-Screen Sign Out Confirmation Modal Card */}
      {confirmSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border-2 border-[#825936]/40 max-w-sm w-full p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-[#825936] flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Sign Out of Atelier?</h3>
                <span className="text-[10px] text-stone-500 font-mono">Administrative Control Session</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to log out of the Orchid Flame administration workspace? You will need your credentials to sign in again.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmSignOut(false)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer hover:bg-stone-100 transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleConfirmLogout}
                className="w-1/2 py-2.5 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-md"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. In-Screen Catalog Factory Reset Confirmation Modal Card */}
      {confirmResetDefaults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border-2 border-amber-300 max-w-sm w-full p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <FontAwesomeIcon icon={faArrowRotateLeft} className="text-xs" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Reset Catalog Defaults?</h3>
                <span className="text-[10px] text-amber-800 font-mono">Factory Restoration</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              This will restore all initial artisanal candle products and clear any custom products added during this session.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmResetDefaults(false)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="w-1/2 py-2.5 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. In-Screen Order Cancellation Confirmation Modal Card */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border-2 border-red-300 max-w-md w-full p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Cancel Order #{orderToCancel.id}?</h3>
                <span className="text-[10px] text-red-700 font-mono font-semibold uppercase">Fulfillment Revocation</span>
              </div>
              <button
                onClick={() => setOrderToCancel(null)}
                className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="bg-white p-3 border border-stone-200 rounded text-xs space-y-1">
              <p><b>Customer:</b> {orderToCancel.address.fullName} (+91 {orderToCancel.address.phone})</p>
              <p><b>Amount:</b> ₹{orderToCancel.grandTotal} ({orderToCancel.paymentMethod === 'upi' ? 'UPI' : 'COD'})</p>
              <p className="text-stone-500"><b>Destination:</b> {orderToCancel.address.city}, {orderToCancel.address.state}</p>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to mark this customer order as cancelled? Its status will update in both the patron profile and admin book.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setOrderToCancel(null)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer hover:bg-stone-100 transition-colors"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                className="w-1/2 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-md"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. In-Screen Coupon Deletion Confirmation Modal Card */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border-2 border-red-300 max-w-sm w-full p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900 leading-tight">
                    Delete Coupon {couponToDelete.code}?
                  </h3>
                  <span className="text-[10px] text-red-700 font-mono font-semibold uppercase">
                    Permanent Removal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCouponToDelete(null)}
                className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete this promotional coupon voucher code? Customers will no longer be able to redeem it at checkout.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCouponToDelete(null)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer hover:bg-stone-100 transition-colors"
              >
                Keep Coupon
              </button>
              <button
                onClick={handleConfirmDeleteCoupon}
                className="w-1/2 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. In-Screen Delivery Confirmation Modal Card */}
      {orderToDeliverConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border-2 border-emerald-500 max-w-md w-full p-6 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900 leading-tight">
                    Confirm Order Delivery?
                  </h3>
                  <span className="text-[10px] text-emerald-800 font-mono font-semibold uppercase">
                    Order #{orderToDeliverConfirm.id} · Permanent Lock
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOrderToDeliverConfirm(null)}
                className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="bg-white p-3.5 border border-stone-200 rounded text-xs space-y-1">
              <p><b>Customer:</b> {orderToDeliverConfirm.address.fullName} (+91 {orderToDeliverConfirm.address.phone})</p>
              <p><b>Total Amount:</b> ₹{orderToDeliverConfirm.grandTotal} ({orderToDeliverConfirm.paymentMethod === 'upi' ? 'UPI Online' : 'COD'})</p>
              <p className="text-stone-600"><b>Destination:</b> {orderToDeliverConfirm.address.city}, {orderToDeliverConfirm.address.state} - {orderToDeliverConfirm.address.pincode}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span>⚠️ Important Confirmation Notice</span>
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Are you sure you want to mark this order as <b>Delivered</b>? Once confirmed, this order is permanently delivered and locked. Nothing can be modified, changed, or cancelled on it — only viewing its details and tax invoice will be possible.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDeliverConfirm(null)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer hover:bg-stone-100 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDeliverOrder}
                className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                <span>Yes, Confirm Delivered</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Admin Order Details Inspection Modal */}
      {viewingOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-stone-300 max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-left space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Order Details #{viewingOrderDetails.id}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    viewingOrderDetails.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : viewingOrderDetails.status === 'cancelled'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-[#F5F2EC] text-stone-800 border border-stone-300'
                  }`}>
                    {viewingOrderDetails.status === 'delivered' ? 'Delivered (Locked)' : viewingOrderDetails.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 pt-0.5">
                  Invoice No: <b>{viewingOrderDetails.invoiceNumber}</b> • Placed on {new Date(viewingOrderDetails.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setViewingOrderDetails(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <FontAwesomeIcon icon={faXmark} className="text-base" />
              </button>
            </div>

            {/* Billed To & Shipping details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-stone-50 p-3.5 border border-stone-200 rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                  Customer & Delivery Address
                </span>
                <p className="font-bold text-stone-900 text-sm">{viewingOrderDetails.address.fullName}</p>
                <p className="text-stone-700">{viewingOrderDetails.address.addressLine1}</p>
                {viewingOrderDetails.address.addressLine2 && <p className="text-stone-700">{viewingOrderDetails.address.addressLine2}</p>}
                {viewingOrderDetails.address.landmark && <p className="text-stone-500">Landmark: {viewingOrderDetails.address.landmark}</p>}
                <p className="text-stone-700">{viewingOrderDetails.address.city}, {viewingOrderDetails.address.state} - {viewingOrderDetails.address.pincode}</p>
                <p className="text-stone-800 pt-1 font-mono"><b>Phone:</b> +91 {viewingOrderDetails.address.phone}</p>
                <p className="text-stone-800 font-mono"><b>Email:</b> {viewingOrderDetails.address.email}</p>
              </div>

              <div className="bg-stone-50 p-3.5 border border-stone-200 rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                  Payment & Delivery Status
                </span>
                <p className="text-stone-800"><b>Payment Mode:</b> {viewingOrderDetails.paymentMethod === 'upi' ? 'UPI Online Transfer' : 'Cash on Delivery'}</p>
                <p className="text-stone-800"><b>Payment Status:</b> {viewingOrderDetails.paymentStatus === 'paid' ? 'Paid & Verified' : 'Confirmed'}</p>
                {viewingOrderDetails.upiTransactionId && (
                  <p className="text-stone-800 font-mono text-[11px]"><b>UTR / Ref:</b> {viewingOrderDetails.upiTransactionId}</p>
                )}
                <p className="text-stone-800"><b>Fulfillment Milestone:</b> <span className="font-bold uppercase text-stone-900">{viewingOrderDetails.status}</span></p>
                <p className="text-stone-600 text-[11px] pt-1">Courier: Priority Air Express (3-5 Business Days)</p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-stone-600 tracking-wider block">
                Ordered Products ({viewingOrderDetails.items.length})
              </span>
              <div className="border border-stone-200 divide-y divide-stone-200 rounded overflow-hidden text-xs">
                {viewingOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-stone-200 overflow-hidden bg-stone-100 flex-shrink-0">
                        <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{it.product.name}</p>
                        <p className="text-stone-500 text-[11px]">{it.product.category} {it.product.weight ? `• ${it.product.weight}` : ''}</p>
                        <p className="text-stone-600 font-mono text-[11px]">Qty: {it.quantity} × ₹{it.product.price}</p>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-stone-900 text-sm">
                      ₹{it.product.price * it.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-stone-50 p-3.5 border border-stone-200 rounded text-xs space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Gross Subtotal:</span>
                <span className="font-mono">₹{viewingOrderDetails.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping & Handling:</span>
                <span className="font-mono">{viewingOrderDetails.shipping === 0 ? 'FREE' : `₹${viewingOrderDetails.shipping}`}</span>
              </div>
              {viewingOrderDetails.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-₹{viewingOrderDetails.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-950 font-bold text-sm pt-2 border-t border-stone-200">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-[#825936]">₹{viewingOrderDetails.grandTotal}</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  const ord = viewingOrderDetails;
                  setViewingOrderDetails(null);
                  setActiveAdminInvoice(ord);
                  if (onViewInvoice) onViewInvoice(ord);
                }}
                className="px-4 py-2 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FontAwesomeIcon icon={faFileInvoice} className="text-xs" />
                <span>View Tax Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingOrderDetails(null)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold uppercase rounded cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Admin Tax Invoice Modal */}
      {activeAdminInvoice && (
        <InvoiceModal
          order={activeAdminInvoice}
          isOpen={!!activeAdminInvoice}
          onClose={() => setActiveAdminInvoice(null)}
        />
      )}

    </div>
  );
};
