import { motion } from 'motion/react';
import { Search, Filter, ShoppingCart, Heart, Star } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { API } from '../api/axios';

export function Marketplace() {
  const { addToCart, savedItems, toggleSave } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Clothing', 'Jewelry', 'Handicrafts', 'Food', 'Textiles'];

  // ✅ Backend se fetch karo
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/products');
        setAllProducts(res.data.data || []);
      } catch (err) {
        console.error('Products fetch error:', err);
        toast.error('Products load nahi hue');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Cultural <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Marketplace</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Shop authentic Indian products directly from local artisans
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div className="mb-8 flex flex-col md:flex-row gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <motion.button
              className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-orange-500 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-5 h-5" />
              Filters
            </motion.button>
          </motion.div>

          {/* Categories */}
          <motion.div className="mb-8 flex gap-3 overflow-x-auto pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap ${selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500'
                  }`}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16 text-gray-500 text-lg">Loading products</div>
          )}

          {/* Products Grid */}
          {!loading && filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No products found.</p>
              <motion.button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-full font-semibold"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="relative h-72 overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <motion.button
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        toggleSave(product._id);
                        toast.success(savedItems.includes(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
                      }}
                    >
                      <Heart className={`w-5 h-5 transition-colors ${savedItems.includes(product._id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                    </motion.button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{product.name}</h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-orange-600">₹ {product.price}</span>
                      <span className="text-sm text-gray-400 line-through">₹ {product.originalPrice}</span>
                    </div>

                    <motion.button
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        addToCart({ ...product, id: product._id });
                        toast.success(`${product.name} added to cart!`);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}