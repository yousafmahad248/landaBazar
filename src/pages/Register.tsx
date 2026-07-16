import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Key, Mail, User, Phone, RefreshCw, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, email, and password are required fields.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(name, email, password, phone);
      setTimeout(() => {
        navigate('/profile');
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background design accents */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-orange/5 rounded-full blur-[100px] z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-orange-light/5 rounded-full blur-[100px] z-0" />

      <div className="bg-white border border-gray-200/60 rounded-2xl p-8 max-w-md w-full shadow-sm relative z-10 text-left space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group justify-center">
            <div className="bg-brand-orange text-white p-2 rounded font-bold flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-gray-900">
              THRIFTED<span className="text-brand-orange">KICKS</span>
            </span>
          </Link>
          <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wide text-gray-900 pt-2">
            CREATE ACCOUNT
          </h2>
          <p className="text-gray-500 text-xs">
            Join the community to track favorite kicks and drops.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded text-red-600 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-brand-orange" /> Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Yousaf Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-brand-orange" /> Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g., shoehead@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-brand-orange" /> WhatsApp/Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g., +923001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-brand-orange" /> Password *
            </label>
            <input
              type="password"
              required
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-6"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Redirect */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-orange font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
