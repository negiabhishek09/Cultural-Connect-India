import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'USER' | 'ARTISAN' | 'BUSINESS_OWNER' | 'ADMIN';

export interface Product {
  id: string;
  name: string;
  price: string | number;
  originalPrice: string | number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  location?: string;
  bio?: string;
  joinedDate?: string;
}

export interface Post {
  id: string;
  user: {
    name: string;
    email?: string;
    avatar: string;
    location: string;
  };
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  time: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  address: Address;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
}

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (fields: Partial<User>) => void;
  isAuthenticated: boolean;

  savedItems: string[];
  toggleSave: (itemId: string) => void;

  likedPosts: string[];
  toggleLike: (postId: string) => void;

  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'time'>) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'time'>) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  notifications: number;
  addNotification: () => void;
  clearNotifications: () => void;

  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  orders: Order[];
  createOrder: (items: CartItem[], address: Address, paymentMethod: string) => Order;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [savedItems, setSavedItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedItems') || '[]'); }
    catch { return []; }
  });

  const [likedPosts, setLikedPosts] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('likedPosts') || '[]'); }
    catch { return []; }
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    try { return JSON.parse(localStorage.getItem('addresses') || '[]'); }
    catch { return []; }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try { return JSON.parse(localStorage.getItem('orders') || '[]'); }
    catch { return []; }
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications, setNotifications] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('notifications') || '0'); }
    catch { return 0; }
  });

  // Auto login
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch { }
  }, []);

  // ================= AUTH =================

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('likedPosts');
    localStorage.removeItem('savedItems');
  };

  const updateUser = (fields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // ================= NOTIFICATIONS =================

  const addNotification = () => {
    setNotifications((prev) => {
      const updated = prev + 1;
      localStorage.setItem('notifications', String(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications(0);
    localStorage.setItem('notifications', '0');
  };

  // ================= CART =================

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    authFetch('/api/v1/user/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    }).catch((err) => console.error('Cart sync error:', err));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    authFetch(`/api/v1/user/cart/${productId}`, { method: 'DELETE' })
      .catch((err) => console.error('Cart remove error:', err));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
    authFetch(`/api/v1/user/cart/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }).catch((err) => console.error('Cart update error:', err));
  };

  const clearCart = () => {
    setCart([]);
    authFetch('/api/v1/user/cart/clear', { method: 'DELETE' })
      .catch((err) => console.error('Cart clear error:', err));
  };

  // ================= SAVED =================

  const toggleSave = (itemId: string) => {
    setSavedItems((prev) => {
      const updated = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem('savedItems', JSON.stringify(updated));
      return updated;
    });
  };

  // ================= LIKE — ✅ Backend sync =================

  const toggleLike = async (postId: string) => {
    // Optimistic UI update
    setLikedPosts((prev) => {
      const updated = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      localStorage.setItem('likedPosts', JSON.stringify(updated));
      return updated;
    });

    // Backend sync
    try {
      await authFetch(`/api/v1/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Like sync error:', err);
      // Revert on failure
      setLikedPosts((prev) => {
        const reverted = prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId];
        localStorage.setItem('likedPosts', JSON.stringify(reverted));
        return reverted;
      });
    }
  };

  // ================= POSTS =================

  const addPost = (post: Omit<Post, 'id' | 'likes' | 'comments' | 'time'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      likes: 0,
      comments: [],
      time: 'Just now',
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const addComment = (postId: string, comment: Omit<Comment, 'id' | 'time'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      time: 'Just now',
    };
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  // ================= ADDRESS =================

  const addAddress = (address: Omit<Address, 'id'>) => {
    setAddresses((prev) => {
      const newAddress = { ...address, id: Date.now().toString() };
      const updated = address.isDefault
        ? [...prev.map((a) => ({ ...a, isDefault: false })), newAddress]
        : [...prev, newAddress];
      localStorage.setItem('addresses', JSON.stringify(updated));
      return updated;
    });
  };

  const updateAddress = (id: string, address: Partial<Address>) => {
    setAddresses((prev) => {
      const updated = prev.map((addr) => (addr.id === id ? { ...addr, ...address } : addr));
      localStorage.setItem('addresses', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const updated = prev.filter((addr) => addr.id !== id);
      localStorage.setItem('addresses', JSON.stringify(updated));
      return updated;
    });
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) => {
      const updated = prev.map((addr) => ({ ...addr, isDefault: addr.id === id }));
      localStorage.setItem('addresses', JSON.stringify(updated));
      return updated;
    });
  };

  // ================= ORDERS =================

  const createOrder = (items: CartItem[], address: Address, paymentMethod: string): Order => {
    const total = items.reduce((sum, item) => {
      const price = typeof item.price === 'string'
        ? parseInt(item.price.replace(/[^0-9]/g, ''))
        : item.price;
      return sum + price * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      items,
      total,
      address,
      paymentMethod,
      status: 'confirmed',
      date: new Date().toLocaleDateString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('orders', JSON.stringify(updated));
      return updated;
    });

    addNotification();
    return newOrder;
  };

  return (
    <AppContext.Provider
      value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart,
        user, login, logout, updateUser, isAuthenticated: !!user,
        savedItems, toggleSave,
        likedPosts, toggleLike,
        posts, addPost, addComment,
        searchQuery, setSearchQuery,
        notifications, addNotification, clearNotifications,
        addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
        orders, createOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}