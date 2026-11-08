import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRotateRight,
  faFire,
  faTruckFast,
  faLeaf,
  faCircleQuestion,
  faShieldHalved,
  faFileContract,
  faClock,
  faTriangleExclamation,
  faCheckCircle,
  faLightbulb,
  faCamera,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';

export type PolicyTab =
  | 'return-policy'
  | 'candle-care'
  | 'shipping-policy'
  | 'ingredients'
  | 'faq'
  | 'privacy-policy'
  | 'terms';

interface PolicyViewProps {
  activeTab?: PolicyTab;
  onTabChange?: (tab: PolicyTab) => void;
  onBackToHome?: () => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({
  activeTab = 'return-policy',
  onTabChange,
  onBackToHome,
}) => {
  const tabs: { id: PolicyTab; label: string; icon: any }[] = [
    { id: 'return-policy', label: 'Return & Refund Policy', icon: faRotateRight },
    { id: 'candle-care', label: 'Candle Care Guide', icon: faFire },
    { id: 'shipping-policy', label: 'Shipping Policy', icon: faTruckFast },
    { id: 'ingredients', label: 'Artisan Ingredients', icon: faLeaf },
    { id: 'faq', label: 'Frequently Asked Questions', icon: faCircleQuestion },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: faShieldHalved },
    { id: 'terms', label: 'Terms of Service', icon: faFileContract },
  ];

