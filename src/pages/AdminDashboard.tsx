import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../lib/api';
import { Product, Category, User, Settings as SettingsType } from '../types';
import {
  LayoutDashboard,
  FolderTree,
  Users,
  TrendingUp,
  Tag,
  Package,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Upload,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  DollarSign,
  X,
  Sparkles,
  Settings,
  User as UserIcon,
  Shield,
  ShieldAlert,
  Ban,
  Unlock,
  Save,
  Globe,
  Phone,
  Instagram,
  Facebook,
  Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, products, categories, refreshProducts, refreshCategories, settings, updateSettings, updateCategory, blockUser, deleteUser, updateProfile } = useApp();
  const navigate = useNavigate();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'categories' | 'users' | 'profile' | 'settings'>('stats');

  // Stats State
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    inStock: 0,
    sold: 0,
    estimatedRevenue: 0,
    totalBrands: 0,
    totalCategories: 0
  });

  // Database lists
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Form Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Edit Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Form Fields for Products
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formCondition, setFormCondition] = useState<'Like New' | 'Good' | 'Fair'>('Like New');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsBestDeal, setFormIsBestDeal] = useState(false);

  // Category Manager State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  // Settings Form States
  const [settingsData, setSettingsData] = useState<SettingsType>({ websiteName: '' });

  // Status Alerts
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [modalLoading, setModalLoading] = useState(false);

  // Security gate
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    } else {
      fetchAdminData();
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfilePhone(user.phone || '');
      setProfilePicture(user.profilePicture || '');
    }
    if (settings) {
      setSettingsData(settings);
    }
  }, [user, settings]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statData = await apiRequest('/api/admin/stats');
      setStats(statData);

      const userData = await apiRequest<User[]>('/api/admin/users');
      setAllUsers(userData);
    } catch (err) {
      console.error('Error loading admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProductModal = (prod: Product | null = null) => {
    setAlertMsg({ type: '', text: '' });
    if (prod) {
      setEditingProduct(prod);
      setFormName(prod.name);
      setFormBrand(prod.brand);
      setFormSize(prod.size);
      setFormCondition(prod.condition);
      setFormDescription(prod.description);
      setFormPrice(prod.price.toString());
      setFormOriginalPrice(prod.originalPrice?.toString() || '');
      setFormCategoryId(prod.categoryId);
      setFormImageUrls(prod.imageUrls);
      setFormIsFeatured(prod.isFeatured);
      setFormIsNewArrival(prod.isNewArrival);
      setFormIsBestDeal(prod.isBestDeal);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormBrand('');
      setFormSize('');
      setFormCondition('Like New');
      setFormDescription('');
      setFormPrice('');
      setFormOriginalPrice('');
      setFormCategoryId(categories[0]?.id || '');
      setFormImageUrls([]);
      setFormIsFeatured(false);
      setFormIsNewArrival(true);
      setFormIsBestDeal(false);
    }
    setShowProductModal(true);
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && !formImageUrls.includes(newImageUrl)) {
      setFormImageUrls([...formImageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (idx: number) => {
    setFormImageUrls(formImageUrls.filter((_, i) => i !== idx));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setModalLoading(true);
    setAlertMsg({ type: '', text: '' });

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file as Blob);
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              const result = await apiRequest<{ imageUrl: string }>('/api/upload', {
                method: 'POST',
                body: JSON.stringify({ image: base64 })
              });
              resolve(result.imageUrl);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = (error) => reject(error);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormImageUrls(prev => [...prev, ...uploadedUrls]);
      setAlertMsg({ type: 'success', text: `Successfully uploaded ${uploadedUrls.length} image(s)!` });
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to upload one or more images.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg({ type: '', text: '' });

    if (!formName || !formBrand || !formSize || !formPrice || !formCategoryId) {
      setAlertMsg({ type: 'error', text: 'Please fill in all required attributes.' });
      return;
    }

    if (formImageUrls.length === 0) {
      setAlertMsg({ type: 'error', text: 'At least one product image is required.' });
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        name: formName,
        brand: formBrand,
        size: formSize,
        condition: formCondition,
        description: formDescription,
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        categoryId: formCategoryId,
        imageUrls: formImageUrls,
        isFeatured: formIsFeatured,
        isNewArrival: formIsNewArrival,
        isBestDeal: formIsBestDeal
      };

      if (editingProduct) {
        await apiRequest(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      await refreshProducts();
      await fetchAdminData();
      setShowProductModal(false);
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Error saving product.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this shoe drop?')) return;

    try {
      await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
      await refreshProducts();
      await fetchAdminData();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleToggleSoldStatus = async (product: Product) => {
    const newStatus = product.stockStatus === 'In Stock' ? 'Sold' : 'In Stock';
    try {
      await apiRequest(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ stockStatus: newStatus })
      });
      await refreshProducts();
      await fetchAdminData();
    } catch (err) {
      alert('Failed to change sold status.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName })
      });
      setNewCategoryName('');
      await refreshCategories();
      await fetchAdminData();
    } catch (err) {
      alert('Failed to create category.');
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !editingCategory) return;

    try {
      await updateCategory(editingCategory.id, editCategoryName);
      setEditingCategory(null);
      setShowCategoryModal(false);
      await fetchAdminData();
    } catch (err) {
      alert('Failed to update category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });
      await refreshCategories();
      await fetchAdminData();
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  const handleToggleUserBlock = async (userToToggle: User) => {
    const isBlocking = !userToToggle.isBlocked;
    const action = isBlocking ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await blockUser(userToToggle.id, isBlocking);
      await fetchAdminData();
    } catch (err) {
      alert(`Failed to ${action} user.`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user? This action cannot be undone.')) return;

    try {
      await deleteUser(userId);
      await fetchAdminData();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg({ type: '', text: '' });
    setModalLoading(true);
    try {
      await updateProfile(profileName, profilePhone, profileEmail, profilePicture, profilePassword || undefined);
      setProfilePassword('');
      setAlertMsg({ type: 'success', text: 'Admin profile updated successfully!' });
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg({ type: '', text: '' });
    setModalLoading(true);
    try {
      await updateSettings(settingsData);
      setAlertMsg({ type: 'success', text: 'Website settings updated successfully!' });
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setModalLoading(true);
    try {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const result = await apiRequest<{ imageUrl: string }>('/api/upload', {
            method: 'POST',
            body: JSON.stringify({ image: base64 })
          });
          setProfilePicture(result.imageUrl);
        } catch (err) {
          alert('Failed to upload profile picture.');
        } finally {
          setModalLoading(false);
        }
      };
    } catch (err) {
      setModalLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setModalLoading(true);
    try {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const result = await apiRequest<{ imageUrl: string }>('/api/upload', {
            method: 'POST',
            body: JSON.stringify({ image: base64 })
          });
          setSettingsData({ ...settingsData, logoUrl: result.imageUrl });
        } catch (err) {
          alert('Failed to upload logo.');
        } finally {
          setModalLoading(false);
        }
      };
    } catch (err) {
      setModalLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-10 text-gray-900">
      {/* Title */}
      <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-brand-orange" /> Admin Control Panel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Store management and administrative operations
          </p>
        </div>
        <button
          onClick={() => handleOpenProductModal(null)}
          className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs px-5 py-3 rounded transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Add New Kicks
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'stats' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Statistics
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'inventory' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" /> Shoes Inventory
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'categories' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Categories
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'users' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Admin Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Website Settings
        </button>
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-8 h-8 text-brand-orange animate-spin" />
          <p className="text-gray-500 font-mono text-xs">Synchronizing data...</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* TAB 1: STATISTICS OVERVIEW */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200/60 rounded-xl p-6 space-y-2 shadow-xs">
                  <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Total Kicks listed</span>
                  <p className="text-3xl font-display font-black text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-xl p-6 space-y-2 shadow-xs">
                  <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">In Stock Drops</span>
                  <p className="text-3xl font-display font-black text-emerald-600">{stats.inStock}</p>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-xl p-6 space-y-2 shadow-xs">
                  <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Sold-Out Kicks</span>
                  <p className="text-3xl font-display font-black text-brand-orange">{stats.sold}</p>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-xl p-6 space-y-2 shadow-xs">
                  <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Estimated Sales (USD)</span>
                  <p className="text-3xl font-display font-black text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-7 h-7 text-brand-orange shrink-0 -mr-1" />
                    {stats.estimatedRevenue}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200/60 rounded-xl p-6 space-y-4 shadow-xs">
                  <h3 className="font-display font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-orange" /> Store Accounts Registered
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <span className="text-gray-500 text-sm font-sans">Active Customer profiles:</span>
                    <span className="font-mono font-bold text-gray-900 text-lg">{stats.totalUsers}</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200/60 rounded-xl p-6 space-y-4 shadow-xs">
                  <h3 className="font-display font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-orange" /> Curation Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="text-gray-500 text-xs block font-sans">Active Categories</span>
                      <span className="text-lg font-mono font-bold text-gray-900">{stats.totalCategories}</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="text-gray-500 text-xs block font-sans">Active Brands</span>
                      <span className="text-lg font-mono font-bold text-gray-900">{stats.totalBrands}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY MANAGER */}
          {activeTab === 'inventory' && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-gray-700 font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-mono uppercase text-gray-500 tracking-wider">
                      <th className="py-4 px-6">Sneaker Details</th>
                      <th className="py-4 px-6">Brand</th>
                      <th className="py-4 px-6">Size</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(prod => {
                      const isProductSold = prod.stockStatus === 'Sold';
                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.imageUrls[0]}
                                alt=""
                                className="w-12 h-10 object-cover rounded bg-gray-100 border border-gray-200 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <Link to={`/product/${prod.id}`} className="font-bold text-gray-900 hover:text-brand-orange transition-colors line-clamp-1">
                                  {prod.name}
                                </Link>
                                <span className="text-[10px] font-mono text-gray-500 uppercase">{prod.condition}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-500 font-mono text-xs">{prod.brand}</td>
                          <td className="py-4 px-6 font-bold text-gray-900">{prod.size}</td>
                          <td className="py-4 px-6 font-mono font-semibold text-gray-900">${prod.price}</td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleToggleSoldStatus(prod)}
                              className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
                              title={isProductSold ? "Mark as In Stock" : "Mark as Sold"}
                            >
                              {isProductSold ? (
                                <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                                  <ToggleRight className="w-4 h-4" /> Sold Out
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                                  <ToggleLeft className="w-4 h-4" /> In Stock
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenProductModal(prod)}
                                className="p-2 bg-gray-50 hover:bg-brand-orange hover:text-white text-gray-600 rounded border border-gray-200 transition-colors cursor-pointer"
                                title="Edit shoe"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded border border-red-200 transition-colors cursor-pointer"
                                title="Delete shoe drop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="bg-white border border-gray-200/60 p-6 rounded-2xl shadow-xs space-y-6">
                <h3 className="font-display font-bold text-sm text-gray-700 uppercase tracking-wider">Create New Category</h3>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Hiking Boots"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>
              </div>

              <div className="bg-white border border-gray-200/60 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="font-display font-bold text-sm text-gray-700 uppercase tracking-wider">Existing Categories</h3>
                <div className="divide-y divide-gray-100">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">/{cat.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name); setShowCategoryModal(true); }}
                          className="p-2 text-gray-600 hover:text-white bg-gray-50 hover:bg-brand-orange rounded border border-gray-200 transition-all cursor-pointer"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded border border-red-200 transition-all cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USERS MANAGER */}
          {activeTab === 'users' && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-gray-700 font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-mono uppercase text-gray-500 tracking-wider">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Status/Role</th>
                      <th className="py-4 px-6">Date Registered</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allUsers.map(usr => (
                      <tr key={usr.id} className={`hover:bg-gray-50/50 transition-colors ${usr.isBlocked ? 'bg-red-50/30 opacity-75' : ''}`}>
                        <td className="py-4 px-6 font-bold text-gray-900">{usr.name}</td>
                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">{usr.email}</td>
                        <td className="py-4 px-6 space-y-1">
                          {usr.isAdmin ? (
                            <span className="inline-block text-[10px] font-bold text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2 py-0.5 rounded uppercase mr-2">Admin</span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded uppercase mr-2">Customer</span>
                          )}
                          {usr.isBlocked && (
                            <span className="inline-block text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded uppercase">Blocked</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                          {new Date(usr.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!usr.isAdmin && (
                              <button
                                onClick={() => handleToggleUserBlock(usr)}
                                className={`p-2 rounded border transition-all cursor-pointer ${
                                  usr.isBlocked 
                                    ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white border-emerald-200' 
                                    : 'text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white border-amber-200'
                                }`}
                                title={usr.isBlocked ? "Unblock User" : "Block User"}
                              >
                                {usr.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              disabled={usr.isAdmin && user?.id === usr.id}
                              className={`p-2 rounded border transition-all cursor-pointer ${
                                usr.isAdmin && user?.id === usr.id
                                  ? 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
                                  : 'text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border-red-200'
                              }`}
                              title="Permanently Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200/60 p-6 sm:p-8 rounded-2xl shadow-xs space-y-8 max-w-3xl">
              <h3 className="font-display font-black text-xl text-gray-900 uppercase">Administrator Profile</h3>
              
              {alertMsg.text && (
                <div className={`p-4 rounded flex items-center gap-2.5 text-xs border ${
                  alertMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{alertMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-orange bg-gray-50">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-orange font-bold text-3xl">
                        {profileName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-900">Profile Picture</p>
                    <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded text-xs uppercase tracking-wider cursor-pointer transition-colors inline-block">
                      <Upload className="w-4 h-4 inline mr-2" /> Upload New
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Phone Number</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Change Password (Leave blank to keep current)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3.5 px-8 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: WEBSITE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-gray-200/60 p-6 sm:p-8 rounded-2xl shadow-xs space-y-8 max-w-3xl">
              <h3 className="font-display font-black text-xl text-gray-900 uppercase">Storefront Settings</h3>
              
              {alertMsg.text && (
                <div className={`p-4 rounded flex items-center gap-2.5 text-xs border ${
                  alertMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{alertMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSettingsUpdate} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="relative w-24 h-24 rounded overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                    {settingsData.logoUrl ? (
                      <img src={settingsData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Globe className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-900">Website Logo</p>
                    <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded text-xs uppercase tracking-wider cursor-pointer transition-colors inline-block">
                      <Upload className="w-4 h-4 inline mr-2" /> Upload New Logo
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Website Name</label>
                  <input
                    type="text"
                    required
                    value={settingsData.websiteName || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, websiteName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-orange" /> WhatsApp Support Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={settingsData.whatsappNumber || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, whatsappNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono flex items-center gap-1">
                      <Instagram className="w-3 h-3 text-brand-orange" /> Instagram URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={settingsData.instagramUrl || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, instagramUrl: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono flex items-center gap-1">
                      <Facebook className="w-3 h-3 text-brand-orange" /> Facebook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={settingsData.facebookUrl || ''}
                      onChange={(e) => setSettingsData({ ...settingsData, facebookUrl: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3.5 px-8 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Settings
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white border border-gray-200 w-full max-w-sm rounded-xl p-6 relative shadow-2xl animate-fade-in text-gray-900 text-left">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-black text-lg mb-4 uppercase">Edit Category</h3>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-mono">Category Name</label>
                <input
                  type="text"
                  required
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-brand-orange text-white font-bold py-3 rounded text-xs uppercase cursor-pointer">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL FORMLIST */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 overflow-y-auto py-10">
          <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto space-y-6 text-left shadow-2xl animate-slide-up text-gray-900">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-brand-orange text-xs font-mono uppercase tracking-wider font-semibold">
                <Sparkles className="w-4.5 h-4.5" /> Shoe Manager
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-gray-900">
                {editingProduct ? 'Edit Shoes Details' : 'Drop New Kicks'}
              </h2>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Shoe Model Name *</label>
                  <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange font-sans" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Brand *</label>
                  <input type="text" required value={formBrand} onChange={(e) => setFormBrand(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange font-sans" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Size Gauge *</label>
                  <input type="text" required value={formSize} onChange={(e) => setFormSize(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange font-sans" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Condition Drop *</label>
                  <select value={formCondition} onChange={(e) => setFormCondition(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange h-[46px] font-sans">
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Category Link *</label>
                  <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange h-[46px] font-sans">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Selling Price ($) *</label>
                  <input type="number" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange font-sans" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Retail Original Price ($)</label>
                  <input type="number" value={formOriginalPrice} onChange={(e) => setFormOriginalPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange font-sans" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">Description & Health *</label>
                <textarea required rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange font-sans resize-none" />
              </div>
              <div className="space-y-3.5 border-t border-gray-100 pt-4">
                <h3 className="text-xs font-mono tracking-wider text-gray-500 uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-orange" /> Product Images ({formImageUrls.length} added) *
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="relative border border-dashed border-gray-300 hover:border-brand-orange rounded p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100/50 transition-colors flex flex-col items-center gap-1.5">
                    <Upload className="w-6 h-6 text-brand-orange" />
                    <span className="text-xs font-bold text-gray-900">Upload Image Files</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase font-mono block">Or paste Direct URL:</span>
                    <div className="flex gap-2">
                      <input type="text" placeholder="https://..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-grow bg-gray-50 border border-gray-200 text-xs rounded px-3 py-2.5 text-gray-900 focus:outline-none focus:border-brand-orange" />
                      <button type="button" onClick={handleAddImageUrl} className="bg-brand-orange text-white font-bold text-xs uppercase px-3.5 rounded">Add</button>
                    </div>
                  </div>
                </div>
                {formImageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {formImageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-[4/3] bg-gray-50 border border-gray-200 rounded overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemoveImageUrl(idx)} className="absolute top-1 right-1 p-1 bg-black/75 rounded-full text-red-400 hover:text-white"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={modalLoading} className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3.5 rounded text-xs uppercase cursor-pointer flex justify-center items-center gap-2 mt-4">
                {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Shoe Drop'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
