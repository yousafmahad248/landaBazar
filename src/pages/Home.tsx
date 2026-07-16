import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Flame, Sparkles, Compass, ShieldCheck, RefreshCw, Send, CheckCircle2, Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const { products, categories, loading } = useApp();
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestDeals = products.filter(p => p.isBestDeal).slice(0, 4);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmailSubscribed(true);
      setEmailInput('');
    }
  };

  const reviews = [
    {
      id: 'rev-1',
      name: 'Yousaf Ali',
      role: 'Sneakerhead',
      rating: 5,
      comment: 'Thrifted Kicks exceeded my expectations! The Air Jordan Chicago I ordered was exactly in Like New condition as listed. It arrived clean, smelling fresh, and completely verified. Will definitely buy again!',
      shoeType: 'Jordan 1 Retro'
    },
    {
      id: 'rev-2',
      name: 'Hamza Khan',
      role: 'Casual Buyer',
      rating: 5,
      comment: 'Absolutely love the NB 550 green! Getting authentic leather shoes in Karachi for less than half the retail price is a dream. The deep cleaning they perform makes them feel brand new.',
      shoeType: 'New Balance 550'
    },
    {
      id: 'rev-3',
      name: 'Aisha Siddiqui',
      role: 'Fitness Enthusiast',
      rating: 4,
      comment: 'Bought a pair of Adidas Ultraboosts. Boost was clean and midsole had great bounce. Very responsive support on WhatsApp, they answered all my sizing questions within 5 minutes.',
      shoeType: 'Ultraboost 1.0'
    }
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-r from-[#111] to-[#222] px-4 sm:px-6 lg:px-8 py-20 border-b border-white/10 text-white">
        {/* Background visual graphics */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-35">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-orange-light/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          {/* Hero Left Info */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-brand-orange text-white px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 animate-pulse" /> Limited Drops • Authentic Thrift
            </div>
            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tighter leading-[0.95] text-white uppercase">
              PREMIUM <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-orange-light to-amber-500">
                THRIFTED
              </span> <br />
              KICKS.
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed font-sans">
              Curating high-quality, pre-loved and vintage shoes. Professionally deep-cleaned, restored, sanitized, and authentic. Premium brands, fractions of retail.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/shop"
                className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs px-8 py-4 rounded transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-brand-orange/20"
              >
                Browse Shop
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="text-white hover:bg-white/10 border border-white px-7 py-4 rounded uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer font-semibold"
              >
                Learn Our Process
              </Link>
            </div>
          </div>

          {/* Hero Right Graphic */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-[#1c1c1c] to-[#0c0c0c] border border-white/10 rounded-2xl p-6 flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-brand-orange/5 rounded-2xl blur-md" />
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
                alt="Air Jordan 1 Chicago"
                className="w-[90%] object-contain transform -rotate-[15deg] drop-shadow-[0_25px_35px_rgba(234,88,12,0.4)] hover:scale-105 hover:rotate-[-10deg] transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 right-6 bg-black/85 backdrop-blur-md border border-white/10 p-4 rounded shadow-xl flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-mono tracking-wider">Condition</p>
                  <p className="text-sm font-bold text-white">9.8/10 "Like New"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-gray-955">
            Shop by Category
          </h2>
          <p className="text-gray-500 text-sm font-sans">
            Choose your perfect style of premium kicks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat, idx) => {
            const icons = [
              <Sparkles className="w-6 h-6 text-brand-orange" />,
              <Compass className="w-6 h-6 text-brand-orange" />,
              <Flame className="w-6 h-6 text-brand-orange" />,
              <ShieldCheck className="w-6 h-6 text-brand-orange" />,
              <RefreshCw className="w-6 h-6 text-brand-orange" />
            ];

            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group flex flex-col items-center text-center p-6 bg-[#f8f8f8] border border-gray-100 hover:border-brand-orange/40 rounded-2xl shadow-xs transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
              >
                <div className="bg-white border border-gray-200 group-hover:bg-brand-orange/10 group-hover:border-brand-orange/20 p-4 rounded mb-4 transition-all duration-300">
                  {icons[idx % icons.length]}
                </div>
                <h3 className="font-display font-bold text-sm tracking-wide text-gray-900 group-hover:text-brand-orange transition-colors">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b border-gray-100 pb-5 mb-8">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-1.5 text-brand-orange text-xs font-mono uppercase tracking-widest font-semibold">
                <Sparkles className="w-4 h-4" /> Recommended Drops
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-gray-950">
                Featured Kicks
              </h2>
            </div>
            <Link
              to="/shop?filter=featured"
              className="group text-sm font-bold text-brand-orange flex items-center gap-1 hover:text-brand-orange-light transition-colors"
            >
              See All <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Drop */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b border-gray-100 pb-5 mb-8">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-1.5 text-brand-orange text-xs font-mono uppercase tracking-widest font-semibold">
                <Flame className="w-4 h-4" /> FRESH OFF THE SHELF
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-gray-950">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?sort=newest"
              className="group text-sm font-bold text-brand-orange flex items-center gap-1 hover:text-brand-orange-light transition-colors"
            >
              See All <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Best Deals banner and products */}
      {bestDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-orange to-amber-600 rounded-2xl p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl">
            <div className="text-left space-y-3 max-w-xl">
              <span className="bg-black text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
                HOT DEALS
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-white tracking-tight leading-tight">
                UP TO 50% OFF PREMIUM SECOND-HAND BRANDS
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Enjoy massive discounts on certified high-quality sneakers, running shoes, and boots. Limited sizes available, snooze and you lose!
              </p>
            </div>
            <Link
              to="/shop?filter=deals"
              className="bg-white hover:bg-gray-100 text-brand-orange hover:text-brand-orange-dark font-black uppercase tracking-wider text-xs px-8 py-4 rounded transition-all shrink-0 cursor-pointer shadow-lg"
            >
              Shop Best Deals
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16 border-y border-gray-100 text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-gray-955">
              Why Choose Thrifted Kicks?
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              We redefine thrifted footwear with premium quality control and unparalleled service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-gray-200/60 rounded-2xl space-y-4 hover:shadow-md transition-all">
              <div className="bg-brand-orange/10 text-brand-orange border border-brand-orange/20 p-3 rounded w-12 h-12 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900">100% Handpicked & Authentic</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our in-house shoe experts manually inspect and verify each pair of shoes for original authenticity, stitching quality, and structural health.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200/60 rounded-2xl space-y-4 hover:shadow-md transition-all">
              <div className="bg-brand-orange/10 text-brand-orange border border-brand-orange/20 p-3 rounded w-12 h-12 flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900">Deep-Cleaned & Disinfected</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every pair undergoes an extensive multi-step detailing cycle: steam cleaning, bacteria treatment, odor eradication, and outsole restoration.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200/60 rounded-2xl space-y-4 hover:shadow-md transition-all">
              <div className="bg-brand-orange/10 text-brand-orange border border-brand-orange/20 p-3 rounded w-12 h-12 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900">Eco-Friendly Sustainability</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Thrifting footwear prevents heavy carbon shoe production emissions. Look pristine, save significant money, and preserve our planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-16">
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-gray-955">
            Tested & Trusted By Buyers
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            See what actual street shoe collectors say about Thrifted Kicks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-gray-50 border border-gray-200/60 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-xs transition-all">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-black/5" />
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-brand-orange text-brand-orange' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic font-sans">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-6 border-t border-gray-200 mt-6 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-gray-900">{rev.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">{rev.role}</p>
                </div>
                <span className="text-[10px] font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                  {rev.shoeType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-black text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-orange-light/5 rounded-full blur-3xl" />

          <div className="max-w-md mx-auto space-y-3 relative z-10">
            <h3 className="font-display font-black text-xl sm:text-3xl uppercase text-white tracking-tight">
              NEVER MISS A drop
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Thrift items are one-of-a-kind. Subscribe to receive alerts for weekly drops, hot restocks, and secret coupon codes.
            </p>
          </div>

          <div className="max-w-md mx-auto relative z-10">
            {emailSubscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-sm animate-fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Awesome! You are on the VIP shoe drop notification list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-grow bg-[#111] border border-white/10 focus:border-brand-orange text-white placeholder-gray-500 text-sm rounded px-4 py-3.5 focus:outline-none transition-all font-sans"
                />
                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
