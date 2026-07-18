import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Upload, Plus, X, CheckCircle2, AlertCircle, Package, Image as ImageIcon, Save } from 'lucide-react';
import { Category } from '../types';

export const SellShoes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, categories, addProduct, updateProduct, products, isAdmin } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    size: '',
    condition: 'Good' as 'Like New' | 'Good' | 'Fair',
    description: '',
    price: '',
    categoryId: '',
    imageUrls: [''] // Start with one empty image URL
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingImages, setUploadingImages] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEditing) {
      const existingProduct = products.find(p => p.id === id);
      if (!existingProduct) {
        setMessage({ type: 'error', text: 'Product not found.' });
        return;
      }
      
      // Verify ownership
      if (existingProduct.sellerId !== user.id && !isAdmin) {
        navigate('/shop');
        return;
      }

      setFormData({
        name: existingProduct.name,
        brand: existingProduct.brand,
        size: existingProduct.size,
        condition: existingProduct.condition,
        description: existingProduct.description,
        price: existingProduct.price.toString(),
        categoryId: existingProduct.categoryId,
        imageUrls: existingProduct.imageUrls.length > 0 ? existingProduct.imageUrls : ['']
      });
    }
  }, [user, navigate, id, products, isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const removeImageField = (index: number) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      // Get auth token
      const token = localStorage.getItem('token');

      for (const file of Array.from(files)) {
        // Convert image to base64
        const base64 = await convertToBase64(file);
        
        // Upload to server with authentication
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();
        if (data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        } else if (data.message) {
          console.error('Upload failed:', data.message);
        }
      }

      // Add uploaded URLs to form
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls.filter(url => url.trim() !== ''), ...uploadedUrls]
        }));
        setMessage({ type: 'success', text: `${uploadedUrls.length} image(s) uploaded successfully!` });
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setMessage({ type: 'error', text: 'Failed to upload some images. Please try again.' });
    } finally {
      setUploadingImages(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      console.log('📝 Submitting product:', formData);

      // Filter out empty image URLs
      const validImageUrls = formData.imageUrls.filter(url => url.trim() !== '');
      
      if (validImageUrls.length === 0) {
        throw new Error('Please add at least one image');
      }

      if (!formData.name || !formData.brand || !formData.size || !formData.description || !formData.price || !formData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      const productData = {
        name: formData.name,
        brand: formData.brand,
        size: formData.size,
        condition: formData.condition,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        imageUrls: validImageUrls
      };

      if (isEditing && id) {
        await updateProduct(id, productData);
        setMessage({ type: 'success', text: 'Shoe updated successfully!' });
      } else {
        await addProduct({
          ...productData,
          stockStatus: 'In Stock' as const,
          isFeatured: false,
          isNewArrival: true,
          isBestDeal: false
        });
        setMessage({ type: 'success', text: 'Your shoe has been listed successfully!' });
      }

      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: '',
          brand: '',
          size: '',
          condition: 'Good',
          description: '',
          price: '',
          categoryId: '',
          imageUrls: ['']
        });
      }

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      console.error('❌ Error listing product:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to list your shoe. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand-orange/10 p-2 rounded-lg">
            <Package className="w-6 h-6 text-brand-orange" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-gray-900 tracking-tight">
            {isEditing ? 'Edit Your Shoes' : 'Sell Your Shoes'}
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          {isEditing ? 'Update the details for your listed pair' : 'List your preloved kicks and give them a second life'}
        </p>
      </div>

      <div className="bg-white border border-gray-200/60 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded flex items-center gap-2.5 text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Air Jordan 1 Retro High OG"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
            />
          </div>

          {/* Brand and Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g., Nike, Adidas, Jordan"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
                Size *
              </label>
              <input
                type="text"
                name="size"
                required
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., US 10 / EU 44"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {/* Condition and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
              Price ($) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
              Description *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe the condition, any flaws, and what makes these shoes special..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
                Product Images *
              </label>
              <label className="flex items-center gap-1.5 text-[10px] text-brand-orange hover:text-brand-orange-dark font-bold uppercase tracking-wider cursor-pointer">
                <ImageIcon className="w-3.5 h-3.5" />
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>
            </div>

            {uploadingImages && (
              <div className="flex items-center gap-2 text-xs text-brand-orange">
                <Upload className="w-4 h-4 animate-spin" />
                Uploading images...
              </div>
            )}

            {/* Image Preview Grid */}
            {formData.imageUrls.filter(url => url.trim() !== '').length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                {formData.imageUrls.filter(url => url.trim() !== '').map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Invalid+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImageUrls = formData.imageUrls.filter((_, i) => {
                          const validUrls = formData.imageUrls.filter(u => u.trim() !== '');
                          const validIndex = validUrls.indexOf(url);
                          return i !== validIndex || validIndex === -1;
                        });
                        setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Manual URL Input */}
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-bold">
                Or add image URLs manually:
              </p>
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-grow bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded px-4 py-3 focus:outline-none focus:border-brand-orange"
                  />
                  {formData.imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 px-3 py-2 rounded transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center gap-1.5 text-[10px] text-brand-orange hover:text-brand-orange-dark font-bold uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another URL
              </button>
            </div>

            <p className="text-[10px] text-gray-500">
              Upload images from your device or add image URLs manually. At least one image is required.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-4 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {loading ? 'Saving...' : (isEditing ? 'Update Shoe Details' : 'List My Shoes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};