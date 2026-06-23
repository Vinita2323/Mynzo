const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const CategoryChip = require('./Models/CategoryChip');

dotenv.config();

const categoriesInfo = [
  {
    id: 'electronics',
    name: 'Electronics',
    gradient: ['#1e3c72', '#2a5298'],
    svgIcon: '<rect x="38" y="20" width="24" height="50" rx="4" fill="none" stroke="white" stroke-width="4"/><circle cx="50" cy="62" r="3" fill="white"/>'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    gradient: ['#e52d27', '#b31217'],
    svgIcon: '<path d="M30,35 L40,25 L50,30 L60,25 L70,35 L65,65 L50,60 L35,65 Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/>'
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    gradient: ['#d19b3d', '#9b6b1f'],
    svgIcon: '<path d="M30,45 L70,45 L65,70 L35,70 Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/><rect x="22" y="48" width="10" height="5" fill="white"/>'
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Care',
    gradient: ['#ec008c', '#fc6767'],
    svgIcon: '<path d="M50,20 L53,35 L68,38 L53,41 L50,56 L47,41 L32,38 L47,35 Z" fill="white"/>'
  },
  {
    id: 'sports-outdoors',
    name: 'Sports & Fitness',
    gradient: ['#11998e', '#38ef7d'],
    svgIcon: '<path d="M35,30 L65,30 L65,50 C65,58 58,65 50,65 C42,65 35,58 35,50 Z" fill="none" stroke="white" stroke-width="4"/><path d="M50,65 L50,75 M40,75 L60,75" fill="none" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'toys-games',
    name: 'Toys & Games',
    gradient: ['#f857a6', '#ff5858'],
    svgIcon: '<rect x="25" y="35" width="50" height="30" rx="8" fill="none" stroke="white" stroke-width="4"/><circle cx="62" cy="50" r="3" fill="white"/><circle cx="54" cy="50" r="3" fill="white"/><path d="M32,50 L42,50 M37,45 L37,55" fill="none" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'books-stationery',
    name: 'Books & Stationery',
    gradient: ['#30cfd0', '#330867'],
    svgIcon: '<path d="M30,30 C30,30 40,25 50,30 C60,25 70,30 70,30 L70,70 C70,70 60,65 50,70 C40,65 30,70 30,70 Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/>'
  },
  {
    id: 'automotive',
    name: 'Automotive',
    gradient: ['#0f2027', '#203a43'],
    svgIcon: '<path d="M25,50 L25,40 L35,30 L65,30 L75,40 L75,50 Z" fill="none" stroke="white" stroke-width="4"/><circle cx="35" cy="58" r="6" fill="white"/><circle cx="65" cy="58" r="6" fill="white"/>'
  },
  {
    id: 'groceries-gourmet',
    name: 'Groceries',
    gradient: ['#00b09b', '#96c93d'],
    svgIcon: '<path d="M25,40 L75,40 L70,70 L30,70 Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/><path d="M35,40 L50,20 L65,40" fill="none" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    gradient: ['#ff9966', '#ff5e62'],
    svgIcon: '<path d="M50,70 C50,70 25,50 25,35 C25,25 35,18 45,25 C50,30 50,30 50,30 C50,30 50,30 55,25 C65,18 75,25 75,35 C75,50 50,70 50,70 Z" fill="white"/>'
  },
  {
    id: 'garden-outdoor',
    name: 'Garden & Outdoor',
    gradient: ['#134e5e', '#71b280'],
    svgIcon: '<path d="M50,75 L50,45 C50,45 60,35 70,40 C70,40 65,55 50,50" fill="none" stroke="white" stroke-width="4"/><path d="M50,55 C50,55 40,45 30,50 C30,50 35,65 50,60" fill="none" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'pet-supplies',
    name: 'Pet Supplies',
    gradient: ['#f12711', '#f5af19'],
    svgIcon: '<circle cx="50" cy="55" r="14" fill="white"/><circle cx="32" cy="38" r="6" fill="white"/><circle cx="44" cy="26" r="6" fill="white"/><circle cx="56" cy="26" r="6" fill="white"/><circle cx="68" cy="38" r="6" fill="white"/>'
  },
  {
    id: 'baby-products',
    name: 'Baby Products',
    gradient: ['#4facfe', '#00f2fe'],
    svgIcon: '<rect x="38" y="40" width="24" height="35" rx="4" fill="none" stroke="white" stroke-width="4"/><path d="M44,40 L44,28 L56,28 L56,40 M50,28 L50,20" fill="none" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'jewelry-accessories',
    name: 'Jewelry & Watches',
    gradient: ['#d4af37', '#85581a'],
    svgIcon: '<path d="M30,35 L40,20 L60,20 L70,35 L50,65 Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/><path d="M30,35 L70,35 M40,20 L50,35 L60,20 M50,35 L50,65" fill="none" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'footwear',
    name: 'Footwear',
    gradient: ['#833ab4', '#fd1d1d'],
    svgIcon: '<path d="M25,65 L25,45 L40,40 L60,55 L75,55 L75,65 Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/><line x1="25" y1="60" x2="75" y2="60" stroke="white" stroke-width="2"/>'
  },
  {
    id: 'luggage-travel',
    name: 'Luggage & Travel',
    gradient: ['#1e130c', '#9a8478'],
    svgIcon: '<rect x="32" y="35" width="36" height="40" rx="4" fill="none" stroke="white" stroke-width="4"/><path d="M42,35 L42,23 L58,23 L58,35" fill="none" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'office-products',
    name: 'Office Products',
    gradient: ['#3a7bd5', '#3a6073'],
    svgIcon: '<path d="M50,20 L50,65 C50,72 42,78 35,72 C28,66 28,58 35,52 L58,30 C62,26 68,32 64,37 L45,55 C43,57 40,55 42,53 L58,37" fill="none" stroke="white" stroke-linecap="round" stroke-width="4"/>'
  },
  {
    id: 'musical-instruments',
    name: 'Musical Instruments',
    gradient: ['#800000', '#ff0000'],
    svgIcon: '<circle cx="40" cy="65" r="10" fill="white"/><path d="M50,65 L50,25 L70,35 L70,45 L50,35" fill="white"/>'
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    gradient: ['#654ea3', '#eaafc8'],
    svgIcon: '<circle cx="50" cy="45" r="20" fill="none" stroke="white" stroke-width="4"/><path d="M37,58 L42,72 L58,72 L63,58" fill="none" stroke="white" stroke-width="4"/><line x1="45" y1="78" x2="55" y2="78" stroke="white" stroke-width="4"/>'
  },
  {
    id: 'tools-hardware',
    name: 'Tools & Hardware',
    gradient: ['#4b6cb7', '#182848'],
    svgIcon: '<path d="M35,35 L45,25 L65,45 L55,55 Z" fill="white"/><rect x="42" y="48" width="8" height="35" rx="2" transform="rotate(-45 42 48)" fill="white"/>'
  }
];

