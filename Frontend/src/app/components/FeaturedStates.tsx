import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function FeaturedStates() {
  const states = [
    {
      name: 'Uttarakhand',
      description: 'Land of gods with majestic Himalayan peaks and spiritual temples',
      image: 'https://images.unsplash.com/photo-1696465889052-6c8921536920?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVdHRhcmFraGFuZCUyMEluZGlhJTIwbW91bnRhaW5zJTIwdGVtcGxlc3xlbnwxfHx8fDE3NzUwMjUyNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      highlights: 'Yoga, Temples, Mountains',
    },
    {
      name: 'Rajasthan',
      description: 'Royal heritage with magnificent palaces and vibrant culture',
      image: 'https://images.unsplash.com/photo-1757237367150-3c134720f075?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSYWphc3RoYW4lMjBJbmRpYSUyMHBhbGFjZSUyMGNvbG9yZnVsfGVufDF8fHx8MTc3NDk0NzY0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      highlights: 'Palaces, Deserts, Folk Art',
    },
    {
      name: 'Gujarat',
      description: 'Rich traditions, colorful festivals, and entrepreneurial spirit',
      image: 'https://images.unsplash.com/photo-1608616693828-64dfd0f5c5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHdWphcmF0JTIwSW5kaWElMjBjdWx0dXJlJTIwZmVzdGl2YWx8ZW58MXx8fHwxNzc1MDI1MjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      highlights: 'Navratri, Handicrafts, Cuisine',
    },
    {
      name: 'Punjab',
      description: 'Vibrant culture, golden temples, and warm hospitality',
      image: 'https://images.unsplash.com/photo-1723118579792-e22d17b155ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQdW5qYWIlMjBJbmRpYSUyMGdvbGRlbiUyMHRlbXBsZXxlbnwxfHx8fDE3NzUwMjUyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      highlights: 'Bhangra, Golden Temple, Food',
    },
    {
      name: 'Kerala',
      description: "God's own country with backwaters, beaches, and Ayurveda",
      image: 'https://images.unsplash.com/photo-1593417034675-3ed7eda1bee9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLZXJhbGElMjBJbmRpYSUyMGJhY2t3YXRlcnMlMjBib2F0c3xlbnwxfHx8fDE3NzUwMjUyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      highlights: 'Backwaters, Ayurveda, Dance',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Featured <span className="text-orange-600">States</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the unique culture and traditions of India's diverse states
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {states.slice(0, 3).map((state, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={state.image}
                  alt={state.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{state.name}</h3>
                  <p className="text-sm text-orange-300">{state.highlights}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{state.description}</p>
                <button className="flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-4 transition-all">
                  Explore State
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional States Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {states.slice(3).map((state, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={state.image}
                  alt={state.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{state.name}</h3>
                  <p className="text-sm text-orange-300">{state.highlights}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{state.description}</p>
                <button className="flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-4 transition-all">
                  Explore State
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
