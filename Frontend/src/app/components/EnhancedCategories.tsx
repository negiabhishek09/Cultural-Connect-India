import { PartyPopper, Utensils, Music, Flower2, Shirt, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import festivalImg from '../assets/cat-festivals.png';
import foodImg from '../assets/cat-food.png';
import danceImg from '../assets/cat-dance.png';
import traditionsImg from '../assets/cat-traditions.png';
import clothingImg from '../assets/cat-clothing.png';
import handicraftsImg from '../assets/cat-handicrafts.png';

export function EnhancedCategories() {
  const categories = [
    {
      icon: PartyPopper,
      name: 'Festivals',
      description: 'Celebrate vibrant festivals',
      color: 'from-orange-500 to-orange-600',
      count: '200+',
      image: festivalImg,
    },
    {
      icon: Utensils,
      name: 'Food',
      description: 'Discover regional cuisines',
      color: 'from-red-500 to-red-600',
      count: '500+',
      image: foodImg,
    },
    {
      icon: Music,
      name: 'Dance',
      description: 'Experience traditional dances',
      color: 'from-purple-500 to-purple-600',
      count: '150+',
      image: danceImg,
    },
    {
      icon: Flower2,
      name: 'Traditions',
      description: 'Learn age-old customs',
      color: 'from-pink-500 to-pink-600',
      count: '300+',
      image: traditionsImg,
    },
    {
      icon: Shirt,
      name: 'Clothing',
      description: 'Explore ethnic fashion',
      color: 'from-indigo-500 to-indigo-600',
      count: '400+',
      image: clothingImg,
    },
    {
      icon: Palette,
      name: 'Handicrafts',
      description: 'Support local artisans',
      color: 'from-teal-500 to-teal-600',
      count: '250+',
      image: handicraftsImg,
    },
  ];

  return (
    <section id="explore" className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold mb-4"
            whileHover={{ scale: 1.05 }}
          >
            Explore Categories
          </motion.span>
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">
            Cultural <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Categories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dive deep into the diverse aspects of Indian culture and heritage
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className="group relative rounded-3xl overflow-hidden cursor-pointer h-64 shadow-md"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-65 group-hover:opacity-80 transition-opacity duration-300`} />

              {/* Count Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white shadow-md">
                {category.count}
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white drop-shadow">{category.name}</h3>
                </div>
                <p className="text-white/80 text-sm">{category.description}</p>
                <motion.div
                  className="flex items-center gap-2 text-white font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -20 }}
                  whileHover={{ x: 0 }}
                >
                  Explore <span>→</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}