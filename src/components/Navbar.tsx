import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, LayoutDashboard, ShoppingBag, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user, wishlist, logout, isAdmin } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-orange text-white p-2 rounded font-bold flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-white uppercase">
                THRIFTED<span className="text-brand-orange">KICKS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium uppercase tracking-wider text-[13px] transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-brand-orange'
                    : 'text-white hover:text-brand-orange'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2 text-gray-300 hover:text-brand-orange transition-colors">
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-brand-orange text-brand-orange' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-brand-orange text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-black animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 200)}
                  className="flex items-center gap-2 text-xs font-medium text-white hover:text-brand-orange focus:outline-none cursor-pointer p-2 rounded hover:bg-white/5 transition-all uppercase tracking-wider"
                >
                  <User className="w-4 h-4 text-brand-orange" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-[#121212] border border-[#262626] rounded shadow-2xl py-2 z-50 text-white"
                    >
                      <div className="px-4 py-2 border-b border-[#262626]">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold truncate text-white">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-gray-300 hover:text-white hover:bg-brand-orange/20 transition-all border-b border-[#262626]/40"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-orange" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition-all"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>

                      <Link
                        to="/sell"
                        className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition-all"
                      >
                        <Package className="w-4 h-4 text-brand-orange" />
                        Sell Shoes
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-xs uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-[13px] font-medium uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white text-[13px] font-medium uppercase tracking-wider px-4 py-1.5 rounded transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <Link to="/wishlist" className="relative p-2 text-gray-300 hover:text-brand-orange transition-colors">
              <Heart className={`w-6 h-6 ${wishlist.length > 0 ? 'fill-brand-orange text-brand-orange' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#090909]">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1f1f1f] focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile side-drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#1f1f1f] bg-[#0c0c0c] overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-brand-orange/10 text-brand-orange border-l-4 border-brand-orange'
                      : 'text-gray-300 hover:bg-[#121212] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-[#1f1f1f] space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Signed in as <span className="font-bold text-white block">{user.email}</span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10 transition-all"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-[#121212] transition-all"
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </Link>

                    <Link
                      to="/sell"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10 transition-all"
                    >
                      <Package className="w-5 h-5" />
                      Sell Shoes
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 px-3 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-center font-medium text-gray-300 hover:text-white py-2.5 rounded-lg border border-[#333] transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="text-center bg-brand-orange text-white font-bold py-2.5 rounded-lg hover:bg-brand-orange-dark transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
