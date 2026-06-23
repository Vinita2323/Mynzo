const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const CategoryChip = require('./Models/CategoryChip');

dotenv.config();

const newCategories = [
  {
    id: 'skincare-organic',
    name: 'Organic Skincare',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/skincare_organic_1782206718918.png',
    destName: 'category-skincare-organic.webp',
    order: 21
  },
  {
    id: 'smart-wearables',
    name: 'Smart Wearables',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/smart_wearables_1782206735610.png',
    destName: 'category-smart-wearables.webp',
    order: 22
  },
  {
    id: 'bags-wallets',
    name: 'Bags & Wallets',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/bags_wallets_1782206751482.png',
    destName: 'category-bags-wallets.webp',
    order: 23
  },
  {
    id: 'fine-jewellery',
    name: 'Fine Jewellery',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/fine_jewellery_1782206770235.png',
    destName: 'category-fine-jewellery.webp',
    order: 24
  },
  {
    id: 'home-appliances',
    name: 'Home Appliances',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/home_appliances_1782206787074.png',
    destName: 'category-home-appliances.webp',
    order: 25
  },
  {
    id: 'trendy-sneakers',
    name: 'Trendy Sneakers',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/trendy_sneakers_1782206802674.png',
    destName: 'category-trendy-sneakers.webp',
    order: 26
  },
  {
    id: 'kids-clothing',
    name: 'Kids Clothing',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/kids_clothing_1782206818680.png',
    destName: 'category-kids-clothing.webp',
    order: 27
  }
];

const destDir = path.join(__dirname, 'uploads', 'categories');

async function seedNewCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected successfully!');

    // Ensure target folder exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const seededChips = [];
    for (const item of newCategories) {
      if (!fs.existsSync(item.src)) {
        console.error(`Source file not found: ${item.src}`);
        continue;
      }
      const destPath = path.join(destDir, item.destName);
      console.log(`Processing: ${item.src} -> ${destPath}`);

      // Resize and compress as WebP
      await sharp(item.src)
        .resize(200, 200)
        .webp({ quality: 80 })
        .toFile(destPath);
      
      console.log(`Successfully generated and compressed: ${item.destName}`);

      const relativeUrlPath = `/uploads/categories/${item.destName}`;
      const chipData = {
        id: item.id,
        categoryName: item.name,
        image: relativeUrlPath,
        active: true,
        order: item.order
      };

      // Upsert CategoryChip in DB
      const chip = await CategoryChip.findOneAndUpdate(
        { id: item.id },
        chipData,
        { new: true, upsert: true }
      );
      seededChips.push(chip);
    }

    console.log(`Successfully seeded ${seededChips.length} new categories into MongoDB!`);
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding new categories:', err);
    process.exit(1);
  }
}

seedNewCategories();
