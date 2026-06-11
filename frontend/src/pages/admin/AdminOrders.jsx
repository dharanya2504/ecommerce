import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiCheck, FiAlertCircle, FiClock, FiEye, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { AdminNav } from './AdminDashboard';

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Fetch all orders (Admin view)
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/orders');
      return res.data.orders;
    },
  });

  // Approve Payment Mutation
  const approvePaymentMutation = useMutation({
    mutationFn: async (id) => {
      return await axiosInstance.put(`/admin/payment/approve/${id}`, {
        remarks: 'Payment verified successfully.'
      });
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries(['adminOrders']);
      toast.success('Payment approved!');
      
      // Update selectedOrder local state
      setSelectedOrder((prev) =>
        prev && prev._id === id
          ? { ...prev, paymentStatus: 'Approved', orderStatus: 'Payment Approved' }
          : prev
      );
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to approve payment.');
    },
  });

  // Reject Payment Mutation
  const rejectPaymentMutation = useMutation({
    mutationFn: async ({ id, remarks }) => {
      return await axiosInstance.put(`/admin/payment/reject/${id}`, { remarks });
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries(['adminOrders']);
      toast.success('Payment rejected.');
      setShowRejectForm(false);
      setRejectRemarks('');
      
      // Update selectedOrder local state
      setSelectedOrder((prev) =>
        prev && prev._id === id
          ? { ...prev, paymentStatus: 'Rejected', orderStatus: 'Pending Payment' }
          : prev
      );
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to reject payment.');
    },
  });

  // Update Order Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, orderStatus }) => {
      return await axiosInstance.put(`/admin/orders/${id}/status`, { orderStatus });
    },
    onSuccess: (data, { id, orderStatus }) => {
      queryClient.invalidateQueries(['adminOrders']);
      toast.success(`Order status updated to ${orderStatus}.`);
      
      // Update selectedOrder local state
      setSelectedOrder((prev) =>
        prev && prev._id === id ? { ...prev, orderStatus } : prev
      );
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update order status.');
    },
  });

  const handleApprove = (orderId) => {
    if (window.confirm('Confirm payment approval? This will adjust inventory and unlock shipment.')) {
      approvePaymentMutation.mutate(orderId);
    }
  };

  const handleReject = (e, orderId) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      toast.error('Please specify the reason for rejection.');
      return;
    }
    rejectPaymentMutation.mutate({ id: orderId, remarks: rejectRemarks });
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ id: orderId, orderStatus: newStatus });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide">Manage Orders</h1>
        <p className="text-sm text-neutral font-light mt-1">Audit customer receipts and adjust tracking status.</p>
      </div>

      {/* Admin navigation tabs */}
      <AdminNav active="orders" />

      {/* Table grid */}
      <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-premium">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-primary/5 text-neutral font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total Price</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Proof</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 font-light">
                {ordersData?.map((order) => (
                  <tr key={order._id} className="hover:bg-background/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-primary">{order.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      {order.user?.name || 'Guest'} <br />
                      <span className="text-[10px] text-neutral font-light">
                        {order.user?.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">₹{order.totalAmount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        order.paymentStatus === 'Approved'
                          ? 'bg-green-50 text-green-600'
                          : order.paymentStatus === 'Rejected'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-primary">{order.orderStatus}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {order.paymentProof ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Uploaded
                        </span>
                      ) : (
                        <span className="text-neutral font-light">Missing</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowRejectForm(false);
                          setRejectRemarks('');
                        }}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-wider ml-auto transition-colors"
                      >
                        <FiEye /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Detail Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          ></div>

          {/* Drawer Body */}
          <div className="bg-white border-l border-primary/5 shadow-premium w-full sm:w-[500px] h-full relative z-10 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-primary/5 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-[10px] text-neutral uppercase tracking-widest font-semibold">
                    Inspect Invoice Details
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 hover:bg-background rounded-full transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Items breakdown list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Apparel Line</h4>
                <div className="divide-y divide-primary/5 bg-background/30 rounded-2xl p-4 border border-primary/5">
                  {selectedOrder.products?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2.5 first:pt-0 last:pb-0 text-xs">
                      <div>
                        <h5 className="font-semibold text-text">{item.productName}</h5>
                        <p className="text-[10px] text-neutral mt-0.5">
                          Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-primary">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping info */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Shipping Info</h4>
                <div className="p-4 border border-primary/5 rounded-2xl text-xs font-light leading-relaxed">
                  <p>
                    Recipient: <strong className="font-semibold text-text">{selectedOrder.user?.name}</strong>
                  </p>
                  <p className="mt-1">
                    Address: {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{' '}
                    {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode},{' '}
                    {selectedOrder.shippingAddress?.country}
                  </p>
                </div>
              </div>

              {/* Status Update Select */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Transition Order Status</h4>
                <div className="flex gap-4">
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="flex-grow py-2.5 px-4 bg-background/50 border border-primary/10 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Pending Payment">Pending Payment</option>
                    <option value="Payment Approved">Payment Approved</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Screenshot Payment Verification Box */}
              {selectedOrder.paymentProof && (
                <div className="space-y-3 border-t border-primary/5 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Payment Verification Proof</h4>
                  
                  {/* Screenshot Display */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-primary/10 bg-background shadow-premium flex items-center justify-center p-1.5 relative group">
                    <img
                      src={`http://localhost:5000${selectedOrder.paymentProof}`}
                      alt="Payment Screenshot Proof"
                      className="w-full h-full object-contain cursor-zoom-in"
                      onClick={() => window.open(`http://localhost:5000${selectedOrder.paymentProof}`)}
                    />
                  </div>

                  {/* Actions buttons */}
                  {selectedOrder.paymentStatus === 'Pending' && !showRejectForm && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApprove(selectedOrder._id)}
                        className="flex-grow py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary/95 transition-all shadow-premium flex items-center justify-center gap-1.5"
                      >
                        <FiCheck /> Approve Payment
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="flex-grow py-2.5 border border-red-200 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        <FiAlertCircle /> Reject Proof
                      </button>
                    </div>
                  )}

                  {/* Rejection input remarks */}
                  {showRejectForm && (
                    <form onSubmit={(e) => handleReject(e, selectedOrder._id)} className="space-y-3 p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                      <h5 className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Reason for Rejection</h5>
                      <textarea
                        rows="2"
                        required
                        placeholder="e.g. Transaction image is blurry, please resubmit."
                        value={rejectRemarks}
                        onChange={(e) => setRejectRemarks(e.target.value)}
                        className="w-full p-2.5 bg-white border border-red-200 rounded-xl text-xs focus:outline-none"
                      ></textarea>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(false)}
                          className="flex-1 py-2 bg-white border border-neutral-grey/25 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold"
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Bottom pricing */}
            <div className="border-t border-primary/5 pt-4 mt-6 flex justify-between items-center text-xs">
              <span className="text-neutral font-semibold uppercase tracking-wider">Order Value</span>
              <span className="text-lg font-bold text-primary">₹{selectedOrder.totalAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
