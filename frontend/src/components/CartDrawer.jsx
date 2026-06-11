import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { cartStart, cartSuccess, cartFailure } from '../store/cartSlice';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalPrice, totalItems, loading } = useSelector((state) => state.cart);

  // Fetch Cart from Backend API if authenticated
  const fetchCart = async () => {
    if (!isAuthenticated) return;
    dispatch(cartStart());
    try {
      const res = await axiosInstance.get('/cart');
      if (res.data.success) {
        dispatch(cartSuccess(res.data));
      }
    } catch (err) {
      dispatch(cartFailure(err.message));
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchCart();
    }
  }, [isOpen, isAuthenticated]);

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await axiosInstance.put('/cart/update', { itemId, quantity });
      if (res.data.success) {
        // Refresh cart
        fetchCart();
        toast.success('Cart updated.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await axiosInstance.delete('/cart/remove', { data: { itemId } });
      if (res.data.success) {
        fetchCart();
        toast.success('Item removed from cart.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const handleCheckout = () => {
    onClose();
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
          ></motion.div>

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 bottom-0 right-0 w-full sm:w-[450px] bg-white shadow-premium z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-xl text-primary" />
                <h3 className="font-serif text-xl font-semibold text-primary">Your Cart</h3>
                <span className="text-xs px-2 py-0.5 bg-background text-primary font-bold rounded-full">
                  {totalItems}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-background text-text/70 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!isAuthenticated ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <FiUser className="text-4xl text-neutral" />
                  <p className="text-text font-medium">Please login to view your cart</p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/login');
                    }}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-wider rounded-lg uppercase hover:bg-primary/95 transition-all"
                  >
                    Login Now
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center text-primary">
                    <FiShoppingBag className="text-2xl" />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-primary">Your cart is empty</h4>
                  <p className="text-sm text-neutral font-light">Explore our curated collections and add your first piece.</p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/shop');
                    }}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-wider rounded-lg uppercase hover:bg-primary/95 transition-all"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item._id} className="flex gap-4 pb-6 border-b border-primary/5 last:border-0">
                    {/* Image */}
                    <div className="w-20 h-24 bg-background rounded-lg overflow-hidden flex-shrink-0 border border-primary/5">
                      <img
                        src={
                          item.product?.images?.[0]
                            ? `http://localhost:5000${item.product.images[0]}`
                            : 'https://via.placeholder.com/150x200?text=Product'
                        }
                        alt={item.product?.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x200?text=Apparel';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between gap-2">
                          <h4 className="text-sm font-medium text-text leading-tight line-clamp-2">
                            {item.product?.productName}
                          </h4>
                          <span className="text-sm font-semibold text-primary">
                            ₹{item.product?.price}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1.5 text-xs text-neutral">
                          {item.size && (
                            <span>
                              Size: <strong className="text-text">{item.size}</strong>
                            </span>
                          )}
                          {item.color && (
                            <span>
                              Color: <strong className="text-text">{item.color}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-primary/10 rounded-lg bg-background px-1">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 hover:text-primary disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="text-xs" />
                          </button>
                          <span className="px-3 text-xs font-bold text-text">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            className="p-1.5 hover:text-primary"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-primary/5 bg-background/50">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-neutral">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <hr className="border-primary/5" />
                  <div className="flex justify-between text-base font-bold text-primary">
                    <span>Estimated Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Placeholder icon imports fix
import { FiUser } from 'react-icons/fi';

export default CartDrawer;
