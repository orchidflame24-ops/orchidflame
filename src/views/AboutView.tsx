import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faLeaf, faFire, faAward } from '@fortawesome/free-solid-svg-icons';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-transparent text-left" id="about-view">
      
      {/* Hero Header */}
      <section className="bg-[#221D1B] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#825936]/40 bg-dark-filigree">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.35em] text-[#C29B64] font-mono block">
            Devotion · Purity · Botanical Artistry
          </span>
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-5xl font-light uppercase tracking-wider text-[#FAF7F0] break-words">
            Orchid Flame Heritage <br />
            <span className="italic font-normal">Crafted With Pure Devotion</span>
          </h1>
          <p className="text-stone-300 text-sm sm:text-base font-serif italic max-w-xl mx-auto leading-relaxed">
            Thoughtfully made products for cleaner living, sensory elevation, and meaningful social impact.
          </p>
        </div>
      </section>

      {/* Social Impact Highlight */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-botanical-wallpaper-faint border-2 border-[#825936] p-5 sm:p-12 shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="w-20 h-20 bg-white border border-[#825936] rounded-full flex items-center justify-center flex-shrink-0 text-[#825936] shadow-xs">
            <FontAwesomeIcon icon={faEye} className="text-3xl" />
          </div>
          <div className="space-y-2 flex-grow">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#825936] font-mono">
              Orchid Flame Social Mission
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              10 Products = 1 Cataract Surgery Funded
            </h2>
            <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
              We believe true luxury uplifts both the home and human dignity. With every 10 candles, reed diffusers, or botanical wax tablets purchased, Orchid Flame directly finances a life-restoring cataract surgery for underprivileged individuals across rural Indian communities. Over 5,000+ surgeries have been successfully completed to date.
            </p>
          </div>
        </div>
      </section>

      {/* Formulation Standards */}
      <section className="bg-botanical-wallpaper-faint border-y border-stone-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#825936]">
              Artisan Alchemy
            </span>
            <h2 className="font-serif text-3xl text-stone-900 font-medium">
              Our Pure Formulation Promise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                faIcon: faLeaf,
                title: "100% Biodegradable Soy Wax",
                desc: "Derived sustainably from renewable domestic soybean crops. Our wax burns cooler and up to 50% longer than commercial paraffin candles with zero black soot.",
              },
              {
                faIcon: faFire,
                title: "Lead-Free Cotton & Wooden Wicks",
                desc: "Carefully calibrated organic wicks ensure an even melting pool, stable crackle, and no toxic chemical emissions.",
              },
              {
                faIcon: faAward,
                title: "Therapeutic Botanical Oils",
                desc: "Free from parabens, phthalates, and synthetic petroleum solvents. Every fragrance is blended at optimal temperature to preserve aromatic vitality.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/95 backdrop-blur-xs border border-stone-200 p-5 sm:p-8 space-y-3 hover:border-stone-900 transition-colors shadow-xs">
                <div className="w-12 h-12 bg-stone-100 flex items-center justify-center text-[#825936]">
                  <FontAwesomeIcon icon={item.faIcon} className="text-xl" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">{item.title}</h3>
                <p className="text-stone-600 text-xs leading-relaxed font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
