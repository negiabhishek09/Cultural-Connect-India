import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit, Upload, X, Loader2, Package, Compass, CalendarDays, LayoutDashboard, MessageSquare } from 'lucide-react';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { API } from '../api/axios';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminDashboard } from './AdminDashboard';

const CLOUD_NAME = 'dgultnzuv';
const UPLOAD_PRESET = 'cultural-connect-india';

async function uploadImageToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `culture-connect/${folder}`);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST', body: formData,
  });
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url;
}

const emptyEventForm = {
  name: '', description: '', image: '', tag: '',
  startDate: '', endDate: '', location: '', venue: '',
  stateId: '', categoryId: '', isFeatured: false,
};

const emptyProductForm = {
  name: '', price: '', originalPrice: '', image: '',
  rating: '0', reviews: '0', category: '', description: '',
};

const emptyExploreForm = {
  title: '', category: '', location: '', rating: '0',
  image: '', price: '', description: '',
};

const emptyCommunityForm = {
  caption: '',
  image: '',
  location: '',
  categoryId: '',
};

type Tab = 'dashboard' | 'events' | 'products' | 'explore' | 'community';

export function AdminPanel() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const [events, setEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [exploreItems, setExploreItems] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [exploreForm, setExploreForm] = useState(emptyExploreForm);
  const [communityForm, setCommunityForm] = useState(emptyCommunityForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Access denied');
      navigate('/');
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [evRes, prRes, exRes, postRes] = await Promise.all([
        API.get('/events'),
        API.get('/products'),
        API.get('/explore'),
        API.get('/posts'),
      ]);
      setEvents(evRes.data.data || []);
      setProducts(prRes.data.data || []);
      setExploreItems(exRes.data.data || []);
      setPosts(postRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Sirf image select karo'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image 10MB se chhoti honi chahiye'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setEventForm(emptyEventForm);
    setProductForm(emptyProductForm);
    setExploreForm(emptyExploreForm);
    setCommunityForm(emptyCommunityForm);
    setImageFile(null);
    setImagePreview('');
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    if (activeTab === 'events') {
      setEventForm({
        name: item.name || '', description: item.description || '',
        image: item.image || '', tag: item.tag || '',
        startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : '',
        location: item.location || '', venue: item.venue || '',
        stateId: item.stateId?._id || item.stateId || '',
        categoryId: item.categoryId?._id || item.categoryId || '',
        isFeatured: item.isFeatured || false,
      });
    } else if (activeTab === 'products') {
      setProductForm({
        name: item.name || '', price: item.price || '',
        originalPrice: item.originalPrice || '', image: item.image || '',
        rating: String(item.rating || 0), reviews: String(item.reviews || 0),
        category: item.category || '', description: item.description || '',
      });
    } else if (activeTab === 'explore') {
      setExploreForm({
        title: item.title || '', category: item.category || '',
        location: item.location || '', rating: String(item.rating || 0),
        image: item.image || '', price: item.price || '',
        description: item.description || '',
      });
    } else if (activeTab === 'community') {
      setCommunityForm({
        caption: item.caption || '',
        image: item.image || '',
        location: item.location || '',
        categoryId: item.categoryId?._id || item.categoryId || '',
      });
    }
    setImagePreview(item.image || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Delete — direct state update, no fetchAll
  const handleDelete = async (id: string, type: Tab) => {
    if (!confirm('Delete karna chahte ho?')) return;
    try {
      const url =
        type === 'events' ? `/events/${id}`
        : type === 'products' ? `/products/${id}`
        : type === 'community' ? `/posts/${id}`
        : `/explore/${id}`;

      await API.delete(url);
      toast.success('Delete ho gaya!');

      if (type === 'events') setEvents(prev => prev.filter(e => e._id !== id));
      else if (type === 'products') setProducts(prev => prev.filter(p => p._id !== id));
      else if (type === 'community') setPosts(prev => prev.filter(p => p._id !== id));
      else setExploreItems(prev => prev.filter(e => e._id !== id));

    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete fail ho gaya');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl =
        activeTab === 'events' ? eventForm.image
        : activeTab === 'products' ? productForm.image
        : activeTab === 'community' ? communityForm.image
        : exploreForm.image;

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImageToCloudinary(imageFile, activeTab);
        setUploading(false);
      }

      if (!imageUrl) { toast.error('Image zaroori hai'); return; }

      let payload: any;
      let url: string;

      if (activeTab === 'events') {
        payload = { ...eventForm, image: imageUrl };
        url = editing ? `/events/${editing._id}` : '/events';
      } else if (activeTab === 'products') {
        payload = { ...productForm, image: imageUrl, rating: Number(productForm.rating), reviews: Number(productForm.reviews) };
        url = editing ? `/products/${editing._id}` : '/products';
      } else if (activeTab === 'community') {
        payload = { ...communityForm, image: imageUrl };
        url = editing ? `/posts/${editing._id}` : '/posts';
      } else {
        payload = { ...exploreForm, image: imageUrl, rating: Number(exploreForm.rating) };
        url = editing ? `/explore/${editing._id}` : '/explore';
      }

      if (editing) {
        const res = await API.patch(url, payload);
        const updated = res.data.data;
        toast.success('Update ho gaya!');

        // ✅ FIX: Edit ke baad bhi direct state update — fetchAll ki zaroorat nahi
        if (activeTab === 'events') setEvents(prev => prev.map(e => e._id === editing._id ? { ...e, ...updated } : e));
        else if (activeTab === 'products') setProducts(prev => prev.map(p => p._id === editing._id ? { ...p, ...updated } : p));
        else if (activeTab === 'community') setPosts(prev => prev.map(p => p._id === editing._id ? { ...p, ...updated } : p));
        else setExploreItems(prev => prev.map(e => e._id === editing._id ? { ...e, ...updated } : e));

      } else {
        const res = await API.post(url, payload);
        const created = res.data.data;
        toast.success('Create ho gaya!');

        // ✅ FIX: Create ke baad bhi direct state update
        if (activeTab === 'events') setEvents(prev => [created, ...prev]);
        else if (activeTab === 'products') setProducts(prev => [created, ...prev]);
        else if (activeTab === 'community') setPosts(prev => [created, ...prev]);
        else setExploreItems(prev => [created, ...prev]);
      }

      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error aa gaya');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'events', label: 'Events', icon: CalendarDays, count: events.length },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'explore', label: 'Explore', icon: Compass, count: exploreItems.length },
    { id: 'community', label: 'Community', icon: MessageSquare, count: posts.length },
  ];

  const currentList =
    activeTab === 'events' ? events
    : activeTab === 'products' ? products
    : activeTab === 'explore' ? exploreItems
    : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      <div className="pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Header */}
          <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin <span className="text-orange-600">Panel</span></h1>
              <p className="text-gray-500 mt-1">Sab kuch manage karo</p>
            </div>
            {activeTab !== 'dashboard' && (
              <motion.button
                onClick={() => { setShowForm(!showForm); setEditing(null); }}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                {showForm ? <X size={20} /> : <Plus size={20} />}
                {showForm ? 'Cancel' : `New ${activeTab === 'events' ? 'Event' : activeTab === 'products' ? 'Product' : activeTab === 'community' ? 'Post' : 'Explore Item'}`}
              </motion.button>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as Tab); resetForm(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && <AdminDashboard />}

          {/* Form */}
          {activeTab !== 'dashboard' && (
            <AnimatePresence>
              {showForm && (
                <motion.div
                  className="bg-white rounded-3xl shadow-lg p-8 mb-8"
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    {editing ? '✏️ Edit karo' : '➕ Naya add karo'} — {activeTab}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {activeTab === 'events' && <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
                          <input type="text" value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Diwali Festival 2026" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Tag *</label>
                          <input type="text" value={eventForm.tag} onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Festival" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                          <input type="datetime-local" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                          <input type="datetime-local" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                          <input type="text" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Delhi, India" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Venue</label>
                          <input type="text" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="India Gate" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">State ID *</label>
                          <input type="text" value={eventForm.stateId} onChange={(e) => setEventForm({ ...eventForm, stateId: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="MongoDB ObjectId" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category ID *</label>
                          <input type="text" value={eventForm.categoryId} onChange={(e) => setEventForm({ ...eventForm, categoryId: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="MongoDB ObjectId" required />
                        </div>
                      </>}

                      {activeTab === 'products' && <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                          <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Banarasi Silk Saree" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                          <input type="text" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Clothing" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                          <input type="text" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="₹8,999" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price *</label>
                          <input type="text" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="₹12,999" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (0-5)</label>
                          <input type="number" min="0" max="5" step="0.1" value={productForm.rating} onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Reviews Count</label>
                          <input type="number" min="0" value={productForm.reviews} onChange={(e) => setProductForm({ ...productForm, reviews: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" />
                        </div>
                      </>}

                      {activeTab === 'explore' && <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                          <input type="text" value={exploreForm.title} onChange={(e) => setExploreForm({ ...exploreForm, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Rajasthan Heritage Tour" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                          <input type="text" value={exploreForm.category} onChange={(e) => setExploreForm({ ...exploreForm, category: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Traditions" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                          <input type="text" value={exploreForm.location} onChange={(e) => setExploreForm({ ...exploreForm, location: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Jaipur, Rajasthan" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                          <input type="text" value={exploreForm.price} onChange={(e) => setExploreForm({ ...exploreForm, price: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="₹2,999" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (0-5)</label>
                          <input type="number" min="0" max="5" step="0.1" value={exploreForm.rating} onChange={(e) => setExploreForm({ ...exploreForm, rating: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" />
                        </div>
                      </>}

                      {activeTab === 'community' && <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Caption *</label>
                          <input type="text" value={communityForm.caption} onChange={(e) => setCommunityForm({ ...communityForm, caption: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Exploring Hawa Mahal at sunset 🌅" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          <input type="text" value={communityForm.location} onChange={(e) => setCommunityForm({ ...communityForm, location: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="Jaipur, Rajasthan" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category ID</label>
                          <input type="text" value={communityForm.categoryId} onChange={(e) => setCommunityForm({ ...communityForm, categoryId: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" placeholder="MongoDB ObjectId (optional)" />
                        </div>
                      </>}

                    </div>

                    {activeTab !== 'community' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                        <textarea
                          value={activeTab === 'events' ? eventForm.description : activeTab === 'products' ? productForm.description : exploreForm.description}
                          onChange={(e) => {
                            if (activeTab === 'events') setEventForm({ ...eventForm, description: e.target.value });
                            else if (activeTab === 'products') setProductForm({ ...productForm, description: e.target.value });
                            else setExploreForm({ ...exploreForm, description: e.target.value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          rows={3} placeholder="Description likho..." required
                        />
                      </div>
                    )}

                    {activeTab === 'events' && (
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="isFeatured" checked={eventForm.isFeatured}
                          onChange={(e) => setEventForm({ ...eventForm, isFeatured: e.target.checked })}
                          className="w-5 h-5 accent-orange-600" />
                        <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700">Featured Event</label>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      {imagePreview ? (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-orange-300">
                          <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setImagePreview(''); setImageFile(null); }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <motion.div onClick={() => imageInputRef.current?.click()}
                          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
                          whileHover={{ scale: 1.01 }}>
                          <Upload size={32} className="text-gray-400 mb-2" />
                          <p className="text-gray-500 font-medium">Click to upload an image.</p>
                          <p className="text-gray-400 text-sm">it will be saved on Cloudinary</p>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <motion.button type="submit" disabled={submitting}
                        className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {submitting ? (
                          <><Loader2 size={18} className="animate-spin" />{uploading ? 'Image upload ho rahi hai...' : 'Save ho raha hai...'}</>
                        ) : (editing ? 'Update' : 'Create')}
                      </motion.button>
                      <button type="button" onClick={resetForm}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* List */}
          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {activeTab === 'events' ? 'All Events'
                  : activeTab === 'products' ? 'All Products'
                  : activeTab === 'community' ? 'All Community Posts'
                  : 'All Explore Items'} ({currentList.length})
              </h2>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
              ) : currentList.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">Koi item nahi hai abhi</p>
                  <p className="text-sm">Upar "New" button se add karo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentList.map((item: any) => (
                    <motion.div key={item._id}
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-all"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <img src={item.image} alt={item.name || item.title || item.caption}
                        className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {item.name || item.title || item.caption}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.location || item.category || item.price}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {(item.tag || item.category) && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                              {item.tag || item.category}
                            </span>
                          )}
                          {item.isFeatured && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full font-medium">Featured</span>
                          )}
                          {activeTab === 'community' && (
                            <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full font-medium">
                              ❤️ {item.likeCount ?? item.likes?.length ?? 0} likes
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex-shrink-0">
                        {item.price || (item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN') : '')}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <motion.button onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" whileTap={{ scale: 0.9 }}>
                          <Edit size={18} />
                        </motion.button>
                        <motion.button onClick={() => handleDelete(item._id, activeTab)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg" whileTap={{ scale: 0.9 }}>
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}