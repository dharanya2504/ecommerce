import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { FiUser, FiShoppingBag, FiMapPin, FiLogOut, FiArrowRight, FiClock } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import { logout } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, orders, addresses

  // Fetch My Orders using React Query
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await axiosInstance.get('/orders/my-orders');
      return res.data.orders;
    },
  });

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: <FiUser /> },
    { id: 'orders', name: 'Order History', icon: <FiShoppingBag /> },
    { id: 'addresses', name: 'Saved Address', icon: <FiMapPin /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-6">
        <div className="flex items-center gap-3 border-b border-primary/5 pb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary truncate max-w-[150px]">{user?.name}</h3>
            <span className="text-[10px] uppercase tracking-widest text-neutral font-semibold">
              {user?.role} Account
            </span>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm transition-all font-medium ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-premium'
                  : 'hover:bg-background text-text/80'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm hover:bg-red-50 text-red-500 transition-all font-medium text-left"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Tab Contents */}
      <div className="lg:col-span-9 bg-white border border-primary/5 rounded-3xl p-6 md:p-8 shadow-premium min-h-[400px]">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-primary border-b border-primary/5 pb-4">
              Profile Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-light">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-neutral font-semibold">Full Name</span>
                <p className="font-medium text-text border border-primary/5 bg-background/30 rounded-xl p-3.5">
                  {user?.name}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-neutral font-semibold">Email Address</span>
                <p className="font-medium text-text border border-primary/5 bg-background/30 rounded-xl p-3.5">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-neutral font-semibold">Phone Number</span>
                <p className="font-medium text-text border border-primary/5 bg-background/30 rounded-xl p-3.5">
                  {user?.phone || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-neutral font-semibold">Account Status</span>
                <p className="font-medium text-green-600 border border-primary/5 bg-background/30 rounded-xl p-3.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> Active
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-primary border-b border-primary/5 pb-4">
              Order History
            </h3>

            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-neutral font-light">Retrieving orders...</p>
              </div>
            ) : !ordersData || ordersData.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <FiShoppingBag className="text-4xl text-neutral mx-auto" />
                <p className="text-sm text-neutral font-light">You have not placed any orders yet.</p>
                <button
                  onClick={() => navigate('/shop')}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-primary/95 transition-all shadow-premium"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                {ordersData.map((order) => (
                  <div
                    key={order._id}
                    className="border border-primary/5 rounded-2xl p-5 hover:shadow-premium-hover transition-all bg-background/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-primary">Invoice #{order.orderNumber}</h4>
                        <span className="text-[10px] text-neutral font-light">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Order status */}
                      <span className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                        order.orderStatus === 'Delivered'
                          ? 'border-green-200 bg-green-50 text-green-600'
                          : order.orderStatus === 'Cancelled'
                          ? 'border-red-200 bg-red-50 text-red-500'
                          : 'border-yellow-200 bg-yellow-50 text-yellow-600'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <hr className="border-primary/5" />

                    {/* Products description snippet */}
                    <div className="flex justify-between items-center text-xs text-text/80 font-light">
                      <span>
                        Items: {order.products?.reduce((sum, p) => sum + p.quantity, 0)} units
                      </span>
                      <span>Total Amount: <strong className="font-bold text-primary">₹{order.totalAmount}</strong></span>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => navigate(`/orders/track/${order._id}`)}
                        className="text-xs font-bold uppercase tracking-wider text-primary hover:text-secondary flex items-center gap-1.5"
                      >
                        Track Order <FiArrowRight />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-bold text-primary border-b border-primary/5 pb-4">
              Saved Delivery Address
            </h3>

            {/* If we have placed orders, display the shipping address from the last order */}
            {!ordersLoading && ordersData && ordersData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ordersData.map((order, index) => {
                  const addr = order.shippingAddress;
                  if (!addr) return null;
                  return (
                    <div key={order._id} className="border border-primary/5 rounded-2xl p-5 space-y-2 relative shadow-premium bg-background/5">
                      <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-primary/45">
                        Address {index + 1}
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        Shipping Destination
                      </h4>
                      <p className="text-xs text-text/85 font-light leading-relaxed">
                        {addr.street}, <br />
                        {addr.city}, {addr.state} - {addr.postalCode} <br />
                        {addr.country}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <FiMapPin className="text-4xl text-neutral mx-auto" />
                <p className="text-sm text-neutral font-light">No saved addresses found.</p>
                <p className="text-xs text-neutral font-light max-w-xs mx-auto">
                  Your address details will be saved automatically when you place your first order.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
