import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { API } from '../api/axios';

export function States() {
  const [states, setStates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/states')
      .then((res) => setStates(res.data.data || []))
      .catch(console.error);
  }, []);

  const regions = ['All', 'North', 'South', 'East', 'West', 'Central', 'Northeast'];

  const filtered = states.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = selectedRegion === 'All' || s.region === selectedRegion;
    return matchSearch && matchRegion;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Explore <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">India</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select a state to discover its events, products, culture and more
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative mb-6 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Region Filter */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 justify-center">
            {regions.map((region) => (
              <motion.button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap text-sm ${
                  selectedRegion === region
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500'
                }`}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                {region}
              </motion.button>
            ))}
          </div>

          {/* States Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((state, index) => (
              <motion.div
                key={state._id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/states/${state.slug}`)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={state.image}
                    alt={state.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{state.name}</h3>
                    <div className="flex items-center gap-1 text-orange-300 text-sm">
                      <MapPin size={12} />
                      <span>{state.capital}</span>
                    </div>
                  </div>
                  {state.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm text-gray-500 line-clamp-2">{state.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">
                      {state.region}
                    </span>
                    <span className="text-xs text-gray-400">{state.language?.join(', ')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">Koi state nahi mila</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}