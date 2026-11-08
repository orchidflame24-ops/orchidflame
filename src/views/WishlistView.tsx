import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart as faHeartSolid,
  faBagShopping,
  faBolt,
  faTrashCan,
  faArrowLeft,
  faStar,
  faCheck,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface WishlistViewProps {
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onClearWishlist: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  onBuyNow: (product: Product, quantity: number, size?: string) => void;
  onContinueShopping: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onRemoveFromWishlist,
  onClearWishlist,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onContinueShopping,
}) => {
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product, 1, product.weight);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleInstantBuy = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onBuyNow(product, 1, product.weight);
  };

  const handleMoveAllToBag = () => {
    wishlist.forEach((product) => {
      if (product.inStock !== false) {
        onAddToCart(product, 1, product.weight);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] bg-candle-wallpaper-faint text-stone-900 pb-24 text-left">
      {/* 1. Header Banner */}
      <section className="border-b border-stone-200/80 bg-white/70 backdrop-blur-md pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
            <button
              onClick={onContinueShopping}
              className="hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
              <span>Back to Store</span>
            </button>
            <span>/</span>
            <span className="text-[#825936] font-semibold">Wishlist</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                Curated Sanctuary · {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} Saved
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-wide text-stone-950">
                Your Saved Wishlist
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                Personal collection of handcrafted pure soy candles and artisan botanical fragrances saved for your home or gifting.
              </p>
            </div>

            {wishlist.length > 0 && (
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleMoveAllToBag}
                  className="px-4 py-2 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                  <span>Move All to Bag</span>
                </button>
                <button
                  type="button"
                  onClick={onClearWishlist}
                  className="px-3 py-2 border border-stone-300 hover:border-red-400 hover:text-red-700 text-stone-600 text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Clear entire wishlist"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 2. Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {wishlist.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-stone-300/80 rounded-none p-10 sm:p-16 text-center max-w-2xl mx-auto my-12 shadow-sm space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#FAF5EE] border border-[#C29B64]/40 flex items-center justify-center text-[#825936] shadow-inner">
              <FontAwesomeIcon icon={faHeartSolid} className="text-3xl text-[#C29B64]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Your Wishlist is Empty
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                You haven&apos;t saved any handcrafted fragrances yet. Browse our signature soy candles, ceramic vessels, and flameless wax sachets to save your favorites.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onContinueShopping}
                className="px-8 py-3.5 bg-stone-900 hover:bg-[#825936] text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                <span>Explore Scented Candles</span>
              </button>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlist.map((product) => {
                const isAdded = addedIds[product.id];
                const isOutOfStock = product.inStock === false;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="group bg-white border border-stone-300 hover:border-stone-900 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Top Image Container */}
                    <div 
                      onClick={() => onSelectProduct(product)}
                      className="relative aspect-[4/5] bg-stone-100 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                      />

                      {/* Stock / Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        {isOutOfStock ? (
                          <span className="bg-red-800 text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                            Sold Out
                          </span>
                        ) : product.isBestSeller ? (
                          <span className="bg-stone-900 text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                            Bestseller
                          </span>
                        ) : null}
                      </div>

                      {/* Remove From Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                      </button>
                    </div>

                    {/* Info Container */}
                    <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                      <div 
                        onClick={() => onSelectProduct(product)} 
                        className="cursor-pointer space-y-1"
                      >
                        <span className="text-[10px] font-mono tracking-wider uppercase text-[#825936] font-semibold block">
                          {product.category}
                        </span>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-stone-950 line-clamp-1 group-hover:text-[#825936] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Price & Weight */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-base font-bold text-stone-950">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="font-mono text-xs text-stone-400 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-stone-500 uppercase">
                          {product.weight}
                        </span>
                      </div>

                      {/* Action Buttons: BUY NOW & ADD TO BAG */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleInstantBuy(e, product)}
                          disabled={isOutOfStock}
                          className={`py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
                            isOutOfStock
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'bg-[#825936] hover:bg-[#6c482b] text-white cursor-pointer'
                          }`}
                          title="Instant Buy Now (Skip cart drawer)"
                        >
                          <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
                          <span>Buy Now</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleAdd(e, product)}
                          disabled={isOutOfStock}
                          className={`py-2.5 px-2 border text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                            isOutOfStock
                              ? 'border-stone-200 text-stone-400 cursor-not-allowed'
                              : 'border-stone-900 hover:bg-stone-900 hover:text-white text-stone-900 cursor-pointer'
                          }`}
                        >
                          <FontAwesomeIcon icon={isAdded ? faCheck : faBagShopping} className="text-[10px]" />
                          <span>{isAdded ? 'Added ✓' : 'Add to Bag'}</span>
                        </button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 3. Artisan Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white border border-stone-200 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <span className="font-serif font-bold text-stone-900 block text-sm">100% Pure Soy Wax</span>
            <p className="text-stone-500 text-xs">Zero paraffin, clean burn, botanical therapeutic oils.</p>
          </div>
          <div className="space-y-1 sm:border-x sm:border-stone-200 sm:px-4">
            <span className="font-serif font-bold text-stone-900 block text-sm">Complimentary Delivery</span>
            <p className="text-stone-500 text-xs">Free priority air express on artisanal orders above ₹1,500.</p>
          </div>
          <div className="space-y-1">
            <span className="font-serif font-bold text-stone-900 block text-sm">Social Mission Funded</span>
            <p className="text-stone-500 text-xs">Every 10 candles fund 1 cataract surgery for rural elders.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