  const handleSelectTab = (tab: PolicyTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-left" id="policy-view">
      {/* Top Banner */}
      <section className="bg-[#221D1B] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#825936]/40 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="text-stone-300 hover:text-white text-xs uppercase tracking-widest font-mono flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Return to Home</span>
              </button>
            )}
          </div>
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.35em] text-[#C29B64] font-mono block">
            Orchid Flame · Artisan Candle Standards
          </span>
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-wide text-[#FAF7F0] break-words">
            Customer Care & Policies
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm font-serif italic max-w-xl mx-auto leading-relaxed">
            Handcrafted luxury made with devotion. Transparent policies, artisanal guidance, and dedicated support for every patron.
          </p>
        </div>
      </section>

      {/* Main Container with Sidebar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Policy Navigation Tabs (Desktop Left Sticky Sidebar & Mobile Horizontal Scroll) */}
          <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-28 bg-white border border-stone-200/90 shadow-xs p-4 sm:p-5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block px-2 pb-1 font-mono">
              Policy & Care Directory
            </span>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 scrollbar-none pb-1 lg:pb-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold tracking-wider transition-all whitespace-nowrap lg:whitespace-normal cursor-pointer text-left flex-shrink-0 lg:w-full ${
                      isActive
                        ? 'bg-[#1C1917] text-white shadow-xs font-bold'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={tab.icon}
                      className={`text-xs flex-shrink-0 ${isActive ? 'text-[#C29B64]' : 'text-stone-400'}`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Contact Badge in Sidebar */}
            <div className="hidden lg:block pt-4 mt-4 border-t border-stone-100 text-xs text-stone-600 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Direct Assistance
              </span>
              <p className="text-[11px] text-stone-500 leading-snug">
                Need urgent help with an order? Reach our customer concierge team directly:
              </p>
              <div className="space-y-1.5 pt-1">
                <a
                  href="http://wa.me/919026006766"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-mono text-[11px] font-bold"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                  <span>+91 90260 06766</span>
                </a>
                <a
                  href="https://www.instagram.com/orchidflame_candles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-700 hover:text-pink-800 text-[11px] font-bold"
                >
                  <FontAwesomeIcon icon={faInstagram} className="text-sm" />
                  <span>@orchidflame_candles</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Detail Content Panel */}
          <main className="flex-1 min-w-0 w-full bg-white border border-stone-200/90 shadow-xs p-4 sm:p-10 lg:p-12">
            
            {/* 1. RETURN & REFUND POLICY (EXACT USER SPECIFIED POLICY) */}
            {activeTab === 'return-policy' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-stone-200 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                    Orchid Flame Scented Candles
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-semibold">
                    Return & Refund Policy
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    We take immense pride in handcrafting every candle, wax sachet, and aroma creation. Because our items are made-to-order, we have specific guidelines, and we do make exceptions in the cases outlined below.
                  </p>
                </div>

                {/* Damaged or Broken Products */}
                <div className="space-y-3 p-5 sm:p-6 bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 text-stone-900 font-serif text-lg font-bold">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 text-base" />
                    <h3>Damaged or Broken Products:</h3>
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    If your order arrives damaged or broken, we're here to make it right.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-700 list-disc list-inside pl-1">
                    <li>We offer a replacement for damaged products after verification</li>
                    <li>Customers must share clear unboxing photos or a video as proof</li>
                    <li>This must be reported within 24 hours of delivery</li>
                  </ul>

                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                    <FontAwesomeIcon icon={faLightbulb} className="text-amber-600 text-base mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Recommendation: </span>
                      We strongly recommend recording your unboxing — especially for fragile or gifting orders — so any damage in transit can be verified quickly.
                    </div>
                  </div>
                </div>

                {/* Wrong Item Received */}
                <div className="space-y-3 p-5 sm:p-6 bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 text-stone-900 font-serif text-lg font-bold">
                    <FontAwesomeIcon icon={faCamera} className="text-[#825936] text-base" />
                    <h3>Wrong Item Received:</h3>
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    If you receive the wrong product, or an item that does not match your order, we will arrange a replacement of the correct item at no additional cost. Please report the issue within 24 hours of delivery with a clear photo of the item received.
                  </p>
                </div>

                {/* Refunds */}
                <div className="space-y-3 p-5 sm:p-6 bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 text-stone-900 font-serif text-lg font-bold">
                    <FontAwesomeIcon icon={faRotateRight} className="text-stone-800 text-base" />
                    <h3>Refunds:</h3>
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    As most of our products are handmade and made-to-order, we prefer to resolve issues through replacements or store credit rather than payment refunds.
                  </p>
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    Refunds, if applicable, are processed only in special cases after review and at the discretion of Orchid Flame. If approved, refunds will be credited back to the original payment method within 5–7 business days.
                  </p>
                </div>

                {/* Reporting Window */}
                <div className="space-y-3 p-5 sm:p-6 bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 text-stone-900 font-serif text-lg font-bold">
                    <FontAwesomeIcon icon={faClock} className="text-[#825936] text-base" />
                    <h3>Reporting Window:</h3>
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    All issues — including damage, wrong items, or any other concerns — must be reported within 24 hours of delivery along with supporting photos or video proof. Requests raised after this window may not be accepted.
                  </p>
                </div>

                {/* Non-Eligible Cases */}
                <div className="space-y-3 p-5 sm:p-6 bg-red-50/50 border border-red-200/70">
                  <div className="flex items-center gap-2 text-red-950 font-serif text-lg font-bold">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-700 text-base" />
                    <h3>Non-Eligible Cases:</h3>
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm">
                    The following are not eligible for returns, replacements, or refunds:
                  </p>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700 list-disc list-inside pl-1">
                    <li>Change of mind after order is placed</li>
                    <li>Slight variations in colour, texture, or appearance — as these are natural characteristics of handmade products</li>
                    <li>Damage caused after delivery</li>
                    <li>Issues reported after the 24-hour window</li>
                  </ul>
                </div>

                {/* How to Reach Us */}
                <div className="space-y-4 p-6 sm:p-8 bg-[#FAF8F5] border-2 border-[#825936]">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#825936] font-mono">
                      Priority Resolution Concierge
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-bold">
                      How to Reach Us:
                    </h3>
                  </div>
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    To report an issue, reach out to us on{' '}
                    <a
                      href="http://wa.me/919026006766"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-800 underline hover:text-emerald-950"
                    >
                      WhatsApp (+91 90260 06766)
                    </a>{' '}
                    or{' '}
                    <a
                      href="https://www.instagram.com/orchidflame_candles"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-pink-700 underline hover:text-pink-900"
                    >
                      Instagram DM (@orchidflame_candles)
                    </a>{' '}
                    within 24 hours of receiving your order. Please include:
                  </p>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-stone-800 list-disc list-inside pl-2 font-medium">
                    <li>Your order details</li>
                    <li>Clear photos or an unboxing video</li>
                    <li>A brief description of the issue</li>
                  </ul>
                  <p className="text-stone-600 text-xs sm:text-sm italic">
                    We'll get back to you as quickly as possible and work towards a resolution.
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-3">
                    <a
                      href="http://wa.me/919026006766"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors text-center"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="text-sm flex-shrink-0" />
                      <span>Message on WhatsApp</span>
                    </a>
                    <a
                      href="https://www.instagram.com/orchidflame_candles"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors text-center"
                    >
                      <FontAwesomeIcon icon={faInstagram} className="text-sm flex-shrink-0" />
                      <span>Message on Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CANDLE CARE GUIDE */}
            {activeTab === 'candle-care' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-stone-200 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                    Artisan Maintenance
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-semibold">
                    The Complete Candle Care & Safety Guide
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    Maximise burn longevity, achieve a clean soot-free flame, and care for your handcrafted vessels with our master tips.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                      <span className="w-6 h-6 rounded-full bg-[#825936] text-white flex items-center justify-center text-xs">1</span>
                      <h4>The Crucial Memory Burn</h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      On the very first lighting, allow your candle to burn continuously for 3 to 4 hours until the melted wax pool reaches all the way to the edges of the jar. Soy wax has a memory: this prevents tunneling and ensures an even, flat surface for subsequent burns.
                    </p>
                  </div>

                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                      <span className="w-6 h-6 rounded-full bg-[#825936] text-white flex items-center justify-center text-xs">2</span>
                      <h4>Trim Wick Before Every Light</h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Always trim your cotton wick to 1/4 inch (6mm) before relighting. A trimmed wick prevents mushrooming, excessive flickering, black smoke, and keeps the vessel clean.
                    </p>
                  </div>

                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                      <span className="w-6 h-6 rounded-full bg-[#825936] text-white flex items-center justify-center text-xs">3</span>
                      <h4>Safe Placement & Drafts</h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Burn your candle on a stable, flat, heat-resistant surface away from open windows, ceiling fans, curtains, pets, and small children. Drafts cause uneven burning and smoking.
                    </p>
                  </div>

                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
                      <span className="w-6 h-6 rounded-full bg-[#825936] text-white flex items-center justify-center text-xs">4</span>
                      <h4>Extinguishing with Care</h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Use a brass candle snuffer or wick dipper rather than blowing out the flame. This eliminates hot wax splatter and prevents smoke from compromising your room's fragrance ambience.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-stone-100/70 border border-stone-300 space-y-3">
                  <h4 className="font-serif font-bold text-stone-900 text-base">
                    Scented Wax Sachet & Ceramic Care
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    Hang wax sachets in wardrobes, linen closets, or cars away from direct harsh sunlight and temperatures above 45°C. To refresh scent throw after several months, gently scrape the back surface of the wax tablet with a coin.
                  </p>
                </div>
              </div>
            )}

            {/* 3. SHIPPING POLICY */}
            {activeTab === 'shipping-policy' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-stone-200 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                    Pan-India Delivery
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-semibold">
                    Shipping & Delivery Policy
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    Carefully packed in eco-friendly honeycomb and shock-resistant cushioning to reach you in flawless condition.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
                    <h4 className="font-bold text-stone-900">Processing & Handcrafting Time</h4>
                    <p>Every product is hand-poured in small artisanal batches. Orders are processed, quality checked, and dispatched within 24 to 48 business hours.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
                    <h4 className="font-bold text-stone-900">Delivery Timelines</h4>
                    <p>Metro cities: 2 to 4 business days. Rest of India: 4 to 6 business days. Express shipping updates and AWB tracking links are shared directly to your registered WhatsApp number.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
                    <h4 className="font-bold text-stone-900">Complimentary Free Delivery</h4>
                    <p>We provide complimentary express delivery on all orders above ₹1,500 across India. Standard orders incur a flat ₹79 shipping fee.</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
                    <h4 className="font-bold text-stone-900">Transit Inspection & Damage Reporting</h4>
                    <p>Remember to record an unboxing video upon receipt! Any transit damage or missing item must be reported within 24 hours of delivery on WhatsApp or Instagram DM with clear evidence.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. INGREDIENTS */}
            {activeTab === 'ingredients' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-stone-200 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                    Botanical Purity
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-semibold">
                    Ingredients & Formulation Standards
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    Clean, non-toxic, and therapeutic formulation crafted with respect for nature.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#825936] block">Wax Base</span>
                    <h4 className="font-serif font-bold text-stone-900">100% Pure Soy & Coconut Wax</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Zero paraffin, zero petroleum derivatives. Completely biodegradable, soot-free burn that holds essential oil molecules stably and burns up to 50% longer than traditional waxes.
                    </p>
                  </div>

                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#825936] block">Aromatic Concentrates</span>
                    <h4 className="font-serif font-bold text-stone-900">Therapeutic Botanical Essential Oils</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Cold-pressed botanical extracts and IFRA-certified fine fragrance oils free of phthalates, parabens, and synthetic dyes for a clean olfactory experience.
                    </p>
                  </div>

                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#825936] block">Wick Composition</span>
                    <h4 className="font-serif font-bold text-stone-900">Organic Lead-Free Cotton & Wood</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Braided with pure unbleached cotton threads and paper filaments, or FSC-certified natural crackling wood wicks that release zero heavy metals or lead into your living room.
                    </p>
                  </div>

                  <div className="p-5 bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#825936] block">Ethics</span>
                    <h4 className="font-serif font-bold text-stone-900">Cruelty-Free & Reusable Vessels</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Never tested on animals. Once your candle finishes, vessels are effortlessly cleaned with warm water and soap to become tea light holders, planters, or desk organizers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-stone-200 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                    Help & Clarity
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-semibold">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: 'How do I report a damaged or broken candle?',
                      a: 'Simply message us on WhatsApp (+91 90260 06766) or Instagram DM (@orchidflame_candles) within 24 hours of delivery. Include your order ID, clear photos or an unboxing video, and we will immediately arrange a replacement after review.',
                    },
                    {
                      q: 'Why is an unboxing video strongly recommended?',
                      a: 'Because candles and ceramic vessels are fragile handmade goods, an unboxing video ensures instant verification with our courier partners so we can dispatch your replacement without delay.',
                    },
                    {
                      q: 'Can I customize gift hampers for weddings or corporate events?',
                      a: 'Yes! We specialize in bespoke gift hampers, personalized labels, and custom fragrance blends for weddings, festivities, and corporate gifting. Contact our studio via WhatsApp or Instagram.',
                    },
                    {
                      q: 'What is the Cataract Surgery Social Impact mission?',
                      a: 'With every 10 candles or diffuser creations purchased, Orchid Flame finances 1 life-changing cataract surgery for underprivileged elders in rural India. Over 5,000+ surgeries completed.',
                    },
                    {
                      q: 'Are your candles safe around pets and children?',
                      a: 'Our candles use non-toxic soy wax and lead-free wicks. While clean burning, all burning candles should be kept out of reach of pets and children and never left unattended.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-stone-50 border border-stone-200 space-y-1.5">
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[#825936] text-xs flex-shrink-0" />
                        <span>{item.q}</span>
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed pl-5">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PRIVACY POLICY */}
            {activeTab === 'privacy-policy' && (
              <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed animate-fadeIn">
                <div className="border-b border-stone-200 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                    Data Protection
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-semibold">
                    Privacy Policy
                  </h2>
                </div>
                <p>
                  At Orchid Flame, we value the privacy and trust of our patrons. This policy details how we collect, store, and safeguard your personal details when you interact with our boutique.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">Information We Collect</h4>
                <p>
                  When you place an order, create a profile, or request support, we collect your name, shipping address, contact phone number, email address, and order transaction records. We never store payment card credentials or UPI PINs.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">How We Use Your Data</h4>
                <p>
                  Your details are utilized strictly to generate your GST Tax Invoice, coordinate dispatch with verified courier services, provide order tracking updates via WhatsApp, and deliver concierge support.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">Third-Party Disclosure</h4>
                <p>
                  We do not sell, rent, or trade your personal data to any external marketing agencies. Data is shared exclusively with necessary logistics partners (e.g. Bluedart, Delhivery) solely for delivery execution.
                </p>
              </div>
            )}

            {/* 7. TERMS OF SERVICE */}
            {activeTab === 'terms' && (
              <div className="space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed animate-fadeIn">
                <div className="border-b border-stone-200 pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block mb-1">
                    Terms & Conditions
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-semibold">
                    Terms of Service
                  </h2>
                </div>
                <p>
                  Welcome to Orchid Flame. By accessing our platform and placing orders, you agree to comply with and be bound by the following terms and conditions.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">Handcrafted Goods Disclaimer</h4>
                <p>
                  Every Orchid Flame candle and wax creation is uniquely hand-poured. Slight variations in frosting, colour tone, or botanical placement are inherent hallmarks of authentic soy wax craft and are not defects.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">Pricing & GST Invoicing</h4>
                <p>
                  All prices listed on the storefront are in Indian Rupees (INR) inclusive of applicable goods and services taxes. Official computer-generated GST tax invoices are provided with every completed order.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">Governing Law</h4>
                <p>
                  These terms are governed by the laws of India. Any disputes arising in connection with orders shall be subject to the exclusive jurisdiction of the competent courts in India.
                </p>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
