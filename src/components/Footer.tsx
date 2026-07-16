import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-500 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-brand-orange text-white p-2 rounded-lg font-bold flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-gray-900">
                THRIFTED<span className="text-brand-orange">KICKS</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Premium second-hand (landa/thrifted) kicks, curated for style, cleanliness, and durability. Bringing you premium brands at fractions of retail.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-brand-orange transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand-orange transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand-orange transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-display font-bold uppercase tracking-wider text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-brand-orange transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-brand-orange transition-colors">Shop All Shoes</Link></li>
              <li><Link to="/about" className="hover:text-brand-orange transition-colors">About Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-brand-orange transition-colors">Contact Support</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-orange transition-colors">My Wishlist</Link></li>
            </ul>
          </div>

          {/* Support / Policies */}
          <div>
            <h3 className="text-gray-900 font-display font-bold uppercase tracking-wider text-sm mb-4">Customer Care</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about#sizing" className="hover:text-brand-orange transition-colors">Sizing Guide</Link></li>
              <li><Link to="/contact#faq" className="hover:text-brand-orange transition-colors">FAQs & Help</Link></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Terms & Conditions</a></li>
              <li><span className="flex items-center gap-1.5 text-brand-orange text-xs font-semibold uppercase tracking-widest mt-4">
                <ShieldCheck className="w-4 h-4" /> 100% Authentic & Washed
              </span></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-gray-900 font-display font-bold uppercase tracking-wider text-sm mb-4">Contact us</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">Light House Market, Karachi, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-orange flex-shrink-0" />
                <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-orange transition-colors">
                  +92 300 1234567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-orange flex-shrink-0" />
                <a href="mailto:support@thriftedkicks.com" className="text-gray-600 hover:text-brand-orange transition-colors">
                  support@thriftedkicks.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; 2026 Thrifted Kicks. All rights reserved.</p>
          <p className="flex items-center gap-1 text-gray-500">
            Premium Thrifted Shoes, cleaned & polished with premium craftsmanship.
          </p>
        </div>
      </div>
    </footer>
  );
};
