import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagnifyingGlass, 
  faSliders, 
  faArrowDownShortWide, 
  faXmark, 
  faRotateRight 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopViewProps {
  products: Product[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  wishlist?: Product[];
  onToggleWishlist?: (product: Product) => void;
}

type SortOption = 'bestselling' | 'price-low-high' | 'price-high-low' | 'rating';

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  wishlist = [],
  onToggleWishlist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('bestselling');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categories: { id: string | null; name: string }[] = [
    { id: null, name: '✦ All Creations' },
    { id: 'Signature candles', name: '1. Signature candles' },
    { id: 'Premium candles', name: '2. Premium candles' },
    { id: 'Decorative candles', name: '3. Decorative candles' },
    { id: 'Ceramic candle', name: '4. Ceramic candle' },
    { id: 'Scented wax sachet', name: '5. Scented wax sachet' },
    { id: 'Mini jar combos', name: '6. Mini jar combos' },
    { id: 'Combos', name: '8. Combos' },
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    onSelectCategory(null);
    setSortBy('bestselling');
  };

  const processedProducts = useMemo(() => {
    // Only show visible products on customer storefront
    let result = products.filter((p) => p.isVisible !== false);

    if (selectedCategory) {
      const target = selectedCategory.toLowerCase().replace(/^[0-9]+\.\s*/, '').trim();
      result = result.filter((p) => {
        const pCat = p.category.toLowerCase().replace(/^[0-9]+\.\s*/, '').trim();
        return pCat === target || p.category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ingredients.some((i) => i.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestselling':
      default:
        result.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return b.rating - a.rating;
        });
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Smoothly scroll right side to top when category or search changes
  useEffect(() => {
    rightScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, searchQuery]);

  // Forward wheel scrolling from the still left sidebar to the right products container
  const handleAsideWheel = (e: React.WheelEvent<HTMLElement>) => {
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left bg-transparent" id="shop-view">
      
      {/* Centered Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Desktop Sidebar — Fixed/Still, fully visible, white luxury card panel */}
        <aside 
          onWheel={handleAsideWheel}
          className="hidden lg:flex lg:flex-col w-64 xl:w-72 flex-shrink-0 sticky top-16 lg:-mt-6 self-start z-20 bg-white border border-stone-200/90 shadow-xs p-5 sm:p-6 space-y-5 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-serif text-xs uppercase tracking-wider font-bold text-stone-900 border-b border-stone-200 pb-2">
                Search Fragrances
              </h3>
              <div className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                <input
                  type="text"
                  placeholder="Scent, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 py-2 pl-9 pr-4 text-xs font-sans text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#825936] focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xs uppercase tracking-wider font-bold text-stone-900 border-b border-stone-200 pb-2">
                Shop Categories
              </h3>
              <div className="flex flex-col space-y-1.5 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id || 'all'}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`text-left py-2 px-3 transition-colors uppercase tracking-wider text-[11px] font-bold cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {(selectedCategory || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid & Controls — Scrollable Right Column Only */}
        <div 
          ref={rightScrollRef} 
          className="flex-1 min-w-0 space-y-6 w-full lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto pr-1"
        >
          {/* Header with Candle Art Wallpaper */}
          <div className="bg-candle-wallpaper-faint border border-stone-200 p-5 sm:p-8 space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block">
              ORCHID FLAME · Fine Fragrance Boutique
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl text-stone-900 font-medium break-words">
              {selectedCategory ? `${selectedCategory} Collection` : 'The Complete Collection'}
            </h1>
            <p className="text-stone-700 text-xs sm:text-sm font-sans max-w-2xl leading-relaxed">
              Artisanal hand-poured creations made with 100% natural soy and coconut wax, pure botanical oils, and organic lead-free wicks.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-stone-300 p-3 sm:p-3.5 gap-3 shadow-xs">
            <span className="text-xs text-stone-600 font-bold self-start sm:self-auto">
              Showing <span className="font-extrabold text-stone-900">{processedProducts.length}</span> creations
            </span>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden px-3 py-1.5 border border-stone-300 hover:bg-stone-50 text-stone-800 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <FontAwesomeIcon icon={faSliders} className="text-xs" />
                <span>Filter Fragrances</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <FontAwesomeIcon icon={faArrowDownShortWide} className="text-stone-400 text-xs" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-stone-300 py-1.5 px-2.5 sm:px-3 focus:outline-none focus:border-stone-900 text-stone-800 font-sans uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                >
                  <option value="bestselling">Most Popular</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {processedProducts.length === 0 ? (
            <div className="bg-white border border-stone-300 p-12 text-center space-y-4 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-stone-800">
                No Creations Found
              </h3>
              <p className="text-stone-500 text-xs max-w-sm mx-auto">
                No scents match your current filter selections. Try searching with a different note or reset all filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#825936] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlist.some((w) => w.id === product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[85vw] max-w-xs bg-white p-5 flex flex-col h-full lg:hidden text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900">
                  Filter Scents
                </h3>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <FontAwesomeIcon icon={faXmark} className="text-base text-stone-500" />
                </button>
              </div>

              <div className="space-y-4 flex-grow overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-500">Categories</span>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id || 'all'}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setMobileFiltersOpen(false);
                        }}
                        className={`w-full text-left py-2 px-3 text-xs font-bold uppercase ${
                          selectedCategory === cat.id ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
