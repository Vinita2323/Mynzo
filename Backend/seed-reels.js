/**
 * Delete all Studio reels and seed 10 genuine, product-linked review reels.
 *
 * Run: node seed-reels.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./Config/db');
const Reel = require('./Models/Reel');
const Product = require('./Models/Product');

/**
 * 10 genuine UGC-style reviews mapped to real catalog products.
 * Mix of local uploads + browser-playable sample clips for visual variety.
 */
const REEL_SEEDS = [
  {
    username: 'priya_skincare',
    caption: 'Elite Retinol serum — skin feels smoother after 1 week. No irritation, light texture. Worth it!',
    rating: 5,
    section: 'following',
    productMatch: /retinol/i,
    video: '/uploads/videos/fashion_reel.mp4'
  },
  {
    username: 'neha_glowup',
    caption: 'Brio Aloe Vera serum for summer — cooling, non-sticky, perfect under sunscreen.',
    rating: 5,
    section: 'following',
    productMatch: /aloe/i,
    video: '/uploads/videos/sample_reel.mp4'
  },
  {
    username: 'aisha_selfcare',
    caption: 'EcoCraft Collagen clay mask — pores look cleaner, skin feels firmer. Sunday reset essential.',
    rating: 4,
    section: 'following',
    productMatch: /clay|collagen/i,
    video: '/uploads/videos/video-1781085834105-37064542.mp4'
  },
  {
    username: 'meera_beauty',
    caption: 'Apex Rose eye cream — puffiness down, soft finish. Using AM + PM.',
    rating: 5,
    section: 'following',
    productMatch: /eye cream/i,
    video: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    username: 'arjun_techlife',
    caption: 'Apex Pro Smart Ring unboxing — sleek build, tracks sleep & steps. Daily driver now.',
    rating: 5,
    section: 'forYou',
    productMatch: /smart ring/i,
    video: 'https://www.w3schools.com/html/movie.mp4'
  },
  {
    username: 'kavya_style',
    caption: 'Elite Sleek Travel Handbag — fits laptop + makeup pouch. Office to airport ready.',
    rating: 5,
    section: 'forYou',
    productMatch: /handbag/i,
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    username: 'rohan_commute',
    caption: 'Nova Modern Canvas Backpack review — padded straps, plenty of pockets. College + gym.',
    rating: 4,
    section: 'following',
    productMatch: /backpack/i,
    video: '/uploads/videos/fashion_reel.mp4'
  },
  {
    username: 'isha_evenings',
    caption: 'Ultra Compact Suede Clutch — perfect for dinners. Soft feel, looks expensive.',
    rating: 5,
    section: 'forYou',
    productMatch: /clutch/i,
    video: '/uploads/videos/sample_reel.mp4'
  },
  {
    username: 'vivaan_urban',
    caption: 'Zenith Urban Commute Sling — hands-free, anti-theft vibe, fits phone + wallet + keys.',
    rating: 5,
    section: 'following',
    productMatch: /zenith|urban commute/i,
    video: '/uploads/videos/video-1781085834105-37064542.mp4'
  },
  {
    username: 'ananya_jewels',
    caption: 'Solace Emerald earrings — lightweight, sparkle catches light beautifully. Festive favourite!',
    rating: 5,
    section: 'forYou',
    productMatch: /solace|emerald/i,
    video: 'https://www.w3schools.com/html/mov_bbb.mp4'
  }
];

function pickProduct(products, seed, usedIds) {
  const matched = products.find(
    (p) => seed.productMatch.test(`${p.name} ${p.brandName || ''}`) && !usedIds.has(String(p._id))
  );
  if (matched) return matched;
  const unused = products.find((p) => !usedIds.has(String(p._id)));
  return unused || products[0];
}

const seedReels = async () => {
  try {
    await connectDB();

    console.log('\n🗑️  Deleting ALL existing reels...');
    const deleted = await Reel.deleteMany({});
    console.log(`   Removed ${deleted.deletedCount} reels.`);

    console.log('\n🔍 Loading approved products...');
    const products = await Product.find({ status: 'Approved' }).limit(40);
    if (products.length === 0) {
      console.log('❌ No approved products found. Add products first.');
      process.exit(1);
    }
    console.log(`   Found ${products.length} approved products.`);

    const usedProductIds = new Set();
    const reelsToCreate = REEL_SEEDS.map((seed) => {
      const product = pickProduct(products, seed, usedProductIds);
      usedProductIds.add(String(product._id));

      // Unique synthetic uploader per reel so Report shows for every logged-in user
      // (do not attach real User accounts — that hid Report on "own" seeded reels)
      return {
        productId: product._id,
        uploadedBy: new mongoose.Types.ObjectId(),
        userModel: 'User',
        userType: 'user',
        username: seed.username,
        profileImage: '',
        video: seed.video,
        rating: seed.rating,
        caption: seed.caption,
        status: 'approved',
        section: seed.section,
        likes: [],
        comments: [],
        views: 180 + Math.floor(Math.random() * 4200)
      };
    });

    console.log('\n🌱 Seeding 10 genuine Studio reels...');
    const seeded = await Reel.insertMany(reelsToCreate);

    seeded.forEach((r, i) => {
      const product = products.find((p) => String(p._id) === String(reelsToCreate[i].productId));
      console.log(`   ${i + 1}. @${r.username} → ${product?.name || r.productId} [${r.section}]`);
    });

    console.log(`\n✅ Done. Seeded ${seeded.length} reels. Old reels deleted.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedReels();
