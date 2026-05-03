import { motion } from 'framer-motion'; // ✅ fixed
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { BookingModal } from '../components/modals/BookingModal';
import { API } from '../api/axios';
import { toast } from 'sonner';

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; item: any | null }>({
    isOpen: false,
    item: null,
  });

  // ✅ categories safe
  const categories = useMemo(() => {
    const cats = allItems.map((item) => item.category || 'Other');
    return ['All', ...Array.from(new Set(cats))];
  }, [allItems]);

  // ✅ fetch API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await API.get('/explore');
        setAllItems(res?.data?.data || []);
      } catch (err) {
        console.error('Explore fetch error:', err);
        toast.error('Items load nahi hue');
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // ✅ filter safe (no crash)
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const title = item.title?.toLowerCase() || '';
      const location = item.location?.toLowerCase() || '';

      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) ||
        location.includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Explore{' '}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Culture
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover authentic Indian cultural experiences and traditions
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            className="mb-8 flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for cultures, festivals, traditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none"
              />
            </div>

            <motion.button
              className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-orange-500 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-5 h-5" />
              Filters
            </motion.button>
          </motion.div>

          {/* Categories */}
          <motion.div
            className="mb-8 flex gap-3 overflow-x-auto pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16 text-gray-500 text-lg">
              Items load ho rahe hain...
            </div>
          )}

          {/* Empty */}
          {!loading && filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">Koi experience nahi mila.</p>
              <motion.button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-full font-semibold"
                whileHover={{ scale: 1.05 }}
              >
                Clear Filters
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    {item.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                          {item.category}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-white rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {item.rating || 4.5}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title || 'Untitled'}
                    </h3>

                    {/* ✅ Fixed location link */}
                    {item.location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4"
                      >
                        <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                        <span className="text-sm underline">
                          {item.location}
                        </span>
                      </a>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        {item.price ? `₹ ${item.price}` : 'Free'}
                      </span>

                      <motion.button
                        className="px-6 py-2 bg-orange-600 text-white rounded-full font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setBookingModal({ isOpen: true, item })
                        }
                      >
                        Book Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>

      <Footer />

      {/* Modal */}
      {bookingModal.item && (
        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={() => setBookingModal({ isOpen: false, item: null })}
          title={bookingModal.item.title}
          price={bookingModal.item.price}
        />
      )}
    </div>
  );
}