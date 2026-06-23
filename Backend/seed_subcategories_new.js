const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const SubCategoryChip = require('./Models/SubCategoryChip');

dotenv.config();

const categoryGradients = {
  'skincare-organic': ['#ec008c', '#fc6767'],
  'smart-wearables': ['#1e3c72', '#2a5298'],
  'bags-wallets': ['#d19b3d', '#9b6b1f'],
  'fine-jewellery': ['#d4af37', '#85581a'],
  'home-appliances': ['#0f2027', '#203a43'],
  'trendy-sneakers': ['#ff9966', '#ff5e62'],
  'kids-clothing': ['#4facfe', '#00f2fe']
};

const subCategoriesData = {
  'skincare-organic': ['Face Serums', 'Facial Oils', 'Face Wash', 'Clay Masks', 'Eye Creams'],
  'smart-wearables': ['Smartwatches', 'Fitness Trackers', 'Earbuds', 'Smart Rings', 'Wearable Bands'],
  'bags-wallets': ['Handbags', 'Backpacks', 'Wallets', 'Clutches', 'Sling Bags'],
  'fine-jewellery': ['Gold Rings', 'Necklaces', 'Gemstone Earrings', 'Bracelets', 'Bridal Sets'],
  'home-appliances': ['Espresso Makers', 'Food Blenders', 'Bread Toasters', 'Air Fryers', 'Electric Kettles'],
  'trendy-sneakers': ['Running Shoes', 'Casual Sneakers', 'High Top Kicks', 'Sports Trainers', 'Canvas Shoes'],
  'kids-clothing': ['Baby Overalls', 'Printed Tees', 'Denim Jeans', 'Cotton Frocks', 'Kids Pajamas']
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

async function seedNewSubCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected successfully!');

    // Ensure target folder exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const seededChips = [];
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

        // Generate vector SVG typographic badge
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

        // Compress and save as WebP
        await sharp(svgBuffer)
          .webp({ quality: 80 })
          .toFile(destPath);
        
        console.log(`Generated and compressed: ${filename}`);

        const relativeUrlPath = `/uploads/subcategories/${filename}`;
        const chipData = {
          id: subId,
          categoryId: catId,
          subCategoryName: subName,
          image: relativeUrlPath,
          active: true,
          order: i + 1
        };

        // Upsert SubCategoryChip in DB
        const chip = await SubCategoryChip.findOneAndUpdate(
          { id: subId },
          chipData,
          { new: true, upsert: true }
        );
        seededChips.push(chip);
      }
    }

    console.log(`Seeded and updated ${seededChips.length} SubCategoryChips in MongoDB successfully!`);
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding subcategories:', err);
    process.exit(1);
  }
}

seedNewSubCategories();
