import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, X } from 'lucide-react';
import { Product } from '../types';

export const Shop: React.FC = () => {
  const { products, categories, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync category or predefined filters from searchParams
  useEffect(() => {
    const catId = searchParams.get('category');
    if (catId) {
      setSelectedCategory(catId);
    }

    const filterType = searchParams.get('filter');
    if (filterType === 'deals') {
      setSelectedCondition('');
      // Deals can be filtered by setting a max price or matching best deals
      setSortBy('price-asc');
    } else if (filterType === 'featured') {
      // Handled inside memoized filtration
    }

    const sortType = searchParams.get('sort');
    if (sortType === 'newest') {
      setSortBy('newest');
    }
  }, [searchParams]);

  // Extract dynamically available brands and sizes from all products to avoid static dead-ends
  const brands = useMemo(() => {
    const unique = new Set(products.map(p => p.brand));
    return Array.from(unique).sort();
  }, [products]);

  const sizes = useMemo(() => {
    const unique = new Set(products.map(p => p.size));
    return Array.from(unique).sort();
  }, [products]);

  // Handle clearing all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedSize('');
    setSelectedCondition('');
    setSelectedCategory('');
    setMaxPrice(250);
    setSortBy('newest');
    setSearchParams({});
  };

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    const filterType = searchParams.get('filter');

    return products
      .filter(product => {
        // Search filter (handles name, brand, description)
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          query === '' ||
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query);

        // Brand filter
        const matchesBrand = selectedBrand === '' || product.brand === selectedBrand;

        // Size filter
        const matchesSize = selectedSize === '' || product.size === selectedSize;

        // Condition filter
        const matchesCondition = selectedCondition === '' || product.condition === selectedCondition;

        // Category filter
        const matchesCategory = selectedCategory === '' || product.categoryId === selectedCategory;

        // Price filter
        const matchesPrice = product.price <= maxPrice;

        // Special pre-route query filters
        const matchesSpecialFilter =
          filterType === 'deals'
            ? product.isBestDeal
            : filterType === 'featured'
            ? product.isFeatured
            : true;

        return (
          matchesQuery &&
          matchesBrand &&
          matchesSize &&
          matchesCondition &&
          matchesCategory &&
          matchesPrice &&
          matchesSpecialFilter
        );
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        return 0;
      });
  }, [products, searchQuery, selectedBrand, selectedSize, selectedCondition, selectedCategory, maxPrice, sortBy, searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-900">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="text-left">
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-gray-900 tracking-tight">
            Shop Kicks
          </h1>
          <p className="text-gray-500 text-sm">
            Showing <span className="text-brand-orange font-bold font-mono">{filteredProducts.length}</span> of {products.length} pre-loved shoes
          </p>
        </div>

        {/* Search & Mobile Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sneaker models, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200/60 focus:border-brand-orange text-gray-900 text-sm pl-10 pr-4 py-3 rounded focus:outline-none transition-all font-sans"
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden bg-white border border-gray-200 text-gray-700 p-3 rounded hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center justify-center cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-gray-200/60 rounded-2xl p-6 space-y-6 sticky top-24 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="font-display font-bold text-sm tracking-wide text-gray-900 uppercase flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-orange" /> Filters
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Category</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-left text-sm py-1 px-2.5 rounded transition-colors w-full cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-brand-orange/10 text-brand-orange font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left text-sm py-1 px-2.5 rounded transition-colors w-full cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-brand-orange/10 text-brand-orange font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2.5 border-t border-gray-100 pt-4">
            <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Brand</h3>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm px-3 py-2.5 rounded focus:outline-none transition-all"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div className="space-y-2.5 border-t border-gray-100 pt-4">
            <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Shoe Size</h3>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm px-3 py-2.5 rounded focus:outline-none transition-all"
            >
              <option value="">All Sizes</option>
              {sizes.map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2.5 border-t border-gray-100 pt-4">
            <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Condition</h3>
            <div className="grid grid-cols-3 gap-2">
              {['Like New', 'Good', 'Fair'].map(cond => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(selectedCondition === cond ? '' : cond)}
                  className={`text-center text-xs py-2 rounded font-bold border transition-all cursor-pointer ${
                    selectedCondition === cond
                      ? 'bg-brand-orange/10 text-brand-orange border-brand-orange'
                      : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-gray-400 hover:text-gray-900'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase">
              <span>Max Price</span>
              <span className="text-gray-900 font-bold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-orange bg-gray-200 h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>$20</span>
              <span>$250</span>
            </div>
          </div>

          {/* Sorting */}
          <div className="space-y-2.5 border-t border-gray-100 pt-4">
            <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm px-3 py-2.5 rounded focus:outline-none transition-all"
            >
              <option value="newest">Newest Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-9 flex flex-col h-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <RefreshCw className="w-8 h-8 text-brand-orange animate-spin" />
              <p className="text-gray-500 text-sm font-mono">Fetching latest curated drops...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gray-50 border border-gray-200/60 rounded-2xl space-y-4">
              <div className="bg-white p-4 rounded-full text-brand-orange border border-gray-200 shadow-xs animate-pulse">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900">No Matching Kicks Found</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                We couldn't find any shoes matching your filters. Try selecting wider parameters or reset to search everything.
              </p>
              <button
                onClick={resetFilters}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-sm px-6 py-2.5 rounded transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS BOTTOM DRAWER MODAL */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs md:hidden animate-fade-in">
          <div className="bg-white border-t border-gray-200 w-full max-h-[85vh] rounded-t-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="font-display font-bold text-base tracking-wide text-gray-900 uppercase flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-brand-orange" /> Filters & Sort
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    resetFilters();
                    setShowMobileFilters(false);
                  }}
                  className="text-xs text-gray-400 hover:text-brand-orange transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`text-xs py-2 px-3.5 rounded border transition-all ${
                    selectedCategory === ''
                      ? 'bg-brand-orange/10 text-brand-orange border-brand-orange font-bold'
                      : 'border-gray-200 text-gray-600 bg-gray-50'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-xs py-2 px-3.5 rounded border transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-brand-orange/10 text-brand-orange border-brand-orange font-bold'
                        : 'border-gray-200 text-gray-600 bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Brand</h3>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3 py-2.5 rounded focus:outline-none"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Shoe Size</h3>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3 py-2.5 rounded focus:outline-none"
              >
                <option value="">All Sizes</option>
                {sizes.map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Condition</h3>
              <div className="grid grid-cols-3 gap-2">
                {['Like New', 'Good', 'Fair'].map(cond => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(selectedCondition === cond ? '' : cond)}
                    className={`text-center text-xs py-2 rounded font-bold border transition-all ${
                      selectedCondition === cond
                        ? 'bg-brand-orange/10 text-brand-orange border-brand-orange'
                        : 'border-gray-200 text-gray-600 bg-gray-50'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase">
                <span>Max Price</span>
                <span className="text-gray-900 font-bold">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-orange bg-gray-200 h-1.5 rounded"
              />
            </div>

            {/* Sorting */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono tracking-wider text-gray-400 uppercase">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm px-3 py-2.5 rounded focus:outline-none"
              >
                <option value="newest">Newest Drops</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded transition-all uppercase tracking-wider text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
