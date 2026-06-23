const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const Product = require('./Models/Product');

dotenv.config();

const newCategories = [
  'skincare-organic',
  'smart-wearables',
  'bags-wallets',
  'fine-jewellery',
  'home-appliances',
  'trendy-sneakers',
  'kids-clothing'
];

const subCategoriesData = {
  'skincare-organic': ['Face Serums', 'Facial Oils', 'Face Wash', 'Clay Masks', 'Eye Creams'],
  'smart-wearables': ['Smartwatches', 'Fitness Trackers', 'Earbuds', 'Smart Rings', 'Wearable Bands'],
  'bags-wallets': ['Handbags', 'Backpacks', 'Wallets', 'Clutches', 'Sling Bags'],
  'fine-jewellery': ['Gold Rings', 'Necklaces', 'Gemstone Earrings', 'Bracelets', 'Bridal Sets'],
  'home-appliances': ['Espresso Makers', 'Food Blenders', 'Bread Toasters', 'Air Fryers', 'Electric Kettles'],
  'trendy-sneakers': ['Running Shoes', 'Casual Sneakers', 'High Top Kicks', 'Sports Trainers', 'Canvas Shoes'],
  'kids-clothing': ['Baby Overalls', 'Printed Tees', 'Denim Jeans', 'Cotton Frocks', 'Kids Pajamas']
};

const variationsPool = {
  'skincare-organic': ['Rose Extract', 'Tea Tree Oil', 'Hyaluronic Acid', 'Retinol Boosting', 'Vitamin C Glow', 'Collagen Firming', 'Green Tea Infused', 'Niacinamide Clear', 'Aloe Vera Soothing', 'Activated Charcoal'],
  'smart-wearables': ['Pro Edition', 'Active Sport', 'Classic Leather', 'Lite Series', 'Ultra Fit', 'Elite Edition', 'GPS Edition', 'Titanium Edition', 'Neon Edition', 'Slim Series'],
  'bags-wallets': ['Vintage Leather', 'Modern Canvas', 'Compact Suede', 'Sleek Travel', 'Daily Utility', 'Executive Premium', 'Classy Tote', 'Urban Commute', 'Festive Clutch', 'Slimline Pocket'],
  'fine-jewellery': ['24K Gold Plated', 'Rose Gold Classic', 'Platinum Sparkle', 'Diamond Cut', 'Emerald Royal', 'Ruby Heart', 'Sapphire Star', 'Silver Filigree', 'Pearl Premium', 'Crystal Grace'],
  'home-appliances': ['Smart Pro', 'Eco Turbo', 'Compact Touch', 'Retro Design', 'Digital Plus', 'Classic Blend', 'Maxi Roast', 'Express Brew', 'Easy Clean', 'Power Grind'],
  'trendy-sneakers': ['Cloud Cushion', 'Flex Runner', 'Retro Court', 'Carbon Boost', 'Air Breathable', 'Urban Streetwear', 'Trail Grip', 'Velo City', 'Classic Leather', 'Volt Edition'],
  'kids-clothing': ['Soft Organic Cotton', 'Cute Animal Print', 'Stretchy Playwear', 'Summer Breezy', 'Comfy Fleece', 'Striped Classic', 'Plush Velvet', 'Cozy Sleepwear', 'Denim Comfort', 'Festive Wear']
};

const brandsPool = ['Mynzo Premium', 'Apex', 'Nova', 'Ultra', 'Elite', 'Solace', 'EcoCraft', 'Vortex', 'Zenith', 'Brio'];
const subchipDir = path.join(__dirname, 'uploads', 'subcategories');
const productDir = path.join(__dirname, 'uploads', 'products');

