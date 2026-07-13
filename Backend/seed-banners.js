const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./Config/db');

// Define Banner Schema locally to avoid model dependency issues
const BannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: String,
  active: Boolean
});

const Banner = mongoose.model('Banner', BannerSchema);

const seedBanners = async () => {
  console.log('Connecting to database...');
  await connectDB();
  console.log('Connected!');

  try {
    // Delete all existing banners
    const deleteResult = await Banner.deleteMany({});
    console.log(`🧹 Cleared existing banners (${deleteResult.deletedCount} documents removed).`);

    const newBanners = [
      {
        title: "Premium Audio",
        subtitle: "Immersive Noise Cancelling Sound",
        image: "http://localhost:5000/uploads/new_gadgets_banner.webp",
        active: true
      },
      {
        title: "Natural Skincare",
        subtitle: "Pure Botanical Luxury",
        image: "http://localhost:5000/uploads/new_cosmetics_banner.webp",
        active: true
      },
      {
        title: "Dynamic Sneakers",
        subtitle: "Perform at Your Peak",
        image: "http://localhost:5000/uploads/new_sneakers_banner.webp",
        active: true
      }
    ];

    // Seed new banners
    for (const b of newBanners) {
      const bannerDoc = new Banner(b);
      await bannerDoc.save();
      console.log(`✅ Seeded banner: "${b.title}"`);
    }

    console.log('🎉 Seeding banners completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding banners failed:', error.message);
    process.exit(1);
  }
};

seedBanners();
