import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircleQuestion, 
  faXmark, 
  faTruckFast, 
  faShieldHalved, 
  faRotateRight, 
  faEnvelope,
  faTriangleExclamation,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { PolicyTab } from '../views/PolicyView';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePolicy?: (tab: PolicyTab) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onNavigatePolicy }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border-0 sm:border border-stone-200 shadow-2xl rounded-none sm:rounded-md overflow-hidden my-auto h-full sm:h-auto sm:max-h-[90vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="bg-[#825936] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FontAwesomeIcon icon={faCircleQuestion} className="text-amber-200 text-sm flex-shrink-0" />
            <h3 className="font-serif text-xs sm:text-base font-bold tracking-wider sm:tracking-widest uppercase text-white truncate">
              Customer Support & Concierge
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-100 hover:text-white rounded transition-colors cursor-pointer flex-shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6 text-xs text-stone-700">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="http://wa.me/919026006766"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-emerald-50 border border-emerald-200 flex items-center gap-3 hover:bg-emerald-100 transition-colors group"
            >
              <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
              </div>
              <div>
                <span className="font-bold text-emerald-900 block text-xs">WhatsApp Concierge</span>
                <span className="text-[11px] text-emerald-700 font-mono">+91 90260 06766</span>
              </div>
            </a>

            <a
              href="https://www.instagram.com/orchidflame_candles?igsh=dXUxNzB0bmJwazVt&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-pink-50 border border-pink-200 flex items-center gap-3 hover:bg-pink-100 transition-colors group"
            >
              <div className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <FontAwesomeIcon icon={faInstagram} className="text-lg" />
              </div>
              <div>
                <span className="font-bold text-pink-900 block text-xs">Instagram DM</span>
                <span className="text-[11px] text-pink-700">@orchidflame_candles</span>
              </div>
            </a>
          </div>

          {/* Return & Replacement Quick Notice */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-700" />
              <span>Damaged or Broken in Transit?</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              We offer a replacement for damaged or wrong products after verification! Please share clear unboxing photos or a video within <strong>24 hours of delivery</strong> on WhatsApp or Instagram DM.
            </p>
            {onNavigatePolicy && (
              <button
                onClick={() => {
                  onClose();
                  onNavigatePolicy('return-policy');
                }}
                className="text-[11px] text-[#825936] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer pt-1"
              >
                <span>Read Full Return & Care Policy</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </button>
            )}
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1.5">
              Frequently Asked Questions
            </h4>

            <div className="space-y-2.5">
              <div className="bg-stone-50 p-3.5 border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTruckFast} className="text-[#825936] text-xs" />
                  <span>How does order dispatch and delivery work?</span>
                </p>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  All candles are hand-poured in artisanal batches and dispatched within 24–48 hours. Orders reach within 2 to 6 business days with live tracking shared to your WhatsApp. Free delivery on orders above ₹1,500.
                </p>
              </div>

              <div className="bg-stone-50 p-3.5 border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[#825936] text-xs" />
                  <span>What makes Orchid Flame candles clean burning?</span>
                </p>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  We use 100% natural, biodegradable soy and coconut wax with organic lead-free cotton wicks, ensuring a soot-free burn with no toxic fumes or petroleum paraffin.
                </p>
              </div>

              <div className="bg-stone-50 p-3.5 border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faRotateRight} className="text-[#825936] text-xs" />
                  <span>What is the Cataract Surgery Social Impact mission?</span>
                </p>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Every 10 candle or reed diffuser purchases directly fund 1 life-changing cataract restoration surgery for elders in rural communities. Over 5,000+ surgeries supported.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
          <a
            href="mailto:orchidflame24@gmail.com"
            className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span>orchidflame24@gmail.com</span>
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-[#825936] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
