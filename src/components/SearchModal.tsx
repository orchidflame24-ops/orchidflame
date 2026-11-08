import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  products?: Product[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products = PRODUCTS,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleProducts = products.filter((p) => p.isVisible !== false);
  const results = query.trim()
    ? visibleProducts.filter((p) => {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.collectionName?.toLowerCase().includes(q) ||
        p.ingredients.some((i) => i.toLowerCase().includes(q))
      );
    })
    : visibleProducts.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 pt-8 sm:pt-20 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 shadow-2xl rounded-none sm:rounded-md overflow-hidden text-left my-auto sm:my-0">

        {/* Search Input */}
        <div className="p-3 sm:p-4 border-b border-stone-200 flex items-center gap-2.5 sm:gap-3 bg-stone-50">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-stone-400 text-sm flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search candles, diffusers, notes like Sandalwood..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs sm:text-sm font-sans bg-transparent focus:outline-none text-stone-900 placeholder-stone-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer flex-shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Results */}
        <div className="p-3.5 sm:p-5 max-h-96 overflow-y-auto space-y-3.5 sm:space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#825936] block">
            {query.trim() ? `Search Results (${results.length})` : 'Popular Fragrances'}
          </span>

          {results.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              No fragrances matching "{query}". Try searching for Sandal, Saffron, Rose, or Diffuser.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex gap-3 p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 cursor-pointer transition-colors group"
                >
                  <div className="w-14 h-14 bg-stone-200 overflow-hidden flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-104 transition-transform" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between overflow-hidden">
                    <div>
                      <h4 className="font-serif text-xs font-bold text-stone-900 truncate group-hover:text-[#825936]">
                        {product.name}
                      </h4>
                      <span className="text-[10px] text-stone-500 block truncate">
                        {product.category} · {product.weight}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-stone-900">₹{product.price}</span>
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
