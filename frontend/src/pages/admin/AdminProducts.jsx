import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { AdminNav } from './AdminDashboard';

const AdminProducts = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [sizes, setSizes] = useState(['S', 'M', 'L']);
  const [colors, setColors] = useState(['White', 'Black']);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categories');
      return res.data.categories;
    },
  });

  // Fetch Products (Admin view)
  const { data: products, isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/products');
      return res.data.products;
    },
  });

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return await axiosInstance.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      toast.success('Product created successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create product.');
    },
  });

  // Update Product Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return await axiosInstance.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      toast.success('Product updated successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update product.');
    },
  });

  // Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await axiosInstance.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProducts']);
      toast.success('Product deactivated.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete product.');
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductName('');
    setDescription('');
    setCategoryId(categories?.[0]?._id || '');
    setPrice(0);
    setStock(0);
    setSizes(['S', 'M', 'L']);
    setColors(['White', 'Black']);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductName(product.productName);
    setDescription(product.description);
    setCategoryId(product.category?._id || '');
    setPrice(product.price);
    setStock(product.stock);
    setSizes(product.sizes || []);
    setColors(product.colors || []);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('description', description);
    formData.append('category', categoryId);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('sizes', JSON.stringify(sizes));
    formData.append('colors', JSON.stringify(colors));

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, formData });
    } else {
      if (selectedFiles.length === 0) {
        toast.error('Please select at least one product image.');
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const toggleSizeSelection = (size) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide">Manage Products</h1>
          <p className="text-sm text-neutral font-light mt-1">Upload and catalog apparel assets.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 py-3 px-5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Admin navigation tabs */}
      <AdminNav active="products" />

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
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Apparel Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 font-light">
                {products?.map((product) => (
                  <tr key={product._id} className="hover:bg-background/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="w-10 h-12 rounded overflow-hidden border border-primary/5">
                        <img
                          src={`http://localhost:5000${product.images?.[0]}`}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=100&q=80';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-primary">{product.productName}</td>
                    <td className="py-3.5 px-4">{product.category?.categoryName}</td>
                    <td className="py-3.5 px-4 font-medium">₹{product.price}</td>
                    <td className="py-3.5 px-4">{product.stock} units</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        product.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {product.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 hover:bg-background text-primary rounded-lg transition-all"
                          title="Edit"
                        >
                          <FiEdit className="text-sm" />
                        </button>
                        {product.isActive && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to deactivate ${product.productName}?`)) {
                                deleteMutation.mutate(product._id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                            title="Deactivate"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={closeModal}></div>

          {/* Modal Container */}
          <div className="bg-white border border-primary/5 rounded-3xl p-6 md:p-8 shadow-premium w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto m-6">
            <div className="flex justify-between items-center border-b border-primary/5 pb-4 mb-6">
              <h3 className="font-serif text-xl font-bold text-primary">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-background rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary">Product Name</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary">Description</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary">Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Sizes Selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Available Sizes</span>
                <div className="flex gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                    const isSelected = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSizeSelection(sz)}
                        className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-primary/10 bg-white text-text/80'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors selection snippet */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary">Colors (comma separated)</label>
                <input
                  type="text"
                  required
                  value={colors.join(', ')}
                  onChange={(e) =>
                    setColors(e.target.value.split(',').map((c) => c.trim()).filter((c) => c !== ''))
                  }
                  className="w-full px-4 py-2.5 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none"
                />
              </div>

              {/* Image files upload */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Product Images</span>
                <div className="relative border-2 border-dashed border-primary/15 rounded-xl p-4 bg-background/30 flex flex-col items-center justify-center text-center cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FiUpload className="text-xl text-primary/60 group-hover:text-primary mb-1" />
                  <span className="text-xs font-semibold text-primary">Upload Images</span>
                  {selectedFiles.length > 0 && (
                    <span className="text-[10px] text-green-600 font-bold mt-1">
                      {selectedFiles.length} file(s) selected
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4 border-t border-primary/5 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-primary/15 rounded-xl text-xs font-bold uppercase tracking-wider text-text/80 hover:bg-background transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/95 transition-all shadow-premium"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
