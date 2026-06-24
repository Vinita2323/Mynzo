const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./Config/db');
const User = require('./Models/User');
const Product = require('./Models/Product');
const Order = require('./Models/Order');

const seed = async () => {
  try {
    await connectDB();
    
    // Find a user or create one
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        phone: '9999999999',
        name: 'Seed Test Customer',
        email: 'seed_customer@gmail.com',
        isVerified: true
      });
      console.log('✅ Created mock user:', user.email);
    } else {
      console.log('👤 Found user for seed:', user.name || user.email || user.phone);
    }

    // Find products
    const products = await Product.find({}).limit(2);
    if (products.length < 2) {
      console.error('❌ Error: Need at least 2 products in the database to seed orders!');
      process.exit(1);
    }
    console.log(`📦 Found ${products.length} products to populate order items.`);

    // Order 1
    const order1 = new Order({
      userId: user._id,
      items: [
        {
          productId: products[0]._id,
          name: products[0].name,
          price: products[0].sellingPrice || 150,
          quantity: 1,
          image: products[0].images?.[0] || ''
        }
      ],
      total: products[0].sellingPrice || 150,
      deliveryAddress: {
        name: user.name || 'Test User',
        type: 'Home',
        address: '123 Test Street, New Delhi',
        pincode: '110001'
      },
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      paymentId: 'pay_seed_001_' + Date.now(),
      status: 'Delivered',
      shiprocketOrderId: 'SR_SEED_001_' + Date.now(),
      shipmentId: 'SR_SHIP_001_' + Date.now(),
      awbCode: '99999999991',
      courierName: 'Delhivery',
      shipmentStatus: 'Delivered'
    });

    // Order 2
    const order2 = new Order({
      userId: user._id,
      items: [
        {
          productId: products[1]._id,
          name: products[1].name,
          price: products[1].sellingPrice || 250,
          quantity: 2,
          image: products[1].images?.[0] || ''
        }
      ],
      total: (products[1].sellingPrice || 250) * 2,
      deliveryAddress: {
        name: user.name || 'Test User',
        type: 'Work',
        address: '456 Tech Park, Bangalore',
        pincode: '560001'
      },
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      paymentId: 'pay_seed_002_' + Date.now(),
      status: 'Delivered',
      shiprocketOrderId: 'SR_SEED_002_' + Date.now(),
      shipmentId: 'SR_SHIP_002_' + Date.now(),
      awbCode: '99999999992',
      courierName: 'BlueDart',
      shipmentStatus: 'Delivered'
    });

    await order1.save();
    console.log('✅ Seeded Order 1:', order1._id);

    await order2.save();
    console.log('✅ Seeded Order 2:', order2._id);

    console.log('🚀 Successfully seeded 2 Paid and Delivered orders!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
