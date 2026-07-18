import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Key, Mail, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      const loggedInUser = await login(email, password);
      console.log('✅ Login successful!');
      
      if (loggedInUser.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
            WELCOME BACK
          </h2>
          <p className="text-gray-500 text-xs">
            Enter your credentials to manage your profile and drops.
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
              <Mail className="w-3.5 h-3.5 text-brand-orange" /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g., shoehead@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3.5 focus:outline-none transition-all font-sans"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-brand-orange" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3.5 pr-12 focus:outline-none transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-6"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'Log In To Account'
            )}
          </button>
        </form>

        {/* Redirect */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-orange font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* Developer test credentials helper */}
        <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl text-[11px] space-y-1">
          <p className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">Developer Test Accounts:</p>
          <div className="text-gray-600 font-mono flex flex-col gap-0.5">
            <p>👨‍💼 <span className="text-gray-900 font-semibold">Admin:</span> admin@thriftedkicks.com / admin123</p>
            <p>👟 <span className="text-gray-900 font-semibold">General:</span> Register any new account instantly!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
