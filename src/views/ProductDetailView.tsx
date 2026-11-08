import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faHeart as faHeartSolid, 
  faBagShopping, 
  faPaperPlane, 
  faChevronLeft, 
  faChevronRight,
  faFire,
  faLeaf,
  faShieldHalved,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { Product } from '../types';

interface ProductDetailViewProps {
  product: Product;
  onBackToShop: () => void;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  onBuyNow?: (product: Product, quantity: number, size?: string) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBackToShop,
  onAddToCart,
  onBuyNow,
  allProducts,
  onSelectProduct,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [addedNotification, setAddedNotification] = useState(false);

  const images = product.additionalImages && product.additionalImages.length > 0 
    ? product.additionalImages 
    : [product.image];

  const handleAddToCart = () => {
    onAddToCart(product, quantity, product.weight);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 2500);
  };

  const handleBuyNow = () => {
    if (product.inStock === false) return;
    if (onBuyNow) {
      onBuyNow(product, quantity, product.weight);
    } else {
      onAddToCart(product, quantity, product.weight);
    }
  };

  const handleDirectWhatsAppOrder = () => {
    let msg = `🌸 *ORCHID FLAME — DIRECT PRODUCT INQUIRY* 🌸\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Hello Orchid Flame! I would like to order this piece:\n\n`;
    msg += `• *Product*: ${product.name}\n`;
    msg += `• *Category*: ${product.category}\n`;
    msg += `• *Quantity*: ${quantity}\n`;
    msg += `• *Rate*: ₹${product.price} each\n`;
    msg += `• *Total Amount*: ₹${product.price * quantity}\n`;
    if (product.fragranceNotes?.top) msg += `• *Notes*: ${product.fragranceNotes.top}, ${product.fragranceNotes.heart}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Please share delivery availability and payment details. Thank you!`;

    const waUrl = `https://api.whatsapp.com/send?phone=919026006766&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const relatedProducts = allProducts
    .filter((p) => p.isVisible !== false && p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 text-left pb-12" id="product-detail-view">
      
      {/* Back to Collection Link */}
      <button
        onClick={onBackToShop}
        className="inline-flex items-center gap-2 text-stone-600 hover:text-[#825936] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        <span>Back to Collection</span>
      </button>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Gallery (Matching Image 5) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] bg-stone-100 border border-stone-200 overflow-hidden shadow-xs">
            <img
              src={images[selectedImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Wishlist toggle with FontAwesome */}
            <button
              onClick={() => onToggleWishlist && onToggleWishlist(product)}
              className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-xs text-stone-700 hover:text-[#825936] rounded-full shadow-xs flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Wishlist toggle"
            >
              <FontAwesomeIcon 
                icon={isWishlisted ? faHeartSolid : faHeartRegular} 
                className={`text-base ${isWishlisted ? 'text-[#825936]' : ''}`} 
              />
            </button>

            {/* Gallery Navigation Arrows if multiple */}
            {images.length > 1 && (
              <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                <button
                  onClick={() => setSelectedImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="w-9 h-9 rounded-full bg-white/80 text-stone-800 hover:bg-white pointer-events-auto transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <button
                  onClick={() => setSelectedImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="w-9 h-9 rounded-full bg-white/80 text-stone-800 hover:bg-white pointer-events-auto transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail row if multiple */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 border overflow-hidden transition-all cursor-pointer ${
                    selectedImageIdx === idx ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details & Authentic Specification Table (Matching Image 5) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold">
              ORCHID FLAME · {product.collectionName || product.category}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 pt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-sm sm:text-base text-stone-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                Inclusive of all taxes (18% GST)
              </span>
            </div>
          </div>

          <p className="text-stone-600 text-xs sm:text-sm font-sans leading-relaxed">
            {product.longDescription || product.description}
          </p>

          {/* Quantity Controls & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Quantity:</span>
              <div className="flex items-center border border-stone-300 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 cursor-pointer font-bold"
                >
                  -
                </button>
                <span className="px-4 font-mono text-xs font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 cursor-pointer font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {product.inStock === false ? (
                <div className="w-full py-3.5 bg-stone-300 text-stone-600 text-xs font-bold uppercase tracking-widest text-center cursor-not-allowed">
                  Currently Sold Out
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-stone-900 hover:bg-[#C29B64] text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                  <span>{addedNotification ? 'Added to Bag ✓' : 'Add to Cart'}</span>
                </button>
              )}

              <button
                onClick={handleBuyNow}
                disabled={product.inStock === false}
                className={`w-full py-3.5 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                  product.inStock === false
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#825936] hover:bg-[#6c482b] cursor-pointer'
                }`}
                title="Instant Buy Now (Directly proceeds to checkout & payment)"
              >
                <FontAwesomeIcon icon={faBolt} className="text-xs" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* AUTHENTIC SPECIFICATIONS TABLE (MATCHING REFERENCE IMAGE 5) */}
          <div className="border border-stone-200 divide-y divide-stone-200 bg-white shadow-xs text-[11px] sm:text-xs">
            
            {product.fragranceNotes?.top && (
              <>
                <div className="grid grid-cols-3 p-2.5 sm:p-3 bg-stone-50/70">
                  <span className="font-bold text-stone-900 col-span-1 break-words">Fragrance:</span>
                  <span className="text-stone-700 col-span-2 break-words">{product.name.split('(')[0].trim()}</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 sm:p-3">
                  <span className="font-bold text-stone-900 col-span-1 break-words">Top Notes:</span>
                  <span className="text-stone-700 col-span-2 break-words">{product.fragranceNotes.top}</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 sm:p-3">
                  <span className="font-bold text-stone-900 col-span-1 break-words">Heart Notes:</span>
                  <span className="text-stone-700 col-span-2 break-words">{product.fragranceNotes.heart}</span>
                </div>
                <div className="grid grid-cols-3 p-2.5 sm:p-3">
                  <span className="font-bold text-stone-900 col-span-1 break-words">Base Notes:</span>
                  <span className="text-stone-700 col-span-2 break-words">{product.fragranceNotes.base}</span>
                </div>
              </>
            )}

            {product.burnTime && (
              <div className="grid grid-cols-3 p-2.5 sm:p-3 bg-stone-50/70">
                <span className="font-bold text-stone-900 col-span-1 break-words">Burn Time:</span>
                <span className="text-stone-700 col-span-2 break-words">{product.burnTime}</span>
              </div>
            )}

            {product.weight && (
              <div className="grid grid-cols-3 p-2.5 sm:p-3">
                <span className="font-bold text-stone-900 col-span-1 break-words">Wax Weight:</span>
                <span className="text-stone-700 col-span-2 break-words">{product.weight}</span>
              </div>
            )}

            {product.noOfWicks && (
              <div className="grid grid-cols-3 p-2.5 sm:p-3 bg-stone-50/70">
                <span className="font-bold text-stone-900 col-span-1 break-words">No. of Wicks:</span>
                <span className="text-stone-700 col-span-2 break-words">{product.noOfWicks}</span>
              </div>
            )}

            {product.dimensions && (
              <div className="grid grid-cols-3 p-2.5 sm:p-3">
                <span className="font-bold text-stone-900 col-span-1 break-words">Size Dimensions:</span>
                <span className="text-stone-700 col-span-2 break-words">{product.dimensions}</span>
              </div>
            )}

            <div className="grid grid-cols-3 p-2.5 sm:p-3 bg-stone-50/70">
              <span className="font-bold text-stone-900 col-span-1 break-words">Country Of Origin:</span>
              <span className="text-stone-700 col-span-2 font-bold break-words">{product.countryOfOrigin || 'India'}</span>
            </div>

          </div>

          {/* Eco certifications with Botanical Wallpaper */}
          <div className="bg-botanical-wallpaper-faint border border-stone-200 p-4 shadow-2xs">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/95 backdrop-blur-xs border border-stone-200/80 text-[10px] font-bold uppercase tracking-wider text-stone-700 flex flex-col items-center gap-1 shadow-2xs">
                <FontAwesomeIcon icon={faLeaf} className="text-[#825936] text-xs" />
                <span>100% Pure Soy</span>
              </div>
              <div className="p-3 bg-white/95 backdrop-blur-xs border border-stone-200/80 text-[10px] font-bold uppercase tracking-wider text-stone-700 flex flex-col items-center gap-1 shadow-2xs">
                <FontAwesomeIcon icon={faFire} className="text-[#825936] text-xs" />
                <span>Lead Free Wick</span>
              </div>
              <div className="p-3 bg-white/95 backdrop-blur-xs border border-stone-200/80 text-[10px] font-bold uppercase tracking-wider text-stone-700 flex flex-col items-center gap-1 shadow-2xs">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[#825936] text-xs" />
                <span>Zero Paraffin</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-stone-200 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#825936]">
              Complementary Ambience
            </span>
            <h2 className="font-serif text-2xl font-medium text-stone-900">
              You May Also Adore
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white border border-stone-200 p-4 cursor-pointer hover:border-stone-900 transition-colors group space-y-3"
              >
                <div className="aspect-square bg-stone-100 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#825936] line-clamp-1">
                    {p.name}
                  </h4>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="font-mono text-sm font-bold text-stone-900">₹{p.price}</span>
                    <span className="text-[10px] text-stone-500 uppercase">{p.weight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
