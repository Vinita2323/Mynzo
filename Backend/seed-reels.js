const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./Config/db');
const Reel = require('./Models/Reel');
const Product = require('./Models/Product');
const Admin = require('./Models/Admin');
const User = require('./Models/User');

const videoUrls = [
  {
    username: 'fashion_forward',
    caption: 'Neon dreams and street style. 🌟 Rate this outfit in the comments!',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-in-a-studio-41901-large.mp4',
    rating: 5,
    section: 'forYou'
  },
  {
    username: 'coffee_aesthetic',
    caption: 'Nothing beats a fresh warm brew in the morning. ☕️✨',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-cup-of-hot-coffee-41617-large.mp4',
    rating: 4,
    section: 'forYou'
  },
  {
    username: 'shoe_collector',
    caption: 'Step out in style. Premium leather boots for everyday hustle. 👞💼',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-feet-of-a-man-walking-in-leather-shoes-40292-large.mp4',
    rating: 5,
    section: 'forYou'
  },
  {
    username: 'fitness_motivation',
    caption: 'Start your week strong. No excuses, let’s run! 🏃‍♀️💪',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-a-treadmill-41604-large.mp4',
    rating: 5,
    section: 'forYou'
  },
  {
    username: 'yellow_summer',
    caption: 'Spinning into summer like... ☀️💛 Grab the summer collection now!',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-a-yellow-dress-spinning-41887-large.mp4',
    rating: 4,
    section: 'forYou'
  },
  {
    username: 'desk_setup',
    caption: 'Workspace productivity tips. How do you keep focused? 💻🧠',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-laptop-40294-large.mp4',
    rating: 5,
    section: 'forYou'
  },
  {
    username: 'wanderlust_travel',
    caption: 'Get lost in nature to find yourself. Next stop: mountains! 🏔️🎒',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-traveler-with-backpack-walking-in-nature-41595-large.mp4',
    rating: 5,
    section: 'forYou'
  },
  {
    username: 'chocoholic',
    caption: 'Chocolate therapy is the best therapy. Who wants a bite? 🍫😋',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-chocolate-on-a-plate-41619-large.mp4',
    rating: 4,
    section: 'forYou'
  },
  {
    username: 'glow_skincare',
    caption: 'My 3-step morning skincare routine for a natural glowing finish. ✨🧴',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-applying-facial-cream-41613-large.mp4',
    rating: 5,
    section: 'forYou'
  },
  {
    username: 'shopaholic_diary',
    caption: 'Retail therapy done right. Shopping haul coming up next! 🛍️💖',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-carrying-shopping-bags-in-a-mall-41883-large.mp4',
    rating: 5,
    section: 'forYou'
  }
];

const seedReels = async () => {
  try {
    await connectDB();
    console.log('🗑️ Deleting old reels...');
    await Reel.deleteMany({});

    console.log('🔍 Fetching products to link...');
    const products = await Product.find({ status: 'Approved' }).limit(10);
    if (products.length === 0) {
      console.log('❌ No approved products found to link with reels. Please add products first.');
      process.exit(1);
    }
    console.log(`Found ${products.length} products to link with reels.`);

    console.log('🔍 Fetching uploader user/admin...');
    let uploaderId;
    let userModel = 'Admin';
    let userType = 'admin';

    const admin = await Admin.findOne({});
    if (admin) {
      uploaderId = admin._id;
    } else {
      const user = await User.findOne({});
      if (user) {
        uploaderId = user._id;
        userModel = 'User';
        userType = 'user';
      } else {
        // Fallback to random ObjectId
        uploaderId = new mongoose.Types.ObjectId();
      }
    }
    console.log(`Using uploader: ${uploaderId} (${userModel})`);

    const reelsToCreate = videoUrls.map((item, idx) => {
      const product = products[idx % products.length];
      return {
        ...item,
        productId: product._id,
        uploadedBy: uploaderId,
        userModel,
        userType,
        profileImage: '/uploads/admin-avatar.png',
        likes: [],
        comments: [],
        views: Math.floor(Math.random() * 2000) + 150,
        status: 'approved'
      };
    });

    console.log('🌱 Seeding 10 new Reels...');
    const seeded = await Reel.insertMany(reelsToCreate);
    console.log(`✅ Successfully seeded ${seeded.length} reels.`);

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedReels();
