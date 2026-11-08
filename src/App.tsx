import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InvoiceModal } from './components/InvoiceModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { HelpModal } from './components/HelpModal';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { AdminView } from './views/AdminView';
import { ProfileView } from './views/ProfileView';
import { PolicyView, PolicyTab } from './views/PolicyView';
import { WishlistView } from './views/WishlistView';
import { Product, CartItem, Order, UserProfile } from './types';
import { PRODUCTS } from './data/products';
import { getStoredUserProfile, saveStoredUserProfile, subscribeToAuthState } from './services/firebase';
import { parseCurrentRoute, navigateTo, syncDocumentTitle } from './utils/router';
import { getSiteSettings, SETTINGS_CHANGE_EVENT } from './services/siteSettings';

export default function App() {
  // Real-time Site Settings (Live sync across all components)
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSiteSettings(getSiteSettings());
    };
    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // Initial Route Resolution
  const initialRoute = useMemo(() => parseCurrentRoute(), []);

  // Navigation & Product Views
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'about' | 'contact' | 'profile' | 'policy' | 'wishlist'>(
    (initialRoute.view === 'admin' ? 'home' : initialRoute.view) as any
  );
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyTab>(initialRoute.policyTab || 'return-policy');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialRoute.category || null);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(initialRoute.view === 'admin');

  // Dynamic Product Catalog State (Synchronized with Admin & always keeps default products up to date)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('orchid_flame_custom_products_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure new default products are present
          const existingIds = new Set(parsed.map((p: Product) => p.id));
          const missingDefaults = PRODUCTS.filter((p) => !existingIds.has(p.id));
          if (missingDefaults.length > 0) {
            const merged = [...parsed, ...missingDefaults];
            localStorage.setItem('orchid_flame_custom_products_v6', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading custom products', err);
    }
    try {
      localStorage.setItem('orchid_flame_custom_products_v6', JSON.stringify(PRODUCTS));
    } catch {
      // ignore
    }
    return PRODUCTS;
  });

  // Comprehensive SPA Router Synchronization (popstate & hashchange)
  useEffect(() => {
    const syncRouteWithState = () => {
      const parsed = parseCurrentRoute();
      if (parsed.view === 'admin') {
        setIsAdminRoute(true);
        syncDocumentTitle(parsed);
        return;
      }

      setIsAdminRoute(false);
      setCurrentView(parsed.view as any);

      if (parsed.productId) {
        const found = products.find((p) => p.id === parsed.productId);
        if (found) {
          setSelectedProduct(found);
          syncDocumentTitle(parsed, found.name);
          return;
        } else {
          setSelectedProduct(null);
        }
      } else {
        setSelectedProduct(null);
      }

      if (parsed.category !== undefined) {
        setSelectedCategory(parsed.category);
      }

      if (parsed.policyTab) {
        setActivePolicyTab(parsed.policyTab);
      }

      syncDocumentTitle(parsed);
    };

    syncRouteWithState();

    window.addEventListener('popstate', syncRouteWithState);
    window.addEventListener('hashchange', syncRouteWithState);
    return () => {
      window.removeEventListener('popstate', syncRouteWithState);
      window.removeEventListener('hashchange', syncRouteWithState);
    };
  }, [products]);

  const handleOpenAdmin = () => {
    navigateTo({ view: 'admin' });
  };

  const handleExitAdmin = (targetView: 'home' | 'shop' = 'shop') => {
    navigateTo({ view: targetView });
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => {
      const updated = [newProduct, ...prev.filter((p) => p.id !== newProduct.id)];
      try {
        localStorage.setItem('orchid_flame_custom_products_v6', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage quota limit reached, trimming image payloads for safe persistence', err);
        const trimmed = updated.map((p) => {
          if (p.image && p.image.length > 150000) {
            return { ...p, image: '/bgof.png', additionalImages: ['/bgof.png'] };
          }
          return p;
        });
        try {
          localStorage.setItem('orchid_flame_custom_products_v6', JSON.stringify(trimmed));
        } catch {
          // Keep updated in memory
        }
      }
      return updated;
    });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      localStorage.setItem('orchid_flame_custom_products_v6', JSON.stringify(updated));
      return updated;
    });
    if (selectedProduct && selectedProduct.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem('orchid_flame_custom_products_v6', JSON.stringify(updated));
      return updated;
    });
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
  };

  const handleResetProducts = () => {
    setProducts(PRODUCTS);
    localStorage.setItem('orchid_flame_custom_products_v6', JSON.stringify(PRODUCTS));
  };

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // User Profile & Firebase Authentication State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getStoredUserProfile());
  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((profile) => {
      if (profile) {
        setUserProfile(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUserChange = (u: UserProfile | null) => {
    setUserProfile(u);
    saveStoredUserProfile(u);
    if (u && pendingCheckoutAfterLogin) {
      setPendingCheckoutAfterLogin(false);
      setProfileOpen(false);
      setCheckoutOpen(true);
    }
  };

  // All Recorded Orders State
  const [allOrders, setAllOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('orchid_flame_orders');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Error reading orders in App', err);
    }
    return [];
  });

  // Invoice State
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('orchid_flame_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('orchid_flame_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (err) {
      console.error('Error reading storage', err);
    }
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('orchid_flame_cart', JSON.stringify(updatedCart));
  };

  const saveWishlist = (updatedWishlist: Product[]) => {
    setWishlist(updatedWishlist);
    localStorage.setItem('orchid_flame_wishlist', JSON.stringify(updatedWishlist));
  };

  const handleAddToCart = (product: Product, quantity: number, size?: string) => {
    if (product.inStock === false) return;

    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        product,
        quantity,
        selectedSize: size || product.weight,
      });
    }

    saveCart(updatedCart);
    setCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity = 1, size?: string) => {
    if (product.inStock === false) return;

    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({
        product,
        quantity,
        selectedSize: size || product.weight,
      });
    }

    saveCart(updatedCart);
    setCartOpen(false); // Skips opening cart drawer

    // Strict sign-in enforcement: no one can place an order without signing in
    if (!userProfile) {
      setPendingCheckoutAfterLogin(true);
      setProfileOpen(true);
      return;
    }

    setCheckoutOpen(true); // Directly goes to checkout & payment!
  };

  const handleProceedToCheckout = () => {
    // Strict sign-in enforcement: no one can place an order without signing in
    if (!userProfile) {
      setPendingCheckoutAfterLogin(true);
      setProfileOpen(true);
      return;
    }
    setCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId, size);
      return;
    }

    const updatedCart = cart.map((item) => {
      if (item.product.id === productId && (!size || item.selectedSize === size)) {
        return { ...item, quantity };
      }
      return item;
    });

    saveCart(updatedCart);
  };

  const handleRemoveCartItem = (productId: string, size?: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && (!size || item.selectedSize === size))
    );
    saveCart(updatedCart);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((w) => w.id === product.id);
    if (exists) {
      saveWishlist(wishlist.filter((w) => w.id !== product.id));
    } else {
      saveWishlist([...wishlist, product]);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    saveWishlist(wishlist.filter((w) => w.id !== productId));
  };

  const handleNavigate = (view: 'home' | 'shop' | 'about' | 'contact' | 'profile' | 'policy' | 'wishlist', subTab?: PolicyTab) => {
    setCurrentView(view);
    setSelectedProduct(null);
    if (subTab) {
      setActivePolicyTab(subTab);
    }
    navigateTo({
      view,
      policyTab: subTab,
      category: view === 'shop' ? selectedCategory : undefined,
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateTo({
      view: 'shop',
      productId: product.id,
    });
  };

  const handleOrderSuccess = (order: Order) => {
    setActiveInvoiceOrder(order);
    setAllOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
  };

  const handleCancelOrder = (orderId: string, reason?: string) => {
    const updated = allOrders.map((o) =>
      o.id === orderId
        ? {
          ...o,
          status: 'cancelled' as const,
          cancelledAt: new Date().toISOString(),
          cancelReason: reason || 'Cancelled by customer from profile dashboard',
        }
        : o
    );
    setAllOrders(updated);
    localStorage.setItem('orchid_flame_orders', JSON.stringify(updated));
  };

  const handleViewInvoice = (order: Order) => {
    setActiveInvoiceOrder(order);
    setInvoiceModalOpen(true);
  };

  const bestSellers = useMemo(() => {
    return products.filter((p) => p.isVisible !== false && p.isBestSeller && p.inStock !== false).slice(0, 8);
  }, [products]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // If on admin route /ocfl, render the Admin Portal
  if (isAdminRoute) {
    return (
      <AdminView
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetProducts}
        onExitAdmin={handleExitAdmin}
        onViewInvoice={handleViewInvoice}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-stone-900 font-sans antialiased selection:bg-[#825936] selection:text-white" id="app-root">

      {/* 1. Global Navigation Bar */}
      <Navbar
        currentView={currentView as any}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenOrders={() => {
          if (userProfile) {
            setCurrentView('profile');
            setSelectedProduct(null);
          } else {
            setProfileOpen(true);
          }
        }}
        onOpenHelp={() => setHelpOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 2. Main Page Views */}
      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedProduct ? `detail-${selectedProduct.id}` : `view-${currentView}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {selectedProduct ? (
              <ProductDetailView
                product={selectedProduct}
                onBackToShop={() => {
                  setSelectedProduct(null);
                  navigateTo({ view: 'shop', category: selectedCategory });
                }}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                allProducts={products}
                onSelectProduct={handleSelectProduct}
                isWishlisted={wishlist.some((w) => w.id === selectedProduct.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ) : (
              <>
                {currentView === 'home' && (
                  <HomeView
                    onNavigate={handleNavigate}
                    onSelectCategory={setSelectedCategory}
                    bestSellers={bestSellers}
                    onSelectProduct={handleSelectProduct}
                    onAddToCart={handleAddToCart}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}

                {currentView === 'shop' && (
                  <ShopView
                    products={products}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onSelectProduct={handleSelectProduct}
                    onAddToCart={handleAddToCart}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}

                {currentView === 'wishlist' && (
                  <WishlistView
                    wishlist={wishlist}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                    onClearWishlist={() => saveWishlist([])}
                    onSelectProduct={handleSelectProduct}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onContinueShopping={() => handleNavigate('shop')}
                  />
                )}

                {currentView === 'about' && <AboutView />}

                {currentView === 'contact' && <ContactView />}

                {currentView === 'profile' && (
                  <ProfileView
                    user={userProfile}
                    onUserChange={handleUserChange}
                    orders={allOrders}
                    onCancelOrder={handleCancelOrder}
                    onViewInvoice={handleViewInvoice}
                    onNavigate={handleNavigate}
                    onOpenAuthModal={() => setProfileOpen(true)}
                  />
                )}

                {currentView === 'policy' && (
                  <PolicyView
                    activeTab={activePolicyTab}
                    onTabChange={setActivePolicyTab}
                    onBackToHome={() => handleNavigate('home')}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={setSelectedCategory}
        onOpenOrders={() => {
          if (userProfile) {
            setCurrentView('profile');
            setSelectedProduct(null);
          } else {
            setProfileOpen(true);
          }
        }}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 4. Sliding Cart Sidebar */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart}
        user={userProfile}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 5. Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          if (activeInvoiceOrder) {
            setInvoiceModalOpen(true);
          }
        }}
        cartItems={cart}
        user={userProfile}
        onOpenAuthModal={() => {
          setPendingCheckoutAfterLogin(true);
          setProfileOpen(true);
        }}
        onUserChange={handleUserChange}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={handleClearCart}
        onNavigateToOrders={() => {
          setCheckoutOpen(false);
          setCurrentView('profile');
          setSelectedProduct(null);
        }}
      />

      {/* 6. Tax Invoice Viewer & PDF Download Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        order={activeInvoiceOrder}
        onClose={() => setInvoiceModalOpen(false)}
      />

      {/* 7. Patron Profile & Account Dashboard (Google Auth, Addresses & Orders) */}
      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => {
          setProfileOpen(false);
          setPendingCheckoutAfterLogin(false);
        }}
        checkoutIntent={pendingCheckoutAfterLogin}
        user={userProfile}
        onUserChange={handleUserChange}
        orders={allOrders}
        onCancelOrder={handleCancelOrder}
        onViewInvoice={handleViewInvoice}
        onNavigateToProfile={() => {
          setCurrentView('profile');
          setSelectedProduct(null);
        }}
      />

      {/* 8. Past Orders & Receipts History Modal */}
      <OrderHistoryModal
        isOpen={ordersOpen}
        onClose={() => setOrdersOpen(false)}
        onViewInvoice={(ord) => {
          setOrdersOpen(false);
          handleViewInvoice(ord);
        }}
      />

      {/* 8. Quick Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        products={products}
      />

      {/* 9. Saved Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={handleSelectProduct}
      />

      {/* 10. Customer Support / Help Modal */}
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        onNavigatePolicy={(tab) => handleNavigate('policy', tab)}
      />

      {/* 11. Floating WhatsApp Button (Hidden during checkout and modals to avoid overlapping mobile UI) */}
      {!checkoutOpen && !cartOpen && !profileOpen && !invoiceModalOpen && !ordersOpen && !searchOpen && !wishlistOpen && !helpOpen && (
        <a
          href={`http://wa.me/${siteSettings.whatsappPhone || '919026006766'}?text=${encodeURIComponent('Hello Orchid Flame! I would like to inquire about your candles.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-13 sm:h-13 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-108 transition-all duration-200 group cursor-pointer"
          aria-label="Direct WhatsApp Concierge"
          title={`Chat on WhatsApp (+91 ${siteSettings.merchantUpiNumber || '9026006766'})`}
          id="floating-whatsapp-btn"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="text-xl sm:text-2xl" />
          <span className="absolute -top-1 -right-1 flex h-3 sm:h-3.5 w-3 sm:w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 sm:h-3.5 w-3 sm:w-3.5 bg-emerald-400"></span>
          </span>
        </a>
      )}

      {/* 12. Floating Scroll-to-Top Button */}
      {showScrollTop && !checkoutOpen && !cartOpen && !profileOpen && !invoiceModalOpen && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-5 sm:bottom-22 sm:right-6 z-40 w-9 h-9 sm:w-10 sm:h-10 bg-[#825936] hover:bg-[#6c482b] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer"
          aria-label="Scroll to top"
          title="Back to Top"
        >
          <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
        </button>
      )}

    </div>
  );
}
