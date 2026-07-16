import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlist, products, user } = useApp();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] text-gray-900">
      {/* Header */}
      <div className="text-left border-b border-gray-100 pb-6 mb-10">
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-gray-900 tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-brand-orange fill-brand-orange" /> My Wishlist
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {user ? `Saved shoes of ${user.name}` : 'Your personal saved kicks drop collection'}
        </p>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-6">
          <div className="bg-white p-4 rounded-full text-brand-orange border border-gray-200 shadow-xs">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-gray-900">Save Your Favorite Kicks</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Please sign in to your Thrifted Kicks account to sync your favorite shoes across your devices.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded transition-all"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      ) : wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-5">
          <div className="bg-white p-4 rounded-full text-brand-orange border border-gray-200 shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-gray-900">Your Wishlist is Empty</h3>
            <p className="text-gray-500 text-sm max-w-sm font-sans">
              See a pair you love? Save them here before someone else grabs them. Thrifted shoes are one-of-a-kind drops!
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded transition-all"
          >
            Start Thrifting
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {wishlistedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
