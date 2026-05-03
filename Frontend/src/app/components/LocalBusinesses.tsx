import { Store, MapPin, Star, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function LocalBusinesses() {
  const businesses = [
    {
      name: 'Rajasthani Handicrafts',
      category: 'Handicrafts & Pottery',
      location: 'Jaipur, Rajasthan',
      rating: 4.8,
      reviews: 127,
      description: 'Authentic handmade pottery, ceramics, and traditional Rajasthani crafts.',
      image: 'https://images.unsplash.com/photo-1768321481665-b40705ab11ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBoYW5kaWNyYWZ0cyUyMGFydGlzYW4lMjBwb3R0ZXJ5fGVufDF8fHx8MTc3NTAyNTI0NXww&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
    },
    {
      name: 'Heritage Textiles',
      category: 'Textiles & Fabrics',
      location: 'Varanasi, Uttar Pradesh',
      rating: 4.9,
      reviews: 203,
      description: 'Premium silk sarees, brocades, and traditional Indian textiles.',
      image: 'https://images.unsplash.com/photo-1773846012458-e6a66c26e49f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0ZXh0aWxlcyUyMHNob3AlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzUwMjUyNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
    },
    {
      name: 'Golden Jewellery House',
      category: 'Jewelry & Ornaments',
      location: 'Mumbai, Maharashtra',
      rating: 4.7,
      reviews: 156,
      description: 'Traditional Indian gold jewelry, temple jewelry, and ethnic designs.',
      image: 'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBqZXdlbHJ5JTIwdHJhZGl0aW9uYWwlMjBnb2xkfGVufDF8fHx8MTc3NTAyNTI0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
    },
    {
      name: 'Spice Bazaar',
      category: 'Spices & Ingredients',
      location: 'Kochi, Kerala',
      rating: 4.9,
      reviews: 189,
      description: 'Fresh Indian spices, organic herbs, and authentic curry blends.',
      image: 'https://images.unsplash.com/photo-1772460759097-ad68b3232a4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzcGljZXMlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzUwMjUyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
    },
  ];

  return (
    <section id="local-businesses" className="py-20 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Local <span className="text-orange-600">Businesses</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Support authentic Indian artisans and local businesses preserving traditional crafts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.map((business, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {business.verified && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      ✓ Verified
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-600 font-semibold uppercase tracking-wide">
                    {business.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {business.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{business.location}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{business.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({business.reviews} reviews)</span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {business.description}
                </p>

                <button className="w-full py-2 bg-orange-50 text-orange-600 rounded-lg font-semibold hover:bg-orange-100 transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-4">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
            View All Businesses
          </button>
        </div>
      </div>
    </section>
  );
}
