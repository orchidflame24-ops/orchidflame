import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid, faBagShopping, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 1, product.weight);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group cursor-pointer flex flex-col justify-between text-left bg-white border border-stone-300 hover:border-stone-900 transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.inStock === false ? (
            <span className="bg-red-800 text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 shadow-xs">
              Out of Stock
            </span>
          ) : (
            <>
              {product.isBestSeller && (
                <span className="bg-stone-900 text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                  Bestseller
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-[#825936] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                  New Arrival
                </span>
              )}
            </>
          )}
        </div>

        {/* FontAwesome Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-xs text-stone-700 hover:text-[#825936] transition-colors rounded-full shadow-xs flex items-center justify-center cursor-pointer"
          aria-label="Save to Wishlist"
        >
          <FontAwesomeIcon 
            icon={isWishlisted ? faHeartSolid : faHeartRegular} 
            className={`text-sm ${isWishlisted ? 'text-[#825936]' : ''}`} 
          />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {product.inStock === false ? (
            <div className="w-full py-2.5 bg-stone-800/90 text-stone-300 text-[11px] font-sans font-bold uppercase tracking-widest flex items-center justify-center shadow-md">
              Sold Out
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-2.5 bg-stone-900/95 hover:bg-[#C29B64] text-white text-[11px] font-sans font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <FontAwesomeIcon icon={justAdded ? faCheck : faBagShopping} className="text-xs" />
              <span>{justAdded ? 'Added ✓' : 'Add to Bag'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex-grow flex flex-col justify-between min-w-0">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <span className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-[#825936] font-semibold block truncate">
            {product.category} {product.collectionName ? `· ${product.collectionName}` : ''}
          </span>
          <h3 className="font-serif text-xs sm:text-base font-bold text-stone-900 line-clamp-1 group-hover:text-[#825936] transition-colors break-words">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-stone-500 line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>
        </div>

        {/* Price & Weight Row */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-mono text-xs sm:text-base font-bold text-stone-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-[10px] sm:text-xs text-stone-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-stone-500 uppercase tracking-wider truncate">
            {product.weight}
          </span>
        </div>
      </div>
    </div>
  );
};
