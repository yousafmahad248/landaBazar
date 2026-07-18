import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Category, WishlistItem } from '../types';
import { apiRequest } from '../lib/api';

interface AppContextProps {
  user: User | null;
  products: Product[];
  categories: Category[];
  wishlist: string[]; // List of wishlisted product IDs
  recentlyViewed: string[]; // List of recently viewed product IDs
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone: string) => Promise<User | undefined>;
  logout: (navigate?: (path: string) => void) => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  addToRecentlyViewed: (productId: string) => void;
  updateProfile: (name: string, phone: string, email: string, profilePicture?: string, password?: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'sellerId' | 'sellerName'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getUserProducts: () => Promise<Product[]>;
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  blockUser: (id: string, isBlocked: boolean) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState<any>({ websiteName: 'Thrifted Kicks' });
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get current session from Supabase
        const response = await apiRequest<User>('/api/auth/profile');
        if (response) {
          setUser(response);
        }
      } catch (err) {
        // No active session
        console.log('No active session found');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Initial Data Fetching
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prods = await apiRequest<Product[]>('/api/products');
      setProducts(prods);

      // Fetch Categories
      const cats = await apiRequest<Category[]>('/api/categories');
      setCategories(cats);

      // Fetch Settings
      const sets = await apiRequest<any>('/api/settings');
      setSettings(sets);

      // Fetch Profile & Wishlist if logged in
      if (user) {
        try {
          const wish = await apiRequest<WishlistItem[]>('/api/wishlist');
          setWishlist(wish.map(item => item.productId));
        } catch (authErr) {
          console.warn('Error fetching wishlist:', authErr);
        }
      }
    } catch (err) {
      console.error('Error loading initial data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const refreshProducts = async () => {
    try {
      const prods = await apiRequest<Product[]>('/api/products');
      setProducts(prods);
    } catch (err) {
      console.error('Error refreshing products:', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const cats = await apiRequest<Category[]>('/api/categories');
      setCategories(cats);
    } catch (err) {
      console.error('Error refreshing categories:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiRequest<{ session: any; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setUser(data.user);
      // Store authentication token
      if (data.session?.access_token) {
        localStorage.setItem('token', data.session.access_token);
      }
      // Store user email for dev token authentication
      localStorage.setItem('userEmail', email);
      return data.user;
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const data = await apiRequest<{ message: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone })
      });
      // Note: User needs to confirm email before logging in
      console.log(data.message);
      // Return the user data anyway for UI feedback
      return data.user;
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const logout = async (navigate?: (path: string) => void) => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setWishlist([]);
      // Clear stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      // Redirect to login page if navigate function is provided
      if (navigate) {
        navigate('/login');
      }
    }
  };

  const updateProfile = async (name: string, phone: string, email: string, profilePicture?: string, password?: string) => {
    try {
      const updatedUser = await apiRequest<User>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, email, profilePicture, password })
      });
      setUser(updatedUser);
    } catch (err: any) {
      throw new Error(err.message || 'Profile update failed');
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      // Redirect to login or show alert
      throw new Error('Please login to manage your wishlist');
    }

    const isWishlisted = wishlist.includes(productId);
    try {
      if (isWishlisted) {
        await apiRequest(`/api/wishlist/${productId}`, { method: 'DELETE' });
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        await apiRequest('/api/wishlist', {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
        setWishlist(prev => [...prev, productId]);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10); // Keep last 10 viewed
      localStorage.setItem('recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  const isAdmin = !!user?.isAdmin;

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'sellerId' | 'sellerName'>): Promise<Product> => {
    if (!user) {
      throw new Error('You must be logged in to add a product');
    }

    const data = await apiRequest<Product>('/api/user/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });

    // Refresh products list
    await refreshProducts();
    return data;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    if (!user) throw new Error('You must be logged in to update a product');
    
    const data = await apiRequest<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    await refreshProducts();
    return data;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!user) throw new Error('You must be logged in to delete a product');
    
    await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
    await refreshProducts();
  };

  const getUserProducts = async (): Promise<Product[]> => {
    if (!user) {
      throw new Error('You must be logged in to view your products');
    }

    return await apiRequest<Product[]>('/api/user/products');
  };

  const updateSettings = async (newSettings: any) => {
    const updated = await apiRequest<any>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(newSettings)
    });
    setSettings(updated);
  };

  const updateCategory = async (id: string, name: string) => {
    await apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
    await refreshCategories();
  };

  const blockUser = async (id: string, isBlocked: boolean) => {
    await apiRequest(`/api/admin/users/${id}/block`, {
      method: 'PUT',
      body: JSON.stringify({ isBlocked })
    });
  };

  const deleteUser = async (id: string) => {
    await apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        categories,
        wishlist,
        recentlyViewed,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshProducts,
        refreshCategories,
        toggleWishlist,
        addToRecentlyViewed,
        updateProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        getUserProducts,
        settings,
        updateSettings,
        updateCategory,
        blockUser,
        deleteUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
