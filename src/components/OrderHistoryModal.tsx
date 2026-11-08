import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faXmark, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onViewInvoice,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('orchid_flame_orders');
        if (saved) {
          setOrders(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to parse orders from localStorage', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-0 sm:border border-stone-200 shadow-2xl rounded-none sm:rounded-md overflow-hidden my-auto h-full sm:h-auto sm:max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-stone-800 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FontAwesomeIcon icon={faBagShopping} className="text-[#C29B64] text-xs sm:text-sm flex-shrink-0" />
            <h3 className="font-serif text-xs sm:text-base font-bold tracking-wider sm:tracking-widest uppercase text-white truncate">
              My Orders & Tax Invoices
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded transition-colors cursor-pointer flex-shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-grow space-y-4 text-left">
          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <FontAwesomeIcon icon={faBagShopping} className="text-stone-300 text-3xl mx-auto block" />
              <h4 className="font-serif text-lg font-bold text-stone-700">No Orders Found</h4>
              <p className="text-stone-500 text-xs max-w-xs mx-auto">
                You haven't placed any candle reservations yet. Discover our artisanal collections!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-stone-50 border border-stone-200 p-4 space-y-3 hover:border-stone-900 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-stone-900">Order #{ord.id}</span>
                      <span className="text-[10px] text-stone-500 block font-mono">
                        Invoice: {ord.invoiceNumber} · {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        ord.paymentMethod === 'upi' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {ord.paymentMethod === 'upi' ? 'UPI Paid' : 'Cash On Delivery'}
                      </span>
                      <span className="font-mono font-bold text-sm text-[#825936]">
                        ₹{ord.grandTotal}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-700">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span className="font-mono text-stone-500">₹{item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                    <span className="text-[10px] text-stone-500">
                      Deliver to: {ord.address.city}, {ord.address.pincode}
                    </span>

                    <button
                      onClick={() => onViewInvoice(ord)}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-[#C29B64] text-white text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faFileLines} className="text-xs" />
                      <span>View Tax Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
