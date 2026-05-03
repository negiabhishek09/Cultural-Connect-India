import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API } from '../api/axios';

export function CommunitySection() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FIX 1: Function bahar nikala taaki focus listener bhi use kar sake
    const fetchPosts = async () => {
      try {
        // ✅ FIX 2: /community → /posts (AdminPanel ke saath match)
        const res = await API.get('/posts');
        setPosts((res.data.data || []).slice(0, 3));
      } catch (err) {
        console.error('Community fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // ✅ FIX 3: Jab user admin se wapas aaye — fresh data fetch ho
    window.addEventListener('focus', fetchPosts);
    return () => window.removeEventListener('focus', fetchPosts);
  }, []);

  const toggleLike = (index: number) => {
    setLikedPosts(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full font-semibold mb-4"
            whileHover={{ scale: 1.05 }}
          >
            Join the Community
          </motion.span>
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">
            Community <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Feed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your cultural experiences and connect with fellow enthusiasts
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-500 text-lg">
            Posts load ho rahe hain...
          </div>
        )}

        {/* No posts */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-lg">
            Abhi koi post nahi hai.
          </div>
        )}

        {/* ✅ FIX 4: [posts.map(...)] → posts.map(...) — extra array wrap hata diya */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* User Header */}
              <div className="p-4 flex items-center gap-3">
                <motion.div className="relative" whileHover={{ scale: 1.1 }}>
                  <ImageWithFallback
                    src={post.userId?.avatar || '/default-avatar.png'}
                    alt={post.userId?.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">
                    {post.userId?.name || 'Unknown User'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {post.userId?.location || 'India'}
                  </p>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Bookmark className="w-5 h-5 text-gray-400 hover:text-orange-600" />
                </motion.button>
              </div>

              {/* Image */}
              <div className="relative h-72 overflow-hidden">
                <ImageWithFallback
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <motion.button
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(index)}
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        likedPosts.includes(index)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                    <span className="font-semibold text-gray-700">
                      {likedPosts.includes(index)
                        ? (post.likes?.length || 0) + 1
                        : post.likes?.length || 0}
                    </span>
                  </motion.button>

                  <motion.button
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="w-6 h-6 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      {post.comments?.length || 0}
                    </span>
                  </motion.button>

                  <motion.button
                    className="ml-auto"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 className="w-6 h-6 text-gray-600" />
                  </motion.button>
                </div>

                <p className="text-gray-900 mb-2">{post.caption}</p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/community')}
          >
            Explore Community
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}