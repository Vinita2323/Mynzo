const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const SubCategoryChip = require('./Models/SubCategoryChip');

dotenv.config();

const categoryGradients = {
  'electronics': ['#1e3c72', '#2a5298'],
  'fashion': ['#e52d27', '#b31217'],
  'home-kitchen': ['#d19b3d', '#9b6b1f'],
  'beauty-personal-care': ['#ec008c', '#fc6767'],
  'sports-outdoors': ['#11998e', '#38ef7d'],
  'toys-games': ['#f857a6', '#ff5858'],
  'books-stationery': ['#30cfd0', '#330867'],
  'automotive': ['#0f2027', '#203a43'],
  'groceries-gourmet': ['#00b09b', '#96c93d'],
  'health-wellness': ['#ff9966', '#ff5e62'],
  'garden-outdoor': ['#134e5e', '#71b280'],
  'pet-supplies': ['#f12711', '#f5af19'],
  'baby-products': ['#4facfe', '#00f2fe'],
  'jewelry-accessories': ['#d4af37', '#85581a'],
  'footwear': ['#833ab4', '#fd1d1d'],
  'luggage-travel': ['#1e130c', '#9a8478'],
  'office-products': ['#3a7bd5', '#3a6073'],
  'musical-instruments': ['#800000', '#ff0000'],
  'smart-home': ['#654ea3', '#eaafc8'],
  'tools-hardware': ['#4b6cb7', '#182848']
};

const subCategoriesData = {
  'electronics': ['Smartphones', 'Laptops', 'Headphones', 'Smartwatches', 'Chargers'],
  'fashion': ["Men's Wear", "Women's Wear", "Kids' Wear", 'Activewear', 'Ethnic Wear'],
  'home-kitchen': ['Cookware', 'Tableware', 'Bedding', 'Kitchen Appliances', 'Home Decor'],
  'beauty-personal-care': ['Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Bath & Body'],
  'sports-outdoors': ['Fitness Equipment', 'Cycling Gear', 'Camping & Hiking', 'Running Shoes', 'Team Sports'],
  'toys-games': ['Board Games', 'Action Figures', 'Puzzles', 'Dolls', 'Educational Toys'],
  'books-stationery': ['Fiction Books', 'Self Help Books', 'Notebooks', 'Pens & Pencils', 'Art Supplies'],
  'automotive': ['Car Cleaning', 'Interior Car Decor', 'Exterior Accessories', 'Car Gadgets', 'Motorcycle Gear'],
  'groceries-gourmet': ['Beverages', 'Snacks', 'Breakfast Cereals', 'Cooking Oils', 'Spices & Herbs'],
  'health-wellness': ['Vitamins', 'Protein Powders', 'Yoga Mats', 'Massagers', 'First Aid Kits'],
  'garden-outdoor': ['Live Plants', 'Flower Seeds', 'Gardening Tools', 'Watering Cans', 'Plant Pots'],
  'pet-supplies': ['Dog Food', 'Cat Food', 'Pet Toys', 'Collars & Leashes', 'Grooming Brushes'],
  'baby-products': ['Baby Wipes', 'Diapers', 'Baby Lotions', 'Strollers', 'Baby Clothes'],
  'jewelry-accessories': ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Wristwatches'],
  'footwear': ["Men's Sneakers", "Women's Heels", 'Running Shoes', 'Casual Loafers', 'Sports Sandals'],
  'luggage-travel': ['Hard Suitcases', 'Soft Trolleys', 'Duffle Bags', 'Travel Backpacks', 'Passport Holders'],
  'office-products': ['Office Chairs', 'Desk Lamps', 'Paper Shredders', 'File Folders', 'Whiteboards'],
  'musical-instruments': ['Acoustic Guitars', 'Keyboard Pianos', 'Drum Pads', 'Ukuleles', 'Microphones'],
  'smart-home': ['Smart Plugs', 'Smart Bulbs', 'Security Cameras', 'Smart Locks', 'Smart Thermostats'],
  'tools-hardware': ['Hand Tool Sets', 'Power Drills', 'Flashlights', 'Measuring Tapes', 'Screwdrivers']
};

const destDir = path.join(__dirname, 'uploads', 'subcategories');

function getInitials(name) {
  const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

async function seedSubCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected successfully!');

    // Ensure target folder exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Clean old subcategory chips
    console.log('Cleaning old SubCategoryChips in DB...');
    await SubCategoryChip.deleteMany({});
    
    let totalSeeded = 0;
    const allSubchips = [];

    const categoryKeys = Object.keys(subCategoriesData);

    for (const catId of categoryKeys) {
      const subs = subCategoriesData[catId];
      const gradient = categoryGradients[catId] || ['#64748b', '#94a3b8'];

      for (let i = 0; i < subs.length; i++) {
        const subName = subs[i];
        const initials = getInitials(subName);
        const subId = `${catId}-${subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const filename = `subcategory-${subId}.webp`;
        const destPath = path.join(destDir, filename);

        // Generate vector SVG typography circular badge matching category gradient
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <defs>
              <linearGradient id="subgrad-${subId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${gradient[0]}" />
                <stop offset="100%" stop-color="${gradient[1]}" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#subgrad-${subId})" />
            <circle cx="50" cy="50" r="28" fill="white" fill-opacity="0.15" stroke="white" stroke-width="2" />
            <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="white" text-anchor="middle" letter-spacing="1">
              ${initials}
            </text>
          </svg>
        `;

        const svgBuffer = Buffer.from(svgString.trim());

        // Compress and save to WebP
        await sharp(svgBuffer)
          .webp({ quality: 80 })
          .toFile(destPath);
        
        console.log(`Generated and compressed: ${filename}`);

        const relativeUrlPath = `/uploads/subcategories/${filename}`;
        allSubchips.push({
          id: subId,
          categoryId: catId,
          subCategoryName: subName,
          image: relativeUrlPath,
          active: true,
          order: i + 1
        });
      }
    }

    console.log('Inserting new SubCategoryChips to MongoDB...');
    const inserted = await SubCategoryChip.insertMany(allSubchips);
    console.log(`Seeded and updated ${inserted.length} SubCategoryChips in MongoDB successfully!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding subcategories:', err);
    process.exit(1);
  }
}

seedSubCategories();
