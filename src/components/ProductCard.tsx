import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, user } = useApp();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const isSold = product.stockStatus === 'Sold';

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.imageUrls.length > 1) {
      setCurrentImageIdx(prev => (prev + 1) % product.imageUrls.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.imageUrls.length > 1) {
      setCurrentImageIdx(prev => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product.id);
    } catch (err: any) {
      alert(err.message || 'Please log in to add items to your wishlist.');
    }
  };

  // Color mappings for conditions
  const conditionColors = {
    'Like New': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Good': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Fair': 'bg-blue-50 text-blue-700 border border-blue-200'
  };

  return (
    <div
      className="group bg-[#f8f8f8] border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-orange/40 transition-all duration-300 flex flex-col h-full text-gray-950"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIdx(0);
      }}
    >
      {/* Image Gallery Container */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          {product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[currentImageIdx]}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 font-mono text-xs">
              NO IMAGE
            </div>
          )}
        </Link>

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="font-display font-black text-2xl tracking-widest text-brand-orange uppercase border-2 border-brand-orange px-4 py-1.5 rounded-md rotate-[-8deg] shadow-lg">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Deal badge */}
        {product.isBestDeal && !isSold && (
          <div className="absolute top-3 left-3 bg-brand-orange text-white font-display font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm z-10 shadow-md">
            DEAL
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white hover:text-brand-orange border border-white/10 backdrop-blur-xs transition-all duration-200 z-20 cursor-pointer"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-brand-orange text-brand-orange' : 'text-gray-300'}`}
          />
        </button>

        {/* Image Sliding Controls on Hover */}
        {isHovered && product.imageUrls.length > 1 && !isSold && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-brand-orange border border-white/10 transition-colors z-20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-brand-orange border border-white/10 transition-colors z-20 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Slider dots indicator */}
        {product.imageUrls.length > 1 && !isSold && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-20">
            {product.imageUrls.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentImageIdx ? 'w-4 bg-brand-orange' : 'w-1.5 bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand & Condition row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-mono tracking-wider text-gray-500 uppercase">{product.brand}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${conditionColors[product.condition]}`}>
            {product.condition}
          </span>
        </div>

        {/* Shoe Name */}
        <Link to={`/product/${product.id}`} className="block hover:text-brand-orange transition-colors">
          <h3 className="font-display font-bold text-base tracking-tight text-gray-950 line-clamp-1 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Size Badge */}
        <div className="mb-4">
          <span className="text-xs text-gray-600 bg-white border border-gray-200 rounded px-2.5 py-1 font-mono">
            Size: <span className="font-bold text-gray-900">{product.size}</span>
          </span>
        </div>

        {/* Pricing and view details */}
        <div className="mt-auto pt-4 border-t border-gray-200/60 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-display font-black text-gray-950">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-mono">${product.originalPrice}</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-mono font-semibold">
              {isSold ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="flex items-center gap-1.5 bg-white hover:bg-brand-orange hover:text-white border border-gray-200 hover:border-brand-orange text-gray-700 hover:shadow-xs text-xs font-bold px-3.5 py-2 rounded-lg transition-all duration-200 transform group-hover:translate-x-0.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};
