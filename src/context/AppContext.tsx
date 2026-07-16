import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Category, WishlistItem } from '../types';
import { apiRequest } from '../lib/api';

interface AppContextProps {
  user: User | null;
  token: string | null;
  products: Product[];
  categories: Category[];
  wishlist: string[]; // List of wishlisted product IDs
  recentlyViewed: string[]; // List of recently viewed product IDs
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  addToRecentlyViewed: (productId: string) => void;
  updateProfile: (name: string, phone: string, email: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'sellerId' | 'sellerName'>) => Promise<Product>;
  getUserProducts: () => Promise<Product[]>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
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
  const [loading, setLoading] = useState<boolean>(true);

  // Sync token to state & localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

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

      // Fetch Profile & Wishlist if logged in
      if (token) {
        try {
          const profile = await apiRequest<User>('/api/auth/profile');
          setUser(profile);

          const wish = await apiRequest<WishlistItem[]>('/api/wishlist');
          setWishlist(wish.map(item => item.productId));
        } catch (authErr) {
          console.warn('Stale auth token, logging out:', authErr);
          logout();
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
  }, [token]);

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
      const data = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const data = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone })
      });
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('token');
  };

  const updateProfile = async (name: string, phone: string, email: string) => {
    try {
      const updatedUser = await apiRequest<User>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, email })
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

  const getUserProducts = async (): Promise<Product[]> => {
    if (!user) {
      throw new Error('You must be logged in to view your products');
    }

    return await apiRequest<Product[]>('/api/user/products');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
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
        getUserProducts
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
