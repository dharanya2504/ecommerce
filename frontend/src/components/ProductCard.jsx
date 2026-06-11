import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { cartStart, cartSuccess, cartFailure } from '../store/cartSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.[0]
    ? `http://localhost:5000${product.images[0]}`
    : 'https://via.placeholder.com/300x400?text=Apparel';

  // alternate image fallback if exists, otherwise same image
  const secondaryImage = product.images?.[1]
    ? `http://localhost:5000${product.images[1]}`
    : product.images?.[0]
    ? `http://localhost:5000${product.images[0]}`
    : 'https://via.placeholder.com/300x400?text=Apparel';

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Stop navigation to details page
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      navigate('/login');
      return;
    }

    const testSize = product.sizes?.[0] || 'M';
    const testColor = product.colors?.[0] || 'Black';

    dispatch(cartStart());
    try {
      const res = await axiosInstance.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        size: testSize,
        color: testColor,
      });

      if (res.data.success) {
        // Fetch full cart to update store state correctly
        const cartRes = await axiosInstance.get('/cart');
        if (cartRes.data.success) {
          dispatch(cartSuccess(cartRes.data));
        }
        toast.success(`Added ${product.productName} to cart.`);
      }
    } catch (err) {
      dispatch(cartFailure(err.message));
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/products/${product._id}`)}
      className="relative flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer shadow-premium border border-primary/5 transition-all duration-500 ease-out h-full"
      style={{
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 25px 50px -12px rgba(84, 99, 128, 0.18)'
          : '0 10px 30px -10px rgba(84, 99, 128, 0.08)',
      }}
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-[3/4] overflow-hidden bg-background">
        {/* Alternate Image on Hover */}
        <motion.img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{ scale: isHovered ? 1.05 : 1 }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&q=80';
          }}
        />

        {/* Badges (Out of stock) */}
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 bg-primary/95 text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
            Sold Out
          </div>
        )}

        {/* Hover Action Buttons */}
        <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {/* Quick View */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product._id}`);
            }}
            className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-premium"
            title="Quick View"
          >
            <FiEye className="text-lg" />
          </motion.button>
        </div>

        {/* Add to Cart Slider from Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 overflow-hidden pointer-events-none">
          <motion.button
            initial={{ y: 60 }}
            animate={{ y: isHovered && product.stock > 0 ? 0 : 60 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="pointer-events-auto w-full py-2.5 bg-primary/90 backdrop-blur-xs text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-premium"
          >
            <FiShoppingBag className="text-sm" /> Add to Cart
          </motion.button>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          {/* Category */}
          <p className="text-[10px] uppercase tracking-widest text-neutral font-semibold">
            {product.category?.categoryName || 'Apparel'}
          </p>

          {/* Title */}
          <h3 className="font-serif text-base font-medium text-text leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {product.productName}
          </h3>
        </div>

        {/* Price & Size overview */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-semibold text-primary">₹{product.price}</span>
          
          <div className="flex gap-1 text-[9px] font-bold text-neutral">
            {product.sizes?.slice(0, 3).map((size) => (
              <span key={size} className="px-1.5 py-0.5 border border-primary/5 rounded bg-background">
                {size}
              </span>
            ))}
            {product.sizes?.length > 3 && <span>+</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
