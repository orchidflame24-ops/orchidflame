import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBagShopping, 
  faHeart, 
  faUser, 
  faMagnifyingGlass, 
  faBars, 
  faEllipsisVertical,
  faXmark, 
  faChevronDown, 
  faChevronLeft, 
  faChevronRight, 
  faCircleQuestion 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { getSiteSettings, SETTINGS_CHANGE_EVENT } from '../services/siteSettings';

interface NavbarProps {
  currentView: 'home' | 'shop' | 'about' | 'contact' | 'profile' | 'policy' | 'wishlist';
  onNavigate: (view: 'home' | 'shop' | 'about' | 'contact' | 'profile' | 'policy' | 'wishlist', subTab?: any) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenOrders: () => void;
  onOpenHelp: () => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenOrders,
  onOpenHelp,
  selectedCategory,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  // Sync with real-time siteSettings
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

  const announcements = siteSettings.announcements && siteSettings.announcements.length > 0
    ? siteSettings.announcements
    : ['Orchid Flame · Hand-poured artisanal soy candles'];

  const handlePrevAnnouncement = () => {
    setAnnouncementIdx((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const handleNextAnnouncement = () => {
    setAnnouncementIdx((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
  };

  const handleCategoryClick = (catId: string | null) => {
    onNavigate('shop');
    onSelectCategory(catId);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shopCategories = [
    { id: 'Signature candles', name: '1. Signature candles' },
    { id: 'Premium candles', name: '2. Premium candles' },
    { id: 'Decorative candles', name: '3. Decorative candles' },
    { id: 'Ceramic candle', name: '4. Ceramic candle' },
    { id: 'Scented wax sachet', name: '5. Scented wax sachet' },
    { id: 'Mini jar combos', name: '6. Mini jar combos' },
    { id: 'Combos', name: '8. Combos' },
  ];

  const currentMsg = announcements[announcementIdx % announcements.length] || announcements[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5] shadow-xs" id="site-header">
      
      {/* 1. SLIM ANNOUNCEMENT BAR */}
      {siteSettings.announcementEnabled !== false && (
        <div className="w-full bg-[#825936] text-amber-50 text-[10px] sm:text-[11px] py-1 sm:py-1.5 px-3 sm:px-4 border-b border-[#734c2b]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            <div className="hidden sm:block sm:w-20" />

            {/* Centered Announcement */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mx-auto font-serif tracking-wider">
              <button
                onClick={handlePrevAnnouncement}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                aria-label="Previous announcement"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[9px]" />
              </button>

              <span className="font-medium text-center truncate max-w-[170px] xs:max-w-[240px] sm:max-w-md">
                {currentMsg}
              </span>

              <button
                onClick={handleNextAnnouncement}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                aria-label="Next announcement"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
              </button>
            </div>

          {/* Right Help Trigger */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1 text-[10px] sm:text-[11px] font-sans text-amber-100 hover:text-white transition-colors cursor-pointer tracking-wider font-semibold flex-shrink-0"
          >
            <FontAwesomeIcon icon={faCircleQuestion} className="text-[10px] flex-shrink-0" />
            <span className="hidden xs:inline">Get Help</span>
          </button>

          </div>
        </div>
      )}

      {/* 2. COMPACT MAIN HEADER BAR */}
      <div className="relative max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between border-b border-stone-200/70 bg-[#FAF8F5]/95 backdrop-blur-md">
        
        {/* Left Actions */}
        <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2.5 z-20">
          
          {/* Left-most Emblem Logo (Hidden on Phone UI, visible on sm and above) */}
          <div
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden sm:flex items-center cursor-pointer group"
            title="Orchid Flame Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-[#C29B64]/60 shadow-xs group-hover:scale-105 transition-transform flex-shrink-0 bg-white">
              <img
                src="/orchid-flame-logo.png"
                alt="Orchid Flame Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Mobile Menu: Vertical 3 Dots (Takes minimal horizontal space!) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-stone-800 hover:text-[#825936] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            title="Navigation Menu"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faEllipsisVertical} className="text-sm xs:text-base" />
          </button>

          {/* User Orders & Profile (Visible on BOTH Phone & Desktop) */}
          <button
            onClick={onOpenOrders}
            className="w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-stone-700 hover:text-[#825936] transition-colors cursor-pointer"
            title="My Orders & Profile"
            aria-label="My Orders"
          >
            <FontAwesomeIcon icon={faUser} className="text-xs xs:text-sm sm:text-base" />
          </button>

          {/* Wishlist Page Link (Tablet/Desktop sm and above) */}
          <button
            onClick={() => {
              onNavigate('wishlist');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden sm:flex relative w-8 h-8 items-center justify-center text-stone-700 hover:text-[#825936] transition-colors cursor-pointer"
            title="Saved Wishlist"
            aria-label="Wishlist"
          >
            <FontAwesomeIcon icon={faHeart} className={`text-sm sm:text-base ${currentView === 'wishlist' ? 'text-[#825936]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#825936] text-white rounded-full text-[8.5px] font-mono font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
        </div>

        {/* Center: Official Orchid Flame Emblem Logo (Dead-Centered on Mobile & Desktop) */}
        <div 
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center cursor-pointer select-none"
        >
          <Logo showText={true} className="w-6 h-6 xs:w-7 xs:h-7 sm:w-10 sm:h-10" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2.5 z-20">
          
          {/* Mobile Wishlist Page Link (Phone only, placed on right next to Cart) */}
          <button
            onClick={() => {
              onNavigate('wishlist');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="sm:hidden relative w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-stone-700 hover:text-[#825936] transition-colors cursor-pointer"
            title="Saved Wishlist"
            aria-label="Wishlist"
          >
            <FontAwesomeIcon icon={faHeart} className={`text-xs xs:text-sm ${currentView === 'wishlist' ? 'text-[#825936]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#825936] text-white rounded-full text-[7.5px] font-mono font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Search Button (Phone & Desktop) */}
          <button
            onClick={onOpenSearch}
            className="w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-stone-700 hover:text-[#825936] transition-colors cursor-pointer"
            title="Search fragrances"
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs xs:text-sm sm:text-base" />
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center text-stone-800 hover:text-[#825936] transition-colors cursor-pointer group"
            title="Shopping Cart"
            aria-label="Cart"
            id="nav-cart-btn"
          >
            <FontAwesomeIcon icon={faBagShopping} className="text-sm xs:text-base sm:text-lg group-hover:scale-105 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#825936] text-white rounded-full text-[8px] sm:text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* 3. SLEEK SUB-NAVIGATION (DESKTOP ONLY) */}
      <nav className="hidden md:flex items-center justify-center space-x-8 py-2.5 text-[11px] uppercase tracking-widest font-sans font-medium text-stone-800 relative bg-white/90 border-b border-stone-200/60">
        
        {/* Shop Dropdown (Updated with 7 requested options) */}
        <div 
          className="relative group py-0.5"
          onMouseEnter={() => setActiveDropdown('shop')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <button 
            onClick={() => handleCategoryClick(null)}
            className="flex items-center gap-1.5 hover:text-[#825936] transition-colors cursor-pointer font-bold"
          >
            <span>Shop</span>
            <FontAwesomeIcon icon={faChevronDown} className="text-[9px] text-stone-400 group-hover:rotate-180 transition-transform" />
          </button>

          {activeDropdown === 'shop' && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-64 bg-white border border-stone-200 shadow-xl p-2 z-50 text-left space-y-1">
              <button
                onClick={() => handleCategoryClick(null)}
                className="w-full text-left px-3 py-1.5 text-[10.5px] uppercase tracking-wider font-bold text-stone-900 hover:bg-stone-50 hover:text-[#825936] cursor-pointer"
              >
                ✦ All Products
              </button>
              <div className="border-t border-stone-100 my-1" />
              {shopCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left px-3 py-1.5 text-[10.5px] uppercase tracking-wider transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-stone-100 text-[#825936] font-bold'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-[#825936]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gift Hampers (Replaced Gifts, and Collections removed as requested) */}
        <div 
          className="relative group py-0.5"
          onMouseEnter={() => setActiveDropdown('gift-hampers')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <button 
            onClick={() => handleCategoryClick('Combos')}
            className="flex items-center gap-1.5 hover:text-[#825936] transition-colors cursor-pointer font-bold"
          >
            <span>Gift Hampers</span>
            <FontAwesomeIcon icon={faChevronDown} className="text-[9px] text-stone-400 group-hover:rotate-180 transition-transform" />
          </button>

          {activeDropdown === 'gift-hampers' && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-60 bg-white border border-stone-200 shadow-xl p-2 z-50 text-left space-y-1">
              <button
                onClick={() => handleCategoryClick('Combos')}
                className="w-full text-left px-3 py-1.5 text-[10.5px] uppercase tracking-wider font-bold text-stone-900 hover:bg-stone-50 hover:text-[#825936] cursor-pointer"
              >
                ✦ All Gift Hampers
              </button>
              <button
                onClick={() => handleCategoryClick('Combos')}
                className="w-full text-left px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:text-[#825936] cursor-pointer"
              >
                Celebration Hampers
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="w-full text-left px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:text-[#825936] cursor-pointer"
              >
                Custom Wedding Favors
              </button>
            </div>
          )}
        </div>

        {/* Collaborations */}
        <button 
          onClick={() => handleCategoryClick(null)}
          className="hover:text-[#825936] transition-colors cursor-pointer font-bold"
        >
          Collaborations
        </button>

        {/* About */}
        <button 
          onClick={() => onNavigate('about')}
          className="hover:text-[#825936] transition-colors cursor-pointer font-bold"
        >
          About
        </button>

      </nav>

      {/* 4. POLISHED MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-stone-200 overflow-hidden text-left shadow-lg"
          >
            <div className="px-5 py-4 space-y-3">
              <button
                onClick={() => handleCategoryClick(null)}
                className="w-full text-left py-2 font-serif text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 flex items-center justify-between"
              >
                <span>Shop All Categories</span>
                <span className="text-xs text-[#825936]">→</span>
              </button>

              <div className="flex flex-col gap-1 text-xs uppercase tracking-wider text-stone-700 pt-1 pb-2">
                {shopCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="p-2 bg-stone-50 text-left font-semibold hover:bg-stone-100 transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  onClick={() => handleCategoryClick('Combos')}
                  className="p-2 bg-amber-50 text-left font-bold text-[#825936] hover:bg-amber-100 transition-colors"
                >
                  🎁 Gift Hampers & Combos
                </button>
              </div>

              <div className="border-t border-stone-100 pt-2 space-y-2">
                <button
                  onClick={() => {
                    onNavigate('about');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1.5 font-serif text-xs font-bold uppercase tracking-wider text-stone-800 block"
                >
                  Our Botanical Heritage & Story
                </button>

                <button
                  onClick={() => {
                    onNavigate('contact');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1.5 font-serif text-xs font-bold uppercase tracking-wider text-stone-800 block"
                >
                  Contact & Studio Concierge
                </button>

                <button
                  onClick={() => {
                    onNavigate('policy', 'return-policy');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1.5 font-serif text-xs font-bold uppercase tracking-wider text-stone-800 block"
                >
                  Return Policy & Care
                </button>

                <button
                  onClick={() => {
                    onNavigate('wishlist');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faHeart} className="text-[#825936] text-xs" />
                    <span>My Saved Wishlist</span>
                  </span>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 bg-[#825936] text-white rounded-full text-[10px] font-mono font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onOpenOrders();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1.5 text-xs font-bold uppercase tracking-wider text-[#825936] block"
                >
                  My Orders & Tax Invoices
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};
