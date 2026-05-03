import { PartyPopper, Utensils, Music, Flower2, Shirt, Palette } from 'lucide-react';
import festivalImg from '../assets/cat-festivals.png';
import foodImg from '../assets/cat-food.png';
import danceImg from '../assets/cat-dance.png';
import traditionsImg from '../assets/cat-traditions.png';
import clothingImg from '../assets/cat-clothing.png';
import handicraftsImg from '../assets/cat-handicrafts.png';

export function CulturalCategories() {
  const categories = [
    {
      icon: PartyPopper,
      name: 'Festivals',
      description: 'Celebrate vibrant festivals',
      color: 'from-orange-600 to-orange-400',
      image: festivalImg,
    },
    {
      icon: Utensils,
      name: 'Food',
      description: 'Discover regional cuisines',
      color: 'from-red-600 to-red-400',
      image: foodImg,
    },
    {
      icon: Music,
      name: 'Dance',
      description: 'Experience traditional dances',
      color: 'from-purple-600 to-purple-400',
      image: danceImg,
    },
    {
      icon: Flower2,
      name: 'Traditions',
      description: 'Learn age-old customs',
      color: 'from-pink-600 to-pink-400',
      image: traditionsImg,
    },
    {
      icon: Shirt,
      name: 'Clothing',
      description: 'Explore ethnic fashion',
      color: 'from-indigo-600 to-indigo-400',
      image: clothingImg,
    },
    {
      icon: Palette,
      name: 'Handicrafts',
      description: 'Support local artisans',
      color: 'from-teal-600 to-teal-400',
      image: handicraftsImg,
    },
  ];

  return (
    <section id="explore" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Cultural <span className="text-orange-600">Categories</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dive deep into the diverse aspects of Indian culture and heritage
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 h-64"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-75 transition-opacity duration-300`} />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white drop-shadow">{category.name}</h3>
                </div>
                <p className="text-white/80 text-sm">{category.description}</p>
                <div className="mt-3 text-white font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Explore →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}