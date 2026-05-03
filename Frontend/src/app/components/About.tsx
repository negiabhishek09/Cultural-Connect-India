import { Heart, Users, Globe, Award } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: Heart,
      title: 'Authentic Culture',
      description: 'Connect with real Indian traditions, festivals, and heritage',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of culture enthusiasts and local artisans',
    },
    {
      icon: Globe,
      title: 'Pan-India Reach',
      description: 'Explore culture from all 29 states and 8 union territories',
    },
    {
      icon: Award,
      title: 'Verified Artisans',
      description: 'Support authentic local businesses and skilled craftspeople',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-orange-600">Cultural Connect India</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Cultural Connect India is a platform dedicated to preserving and promoting the
              rich cultural heritage of India. We connect people with authentic traditions,
              festivals, local artisans, and businesses across the country.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our mission is to bridge the gap between modern India and its timeless
              traditions, creating opportunities for cultural exchange, learning, and
              supporting local communities.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-orange-50 rounded-xl">
                <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
                <div className="text-gray-600">Registered Artisans</div>
              </div>
              <div className="p-6 bg-indigo-50 rounded-xl">
                <div className="text-4xl font-bold text-indigo-600 mb-2">1000+</div>
                <div className="text-gray-600">Cultural Events</div>
              </div>
            </div>
          </div>

          {/* Right Features */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-white to-orange-50 rounded-2xl border-2 border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
