import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiClipboard, FiCreditCard, FiArrowRight, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { clearCart } from '../store/cartSlice';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, totalPrice } = useSelector((state) => state.cart);
  const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Review
  const [shippingDetails, setShippingDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  const onAddressSubmit = (data) => {
    setShippingDetails(data);
    setActiveStep(2); // Go to order review
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/orders/create', {
        shippingAddress: shippingDetails,
      });

      if (res.data.success) {
        toast.success('Order placed! Redirecting to payment...');
        
        // Reset local cart
        dispatch(clearCart());
        
        // Redirect to payment page with new orderId
        const orderId = res.data.order._id;
        navigate(`/payment?orderId=${orderId}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Shipping Address', icon: <FiMapPin /> },
    { number: 2, label: 'Order Review', icon: <FiClipboard /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-primary/5 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-wide">Checkout</h1>
        <p className="text-sm text-neutral font-light mt-1">Complete details to finalize your order.</p>
      </div>

      {/* Stepper Navigation */}
      <div className="relative flex justify-between items-center max-w-md mx-auto mb-10">
        {/* Connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/10 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: activeStep === 2 ? '100%' : '0%' }}
        ></div>

        {/* Steps */}
        {steps.map((step) => {
          const isActive = activeStep === step.number;
          const isCompleted = activeStep > step.number;
          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive || isCompleted ? '#546380' : '#FFFFFF',
                  color: isActive || isCompleted ? '#FFFFFF' : '#546380',
                  borderColor: isActive || isCompleted ? '#546380' : '#ADBED9',
                }}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold shadow-premium"
              >
                {isCompleted ? <FiCheck className="text-base" /> : step.icon}
              </motion.div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                isActive ? 'text-primary font-bold' : 'text-neutral'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stepper Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 bg-white border border-primary/5 rounded-3xl p-6 md:p-8 shadow-premium min-h-[350px]">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="address-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="font-serif text-xl font-bold text-primary mb-6">Shipping Address</h3>
                
                <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-primary">Street Address</label>
                    <input
                      type="text"
                      placeholder="123 Luxury Avenue, Suite 4B"
                      {...register('street', { required: 'Street address is required' })}
                      className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                        errors.street ? 'border-red-400' : 'border-primary/10'
                      }`}
                    />
                    {errors.street && <span className="text-xs text-red-500">{errors.street.message}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-primary">City</label>
                      <input
                        type="text"
                        placeholder="Chennai"
                        {...register('city', { required: 'City is required' })}
                        className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                          errors.city ? 'border-red-400' : 'border-primary/10'
                        }`}
                      />
                      {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-primary">State / Province</label>
                      <input
                        type="text"
                        placeholder="Tamil Nadu"
                        {...register('state', { required: 'State is required' })}
                        className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                          errors.state ? 'border-red-400' : 'border-primary/10'
                        }`}
                      />
                      {errors.state && <span className="text-xs text-red-500">{errors.state.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-primary">Postal Code / ZIP</label>
                      <input
                        type="text"
                        placeholder="600001"
                        {...register('postalCode', {
                          required: 'Postal code is required',
                          pattern: { value: /^[0-9]{6}$/, message: 'Invalid postal code (6 digits)' },
                        })}
                        className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                          errors.postalCode ? 'border-red-400' : 'border-primary/10'
                        }`}
                      />
                      {errors.postalCode && <span className="text-xs text-red-500">{errors.postalCode.message}</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-primary">Country</label>
                      <input
                        type="text"
                        disabled
                        value="India"
                        className="w-full px-4 py-3 bg-background/30 border border-primary/5 rounded-xl text-sm text-neutral focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 group"
                  >
                    Continue to Review
                    <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="review-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xl font-bold text-primary">Order Review</h3>
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Edit Shipping Details
                  </button>
                </div>

                {/* Shipping info */}
                <div className="p-4 bg-background/50 border border-primary/5 rounded-2xl">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Delivery Address</h4>
                  <p className="text-sm text-text/80 leading-relaxed font-light">
                    {shippingDetails?.street}, <br />
                    {shippingDetails?.city}, {shippingDetails?.state} - {shippingDetails?.postalCode} <br />
                    {shippingDetails?.country}
                  </p>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Review Items</h4>
                  <div className="divide-y divide-primary/5 max-h-[200px] overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item._id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="w-10 h-14 bg-background rounded overflow-hidden flex-shrink-0 border border-primary/5">
                          <img
                            src={`http://localhost:5000${item.product?.images?.[0]}`}
                            alt={item.product?.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=100&q=80';
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <h5 className="text-xs font-semibold text-text line-clamp-1">
                            {item.product?.productName}
                          </h5>
                          <p className="text-[10px] text-neutral font-light mt-0.5">
                            Qty: {item.quantity} | Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          ₹{item.product?.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Processing Order...' : 'Place Order & Pay'}
                  {!loading && <FiArrowRight className="text-sm" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Pricing Summary */}
        <div className="lg:col-span-4 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-4">
          <h3 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">Cart Summary</h3>
          <div className="space-y-3 text-xs">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-text/80">
                <span className="font-light truncate max-w-[150px]">{item.product?.productName}</span>
                <span className="font-semibold text-primary">₹{item.product?.price} × {item.quantity}</span>
              </div>
            ))}
            <hr className="border-primary/5" />
            <div className="flex justify-between text-neutral font-light">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-neutral font-light">
              <span>Shipping</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <hr className="border-primary/5" />
            <div className="flex justify-between text-sm font-bold text-primary">
              <span>Grand Total</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
