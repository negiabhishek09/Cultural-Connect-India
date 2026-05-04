"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const State_model_1 = require("../models/State.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const states = [
    {
        name: 'Andhra Pradesh', slug: 'andhra-pradesh',
        description: 'Land of rich culture, temples and coastline.',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
        highlights: 'Tirupati Temple, Araku Valley, Chilika Lake',
        region: 'South', capital: 'Amaravati',
        language: ['Telugu'], isActive: true, isFeatured: false,
    },
    {
        name: 'Arunachal Pradesh', slug: 'arunachal-pradesh',
        description: 'Land of the Dawn-Lit Mountains.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        highlights: 'Tawang Monastery, Ziro Valley, Namdapha',
        region: 'Northeast', capital: 'Itanagar',
        language: ['English', 'Hindi'], isActive: true, isFeatured: false,
    },
    {
        name: 'Assam', slug: 'assam',
        description: 'Gateway to Northeast India, land of tea gardens.',
        image: 'https://images.unsplash.com/photo-1601931935821-5fbe71157695?w=800',
        highlights: 'Kaziranga National Park, Kamakhya Temple, Majuli Island',
        region: 'Northeast', capital: 'Dispur',
        language: ['Assamese'], isActive: true, isFeatured: true,
    },
    {
        name: 'Bihar', slug: 'bihar',
        description: 'Cradle of civilization and Buddhism.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
        highlights: 'Bodh Gaya, Nalanda, Vaishali',
        region: 'East', capital: 'Patna',
        language: ['Hindi', 'Maithili'], isActive: true, isFeatured: false,
    },
    {
        name: 'Chhattisgarh', slug: 'chhattisgarh',
        description: 'Land of forests, waterfalls and tribal culture.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        highlights: 'Chitrakote Falls, Bastar, Sirpur',
        region: 'Central', capital: 'Raipur',
        language: ['Hindi', 'Chhattisgarhi'], isActive: true, isFeatured: false,
    },
    {
        name: 'Goa', slug: 'goa',
        description: 'Pearl of the Orient, beaches and Portuguese heritage.',
        image: 'https://images.unsplash.com/photo-1587922546307-776227941871?w=800',
        highlights: 'Calangute Beach, Basilica of Bom Jesus, Dudhsagar Falls',
        region: 'West', capital: 'Panaji',
        language: ['Konkani', 'English'], isActive: true, isFeatured: true,
    },
    {
        name: 'Gujarat', slug: 'gujarat',
        description: 'Land of Gandhi, vibrant festivals and business.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
        highlights: 'Rann of Kutch, Gir Forest, Somnath Temple',
        region: 'West', capital: 'Gandhinagar',
        language: ['Gujarati'], isActive: true, isFeatured: true,
    },
    {
        name: 'Haryana', slug: 'haryana',
        description: 'Land of heroes, Kurukshetra and agriculture.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        highlights: 'Kurukshetra, Sultanpur Bird Sanctuary, Pinjore Gardens',
        region: 'North', capital: 'Chandigarh',
        language: ['Hindi', 'Haryanvi'], isActive: true, isFeatured: false,
    },
    {
        name: 'Himachal Pradesh', slug: 'himachal-pradesh',
        description: 'Dev Bhoomi, land of gods and snow-capped mountains.',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
        highlights: 'Shimla, Manali, Dharamshala, Spiti Valley',
        region: 'North', capital: 'Shimla',
        language: ['Hindi', 'Pahari'], isActive: true, isFeatured: true,
    },
    {
        name: 'Jharkhand', slug: 'jharkhand',
        description: 'Land of forests and tribal heritage.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        highlights: 'Hundru Falls, Betla National Park, Deoghar',
        region: 'East', capital: 'Ranchi',
        language: ['Hindi', 'Santali'], isActive: true, isFeatured: false,
    },
    {
        name: 'Karnataka', slug: 'karnataka',
        description: 'Silicon Valley of India, rich in history and nature.',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        highlights: 'Hampi, Coorg, Mysore Palace, Jog Falls',
        region: 'South', capital: 'Bengaluru',
        language: ['Kannada'], isActive: true, isFeatured: true,
    },
    {
        name: 'Kerala', slug: 'kerala',
        description: "God's Own Country, backwaters and spices.",
        image: 'https://images.unsplash.com/photo-1593417034675-3ed7eda1bee9?w=800',
        highlights: 'Alleppey Backwaters, Munnar, Periyar Wildlife',
        region: 'South', capital: 'Thiruvananthapuram',
        language: ['Malayalam'], isActive: true, isFeatured: true,
    },
    {
        name: 'Madhya Pradesh', slug: 'madhya-pradesh',
        description: 'Heart of India, tigers and ancient temples.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
        highlights: 'Khajuraho, Kanha Tiger Reserve, Sanchi Stupa',
        region: 'Central', capital: 'Bhopal',
        language: ['Hindi'], isActive: true, isFeatured: false,
    },
    {
        name: 'Maharashtra', slug: 'maharashtra',
        description: 'Land of Marathas, Bollywood and natural wonders.',
        image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800',
        highlights: 'Mumbai, Ajanta & Ellora Caves, Lonavala',
        region: 'West', capital: 'Mumbai',
        language: ['Marathi'], isActive: true, isFeatured: true,
    },
    {
        name: 'Manipur', slug: 'manipur',
        description: 'Jewel of India, land of polo and dance.',
        image: 'https://images.unsplash.com/photo-1601931935821-5fbe71157695?w=800',
        highlights: 'Loktak Lake, Keibul Lamjao, Imphal War Cemetery',
        region: 'Northeast', capital: 'Imphal',
        language: ['Meitei', 'English'], isActive: true, isFeatured: false,
    },
    {
        name: 'Meghalaya', slug: 'meghalaya',
        description: 'Abode of clouds, living root bridges and waterfalls.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        highlights: 'Cherrapunji, Living Root Bridges, Shillong',
        region: 'Northeast', capital: 'Shillong',
        language: ['Khasi', 'English'], isActive: true, isFeatured: false,
    },
    {
        name: 'Mizoram', slug: 'mizoram',
        description: 'Land of blue mountains and bamboo forests.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        highlights: 'Aizawl, Phawngpui, Champhai',
        region: 'Northeast', capital: 'Aizawl',
        language: ['Mizo', 'English'], isActive: true, isFeatured: false,
    },
    {
        name: 'Nagaland', slug: 'nagaland',
        description: 'Land of festivals and Naga tribal heritage.',
        image: 'https://images.unsplash.com/photo-1700040224625-e502a5fbe7d6?w=800',
        highlights: 'Hornbill Festival, Dzukou Valley, Kohima War Cemetery',
        region: 'Northeast', capital: 'Kohima',
        language: ['English', 'Nagamese'], isActive: true, isFeatured: false,
    },
    {
        name: 'Odisha', slug: 'odisha',
        description: 'Land of temples, tribal art and coastline.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
        highlights: 'Konark Sun Temple, Puri Jagannath, Chilika Lake',
        region: 'East', capital: 'Bhubaneswar',
        language: ['Odia'], isActive: true, isFeatured: false,
    },
    {
        name: 'Punjab', slug: 'punjab',
        description: 'Land of five rivers, Golden Temple and bhangra.',
        image: 'https://images.unsplash.com/photo-1723118579792-e22d17b155ab?w=800',
        highlights: 'Golden Temple, Wagah Border, Anandpur Sahib',
        region: 'North', capital: 'Chandigarh',
        language: ['Punjabi'], isActive: true, isFeatured: true,
    },
    {
        name: 'Rajasthan', slug: 'rajasthan',
        description: 'Land of kings, forts and desert festivals.',
        image: 'https://images.unsplash.com/photo-1757237367150-3c134720f075?w=800',
        highlights: 'Jaipur, Udaipur, Jaisalmer, Pushkar Camel Fair',
        region: 'North', capital: 'Jaipur',
        language: ['Hindi', 'Rajasthani'], isActive: true, isFeatured: true,
    },
    {
        name: 'Sikkim', slug: 'sikkim',
        description: 'Himalayan paradise, monasteries and trekking.',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
        highlights: 'Gangtok, Rumtek Monastery, Gurudongmar Lake',
        region: 'Northeast', capital: 'Gangtok',
        language: ['Nepali', 'Sikkimese'], isActive: true, isFeatured: false,
    },
    {
        name: 'Tamil Nadu', slug: 'tamil-nadu',
        description: 'Land of Dravidian temples, classical dance and cuisine.',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
        highlights: 'Meenakshi Temple, Ooty, Marina Beach, Mahabalipuram',
        region: 'South', capital: 'Chennai',
        language: ['Tamil'], isActive: true, isFeatured: true,
    },
    {
        name: 'Telangana', slug: 'telangana',
        description: 'Land of Nizams, pearls and IT hub.',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        highlights: 'Charminar, Golconda Fort, Ramoji Film City',
        region: 'South', capital: 'Hyderabad',
        language: ['Telugu'], isActive: true, isFeatured: false,
    },
    {
        name: 'Tripura', slug: 'tripura',
        description: 'Land of fourteen gods and natural beauty.',
        image: 'https://images.unsplash.com/photo-1601931935821-5fbe71157695?w=800',
        highlights: 'Ujjayanta Palace, Neermahal, Unakoti',
        region: 'Northeast', capital: 'Agartala',
        language: ['Bengali', 'Kokborok'], isActive: true, isFeatured: false,
    },
    {
        name: 'Uttar Pradesh', slug: 'uttar-pradesh',
        description: 'Land of the Taj Mahal, Varanasi and Kumbh Mela.',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
        highlights: 'Taj Mahal, Varanasi, Mathura, Lucknow',
        region: 'North', capital: 'Lucknow',
        language: ['Hindi', 'Urdu'], isActive: true, isFeatured: true,
    },
    {
        name: 'Uttarakhand', slug: 'uttarakhand',
        description: 'Dev Bhoomi, Char Dham and Himalayan adventure.',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
        highlights: 'Rishikesh, Char Dham, Jim Corbett, Nainital',
        region: 'North', capital: 'Dehradun',
        language: ['Hindi', 'Garhwali', 'Kumaoni'], isActive: true, isFeatured: true,
    },
    {
        name: 'West Bengal', slug: 'west-bengal',
        description: 'Cultural capital of India, Durga Puja and literature.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
        highlights: 'Kolkata, Darjeeling, Sundarbans, Durga Puja',
        region: 'East', capital: 'Kolkata',
        language: ['Bengali'], isActive: true, isFeatured: true,
    },
];
function seedStates() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myDB');
            console.log('✅ MongoDB connected');
            // Delete existing states
            yield State_model_1.State.insertMany(states);
            console.log('🗑️ Old states deleted');
            // Insert new states
            yield State_model_1.State.insertMany(states);
            console.log(`✅ ${states.length} states inserted successfully!`);
            yield mongoose_1.default.disconnect();
            console.log('✅ Done!');
        }
        catch (err) {
            console.error('❌ Error:', err);
            process.exit(1);
        }
    });
}
seedStates();
