
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/india-culture-bg.png';

export function ModernHero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
            <Sparkles className="text-orange-400 w-6 h-6" />
          </motion.div>
          <span className="text-orange-400 font-semibold tracking-wide text-lg">
            Discover the Real India
          </span>
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
            <Sparkles className="text-orange-400 w-6 h-6" />
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Discover India's
          <br />
          <motion.span
            className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            style={{ backgroundSize: '200% auto' }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Cultural Diversity
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Explore traditions, festivals, artisans and heritage from every corner of India
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl transition-all flex items-center gap-3 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/explore')}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">Explore Culture</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
          </motion.button>

          <motion.button
            className="group px-10 py-5 bg-white/15 backdrop-blur-sm text-white border-2 border-white/70 rounded-full font-semibold text-lg hover:bg-white/25 transition-all flex items-center gap-3"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/community')}
          >
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Join Community</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            { number: '29', label: 'States & UTs', color: 'from-orange-400 to-orange-500' },
            { number: '1000+', label: 'Festivals', color: 'from-indigo-400 to-indigo-500' },
            { number: '500+', label: 'Artisans', color: 'from-purple-400 to-purple-500' },
            { number: '22', label: 'Languages', color: 'from-pink-400 to-pink-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="p-8 bg-white/10 backdrop-blur-md rounded-3xl hover:shadow-2xl transition-all cursor-pointer border border-white/20 group"
              whileHover={{ y: -5, scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <motion.div
                className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}
                whileHover={{ scale: 1.1 }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-200 font-medium">{stat.label}</div>
              <motion.div
                className={`h-1 bg-gradient-to-r ${stat.color} rounded-full mt-4`}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1, delay: 1.5 + index * 0.1 }}
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
