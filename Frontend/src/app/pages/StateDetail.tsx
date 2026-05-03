import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Package, Compass, ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { API } from '../api/axios';
import { toast } from 'sonner';

export function StateDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [exploreItems, setExploreItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'products' | 'explore'>('events');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchStateData();
  }, [slug]);

  const fetchStateData = async () => {
    setLoading(true);
    try {
      // Fetch state details
      const stateRes = await API.get(`/states/${slug}`);
      const stateData = stateRes.data.data;
      setState(stateData);

      // Fetch related data using stateId
      const [eventsRes, productsRes, exploreRes] = await Promise.all([
        API.get(`/events?stateId=${stateData._id}`),
        API.get(`/products?stateId=${stateData._id}`),
        API.get(`/explore?stateId=${stateData._id}`),
      ]);

      setEvents(eventsRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setExploreItems(exploreRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('State load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">State nahi mila</p>
          <button onClick={() => navigate('/states')} className="px-6 py-3 bg-orange-600 text-white rounded-full">
            Back to States
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'events', label: 'Events', count: events.length, icon: Calendar },
    { id: 'products', label: 'Products', count: products.length, icon: Package },
    { id: 'explore', label: 'Explore', count: exploreItems.length, icon: Compass },
  ];

  const mapsUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(state.name + ', India')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img src={state.image} alt={state.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute top-28 left-6">
          <motion.button
            onClick={() => navigate('/states')}
            className="flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
        </div>

        <div className="absolute bottom-8 left-6 right-6">
          <h1 className="text-5xl font-bold text-white mb-2">{state.name}</h1>
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-orange-400" />
              <span>{state.capital}</span>
            </div>
            <span className="px-3 py-1 bg-orange-600 rounded-full text-sm font-semibold">
              {state.region} India
            </span>
          </div>
          <p className="text-white/70 mt-2 max-w-2xl">{state.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-600">{events.length}</p>
            <p className="text-sm text-gray-500">Events</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-600">{products.length}</p>
            <p className="text-sm text-gray-500">Products</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-600">{exploreItems.length}</p>
            <p className="text-sm text-gray-500">Experiences</p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-600 rounded-2xl p-4 shadow-sm text-center flex flex-col items-center justify-center gap-1 hover:bg-orange-700 transition-colors"
          >
            <ExternalLink size={20} className="text-white" />
            <p className="text-sm text-white font-semibold">View on Map</p>
          </a>
        </div>

        {/* Highlights */}
        {state.highlights && (
          <div className="bg-orange-50 rounded-2xl p-6 mb-10">
            <h3 className="font-bold text-gray-900 mb-2">✨ Highlights</h3>
            <p className="text-gray-600">{state.highlights}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === tab.id ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-orange-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            {events.length === 0 ? (
              <EmptyState text="Is state mein koi event nahi hai abhi" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, i) => (
                  <motion.div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                        {event.tag}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2">{event.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar size={14} className="text-orange-500" />
                        <span>{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(event.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-orange-600 hover:underline"
                      >
                        <MapPin size={14} />
                        {event.location} 📍
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <EmptyState text="Is state mein koi product nahi hai abhi" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, i) => (
                  <motion.div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-orange-600">{product.price}</span>
                        <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <div>
            {exploreItems.length === 0 ? (
              <EmptyState text="Is state mein koi experience nahi hai abhi" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exploreItems.map((item, i) => (
                  <motion.div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white rounded-full px-2 py-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{item.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(item.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-orange-600 hover:underline mb-2"
                      >
                        <MapPin size={14} />
                        {item.location} 📍
                      </a>
                      <span className="text-xl font-bold text-orange-600">{item.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl">
      <p className="text-gray-400 text-lg">{text}</p>
    </div>
  );
}