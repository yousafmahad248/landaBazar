import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { User, Phone, Mail, Edit3, Save, CheckCircle2, AlertCircle, Eye, LogOut, Clock, Heart } from 'lucide-react';
import { Product } from '../types';

export const UserProfile: React.FC = () => {
  const { user, products, recentlyViewed, logout, updateProfile } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Sync profile details to state
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
  }, [user, navigate]);

  // Resolve recently viewed products
  const viewedProducts = recentlyViewed
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => !!p);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await updateProfile(name, phone, email);
      setMessage({ type: 'success', text: 'Profile successfully updated!' });
      setIsEditing(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12 text-gray-900">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-gray-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your personal details and history drops
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 px-5 py-2.5 rounded transition-all flex items-center gap-2 text-xs uppercase tracking-wider font-bold shrink-0 cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Profile Card / Edit Details */}
        <div className="lg:col-span-4 bg-white border border-gray-200/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
            <div className="w-16 h-16 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center font-display font-black text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900">{user.name}</h2>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-brand-orange/10 text-brand-orange px-2.5 py-0.5 rounded">
                {user.isAdmin ? 'Store Admin' : 'Shoe Enthusiast'}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {message.text && (
            <div className={`p-4 rounded flex items-center gap-2.5 text-xs border ${
              message.type === 'success'
                ? 'bg-emerald-55 bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">WhatsApp Phone</label>
                <input
                  type="text"
                  placeholder="e.g., +923001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-3 border border-gray-200 hover:border-gray-400 text-gray-600 rounded text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 border border-gray-200/60 rounded">
                <Mail className="w-5 h-5 text-brand-orange" />
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-mono">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 border border-gray-200/60 rounded">
                <Phone className="w-5 h-5 text-brand-orange" />
                <div>
                  <p className="text-[10px] uppercase text-gray-500 font-mono">WhatsApp/Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{user.phone || 'Not configured yet'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-brand-orange hover:text-white border border-gray-200 hover:border-brand-orange text-gray-700 font-bold py-3.5 rounded text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile Details
              </button>
            </div>
          )}
        </div>

        {/* Recently Viewed Kicks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Clock className="w-5 h-5 text-brand-orange" />
            <h2 className="font-display font-bold text-lg text-gray-900 uppercase tracking-wider">Recently Viewed Kicks</h2>
          </div>

          {viewedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-4">
              <div className="bg-white p-3 rounded-full text-brand-orange border border-gray-200 shadow-xs">
                <Eye className="w-6 h-6" />
              </div>
              <p className="text-gray-500 text-sm max-w-xs font-sans">
                You haven't inspected any shoe details yet. Start browsing around our drop feeds!
              </p>
              <Link
                to="/shop"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded transition-colors"
              >
                Go to Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {viewedProducts.slice(0, 6).map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
