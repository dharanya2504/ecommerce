import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiSliders, FiX, FiCheck } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('newest'); // newest, priceAsc, priceDesc
  const [inStock, setInStock] = useState(false);

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categories');
      return res.data.categories;
    },
  });

  // Handle syncing URL search params (e.g. navbar links passing category Name)
  useEffect(() => {
    const categoryNameFromUrl = searchParams.get('category');
    if (categories && categoryNameFromUrl) {
      const matchedCat = categories.find(
        (c) => c.categoryName.toLowerCase() === categoryNameFromUrl.toLowerCase()
      );
      if (matchedCat) {
        setSelectedCatId(matchedCat._id);
      } else {
        setSelectedCatId('');
      }
    } else if (!categoryNameFromUrl) {
      setSelectedCatId('');
    }
  }, [searchParams, categories]);

  // Fetch Products based on filter states
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedCatId, search, minPrice, maxPrice, inStock],
    queryFn: async () => {
      const params = {};
      if (selectedCatId) params.category = selectedCatId;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (inStock) params.inStock = true;

      const res = await axiosInstance.get('/products', { params });
      return res.data.products;
    },
  });

  // Local sort logic (since backend might not support price sorting natively)
  const getSortedProducts = () => {
    if (!productsData) return [];
    let list = [...productsData];
    if (sortBy === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  };

  const sortedProducts = getSortedProducts();

  const handleCategoryClick = (catId, catName) => {
    setSelectedCatId(catId);
    if (catId) {
      setSearchParams({ category: catName });
    } else {
      setSearchParams({});
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCatId('');
    setMinPrice(0);
    setMaxPrice(5000);
    setSortBy('newest');
    setInStock(false);
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* ─── Shop Header ─── */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl md:text-5xl font-bold tracking-wide">ATELIER CATALOGUE</h1>
        <p className="text-sm text-neutral font-light leading-relaxed">
          Carefully engineered clothing crafted with luxury minimalism, clean contours, and exceptional textures.
        </p>
      </div>

      {/* ─── Search & Sort Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-primary/5 p-4 rounded-2xl shadow-premium">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-primary/45">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search our apparel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 text-sm text-primary font-semibold py-2 px-4 border border-primary/10 rounded-xl hover:bg-background transition-colors"
          >
            <FiSliders /> Filters
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm py-2 px-4 bg-white border border-primary/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text/80"
          >
            <option value="newest">Sort: Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* ─── Desktop layout with sidebar + product grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Visible on desktop) */}
        <aside className="hidden lg:block space-y-8 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium h-fit">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
            <h3 className="font-serif text-lg font-bold text-primary">Filters</h3>
            <button
              onClick={resetFilters}
              className="text-xs text-neutral hover:text-primary transition-colors uppercase tracking-widest font-bold"
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Categories</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCategoryClick('', '')}
                className={`text-sm text-left py-1 px-2.5 rounded-lg transition-colors font-light ${
                  !selectedCatId ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-background text-text/80'
                }`}
              >
                All Collections
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat._id, cat.categoryName)}
                  className={`text-sm text-left py-1 px-2.5 rounded-lg transition-colors font-light ${
                    selectedCatId === cat._id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-background text-text/80'
                  }`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Max Price</h4>
              <span className="text-xs font-bold text-primary">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-background h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral">
              <span>₹0</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* Stock Availability */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Availability</h4>
            <label className="flex items-center gap-3 text-sm text-text/80 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 rounded border-primary/10 text-primary focus:ring-primary accent-primary"
              />
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-primary/5 rounded-3xl p-8 shadow-premium space-y-4">
              <h3 className="font-serif text-2xl font-bold text-primary">No products found</h3>
              <p className="text-sm text-neutral font-light max-w-sm mx-auto">
                No pieces match your current filters. Try relaxing filters or clearing them.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-primary/95 transition-all shadow-premium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Filter Drawer Overlay ─── */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[360px] bg-white shadow-premium z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6 overflow-y-auto pr-1">
                <div className="flex justify-between items-center border-b border-primary/5 pb-4">
                  <h3 className="font-serif text-xl font-bold text-primary">Filters</h3>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1.5 hover:bg-background text-text/70 rounded-full transition-colors"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryClick('', '')}
                      className={`text-xs px-3.5 py-2 rounded-xl transition-all font-semibold uppercase tracking-wider ${
                        !selectedCatId
                          ? 'bg-primary text-white shadow-premium'
                          : 'bg-background hover:bg-primary/5 text-text/80'
                      }`}
                    >
                      All
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat._id, cat.categoryName)}
                        className={`text-xs px-3.5 py-2 rounded-xl transition-all font-semibold uppercase tracking-wider ${
                          selectedCatId === cat._id
                            ? 'bg-primary text-white shadow-premium'
                            : 'bg-background hover:bg-primary/5 text-text/80'
                        }`}
                      >
                        {cat.categoryName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Max Price</h4>
                    <span className="text-xs font-bold text-primary">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary bg-background h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral">
                    <span>₹0</span>
                    <span>₹5,000</span>
                  </div>
                </div>

                {/* Stock Switch */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Availability</h4>
                  <label className="flex items-center gap-3 text-sm text-text/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 rounded border-primary/10 text-primary focus:ring-primary accent-primary"
                    />
                    In Stock Only
                  </label>
                </div>
              </div>

              {/* Drawer actions */}
              <div className="border-t border-primary/5 pt-6 flex gap-4">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 border border-primary/15 rounded-xl text-xs font-bold uppercase tracking-wider text-text/80 hover:bg-background transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/95 transition-all shadow-premium"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
