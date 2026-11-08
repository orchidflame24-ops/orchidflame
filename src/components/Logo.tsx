import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'color' | 'gold' | 'white' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = 'w-9 h-9 sm:w-11 sm:h-11',
  showText = true,
  variant = 'dark',
}) => {
  const isWhite = variant === 'white';
  const isGold = variant === 'gold';

  return (
    <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 select-none group cursor-pointer text-left">
      {/* Uploaded Circular Artwork Logo Emblem */}
      <div className={`relative ${className} rounded-full overflow-hidden flex-shrink-0 shadow-xs border ${
        isWhite ? 'border-amber-200/40' : 'border-[#C29B64]/60'
      }`}>
        <img
          src="/orchid-flame-logo.png"
          alt="Orchid Flame Logo"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-serif text-[10px] xs:text-[11.5px] sm:text-base lg:text-lg font-bold tracking-[0.08em] xs:tracking-[0.13em] sm:tracking-[0.2em] uppercase leading-tight whitespace-nowrap ${
            isWhite ? 'text-white' : isGold ? 'text-[#C29B64]' : 'text-stone-900 group-hover:text-[#825936]'
          } transition-colors`}>
            ORCHID FLAME
          </span>
          <span className={`text-[6px] xs:text-[7px] sm:text-[8.5px] tracking-[0.16em] xs:tracking-[0.24em] sm:tracking-[0.35em] uppercase font-sans font-semibold whitespace-nowrap ${
            isWhite ? 'text-stone-300' : isGold ? 'text-[#a8824f]' : 'text-[#825936]'
          }`}>
            Scented Candles
          </span>
        </div>
      )}
    </div>
  );
};
