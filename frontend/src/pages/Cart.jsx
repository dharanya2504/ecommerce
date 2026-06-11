import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { cartStart, cartSuccess, cartFailure } from '../store/cartSlice';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalPrice, totalItems, loading } = useSelector((state) => state.cart);

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

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await axiosInstance.put('/cart/update', { itemId, quantity });
      if (res.data.success) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-primary/5 pb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wide">Shopping Cart</h1>
        <p className="text-sm text-neutral font-light mt-1">Review your curated selection before checkout.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-primary/5 rounded-3xl p-8 shadow-premium space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center text-primary mx-auto">
            <FiShoppingBag className="text-2xl" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-primary">Your cart is empty</h3>
            <p className="text-sm text-neutral font-light">
              Explore our contemporary collection and select your favorite pieces.
            </p>
          </div>
          <Link
            to="/shop"
            className="px-6 py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-primary/95 transition-all shadow-premium inline-block"
          >
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row gap-6 p-5 bg-white border border-primary/5 rounded-2xl shadow-premium relative transition-all duration-300 hover:shadow-premium-hover"
              >
                {/* Image */}
                <div className="w-24 h-32 bg-background rounded-xl overflow-hidden flex-shrink-0 border border-primary/5 mx-auto sm:mx-0">
                  <img
                    src={
                      item.product?.images?.[0]
                        ? `http://localhost:5000${item.product.images[0]}`
                        : 'https://via.placeholder.com/150x200?text=Product'
                    }
                    alt={item.product?.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=150&q=80';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <h3 className="font-serif text-lg font-semibold text-primary leading-tight">
                        {item.product?.productName}
                      </h3>
                      <span className="text-base font-bold text-primary self-center sm:self-start">
                        ₹{item.product?.price * item.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-neutral font-light">
                      Unit Price: ₹{item.product?.price}
                    </p>
                    <div className="flex justify-center sm:justify-start gap-4 mt-2 text-xs text-neutral">
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

                  <div className="flex justify-between items-center mt-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-primary/10 rounded-lg bg-background px-1 mx-auto sm:mx-0">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:text-primary disabled:opacity-30"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="px-4 text-xs font-bold text-text">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        className="p-1.5 hover:text-primary"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="p-1.5 text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <FiTrash2 className="text-sm" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel Summary */}
          <div className="lg:col-span-4 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-6">
            <h3 className="font-serif text-xl font-bold text-primary border-b border-primary/5 pb-4">
              Order Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-neutral font-light">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-neutral font-light">
                <span>Shipping Fees</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <hr className="border-primary/5" />
              <div className="flex justify-between text-base font-bold text-primary">
                <span>Grand Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 group"
            >
              Checkout Order
              <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-2">
              <Link to="/shop" className="text-xs text-neutral hover:text-primary transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
