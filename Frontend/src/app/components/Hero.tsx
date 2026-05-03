import { Sparkles, ArrowRight } from 'lucide-react';
import heroBg from '../assets/india-culture-bg.png';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Dark overlay — text readable rehega */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Gradient overlay bottom pe — smooth fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">

        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="text-orange-400 w-5 h-5" />
          <span className="text-orange-400 font-semibold tracking-wide">
            Discover the Real India
          </span>
          <Sparkles className="text-orange-400 w-5 h-5" />
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
          Explore India's Rich
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
            Cultural Heritage
          </span>
        </h1>

        <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow">
          Connect with authentic Indian traditions, festivals, local artisans, and
          businesses. Experience the diversity and richness of India's cultural tapestry.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
            Explore Culture
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/15 backdrop-blur-sm text-white border-2 border-white/60 rounded-full font-semibold hover:bg-white/25 transition-all duration-300 hover:scale-105">
            Join Community
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '29', label: 'States & UTs' },
            { number: '1000+', label: 'Festivals' },
            { number: '500+', label: 'Artisans' },
            { number: '22', label: 'Languages' },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 bg-white/10 backdrop-blur-md rounded-2xl hover:shadow-lg transition-all duration-300 border border-white/20"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-200">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}