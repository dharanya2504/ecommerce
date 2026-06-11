import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiBox, FiCheckCircle, FiClock, FiGrid } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';

export const AdminNav = ({ active }) => {
  const links = [
    { id: 'dashboard', label: 'Overview', path: '/admin/dashboard', icon: <FiTrendingUp /> },
    { id: 'products', label: 'Products', path: '/admin/products', icon: <FiBox /> },
    { id: 'categories', label: 'Categories', path: '/admin/categories', icon: <FiGrid /> },
    { id: 'orders', label: 'Orders', path: '/admin/orders', icon: <FiShoppingBag /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-primary/5 pb-5 mb-8">
      {links.map((link) => (
        <Link
          key={link.id}
          to={link.path}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            active === link.id
              ? 'bg-primary text-white shadow-premium'
              : 'bg-white hover:bg-background border border-primary/10 text-primary'
          }`}
        >
          {link.icon} {link.label}
        </Link>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  // Fetch Dashboard Stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/dashboard');
      return res.data.dashboard;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-neutral font-light">Loading Admin Statistics...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `₹${stats?.revenue || 0}`, icon: <FiTrendingUp className="text-green-600" />, bg: 'bg-green-50' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <FiShoppingBag className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Total Customers', value: stats?.totalUsers || 0, icon: <FiUsers className="text-purple-600" />, bg: 'bg-purple-50' },
    { label: 'Active Products', value: stats?.totalProducts || 0, icon: <FiBox className="text-orange-600" />, bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide">Admin Workspace</h1>
        <p className="text-sm text-neutral font-light mt-1">Monitor operational metrics and coordinate inventory.</p>
      </div>

      {/* Admin Tab Navigation */}
      <AdminNav active="dashboard" />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white border border-primary/5 rounded-3xl p-6 shadow-premium flex items-center justify-between transition-all duration-300 hover:shadow-premium-hover"
          >
            <div className="space-y-1.5">
              <span className="text-xs text-neutral font-semibold uppercase tracking-wider">{kpi.label}</span>
              <h3 className="text-2xl font-bold text-primary">{kpi.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center text-xl shadow-premium`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Canvas & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales trend chart placeholder styled premium */}
        <div className="lg:col-span-8 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-4">
          <h3 className="font-serif text-lg font-bold text-primary">Sales Analytics</h3>
          
          {/* Custom SVG line chart representing data beautifully */}
          <div className="h-64 w-full bg-background/30 rounded-2xl border border-primary/5 p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            {/* SVG Plot */}
            <svg className="w-full h-4/5 mt-4 overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#546380" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#546380" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#ADBED9" strokeOpacity="0.15" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#ADBED9" strokeOpacity="0.15" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#ADBED9" strokeOpacity="0.15" strokeDasharray="4 4" />

              {/* Area path */}
              <path
                d="M 0 130 C 50 120, 100 80, 150 90 C 200 100, 250 50, 300 45 C 350 40, 400 20, 500 15 L 500 150 L 0 150 Z"
                fill="url(#chart-grad)"
              />
              
              {/* Line path */}
              <path
                d="M 0 130 C 50 120, 100 80, 150 90 C 200 100, 250 50, 300 45 C 350 40, 400 20, 500 15"
                fill="none"
                stroke="#546380"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Dots */}
              <circle cx="150" cy="90" r="5" fill="#FFFFFF" stroke="#546380" strokeWidth="2.5" />
              <circle cx="300" cy="45" r="5" fill="#FFFFFF" stroke="#546380" strokeWidth="2.5" />
              <circle cx="500" cy="15" r="5" fill="#FFFFFF" stroke="#546380" strokeWidth="2.5" />
            </svg>

            {/* Labels */}
            <div className="flex justify-between text-[9px] text-neutral uppercase tracking-widest px-2">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="lg:col-span-4 bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-4">
          <h3 className="font-serif text-lg font-bold text-primary">Pending Reviews</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiClock className="text-xl text-yellow-600" />
                <div>
                  <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Awaiting Verification</h4>
                  <p className="text-[10px] text-yellow-600 font-light mt-0.5">UPI proof screenshot uploads</p>
                </div>
              </div>
              <span className="text-lg font-bold text-yellow-800 bg-white/70 px-3 py-1 rounded-xl">
                {stats?.pendingPayments || 0}
              </span>
            </div>

            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-xl text-green-600" />
                <div>
                  <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">Payments Verified</h4>
                  <p className="text-[10px] text-green-600 font-light mt-0.5">Total approved purchases</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-800 bg-white/70 px-3 py-1 rounded-xl">
                {stats?.approvedPayments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity orders list */}
      <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-premium space-y-4">
        <h3 className="font-serif text-lg font-bold text-primary">Recent Orders Activity</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-primary/5 text-neutral font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total Price</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 font-light">
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-background/20 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-primary">{order.orderNumber}</td>
                  <td className="py-3.5 px-4">{order.user?.name || 'Guest User'}</td>
                  <td className="py-3.5 px-4 font-medium text-primary">₹{order.totalAmount}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      order.paymentStatus === 'Approved' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-primary">{order.orderStatus}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="text-primary hover:text-secondary font-bold uppercase tracking-wider text-[10px]"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
