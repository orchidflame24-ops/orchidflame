import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faFire,
  faWind,
  faLeaf,
  faDroplet,
  faRecycle,
  faEye,
  faCreditCard,
  faShieldHalved,
  faStar,
  faSpa,
  faCompass
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { PRODUCTS, CATEGORIES_CONFIG } from '../data/products';
import { ProductCard } from '../components/ProductCard';

interface HomeViewProps {
  onNavigate: (view: 'home' | 'shop' | 'about' | 'contact') => void;
  onSelectCategory: (category: string | null) => void;
  bestSellers: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  wishlist?: Product[];
  onToggleWishlist?: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectCategory,
  bestSellers,
  onSelectProduct,
  onAddToCart,
  wishlist = [],
  onToggleWishlist,
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleExploreCategory = (catId: string | null) => {
    onSelectCategory(catId);
    onNavigate('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newArrivalsCollections = [
    {
      title: 'Lavender Bliss',
      subtitle: 'Lotus Ceramic Candle where fragrance meets art',
      image: '/products/lavender-bliss-ceramic.jpg',
      categoryId: 'Ceramic candle',
    },
    {
      title: 'The Rose Bloom',
      subtitle: 'Luxury lotus ceramic candle with golden detailing & rose petals',
      image: '/products/the-rose-bloom-ceramic.jpg',
      categoryId: 'Ceramic candle',
    },
    {
      title: 'Floral Whispers',
      subtitle: 'Exclusive 2-pot ceramic candle set with matching display tray',
      image: '/products/floral-whispers-set.jpg',
      categoryId: 'Ceramic candle',
    },
    {
      title: 'Black Orchid',
      subtitle: 'Enchanting floral fragrance in frosted glass with cork lid',
      image: '/products/black-orchid.jpg',
      categoryId: 'Signature candles',
    },
    {
      title: 'Malay Chandan',
      subtitle: 'Timeless essence of pure chandan, hand-poured with love',
      image: '/products/malay-chandan.png',
      categoryId: 'Signature candles',
    },
    {
      title: 'Shahi Oud',
      subtitle: 'Distinctly royal agarwood & warm oriental luxury',
      image: '/products/shahi-oud.png',
      categoryId: 'Signature candles',
    },
    {
      title: 'Citrus Blush',
      subtitle: 'Zesty, fresh & uplifting botanical happiness',
      image: '/products/citrus-blush.png',
      categoryId: 'Signature candles',
    },
  ];

  const visibleCarouselItems = useMemo(() => {
    const total = newArrivalsCollections.length;
    const items = [];
    for (let i = 0; i < Math.min(4, total); i++) {
      items.push(newArrivalsCollections[(carouselIndex + i) % total]);
    }
    return items;
  }, [carouselIndex]);

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % newArrivalsCollections.length);
  };

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => (prev === 0 ? newArrivalsCollections.length - 1 : prev - 1));
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-transparent" id="home-view">

      {/* 1. HERO BANNER (MATCHING REFERENCE IMAGE 1: TRANSFORM YOUR SPACE INTO PARADISE) */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center bg-[#221D1B] text-white overflow-hidden">

        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-crimson-candle.png"
            alt="Orchid Flame Scented Candles"
            className="w-full h-full object-cover object-center brightness-85 scale-102 transition-transform duration-1000"
          />
          {/* Subtle Warm Gradient Overlay with Luxury Damask Touch */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#171413]/95 via-[#221D1B]/55 to-transparent" />
        </div>

        {/* Hero Left Content Banner */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-24">
          <div className="max-w-xl text-left space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[9px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.35em] text-[#C29B64] font-bold font-serif flex items-center gap-1.5 sm:gap-2 flex-wrap"
            >
              <FontAwesomeIcon icon={faFire} className="text-[#C29B64]" />
              <span>ORCHID FLAME · FESTIVE 2026 COLLECTION</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-light tracking-wide uppercase leading-tight text-[#FAF7F0]"
            >
              Transform Your Space <br />
              <span className="font-normal italic">Into Paradise</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-stone-200 text-xs sm:text-base font-serif italic max-w-md leading-relaxed"
            >
              Designed to evoke beauty for the festive season. Hand-poured into fluted glass and antique brass vessels infused with pure botanical essential oils.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => handleExploreCategory('Signature candles')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-[#C29B64] hover:bg-[#a8824f] text-white text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg smooth-hover text-center"
              >
                <span>Shop Signature Candles</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </button>
            </motion.div>

          </div>
        </div>

      </section>

      {/* 2. CATEGORIES SECTION (MATCHING REFERENCE IMAGE 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-stone-200 pb-6 text-left">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium tracking-tight">
              Categories
            </h2>
          </div>

          <p className="text-stone-600 font-serif italic text-sm sm:text-base sm:max-w-xs self-start sm:self-auto">
            Refined fragrance for modern living.
          </p>

          <button
            onClick={() => handleExploreCategory(null)}
            className="px-6 py-2.5 bg-[#C29B64] hover:bg-[#a8824f] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors self-start sm:self-auto cursor-pointer"
          >
            Shop All
          </button>
        </div>

        {/* Categories: Top 4 Columns & Bottom 3 Centered */}
        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: Top 4 Categories */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES_CONFIG.slice(0, 4).map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.35 }}
                onClick={() => handleExploreCategory(cat.id)}
                className="group cursor-pointer flex flex-col text-left space-y-2.5 sm:space-y-3"
              >
                {/* Category Image Box */}
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden border border-stone-200 relative shadow-xs">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Title & Underline Link */}
                <div className="space-y-1">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#825936] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="inline-block text-xs font-sans font-semibold text-stone-800 border-b border-stone-800 pb-0.5 group-hover:text-[#825936] group-hover:border-[#825936] transition-colors">
                    Shop Now
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Row 2: Bottom 3 Categories (Centered Horizontally) */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {CATEGORIES_CONFIG.slice(4).map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx + 4) * 0.05, duration: 0.35 }}
                onClick={() => handleExploreCategory(cat.id)}
                className="group cursor-pointer flex flex-col text-left space-y-2.5 sm:space-y-3 w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
              >
                {/* Category Image Box */}
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden border border-stone-200 relative shadow-xs">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Title & Underline Link */}
                <div className="space-y-1">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#825936] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="inline-block text-xs font-sans font-semibold text-stone-800 border-b border-stone-800 pb-0.5 group-hover:text-[#825936] group-hover:border-[#825936] transition-colors">
                    Shop Now
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </section>

      {/* BOTANICAL HERITAGE ARTISAN STRIP (USING CANDLE ART WALLPAPER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-candle-wallpaper-faint border border-stone-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
          <div className="space-y-1.5 text-left max-w-xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#825936] block">
              Pure Botanical Alchemy
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium tracking-tight">
              Hand-Poured With Organic Botanicals & Pure Soy
            </h3>
            <p className="text-stone-700 text-xs sm:text-sm font-sans leading-relaxed">
              Every Orchid Flame vessel is thoughtfully layered with pure botanicals, unbleached cotton wicks, and sustainably harvested plant waxes for clean, soot-free indulgence.
            </p>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS CAROUSEL (MATCHING REFERENCE IMAGE 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-stone-200 pb-6 text-left">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium tracking-tight">
              New Arrivals
            </h2>
          </div>

          <p className="text-stone-600 font-serif italic text-sm sm:text-base sm:max-w-sm self-start sm:self-auto">
            Discover new scents designed to refresh your space and mind.
          </p>

          <button
            onClick={() => handleExploreCategory(null)}
            className="px-6 py-2.5 bg-[#C29B64] hover:bg-[#a8824f] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors self-start sm:self-auto cursor-pointer"
          >
            Shop All
          </button>
        </div>

        {/* Carousel Grid with Round Arrow Navigation Buttons */}
        <div className="relative">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleCarouselItems.map((col, index) => (
              <motion.div
                key={`${col.title}-${index}`}
                onClick={() => handleExploreCategory(col.categoryId)}
                className="group cursor-pointer flex flex-col text-left space-y-3"
              >
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden border border-stone-200 relative shadow-xs">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#825936] transition-colors line-clamp-1">
                    {col.title}
                  </h3>
                  <span className="inline-block text-xs font-sans font-semibold text-stone-800 border-b border-stone-800 pb-0.5 group-hover:text-[#825936] group-hover:border-[#825936] transition-colors">
                    Shop Now
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Left / Right Carousel Arrow Buttons with FontAwesome Icons */}
          <div className="hidden lg:flex justify-between absolute top-1/2 -left-4 -right-4 -translate-y-1/2 pointer-events-none">
            <button
              onClick={handlePrevCarousel}
              className="w-10 h-10 rounded-full bg-white border border-stone-300 shadow-md flex items-center justify-center text-stone-700 hover:bg-stone-50 hover:text-stone-950 pointer-events-auto transition-colors cursor-pointer"
              aria-label="Previous slide"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </button>

            <button
              onClick={handleNextCarousel}
              className="w-10 h-10 rounded-full bg-white border border-stone-300 shadow-md flex items-center justify-center text-stone-700 hover:bg-stone-50 hover:text-stone-950 pointer-events-auto transition-colors cursor-pointer"
              aria-label="Next slide"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
          </div>

        </div>

      </section>

      {/* 4. BRAND PURPOSE CARE BADGES (MATCHING REFERENCE IMAGE 4) */}
      <section className="bg-botanical-wallpaper-faint border-y border-stone-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">

          {/* Header Title */}
          <div className="space-y-2">
            <h2 className="font-serif text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-medium tracking-wide uppercase text-[#825936] break-words">
              CRAFTED WITH CARE. CREATED WITH PURPOSE.
            </h2>
            <p className="font-serif italic text-xs sm:text-base text-stone-600 max-w-xl mx-auto">
              Thoughtfully made products for cleaner living and positive impact
            </p>
          </div>

          {/* 7 Circular Line Badges with FontAwesome & Pure Line Art */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 items-start">
            {[
              {
                title: '100% SOY WAX',
                faIcon: faLeaf,
              },
              {
                title: 'LEAD FREE WICK',
                faIcon: faFire,
              },
              {
                title: 'PURE PREMIUM FRAGRANCE OILS',
                faIcon: faDroplet,
              },
              {
                title: 'PARAFFIN FREE',
                faIcon: faSpa,
              },
              {
                title: 'REUSABLE JARS',
                faIcon: faRecycle,
              },
              {
                title: '5000+ SURGERIES COMPLETED',
                faIcon: faEye,
              },
              {
                title: 'SECURED PAYMENTS',
                faIcon: faShieldHalved,
              },
            ].map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2 group w-[calc(50%-0.75rem)] xs:w-[calc(33.33%-0.75rem)] sm:w-28 lg:w-32">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 border-stone-800 border-dashed p-1 flex items-center justify-center group-hover:border-[#825936] transition-colors bg-white shadow-xs">
                  <div className="w-full h-full rounded-full border border-stone-800 flex items-center justify-center text-stone-800 group-hover:text-[#825936] transition-colors">
                    <FontAwesomeIcon icon={badge.faIcon} className="text-lg sm:text-2xl" />
                  </div>
                </div>
                <h4 className="text-[9.5px] sm:text-[11px] font-bold uppercase tracking-normal sm:tracking-wider text-stone-900 leading-tight max-w-[105px] sm:max-w-[110px] break-words">
                  {badge.title}
                </h4>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. BESTSELLERS SHELF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-stone-200 pb-6 text-left">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#825936] block mb-1">
              Highly Coveted
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium tracking-tight">
              Signature Bestsellers
            </h2>
          </div>
          <button
            onClick={() => handleExploreCategory(null)}
            className="px-6 py-2.5 bg-stone-900 hover:bg-[#C29B64] text-white text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto cursor-pointer"
          >
            View All Creations
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              isWishlisted={wishlist.some((w) => w.id === prod.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* 7. CUSTOMER DEVOTION STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-botanical-wallpaper-faint border border-stone-200 p-8 sm:p-12 shadow-xs">
          <div className="text-center mb-10 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#825936]">
              Devotee Testimonials
            </span>
            <h2 className="font-serif text-3xl text-stone-900 font-medium">
              Adored Across Sanctuary Living
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                quote: "The Heirloom Candle Set in Aqua is pure magic. It smells exactly like an ultra-luxury retreat. The triple wicks crackle with such refined elegance.",
                author: "Ananya Kapoor",
                city: "New Delhi",
              },
              {
                quote: "Zero soot and incredible fragrance projection! The Paradise Fluted Amber candle transformed our festive dinner gathering. The glass vessel is a keepsake.",
                author: "Rahul Mehta",
                city: "Mumbai",
              },
              {
                quote: "The botanical wax sachets are gorgeous! My entire wardrobe smells of orange blossoms and cinnamon. Orchid Flame's natural purity is unmatched.",
                author: "Diya Roy",
                city: "Bangalore",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/95 backdrop-blur-xs border border-stone-200 p-6 sm:p-8 flex flex-col justify-between space-y-4 shadow-xs">
                <p className="font-serif italic text-stone-700 text-xs sm:text-sm leading-relaxed">
                  "{item.quote}"
                </p>
                <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-xs font-bold text-stone-900">{item.author}</h4>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider">{item.city}</span>
                  </div>
                  <div className="flex text-amber-500 text-xs gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
