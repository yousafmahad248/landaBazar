export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  isBlocked?: boolean;
  profilePicture?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  size: string; // e.g., "US 9.5 / EU 43" or "43"
  condition: 'Like New' | 'Good' | 'Fair';
  description: string;
  price: number;
  originalPrice?: number; // For "Best Deals" discounts
  stockStatus: 'In Stock' | 'Sold';
  categoryId: string;
  imageUrls: string[]; // At least 1 image, supports multiple
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestDeal: boolean;
  sellerId?: string; // ID of the user who listed the product
  sellerName?: string; // Name of the user who listed the product
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  shoeType: string;
  date: string;
}

export interface Settings {
  id?: string;
  websiteName: string;
  logoUrl?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}
