import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './database';
import { User } from '../models/User.model';
import { Category } from '../models/Category.model';
import { State } from '../models/State.model';
import { Event } from '../models/Event.model';
import { Business } from '../models/Business.model';
import { Product } from '../models/Product.model';
import { Post } from '../models/Post.model';

async function seed() {
  await connectDB();
  console.log('\n🌱 Seeding Cultural Connect India (MongoDB)...\n');

  // Wipe collections cleanly
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    State.deleteMany({}),
    Event.deleteMany({}),
    Business.deleteMany({}),
    Product.deleteMany({}),
    Post.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data\n');

  // ─── Categories (from CulturalCategories.tsx / EnhancedCategories.tsx) ────
  const categoriesData = [
    { name: 'Festivals',   icon: 'PartyPopper', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50',  count: 200 },
    { name: 'Food',        icon: 'Utensils',    color: 'from-red-500 to-red-600',       bgColor: 'bg-red-50',     count: 500 },
    { name: 'Dance',       icon: 'Music',       color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50',  count: 150 },
    { name: 'Traditions',  icon: 'Flower2',     color: 'from-pink-500 to-pink-600',     bgColor: 'bg-pink-50',    count: 300 },
    { name: 'Clothing',    icon: 'Shirt',       color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50',  count: 400 },
    { name: 'Handicrafts', icon: 'Palette',     color: 'from-teal-500 to-teal-600',    bgColor: 'bg-teal-50',    count: 250 },
  ].map((c) => ({
    ...c,
    slug: c.name.toLowerCase(),
    description: `Explore ${c.name.toLowerCase()} from across India`,
  }));

  const categories = await Category.insertMany(categoriesData);
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));
  console.log(`✅ ${categories.length} categories created`);

  // ─── States (from FeaturedStates.tsx) ─────────────────────────────────────
  const statesData = [
    {
      name: 'Uttarakhand', slug: 'uttarakhand', region: 'North', capital: 'Dehradun',
      description: 'Land of gods with majestic Himalayan peaks and spiritual temples',
      highlights: 'Yoga, Temples, Mountains',
      image: 'https://images.unsplash.com/photo-1696465889052-6c8921536920',
      language: ['Hindi', 'Garhwali', 'Kumaoni'],
      isFeatured: true,
    },
    {
      name: 'Rajasthan', slug: 'rajasthan', region: 'West', capital: 'Jaipur',
      description: 'Royal heritage with magnificent palaces and vibrant culture',
      highlights: 'Palaces, Deserts, Folk Art',
      image: 'https://images.unsplash.com/photo-1757237367150-3c134720f075',
      language: ['Hindi', 'Rajasthani'],
      isFeatured: true,
    },
    {
      name: 'Gujarat', slug: 'gujarat', region: 'West', capital: 'Gandhinagar',
      description: 'Rich traditions, colorful festivals, and entrepreneurial spirit',
      highlights: 'Navratri, Handicrafts, Cuisine',
      image: 'https://images.unsplash.com/photo-1608616693828-64dfd0f5c5ab',
      language: ['Gujarati', 'Hindi'],
      isFeatured: true,
    },
    {
      name: 'Punjab', slug: 'punjab', region: 'North', capital: 'Chandigarh',
      description: 'Vibrant culture, golden temples, and warm hospitality',
      highlights: 'Bhangra, Golden Temple, Food',
      image: 'https://images.unsplash.com/photo-1723118579792-e22d17b155ab',
      language: ['Punjabi', 'Hindi'],
      isFeatured: true,
    },
    {
      name: 'Kerala', slug: 'kerala', region: 'South', capital: 'Thiruvananthapuram',
      description: "God's own country with backwaters, beaches, and Ayurveda",
      highlights: 'Backwaters, Ayurveda, Dance',
      image: 'https://images.unsplash.com/photo-1593417034675-3ed7eda1bee9',
      language: ['Malayalam'],
      isFeatured: true,
    },
    {
      name: 'Nagaland', slug: 'nagaland', region: 'Northeast', capital: 'Kohima',
      description: 'Land of tribes with rich indigenous culture and vibrant festivals',
      highlights: 'Tribal Culture, Hornbill Festival, Crafts',
      image: 'https://images.unsplash.com/photo-1700040224625-e502a5fbe7d6',
      language: ['Nagamese', 'English'],
      isFeatured: false,
    },
    {
      name: 'Uttar Pradesh', slug: 'uttar-pradesh', region: 'North', capital: 'Lucknow',
      description: 'Spiritual heartland with ancient temples, the Ganga, and Kumbh Mela',
      highlights: 'Varanasi, Taj Mahal, Kumbh Mela',
      image: 'https://images.unsplash.com/photo-1578064875345-77fa5f1fc1f2',
      language: ['Hindi', 'Urdu'],
      isFeatured: true,
    },
    {
      name: 'Maharashtra', slug: 'maharashtra', region: 'West', capital: 'Mumbai',
      description: 'Gateway of India blending modernity with rich Maratha heritage',
      highlights: 'Ganesh Festival, Ajanta Caves, Bollywood',
      image: 'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0',
      language: ['Marathi', 'Hindi'],
      isFeatured: false,
    },
  ];

  const states = await State.insertMany(statesData);
  const stateMap = Object.fromEntries(states.map((s) => [s.name, s._id]));
  console.log(`✅ ${states.length} states created`);

  // ─── Users ─────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@culturalconnect.in',
    password: 'Admin@123',
    role: 'ADMIN',
    isVerified: true,
    location: 'New Delhi, India',
  });

  const priya = await User.create({
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password: 'User@123',
    avatar: 'https://images.unsplash.com/photo-1725611224180-4a50ef13a0e8',
    location: 'Jaipur, Rajasthan',
    isVerified: true,
  });

  const abhishek = await User.create({
    name: 'Abhishek Singh',
    email: 'abhishek.singh@example.com',
    password: 'User@123',
    avatar: 'https://images.unsplash.com/photo-1774437678561-c321687f6986',
    location: 'Kerala',
    isVerified: true,
  });

  const anjali = await User.create({
    name: 'Anjali Reddy',
    email: 'anjali.reddy@example.com',
    password: 'User@123',
    avatar: 'https://images.unsplash.com/photo-1759840278276-fe8d58873dc3',
    location: 'Varanasi, UP',
    isVerified: true,
  });

  const owner1 = await User.create({
    name: 'Ramesh Kumawat',
    email: 'rajasthani.crafts@example.com',
    password: 'Owner@123',
    role: 'BUSINESS_OWNER',
    location: 'Jaipur, Rajasthan',
    isVerified: true,
  });

  const owner2 = await User.create({
    name: 'Suresh Patel',
    email: 'heritage.textiles@example.com',
    password: 'Owner@123',
    role: 'BUSINESS_OWNER',
    location: 'Varanasi, UP',
    isVerified: true,
  });

  console.log('✅ 6 users created');

  // ─── Events (from CulturalEvents.tsx) ─────────────────────────────────────
  const eventsData = [
    {
      name: 'Pushkar Camel Fair', slug: 'pushkar-camel-fair',
      description: 'The world-famous annual fair featuring camels, cultural performances, and vibrant celebrations.',
      image: 'https://images.unsplash.com/photo-1717131554010-06626b1cc138',
      tag: 'Cultural Fair',
      startDate: new Date('2026-11-01'), endDate: new Date('2026-11-08'),
      location: 'Pushkar, Rajasthan', venue: 'Pushkar Lake Grounds',
      stateId: stateMap['Rajasthan'], categoryId: catMap['Festivals'],
      isFeatured: true,
    },
    {
      name: 'Hornbill Festival', slug: 'hornbill-festival',
      description: 'A spectacular showcase of Naga heritage, traditional arts, dances, and indigenous games.',
      image: 'https://images.unsplash.com/photo-1700040224625-e502a5fbe7d6',
      tag: 'Tribal Festival',
      startDate: new Date('2026-12-01'), endDate: new Date('2026-12-10'),
      location: 'Kohima, Nagaland', venue: 'Kisama Heritage Village',
      stateId: stateMap['Nagaland'], categoryId: catMap['Traditions'],
      isFeatured: true,
    },
    {
      name: 'Kumbh Mela', slug: 'kumbh-mela',
      description: "The world's largest peaceful gathering, a sacred Hindu pilgrimage held every 12 years.",
      image: 'https://images.unsplash.com/photo-1578064875345-77fa5f1fc1f2',
      tag: 'Spiritual Gathering',
      startDate: new Date('2027-01-14'), endDate: new Date('2027-02-26'),
      location: 'Prayagraj, Uttar Pradesh', venue: 'Triveni Sangam',
      stateId: stateMap['Uttar Pradesh'], categoryId: catMap['Traditions'],
      isFeatured: true,
    },
    {
      name: 'Navratri Festival', slug: 'navratri-festival',
      description: 'Nine nights of devotion, music, and the iconic Garba dance celebrating Goddess Durga.',
      image: 'https://images.unsplash.com/photo-1608616693828-64dfd0f5c5ab',
      tag: 'Cultural Festival',
      startDate: new Date('2026-10-02'), endDate: new Date('2026-10-11'),
      location: 'Ahmedabad, Gujarat', venue: 'GMDC Ground',
      stateId: stateMap['Gujarat'], categoryId: catMap['Dance'],
      isFeatured: false,
    },
  ];

  await Event.insertMany(eventsData);
  console.log(`✅ ${eventsData.length} events created`);

  // ─── Businesses (from LocalBusinesses.tsx) ────────────────────────────────
  const businessesData = [
    {
      name: 'Rajasthani Handicrafts', slug: `rajasthani-handicrafts-${Date.now()}`,
      description: 'Authentic handmade pottery, ceramics, and traditional Rajasthani crafts.',
      image: 'https://images.unsplash.com/photo-1768321481665-b40705ab11ce',
      categoryName: 'Handicrafts & Pottery', location: 'Jaipur, Rajasthan',
      address: 'MI Road, Jaipur 302001', phone: '+91 9876543210',
      email: 'info@rajasthanicrafts.in',
      rating: 4.8, reviewCount: 127,
      isVerified: true, isFeatured: true,
      ownerId: owner1._id, categoryId: catMap['Handicrafts'], stateId: stateMap['Rajasthan'],
    },
    {
      name: 'Heritage Textiles', slug: `heritage-textiles-${Date.now() + 1}`,
      description: 'Premium silk sarees, brocades, and traditional Indian textiles.',
      image: 'https://images.unsplash.com/photo-1773846012458-e6a66c26e49f',
      categoryName: 'Textiles & Fabrics', location: 'Varanasi, Uttar Pradesh',
      address: 'Vishwanath Gali, Varanasi 221001', phone: '+91 9876543211',
      email: 'info@heritagetextiles.in',
      rating: 4.9, reviewCount: 203,
      isVerified: true, isFeatured: true,
      ownerId: owner2._id, categoryId: catMap['Clothing'], stateId: stateMap['Uttar Pradesh'],
    },
    {
      name: 'Golden Jewellery House', slug: `golden-jewellery-house-${Date.now() + 2}`,
      description: 'Traditional Indian gold jewelry, temple jewelry, and ethnic designs.',
      image: 'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0',
      categoryName: 'Jewelry & Ornaments', location: 'Mumbai, Maharashtra',
      address: 'Zaveri Bazaar, Mumbai 400002', phone: '+91 9876543212',
      email: 'info@goldenjewellery.in',
      rating: 4.7, reviewCount: 156,
      isVerified: true, isFeatured: false,
      ownerId: admin._id, categoryId: catMap['Traditions'], stateId: stateMap['Maharashtra'],
    },
    {
      name: 'Spice Bazaar', slug: `spice-bazaar-${Date.now() + 3}`,
      description: 'Fresh Indian spices, organic herbs, and authentic curry blends.',
      image: 'https://images.unsplash.com/photo-1772460759097-ad68b3232a4f',
      categoryName: 'Spices & Ingredients', location: 'Kochi, Kerala',
      address: 'Mattancherry, Kochi 682002', phone: '+91 9876543213',
      email: 'info@spicebazaar.in',
      rating: 4.9, reviewCount: 189,
      isVerified: true, isFeatured: false,
      ownerId: admin._id, categoryId: catMap['Food'], stateId: stateMap['Kerala'],
    },
  ];

  const businesses = await Business.insertMany(businessesData);
  console.log(`✅ ${businesses.length} businesses created`);

  // ─── Products (from MarketplaceSection.tsx) ───────────────────────────────
  const productsData = [
    {
      name: 'Banarasi Silk Saree', slug: `banarasi-silk-saree-${Date.now()}`,
      description: 'Handwoven Banarasi silk saree with traditional zari work and intricate motifs.',
      image: 'https://images.unsplash.com/photo-1742287721821-ddf522b3f37b',
      price: 8999, originalPrice: 12999, tag: 'Bestseller',
      rating: 4.8, soldCount: 234, stock: 50, isFeatured: true,
      businessId: businesses[1]._id, categoryId: catMap['Clothing'],
    },
    {
      name: 'Traditional Gold Necklace', slug: `traditional-gold-necklace-${Date.now() + 1}`,
      description: 'Exquisite temple jewelry necklace crafted with traditional goldsmithing techniques.',
      image: 'https://images.unsplash.com/photo-1769706039344-7ad8d7ec2442',
      price: 45999, originalPrice: 59999, tag: 'Premium',
      rating: 5.0, soldCount: 89, stock: 10, isFeatured: true,
      businessId: businesses[2]._id, categoryId: catMap['Traditions'],
    },
    {
      name: 'Handcrafted Pottery Set', slug: `handcrafted-pottery-set-${Date.now() + 2}`,
      description: 'Beautiful blue pottery set handmade by skilled artisans of Jaipur.',
      image: 'https://images.unsplash.com/photo-1768321481665-b40705ab11ce',
      price: 2499, originalPrice: 3499, tag: 'Handmade',
      rating: 4.6, soldCount: 145, stock: 80, isFeatured: false,
      businessId: businesses[0]._id, categoryId: catMap['Handicrafts'],
    },
    {
      name: 'Spice Collection Box', slug: `spice-collection-box-${Date.now() + 3}`,
      description: 'Curated collection of 12 authentic Indian spices sourced directly from Kerala.',
      image: 'https://images.unsplash.com/photo-1772460759097-ad68b3232a4f',
      price: 1299, originalPrice: 1799, tag: 'Organic',
      rating: 4.9, soldCount: 312, stock: 200, isFeatured: true,
      businessId: businesses[3]._id, categoryId: catMap['Food'],
    },
    {
      name: 'Rajasthani Bandhani Dupatta', slug: `rajasthani-bandhani-dupatta-${Date.now() + 4}`,
      description: 'Traditional tie-dye dupatta in vibrant colors, handcrafted by Rajasthani artisans.',
      image: 'https://images.unsplash.com/photo-1742287721821-ddf522b3f37b',
      price: 899, originalPrice: 1499, tag: 'Handmade',
      rating: 4.5, soldCount: 180, stock: 100, isFeatured: false,
      businessId: businesses[0]._id, categoryId: catMap['Clothing'],
    },
  ];

  await Product.insertMany(productsData);
  console.log(`✅ ${productsData.length} products created`);

  // ─── Community Posts (from CommunitySection.tsx) ──────────────────────────
  await Post.insertMany([
    {
      caption: 'Exploring the magnificent Hawa Mahal at sunset 🌅',
      image: 'https://images.unsplash.com/photo-1757237367150-3c134720f075',
      location: 'Jaipur, Rajasthan',
      userId: priya._id, categoryId: catMap['Traditions'],
      likes: [abhishek._id, anjali._id], savedBy: [],
    },
    {
      caption: 'Peaceful morning in the backwaters of Kerala 🚤',
      image: 'https://images.unsplash.com/photo-1593417034675-3ed7eda1bee9',
      location: 'Kerala',
      userId: abhishek._id, categoryId: catMap['Traditions'],
      likes: [priya._id, anjali._id, admin._id], savedBy: [priya._id],
    },
    {
      caption: 'Spiritual vibes at the Ganga Aarti ceremony 🪔',
      image: 'https://images.unsplash.com/photo-1578064875345-77fa5f1fc1f2',
      location: 'Varanasi, UP',
      userId: anjali._id, categoryId: catMap['Traditions'],
      likes: [priya._id, abhishek._id, admin._id, owner1._id], savedBy: [abhishek._id],
    },
  ]);
  console.log('✅ 3 community posts created');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Login credentials:');
  console.log('   Admin:   admin@culturalconnect.in   / Admin@123');
  console.log('   User:    priya.sharma@example.com   / User@123');
  console.log('   Owner:   rajasthani.crafts@example.com / Owner@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => disconnectDB());