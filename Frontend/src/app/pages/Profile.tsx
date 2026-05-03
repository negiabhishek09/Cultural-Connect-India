import { useEffect, useRef, useState } from 'react';
import { API } from '../api/axios';
import { motion } from 'motion/react';
import { Camera, Loader2, ShoppingBag, Heart, Bookmark, Grid3X3 } from 'lucide-react';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useApp } from '../context/AppContext';
import { products, exploreItems } from '../data/dummyData';
import { toast } from 'sonner';

const CLOUD_NAME = 'dgultnzuv';
const UPLOAD_PRESET = 'cultural-connect-india';

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'culture-connect/avatars');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url;
}

interface BackendPost {
  _id: string;
  image: string;
  caption: string;
  likeCount: number;
  isLiked: boolean;
}

interface BackendOrder {
  _id: string;
  items: { name: string; image: string; price: number; quantity: number }[];
  totalAmount: number;
  status: string;
  address: string;
  createdAt: string;
}

export function Profile() {
  const { user, posts, savedItems, likedPosts, login, logout, updateUser } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked' | 'orders'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [backendOrders, setBackendOrders] = useState<BackendOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ✅ Liked posts backend se
  const [likedPostsList, setLikedPostsList] = useState<BackendPost[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  useEffect(() => {
    API.get('/auth/me')
      .then((res) => login(res.data.data))
      .catch(() => logout());
  }, []);

  // Orders fetch
  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      API.get('/orders')
        .then((res) => setBackendOrders(res.data.data || []))
        .catch(() => toast.error('Orders load nahi hue'))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  // ✅ Liked posts fetch — backend se
  useEffect(() => {
    if (activeTab === 'liked') {
      setLikedLoading(true);
      API.get('/posts/liked')
        .then((res) => setLikedPostsList(res.data.data || []))
        .catch(() => toast.error('Liked posts load nahi hue'))
        .finally(() => setLikedLoading(false));
    }
  }, [activeTab]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Sirf image file select karo'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image 5MB se chhoti honi chahiye'); return; }
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      await API.put('/auth/update-profile', { avatar: url });
      updateUser({ avatar: url });
      toast.success('Profile photo update ho gayi! 🎉');
    } catch {
      toast.error('Upload fail ho gayi, dobara try karo');
    } finally {
      setUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await API.put('/auth/update-profile', formData);
      login(res.data.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setIsEditing(false);
      toast.success('Profile update ho gaya!');
    } catch {
      toast.error('Update fail ho gaya');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Please log in to view your profile</p>
          <motion.button
            onClick={() => (window.location.href = '/login')}
            className="px-6 py-3 bg-orange-600 text-white rounded-full font-semibold"
          >
            Go to Login
          </motion.button>
        </div>
      </div>
    );
  }

  const userPosts = posts.filter((p) => p.user?.email === user?.email);
  // ✅ dummy data se sirf saved cultures (products/explore) filter ho rahi hain — yeh theek hai
  const savedCultures = [...products, ...exploreItems].filter((item) => savedItems.includes(item.id));

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid3X3, count: userPosts.length },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: savedCultures.length },
    { id: 'liked', label: 'Liked', icon: Heart, count: likedPosts.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: backendOrders.length },
  ] as const;

  const stats = [
    { label: 'Posts', value: userPosts.length.toString() },
    { label: 'Orders', value: backendOrders.length.toString() },
    { label: 'Saved', value: savedItems.length.toString() },
    { label: 'Liked', value: likedPosts.length.toString() },
  ];

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Profile Header */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <motion.div
                  className="relative w-32 h-32 cursor-pointer group"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => !uploading && avatarInputRef.current?.click()}
                >
                  <div className="w-32 h-32 rounded-full bg-orange-500 p-1">
                    <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                      <ImageWithFallback src={user?.avatar || ''} alt={user?.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading ? <Loader2 size={28} className="text-white animate-spin" /> : <Camera size={28} className="text-white" />}
                  </div>
                </motion.div>
                <p className="text-xs text-gray-400">{uploading ? 'Uploading...' : 'Click to change photo'}</p>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                <div className="flex gap-4 justify-center md:justify-start mt-2 text-gray-600">
                  <span>{user?.location || 'Location not added'}</span>
                  <span>Joined {user?.joinedDate || 'Recently'}</span>
                </div>

                <button onClick={() => setIsEditing(true)} className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg">
                  Edit Profile
                </button>

                {isEditing ? (
                  <div className="space-y-3 mt-4">
                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border p-2 w-full rounded-lg" placeholder="Name" />
                    <input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="border p-2 w-full rounded-lg" placeholder="Location" />
                    <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="border p-2 w-full rounded-lg" placeholder="Bio" />
                    <div className="flex gap-3">
                      <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                      <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-gray-700">{user?.bio || 'No bio available'}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center bg-orange-50 p-3 rounded-xl">
                      <p className="font-bold text-orange-600">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-500 hover:text-orange-500'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div>
                  {userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No posts yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {userPosts.map((post) => (
                        <div key={post.id} className="rounded-2xl overflow-hidden aspect-square">
                          <ImageWithFallback src={post.image} alt={post.caption} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Saved Tab */}
              {activeTab === 'saved' && (
                <div>
                  {savedCultures.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No saved items yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {savedCultures.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-2xl overflow-hidden">
                          <ImageWithFallback src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                          <div className="p-3">
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Liked Tab — backend se */}
              {activeTab === 'liked' && (
                <div>
                  {likedLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-3">Loading...</p>
                    </div>
                  ) : likedPostsList.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No liked posts yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {likedPostsList.map((post) => (
                        <div key={post._id} className="rounded-2xl overflow-hidden aspect-square">
                          <ImageWithFallback src={post.image} alt={post.caption} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-3">Loading orders...</p>
                    </div>
                  ) : backendOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {backendOrders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm text-gray-500">Order ID</p>
                              <p className="font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex gap-2 mb-3 overflow-x-auto">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden">
                                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                            <p className="font-bold text-orange-600">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 truncate">{order.address}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}