const destDir = path.join(__dirname, 'uploads', 'categories');

async function seedCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected successfully!');

    // Ensure target folder exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const updatedChips = [];
    for (let i = 0; i < categoriesInfo.length; i++) {
      const cat = categoriesInfo[i];
      const filename = `category-${cat.id}.webp`;
      const destPath = path.join(destDir, filename);

      // Generate modern vector SVG string
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
          <defs>
            <linearGradient id="grad-${cat.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${cat.gradient[0]}" />
              <stop offset="100%" stop-color="${cat.gradient[1]}" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#grad-${cat.id})" />
          <g>${cat.svgIcon}</g>
        </svg>
      `;

      const svgBuffer = Buffer.from(svgString.trim());
      
      // Compress and save as WebP
      await sharp(svgBuffer)
        .webp({ quality: 80 })
        .toFile(destPath);
      
      console.log(`Successfully generated and compressed: ${filename}`);

      // Upsert CategoryChip document in DB
      const relativeUrlPath = `/uploads/categories/${filename}`;
      const chipData = {
        id: cat.id,
        categoryName: cat.name,
        image: relativeUrlPath,
        active: true,
        order: i + 1
      };

      const chip = await CategoryChip.findOneAndUpdate(
        { id: cat.id },
        chipData,
        { new: true, upsert: true }
      );
      updatedChips.push(chip);
    }

    console.log(`Seeded and updated ${updatedChips.length} CategoryChips in MongoDB successfully!`);
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
}

seedCategories();
