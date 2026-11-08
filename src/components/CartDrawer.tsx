import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBagShopping, 
  faXmark, 
  faTrash, 
  faPlus, 
  faMinus, 
  faLock, 
  faArrowRight, 
  faShieldHalved 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, UserProfile } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, size?: string) => void;
  onRemoveItem: (productId: string, size?: string) => void;
  onProceedToCheckout: () => void;
  user?: UserProfile | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  user,
}) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1500;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
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
            id="cart-drawer"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBagShopping} className="text-[#825936] text-base" />
                <h2 className="font-serif text-base text-stone-900 font-bold uppercase tracking-widest">
                  Shopping Bag ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                aria-label="Close Cart"
              >
                <FontAwesomeIcon icon={faXmark} className="text-base" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="bg-botanical-wallpaper-faint border border-stone-200/80 p-8 rounded-none flex flex-col items-center justify-center my-8 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 bg-white border border-[#825936]/30 rounded-full flex items-center justify-center shadow-xs text-[#825936]">
                    <FontAwesomeIcon icon={faBagShopping} className="text-xl" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg text-stone-900 font-semibold">
                      Your bag is empty
                    </h3>
                    <p className="text-stone-600 text-xs max-w-xs leading-relaxed">
                      Discover our handcrafted Orchid Flame candle pieces to invite beautiful aromas into your space.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-stone-900 hover:bg-[#C29B64] text-white text-xs tracking-widest uppercase font-semibold transition-all duration-200 cursor-pointer shadow-md"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                <>
                  {/* Shipping Progress */}
                  <div className="bg-white border border-stone-200 p-3.5 text-xs text-stone-700 space-y-2">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        ✨ Congratulations! You unlocked Free Express Shipping!
                      </span>
                    ) : (
                      <div>
                        <span>Add <b>₹{freeShippingThreshold - subtotal}</b> more for <b>Free Delivery</b></span>
                        <div className="w-full bg-stone-100 h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-[#C29B64] h-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={`${item.product.id}-${item.selectedSize || 'default'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-white border border-stone-200 p-3.5 flex gap-3.5 relative hover:border-stone-400 transition-colors shadow-xs"
                      >
                        <div className="w-16 h-16 overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-grow flex flex-col justify-between pr-6 min-w-0">
                          <div className="min-w-0">
                            <h4 className="font-serif text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 break-words">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-stone-500 block truncate">
                              {item.product.category} · {item.product.weight || 'Standard Size'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center border border-stone-300 bg-stone-50">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                                className="px-2 py-1 text-stone-600 hover:bg-stone-200 cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-[10px]" />
                              </button>
                              <span className="px-2 font-mono text-xs font-bold text-stone-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                                className="px-2 py-1 text-stone-600 hover:bg-stone-200 cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                              </button>
                            </div>

                            <span className="font-mono text-sm font-bold text-stone-900">
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          className="absolute top-3 right-3 text-stone-400 hover:text-red-700 p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-stone-200 bg-white space-y-4 flex-shrink-0">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-stone-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="font-mono font-bold text-stone-900">
                      {shipping === 0 ? <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span> : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span>GST (18% inclusive)</span>
                    <span className="font-mono">₹{Math.round((subtotal - subtotal / 1.18) * 100) / 100}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-2 flex justify-between font-serif text-base font-bold text-stone-950">
                    <span>Total Payable</span>
                    <span className="font-mono text-lg text-[#825936]">₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full py-3.5 sm:py-4 px-3 bg-stone-900 hover:bg-[#C29B64] text-white text-xs tracking-wider sm:tracking-widest uppercase font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg text-center"
                  id="checkout-drawer-btn"
                >
                  <FontAwesomeIcon icon={faLock} className="text-xs flex-shrink-0" />
                  <span className="truncate">{!user ? 'Sign In & Proceed to Checkout' : 'Proceed to Checkout'}</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs ml-1 flex-shrink-0" />
                </button>

                {!user && (
                  <p className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200/80 p-2 text-center rounded">
                    🔒 Sign in or login is required to place an order.
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-stone-500 font-sans text-center leading-tight">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[#C29B64] text-xs flex-shrink-0" />
                  <span>Instant UPI Online Payment · Official WhatsApp Confirmation</span>
                </div>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
