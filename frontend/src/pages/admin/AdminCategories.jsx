import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { AdminNav } from './AdminDashboard';

const AdminCategories = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  // Fetch Categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/categories');
      return res.data.categories;
    },
  });

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await axiosInstance.post('/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCategories']);
      toast.success('Category created successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create category.');
    },
  });

  // Update Category Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await axiosInstance.put(`/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCategories']);
      toast.success('Category updated successfully!');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update category.');
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await axiosInstance.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCategories']);
      toast.success('Category deleted.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete category.');
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setDescription(category.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { categoryName, description };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide">Manage Categories</h1>
          <p className="text-sm text-neutral font-light mt-1">Configure apparel product taxonomies.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 py-3 px-5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-primary/95 transition-all shadow-premium"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {/* Admin navigation tabs */}
      <AdminNav active="categories" />

      {/* Grid List */}
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
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 font-light">
                {categories?.map((cat) => (
                  <tr key={cat._id} className="hover:bg-background/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-primary">{cat.categoryName}</td>
                    <td className="py-3.5 px-4 max-w-sm truncate">{cat.description}</td>
                    <td className="py-3.5 px-4">
                      {new Date(cat.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 hover:bg-background text-primary rounded-lg transition-all"
                        >
                          <FiEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the category ${cat.categoryName}? This action might orphan products.`)) {
                              deleteMutation.mutate(cat._id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={closeModal}></div>
          
          <div className="bg-white border border-primary/5 rounded-3xl p-6 md:p-8 shadow-premium w-full max-w-md relative z-10 m-6">
            <div className="flex justify-between items-center border-b border-primary/5 pb-4 mb-6">
              <h3 className="font-serif text-xl font-bold text-primary">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={closeModal} className="p-1.5 hover:bg-background rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
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
                  className="w-full px-4 py-2.5 bg-background/50 border border-primary/5 rounded-xl text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4 border-t border-primary/5 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-grow py-3 border border-primary/15 rounded-xl text-xs font-bold uppercase tracking-wider text-text/85 hover:bg-background transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-grow py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/95 transition-all shadow-premium"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