async function seedRealisticProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected successfully!');

    // Ensure product uploads directory exists
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    // Clean old products for only the new categories to preserve the first 2000 products
    console.log('Cleaning existing products for the 7 new categories...');
    await Product.deleteMany({ category: { $in: newCategories } });

    let totalSeeded = 0;
    const batchSize = 50;
    let productBatch = [];

    for (const catId of newCategories) {
      const subs = subCategoriesData[catId];
      const variations = variationsPool[catId] || ['Premium Variant'];

      for (const subName of subs) {
        const subId = `${catId}-${subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const subImagePath = path.join(subchipDir, `subcategory-${subId}.webp`);

        if (!fs.existsSync(subImagePath)) {
          console.error(`Subcategory base image not found: ${subImagePath}`);
          continue;
        }

        // Loop to add 10 products per subcategory
        for (let pIdx = 0; pIdx < 10; pIdx++) {
          const productIndex = totalSeeded + 1;
          const brandName = brandsPool[productIndex % brandsPool.length];
          const variantName = variations[pIdx % variations.length];
          const name = `${brandName} ${variantName} ${subName}`;
          const description = `Indulge in the premium luxury of the all-new ${name}. Meticulously designed for e-commerce catalog standards, it features exceptional quality materials, long-lasting durability, and stylish ergonomics.`;

          // Pricing logic
          const mrp = Math.floor(Math.random() * 6000) + 1200;
          const discountPercent = Math.floor(Math.random() * 35) + 15; // 15% to 50%
          const sellingPrice = Math.floor(mrp * (1 - discountPercent / 100));
          const discountLabel = `${discountPercent}% OFF`;
          
          const sku = `MNZ-NEW-${catId.substring(0,3).toUpperCase()}-${subName.substring(0,3).toUpperCase().replace(/[^A-Z]/g,'')}-${productIndex.toString().padStart(4, '0')}`;
          const filename = `product-${sku}.webp`;
          const destPath = path.join(productDir, filename);

          // Apply slight color variation/hue rotation to make each product variant unique
          // Rotate hue by pIdx * 30 degrees to change color tinting realistically
          const hueRotation = pIdx * 30;
          await sharp(subImagePath)
            .modulate({
              hue: hueRotation,
              saturation: 1.0 + (pIdx % 3) * 0.1 // subtle saturation variation
            })
            .webp({ quality: 80 })
            .toFile(destPath);

          const relativeUrlPath = `/uploads/products/${filename}`;

          // Setup home page flags
          const topSection = productIndex % 4 === 0;
          const crazyDeals = productIndex % 6 === 0;
          const flashSale = productIndex % 5 === 0;

          productBatch.push({
            name,
            category: catId,
            subCategory: subName,
            description,
            sellingPrice,
            mrp,
            stock: Math.floor(Math.random() * 150) + 10,
            discountLabel,
            sku,
            highlights: {
              quality: 'Premium Grade',
              warranty: '1 Year Brand Warranty',
              origin: 'Made in India',
              certification: 'ISO Certified Premium Item'
            },
            technicalSpecs: {
              model: `MNZ-NEW-${productIndex}`,
              weight: `${(Math.random() * 1.5 + 0.1).toFixed(2)} kg`,
              dimensions: `${Math.floor(Math.random() * 20 + 10)} x ${Math.floor(Math.random() * 15 + 5)} x ${Math.floor(Math.random() * 10 + 2)} cm`
            },
            shippingSpecs: {
              weight: 1.0,
              length: 20,
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
            tags: [catId, subName.toLowerCase(), 'premium', 'new', 'mynzo'],
            manufacturerInfo: `${brandName} Innovations Pvt Ltd, India`,
            status: 'Approved',
            sales: Math.floor(Math.random() * 200) + 5
          });

          totalSeeded++;

          // Bulk write batch insertion to DB
          if (productBatch.length >= batchSize) {
            await Product.insertMany(productBatch);
            console.log(`Seeded ${totalSeeded} new products...`);
            productBatch = [];
          }
        }
      }
    }

    // Insert remaining products
    if (productBatch.length > 0) {
      await Product.insertMany(productBatch);
      console.log(`Successfully seeded ${totalSeeded} products in total!`);
    }

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding realistic products:', err);
    process.exit(1);
  }
}

seedRealisticProducts();
