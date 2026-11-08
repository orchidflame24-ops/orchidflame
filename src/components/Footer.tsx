import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faCircleQuestion,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { 
  faWhatsapp, 
  faInstagram, 
  faYoutube, 
  faXTwitter 
} from '@fortawesome/free-brands-svg-icons';
import { PolicyTab } from '../views/PolicyView';

interface FooterProps {
  onNavigate: (view: 'home' | 'shop' | 'about' | 'contact' | 'profile' | 'policy', subTab?: PolicyTab) => void;
  onSelectCategory: (category: string | null) => void;
  onOpenOrders?: () => void;
  onOpenHelp?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onSelectCategory,
  onOpenOrders,
  onOpenHelp,
  onOpenAdmin,
}) => {
  const handleCategoryLink = (catId: string) => {
    onNavigate('shop');
    onSelectCategory(catId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageLink = (view: 'home' | 'shop' | 'about' | 'contact' | 'profile' | 'policy', tab?: PolicyTab) => {
    onNavigate(view, tab);
    if (view === 'shop') onSelectCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-stone-400 text-left pt-16 pb-12 border-t border-stone-900" id="footer">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-16">
        
        {/* Top 3-Column Minimal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 items-start">
          
          {/* Column 1: Brand & Follow Us */}
          <div className="space-y-6">
            <h2 
              onClick={() => handlePageLink('home')}
              className="text-2xl sm:text-3xl font-bold tracking-[0.25em] text-white uppercase font-sans cursor-pointer hover:text-stone-200 transition-colors inline-block"
            >
              ORCHID FLAME
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed font-sans max-w-sm">
              Artisanal hand-poured soy scented candles, fluted glass creations, and botanical fragrances. Made with pure devotion by Orchid Flame.
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold tracking-widest text-stone-500 uppercase block">
                FOLLOW US
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/orchidflame_candles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-stone-800 hover:border-white text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Instagram @orchidflame_candles"
                  title="Instagram @orchidflame_candles"
                >
                  <FontAwesomeIcon icon={faInstagram} className="text-sm" />
                </a>

                <a
                  href="http://wa.me/919026006766"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-stone-800 hover:border-white text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="WhatsApp Concierge"
                  title="WhatsApp Concierge (+91 90260 06766)"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-stone-800 hover:border-white text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="YouTube"
                >
                  <FontAwesomeIcon icon={faYoutube} className="text-sm" />
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-stone-800 hover:border-white text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="X / Twitter"
                >
                  <FontAwesomeIcon icon={faXTwitter} className="text-sm" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <div className="inline-block border-b border-stone-700 pb-1.5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white font-sans">
                QUICK LINKS
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-400 font-sans">
              <li>
                <button
                  onClick={onOpenOrders}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My Orders & Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageLink('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Our story
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageLink('policy', 'candle-care')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Candle Care
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageLink('policy', 'faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageLink('policy', 'return-policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageLink('policy', 'shipping-policy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageLink('policy', 'ingredients')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ingredients
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Get In Touch */}
          <div className="space-y-4">
            <div className="inline-block border-b border-stone-700 pb-1.5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white font-sans">
                GET IN TOUCH
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-stone-400 font-sans">
              <a
                href="http://wa.me/919026006766"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-sm text-stone-400" />
                <span className="font-mono">+91 90260 06766</span>
              </a>

              <a
                href="https://www.instagram.com/orchidflame_candles"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faInstagram} className="text-xs text-stone-400" />
                <span>@orchidflame_candles</span>
              </a>

              <a
                href="mailto:orchidflame24@gmail.com"
                className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faEnvelope} className="text-xs text-stone-400" />
                <span>orchidflame24@gmail.com</span>
              </a>

              <button
                onClick={() => handlePageLink('policy', 'faq')}
                className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors cursor-pointer text-left"
              >
                <FontAwesomeIcon icon={faCircleQuestion} className="text-xs text-stone-400" />
                <span>Visit our Help Centre & Policies</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Minimal Copyright & Policies Bar */}
        <div className="pt-8 border-t border-stone-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-stone-500">
          
          <div className="space-y-1.5">
            <div>
              &copy; {new Date().getFullYear()} <span className="font-bold text-stone-300 uppercase">ORCHID FLAME</span>. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
              <button onClick={() => handlePageLink('policy', 'privacy-policy')} className="hover:text-stone-300 cursor-pointer">Privacy policy</button>
              <span>·</span>
              <button onClick={() => handlePageLink('policy', 'return-policy')} className="hover:text-stone-300 cursor-pointer">Refund policy</button>
              <span>·</span>
              <button onClick={() => handlePageLink('policy', 'shipping-policy')} className="hover:text-stone-300 cursor-pointer">Shipping policy</button>
              <span>·</span>
              <button onClick={() => handlePageLink('contact')} className="hover:text-stone-300 cursor-pointer">Contact information</button>
              <span>·</span>
              <button onClick={() => handlePageLink('policy', 'terms')} className="hover:text-stone-300 cursor-pointer">Terms of service</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] uppercase font-bold tracking-wider sm:tracking-widest text-stone-500 self-start md:self-auto">
            <span>PAYMENT METHODS:</span>
            <span className="text-stone-400">UPI · Instant Online Payments</span>
            
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-stone-600 hover:text-stone-400 ml-2 transition-colors cursor-pointer"
                title="Admin Portal (ocfl)"
              >
                <FontAwesomeIcon icon={faLock} className="text-[10px]" />
              </button>
            )}
          </div>

        </div>

      </div>
    </footer>
  );
};
