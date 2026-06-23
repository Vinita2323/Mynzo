const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const Banner = require('./Models/Banner');

dotenv.config();

const rawImages = [
  {
    title: 'Fashion Festival',
    subtitle: 'Up to 50% Off on Indian Ethnic Wear',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/banner_1_1782206143023.png',
    destName: 'banner-1.webp'
  },
  {
    title: 'Tech Revolution',
    subtitle: 'Best in Class Wireless Audio & Gear',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/banner_2_1782206158762.png',
    destName: 'banner-2.webp'
  },
  {
    title: 'Glow Essentials',
    subtitle: 'Premium Organic Skincare & Cosmetics',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/banner_3_1782206175251.png',
    destName: 'banner-3.webp'
  },
  {
    title: 'Elegant Shine',
    subtitle: 'Crafted Luxury Gold & Diamond Jewellery',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/banner_4_1782206189000.png',
    destName: 'banner-4.webp'
  },
  {
    title: 'Joy of Giving',
    subtitle: 'Perfect Toys & Festive Gift Hampers',
    src: 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/banner_5_1782206204000.png',
    destName: 'banner-5.webp'
  }
];

const destDir = path.join(__dirname, 'uploads');

async function seedBanners() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to database!');

    // Ensure uploads directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 1. Process and save images
    const savedBanners = [];
    for (const item of rawImages) {
      if (!fs.existsSync(item.src)) {
        console.error(`Source file not found: ${item.src}`);
        continue;
      }
      const destPath = path.join(destDir, item.destName);
      console.log(`Processing ${item.src} -> ${destPath}`);

      await sharp(item.src)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(destPath);

      console.log(`Successfully compressed & saved ${item.destName}`);

      // We store relative URL paths (e.g. "/uploads/banner-1.webp") in database
      savedBanners.push({
        title: item.title,
        subtitle: item.subtitle,
        image: `/uploads/${item.destName}`,
        active: true
      });
    }

    // 2. Clear old banners and insert new ones
    console.log('Cleaning existing banners in DB...');
    await Banner.deleteMany({});
    console.log('Inserting new banners...');
    const inserted = await Banner.insertMany(savedBanners);
    console.log(`Successfully seeded ${inserted.length} banners into DB!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding banners:', err);
    process.exit(1);
  }
}

seedBanners();
