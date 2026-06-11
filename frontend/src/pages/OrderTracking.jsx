import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCheck, FiPackage, FiTruck, FiCreditCard, FiInbox, FiClock } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';

const OrderTracking = () => {
  const { id } = useParams();

  // Fetch Order Details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['orderTracking', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/orders/${id}`);
      return res.data.order;
    },
    // Poll every 10 seconds to auto-update on status transition
    refetchInterval: 10000,
  });

  const statuses = [
    { name: 'Pending Payment', key: 'Pending Payment', icon: <FiCreditCard />, desc: 'Awaiting screenshot proof' },
    { name: 'Payment Approved', key: 'Payment Approved', icon: <FiClock />, desc: 'Verified by administrator' },
    { name: 'Processing', key: 'Processing', icon: <FiPackage />, desc: 'Awaiting workshop dispatch' },
    { name: 'Shipped', key: 'Shipped', icon: <FiTruck />, desc: 'Apparel in transit' },
    { name: 'Delivered', key: 'Delivered', icon: <FiInbox />, desc: 'Order arrived' },
  ];

  // Helper to determine active step index
  const getActiveStepIndex = (currentStatus) => {
    return statuses.findIndex((s) => s.key === currentStatus);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-neutral font-light">Loading Order Timeline...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 bg-white border border-primary/5 rounded-3xl p-8 shadow-premium space-y-4 max-w-lg mx-auto">
        <h3 className="font-serif text-2xl font-bold text-primary">Order not found</h3>
        <p className="text-sm text-neutral font-light">
          We could not find an order with this tracker identifier. Please verify your invoice.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-primary/95 transition-all shadow-premium inline-block"
        >
          My Orders
        </Link>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/5 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-neutral font-semibold">TRACK SHIPMENT</span>
          <h1 className="font-serif text-3xl font-bold tracking-wide mt-1">Invoice #{order.orderNumber}</h1>
          <p className="text-xs text-neutral font-light mt-1">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        {/* Status Badge */}
        <div className="bg-primary/10 border border-primary/5 px-4 py-2 rounded-xl text-primary text-xs font-bold tracking-widest uppercase w-fit">
          Status: {order.orderStatus}
        </div>
      </div>

      {/* ─── Animated Timeline Progress ─── */}
      <div className="bg-white border border-primary/5 rounded-3xl p-8 md:p-12 shadow-premium relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
          
          {/* Connector bar (desktop) */}
          <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-background z-0"></div>
          
          {/* Filled progress connector (desktop) */}
          {activeIndex >= 0 && (
            <motion.div
              className="hidden md:block absolute top-[22px] left-[10%] h-0.5 bg-primary z-0 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: activeIndex / 4 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ width: '80%' }}
            ></motion.div>
          )}

          {/* Timeline Nodes */}
          {statuses.map((step, idx) => {
            const isCompleted = activeIndex > idx;
            const isActive = activeIndex === idx;
            const isFuture = activeIndex < idx;

            return (
              <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-3">
                {/* Node bubble */}
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted || isActive ? '#546380' : '#FFFFFF',
                    borderColor: isCompleted || isActive ? '#546380' : '#ADBED9',
                    color: isCompleted || isActive ? '#FFFFFF' : '#ADBED9',
                    scale: isActive ? 1.15 : 1,
                  }}
                  className="w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm shadow-premium flex-shrink-0"
                >
                  {isCompleted ? <FiCheck className="text-base font-bold" /> : step.icon}
                </motion.div>

                {/* Step labels */}
                <div className="flex flex-col md:items-center text-left md:text-center">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${
                    isActive ? 'text-primary' : isFuture ? 'text-neutral' : 'text-text/80'
                  }`}>
                    {step.name}
                  </h4>
                  <p className="text-[10px] text-neutral font-light mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Order Summary & Logistics Details ─── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="md:col-span-7 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-4">
          <h3 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">Purchased Items</h3>
          
          <div className="divide-y divide-primary/5">
            {order.products?.map((item, idx) => (
              <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-12 h-16 bg-background rounded-lg overflow-hidden border border-primary/5 flex-shrink-0">
                  <img
                    src={`http://localhost:5000${item.product?.images?.[0]}`}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=100&q=80';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-text line-clamp-1">{item.productName}</h4>
                  <p className="text-[10px] text-neutral font-light mt-0.5">
                    Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping details */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-3">
            <h3 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">Delivery Information</h3>
            <div className="text-xs text-text/80 space-y-1 font-light leading-relaxed">
              <p className="font-semibold text-primary">Shipping Address:</p>
              <p>
                {order.shippingAddress?.street}, <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode} <br />
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-3">
            <h3 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">Transaction Summary</h3>
            <div className="text-xs text-neutral space-y-2 font-light">
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className={`font-semibold uppercase tracking-wider ${
                  order.paymentStatus === 'Approved' ? 'text-green-600' : order.paymentStatus === 'Rejected' ? 'text-red-500' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.adminRemarks && (
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[10px]">
                  Remarks: {order.adminRemarks}
                </div>
              )}
              <hr className="border-primary/5" />
              <div className="flex justify-between text-sm font-bold text-primary">
                <span>Total Amount Paid</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
