const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const Product = require('./Models/Product');

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

const brandsPool = ['Mynzo Premium', 'Apex', 'Nova', 'Ultra', 'Elite', 'Solace', 'EcoCraft', 'Vortex', 'Zenith', 'Brio'];
const destDir = path.join(__dirname, 'uploads', 'products');

function getInitials(name) {
  const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected successfully!');

    // Ensure target folder exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Clean old products
    console.log('Cleaning old Products in DB...');
    await Product.deleteMany({});
    
    const categoryKeys = Object.keys(subCategoriesData);
    let totalSeeded = 0;
    
    // Batch size for Mongoose insertions
    const batchSize = 100;
    let productBatch = [];

    for (const catId of categoryKeys) {
      const subs = subCategoriesData[catId];
      const gradient = categoryGradients[catId] || ['#64748b', '#94a3b8'];

      for (const subName of subs) {
        const initials = getInitials(subName);

        for (let pIdx = 0; pIdx < 20; pIdx++) {
          const productIndex = totalSeeded + 1;
          const brandName = brandsPool[productIndex % brandsPool.length];
          const name = `${brandName} Premium ${subName} ${pIdx + 1}`;
          const description = `This high-quality ${name} is designed to provide maximum value and performance. Made with premium materials, it offers reliability, durability, and a sleek design tailored to your everyday lifestyle needs.`;
          
          // Pricing logic
          const mrp = Math.floor(Math.random() * 5000) + 999;
          const discountPercent = Math.floor(Math.random() * 40) + 15; // 15% to 55%
          const sellingPrice = Math.floor(mrp * (1 - discountPercent / 100));
          const discountLabel = `${discountPercent}% OFF`;
          
          const sku = `MNZ-${catId.substring(0,3).toUpperCase()}-${subName.substring(0,3).toUpperCase().replace(/[^A-Z]/g,'')}-${productIndex.toString().padStart(4, '0')}`;
          const filename = `product-${sku}.webp`;
          const destPath = path.join(destDir, filename);

          // Generate vector SVG mockup
          const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
              <defs>
                <linearGradient id="pgrad-${productIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${gradient[0]}" />
                  <stop offset="100%" stop-color="${gradient[1]}" />
                </linearGradient>
              </defs>
              <rect width="200" height="200" rx="35" fill="url(#pgrad-${productIndex})" />
              <circle cx="100" cy="100" r="50" fill="white" fill-opacity="0.1" stroke="white" stroke-width="2" />
              <text x="100" y="50" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" fill="white" fill-opacity="0.7" text-anchor="middle" letter-spacing="1">
                ${brandName.toUpperCase()}
              </text>
              <text x="100" y="115" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="44" font-weight="900" fill="white" text-anchor="middle">
                ${initials}
              </text>
              <text x="100" y="165" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="bold" fill="white" fill-opacity="0.8" text-anchor="middle" letter-spacing="1">
                #${sku}
              </text>
            </svg>
          `;

          const svgBuffer = Buffer.from(svgString.trim());

          // Compress and save to WebP
          await sharp(svgBuffer)
            .webp({ quality: 80 })
            .toFile(destPath);

          const relativeUrlPath = `/uploads/products/${filename}`;
          
          // Home page flags logic
          const topSection = productIndex % 7 === 0;
          const crazyDeals = productIndex % 9 === 0;
          const flashSale = productIndex % 5 === 0;

          productBatch.push({
            name,
            category: catId,
            subCategory: subName,
            description,
            sellingPrice,
            mrp,
            stock: Math.floor(Math.random() * 200) + 20,
            discountLabel,
            sku,
            highlights: {
              quality: 'Premium Grade',
              warranty: '1 Year Manufacturer Warranty',
              origin: 'Made in India',
              material: 'Premium Quality Materials'
            },
            technicalSpecs: {
              model: `MNZ-${productIndex}`,
              weight: `${(Math.random() * 2 + 0.1).toFixed(2)} kg`,
              dimensions: `${Math.floor(Math.random() * 30 + 10)} x ${Math.floor(Math.random() * 20 + 5)} x ${Math.floor(Math.random() * 15 + 2)} cm`
            },
            shippingSpecs: {
              weight: 1.2,
              length: 25,
              width: 15,
              height: 10
            },
            flags: {
              topSection,
              crazyDeals,
              flashSale
            },
            gstCategory: 'GST 18% (Global Default)',
            hsnCode: `${Math.floor(Math.random() * 9000) + 1000}`,
            images: [relativeUrlPath],
            brandName,
            tags: [catId, subName.toLowerCase(), 'premium', 'mynzo'],
            manufacturerInfo: `${brandName} Industries Pvt Ltd, India`,
            status: 'Approved',
            sales: Math.floor(Math.random() * 500) + 10
          });

          totalSeeded++;

          // Insert batch to DB
          if (productBatch.length >= batchSize) {
            await Product.insertMany(productBatch);
            console.log(`Successfully seeded ${totalSeeded} products...`);
            productBatch = [];
          }
        }
      }
    }

    // Insert remaining products
    if (productBatch.length > 0) {
      await Product.insertMany(productBatch);
      console.log(`Successfully seeded ${totalSeeded} products total!`);
    }

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
}

seedProducts();
