import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, MessageCircle, ShieldCheck, Sparkles, AlertCircle, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, wishlist, toggleWishlist, addToRecentlyViewed } = useApp();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch product on id change
  useEffect(() => {
    if (id) {
      setLoading(true);
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setActiveImageIdx(0);
        addToRecentlyViewed(id); // Log to recently viewed
      }
      setLoading(false);
    }
  }, [id, products]);

  const isWishlisted = product ? wishlist.includes(product.id) : false;
  const isSold = product ? product.stockStatus === 'Sold' : false;

  // Filter related products of same brand or same category (excluding current)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id && (p.brand === product.brand || p.categoryId === product.categoryId))
      .slice(0, 4);
  }, [product, products]);

  const handleWishlist = async () => {
    if (!product) return;
    try {
      await toggleWishlist(product.id);
    } catch (err: any) {
      alert(err.message || 'Please log in to manage your wishlist.');
    }
  };

  const handleWhatsAppChat = () => {
    if (!product) return;

    const phone = '+923001234567'; // Default store phone number
    const message = `Assalam-o-Alaikum, I am interested in buying this shoe:
👟 *${product.name}*
🏷️ *Brand:* ${product.brand}
📏 *Size:* ${product.size}
✨ *Condition:* ${product.condition}
💰 *Price:* $${product.price}

Is it still available?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw className="w-8 h-8 text-brand-orange animate-spin" />
        <p className="text-gray-500 font-mono text-xs">Inspecting curated sole details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-6 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Product not found or has been removed.</span>
        </div>
        <Link
          to="/shop"
          className="inline-block bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded transition-all"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const conditionColors = {
    'Like New': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Good': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Fair': 'bg-blue-50 text-blue-700 border border-blue-200'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 text-gray-900">
      {/* Product Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Images Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] bg-gray-50 border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
            {product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-gray-400 font-mono text-xs">NO IMAGE</span>
            )}

            {/* Sold Badge Overlay */}
            {isSold && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-10">
                <span className="font-display font-black text-3xl tracking-widest text-brand-orange uppercase border-2 border-brand-orange px-6 py-2.5 rounded rotate-[-8deg] shadow-lg bg-white">
                  SOLD OUT
                </span>
              </div>
            )}

            {/* Image Slider Gallery arrows */}
            {product.imageUrls.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx(prev => (prev - 1 + product.imageUrls.length) % product.imageUrls.length)}
                  className="absolute left-4 p-2.5 rounded bg-white hover:bg-brand-orange border border-gray-200/60 text-gray-700 hover:text-white transition-colors z-20 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIdx(prev => (prev + 1) % product.imageUrls.length)}
                  className="absolute right-4 p-2.5 rounded bg-white hover:bg-brand-orange border border-gray-200/60 text-gray-700 hover:text-white transition-colors z-20 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail row */}
          {product.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-[4/3] bg-gray-50 border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    idx === activeImageIdx
                      ? 'border-brand-orange ring-1 ring-brand-orange/30'
                      : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Detailed specs and Buy action */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Brand & Condition row */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-sm tracking-wider text-brand-orange uppercase font-bold">
              {product.brand}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded ${conditionColors[product.condition]}`}>
              {product.condition} Condition
            </span>
          </div>

          {/* Product Name */}
          <h1 className="font-display font-black text-2xl sm:text-4xl text-gray-900 tracking-tight leading-tight uppercase">
            {product.name}
          </h1>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 py-2 border-y border-gray-100">
            <span className="text-3xl font-display font-black text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-base text-gray-400 line-through font-mono">${product.originalPrice}</span>
                <span className="text-xs bg-brand-orange/10 text-brand-orange border border-brand-orange/20 px-2 py-0.5 rounded font-bold">
                  Save ${product.originalPrice - product.price}
                </span>
              </>
            )}
          </div>

          {/* Availability details */}
          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200/60 rounded font-mono">
              <span className="text-gray-500">Availability:</span>
              <span className={isSold ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                {isSold ? 'Out of Stock (SOLD)' : 'In Stock (1 Pair Left)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200/60 rounded font-mono">
              <span className="text-gray-500">Shoe Size:</span>
              <span className="text-gray-900 font-black bg-white px-3 py-1 rounded border border-gray-200">
                {product.size}
              </span>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xs uppercase text-gray-400 tracking-wider">Details & Condition Notes</h3>
            <p className="text-gray-700 text-sm leading-relaxed font-sans bg-gray-50 p-4 rounded border border-gray-200/60">
              {product.description}
            </p>
          </div>

          {/* Quality check guidelines */}
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded space-y-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4.5 h-4.5" /> Thrifted Kicks Certified Clean
            </span>
            <p className="text-gray-600 leading-relaxed font-sans">
              Manually scrubbed, high-temp steam sterilized, deodorized, and treated with UV sanitization prior to delivery. Feel secure sliding right in.
            </p>
          </div>

          {/* Actions: WhatsApp Chat & Wishlist toggle */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleWhatsAppChat}
              disabled={isSold}
              className={`flex-grow flex items-center justify-center gap-2.5 text-white font-bold py-4 px-6 rounded transition-all shadow-lg text-sm cursor-pointer ${
                isSold
                  ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 hover:scale-[1.01]'
              }`}
            >
              <MessageCircle className="w-5.5 h-5.5" />
              Chat on WhatsApp
            </button>

            <button
              onClick={handleWishlist}
              className={`p-4 rounded border transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                  : 'bg-white border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-950'
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-brand-orange text-brand-orange' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Related Products drop */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-gray-100 text-left">
          <div className="flex items-center gap-1.5 text-brand-orange text-xs font-mono uppercase tracking-widest font-semibold mb-3">
            <Sparkles className="w-4 h-4" /> COMPLEMENTARY DROPS
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-gray-900 mb-8">
            Related Shoes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
