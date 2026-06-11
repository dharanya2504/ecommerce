import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiShield, FiRotateCcw, FiArrowRight, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { ProductDetailsSkeleton } from '../components/Skeleton';
import { cartStart, cartSuccess, cartFailure } from '../store/cartSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Fetch Product Details
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/products/${id}`);
      return res.data.product;
    },
    onSuccess: (data) => {
      // Auto-select first size and color
      if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
    }
  });

  // Fetch Related Products (same category)
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.category?._id],
    queryFn: async () => {
      if (!product?.category?._id) return [];
      const res = await axiosInstance.get('/products', {
        params: { category: product.category._id }
      });
      // Filter out current product
      return res.data.products.filter((p) => p._id !== id).slice(0, 4);
    },
    enabled: !!product?.category?._id
  });

  // Image Zoom on Hover (magnifier effect)
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(http://localhost:5000${product.images[selectedImageIdx]})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleAddToCart = async (checkoutImmediately = false) => {
    if (!isAuthenticated) {
      toast.error('Please login to continue.');
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size.');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color.');
      return;
    }

    dispatch(cartStart());
    try {
      const res = await axiosInstance.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
      });

      if (res.data.success) {
        // Refresh cart
        const cartRes = await axiosInstance.get('/cart');
        if (cartRes.data.success) {
          dispatch(cartSuccess(cartRes.data));
        }
        
        toast.success(`Added ${product.productName} to cart.`);
        if (checkoutImmediately) {
          navigate('/checkout');
        }
      }
    } catch (err) {
      dispatch(cartFailure(err.message));
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  if (productLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (productError || !product) {
    return (
      <div className="text-center py-20 bg-white border border-primary/5 rounded-3xl p-8 shadow-premium space-y-4">
        <h3 className="font-serif text-2xl font-bold text-primary">Apparel not found</h3>
        <p className="text-sm text-neutral font-light max-w-sm mx-auto">
          The piece you are looking for does not exist or has been removed from our collection.
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-primary/95 transition-all shadow-premium inline-block"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const mainImageUrl = product.images?.[selectedImageIdx]
    ? `http://localhost:5000${product.images[selectedImageIdx]}`
    : 'https://via.placeholder.com/600x800?text=Apparel';

  return (
    <div className="space-y-20 md:space-y-32">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 h-fit">
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible w-full sm:w-20 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIdx === idx ? 'border-primary shadow-premium' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={`http://localhost:5000${img}`}
                    alt={`${product.productName} thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=150&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Display Image */}
          <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden shadow-premium border border-primary/5 bg-background group cursor-zoom-in">
            <img
              src={mainImageUrl}
              alt={product.productName}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full object-cover transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=600&q=80';
              }}
            />

            {/* Mag glass zoom overlay */}
            <div
              className="absolute inset-0 pointer-events-none bg-no-repeat bg-[length:200%] border border-primary/5"
              style={zoomStyle}
            ></div>

            {/* Out of Stock Ribbon */}
            {product.stock === 0 && (
              <div className="absolute top-6 left-6 bg-primary/95 text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase shadow-premium">
                Sold Out
              </div>
            )}
          </div>
        </div>

        {/* Right column: Action Board */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral font-bold">
              {product.category?.categoryName || 'Apparel'}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wide text-primary leading-tight">
              {product.productName}
            </h1>
            <p className="text-xl font-bold text-primary">₹{product.price}</p>
          </div>

          <hr className="border-primary/5" />

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-primary">Description</h4>
            <p className="text-sm text-text/80 leading-relaxed font-light">{product.description}</p>
          </div>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs text-primary">
                <span className="font-semibold uppercase tracking-wider">Select Size</span>
                <a href="#" className="hover:underline font-light text-neutral">Size Guide</a>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-[44px] text-xs font-bold uppercase rounded-xl border flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white shadow-premium'
                        : 'border-primary/10 hover:border-primary/40 text-text/80 bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Select Color</span>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => {
                  // Simple color mapper or fallback to default UI representation
                  const lowerCol = color.toLowerCase();
                  const isWhite = lowerCol === 'white';
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        selectedColor === color
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'border-primary/15'
                      }`}
                      style={{
                        backgroundColor: lowerCol === 'light blue' ? '#bfdbfe' : lowerCol === 'grey' ? '#9ca3af' : lowerCol === 'khaki' ? '#f0e68c' : lowerCol
                      }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <FiCheck className={`text-xs ${isWhite ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Availability */}
          <div className="text-xs flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-primary">Availability:</span>
            {product.stock > 0 ? (
              <span className="text-green-600 font-semibold">
                In Stock ({product.stock} units available)
              </span>
            ) : (
              <span className="text-red-500 font-semibold">Temporarily Out of Stock</span>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={product.stock === 0}
              className="flex-1 py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiShoppingBag className="text-sm" /> Add to Cart
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={product.stock === 0}
              className="flex-1 py-3.5 bg-white text-primary border border-primary/15 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-background transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          <hr className="border-primary/5 my-2" />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-neutral font-light">
            <div className="flex flex-col items-center gap-1">
              <FiTruck className="text-base text-primary/70" />
              <span>Complimentary Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FiShield className="text-base text-primary/70" />
              <span>UPI Secure Guarantee</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FiRotateCcw className="text-base text-primary/70" />
              <span>14-day Exchange Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-8 border-t border-primary/5 pt-16">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide">You May Also Like</h2>
            <p className="text-sm text-neutral font-light mt-1">Curated pieces matching this item's aesthetic.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
