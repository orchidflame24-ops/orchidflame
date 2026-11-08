import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faXmark, faTrash, faBagShopping } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#FAF8F5] border-l border-stone-200 shadow-2xl flex flex-col h-full text-left"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FontAwesomeIcon icon={faHeart} className="text-[#825936] text-base flex-shrink-0" />
                <h2 className="font-serif text-sm sm:text-base text-stone-900 font-bold uppercase tracking-wider sm:tracking-widest truncate">
                  Saved Wishlist ({wishlist.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer flex-shrink-0"
              >
                <FontAwesomeIcon icon={faXmark} className="text-base" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-3">
              {wishlist.length === 0 ? (
                <div className="bg-botanical-wallpaper-faint border border-stone-200/80 p-8 text-center space-y-4 my-8 shadow-2xs">
                  <div className="w-16 h-16 bg-white border border-[#825936]/30 rounded-full flex items-center justify-center mx-auto text-[#825936] shadow-xs">
                    <FontAwesomeIcon icon={faHeart} className="text-xl" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Your Wishlist is Empty</h3>
                  <p className="text-stone-600 text-xs max-w-xs mx-auto">
                    Save your favorite seasonal candles and reed diffusers by clicking the heart icon on any product.
                  </p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-stone-200 p-3.5 flex gap-3.5 relative hover:border-stone-400 transition-colors"
                  >
                    <div
                      onClick={() => {
                        onSelectProduct(item);
                        onClose();
                      }}
                      className="w-16 h-16 overflow-hidden bg-stone-100 flex-shrink-0 cursor-pointer"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-grow flex flex-col justify-between pr-6 min-w-0">
                      <div
                        onClick={() => {
                          onSelectProduct(item);
                          onClose();
                        }}
                        className="cursor-pointer min-w-0"
                      >
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 hover:text-[#825936] break-words">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-stone-500 block truncate">
                          {item.category} · {item.weight}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900 flex-shrink-0">
                          ₹{item.price}
                        </span>

                        <button
                          onClick={() => {
                            onAddToCart(item, 1, item.weight);
                            onRemoveFromWishlist(item.id);
                          }}
                          className="px-2.5 sm:px-3 py-1 bg-stone-900 hover:bg-[#C29B64] text-white text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0"
                        >
                          <FontAwesomeIcon icon={faBagShopping} className="text-[10px] flex-shrink-0" />
                          <span>Move to Bag</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromWishlist(item.id)}
                      className="absolute top-3 right-3 text-stone-400 hover:text-red-700 p-1 cursor-pointer transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
