/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Wishlist } from './pages/Wishlist';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserProfile } from './pages/UserProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { SellShoes } from './pages/SellShoes';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-brand-orange selection:text-white">
          {/* Header Navigation */}
          <Navbar />

          {/* Main views stage */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/sell" element={<SellShoes />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Fallback wildcard redirect to home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Footer Navigation */}
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}
