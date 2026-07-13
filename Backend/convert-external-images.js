const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Define Product Schema locally to avoid model dependency issues
const ProductSchema = new mongoose.Schema({
  name: String,
  images: [String]
});

const Product = mongoose.model('Product', ProductSchema);

// Helper to download image buffer
async function downloadImageBuffer(url) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      timeout: 10000 // 10s timeout
    });
    return Buffer.from(response.data);
  } catch (err) {
    throw new Error(`Download failed: ${err.message}`);
  }
}

async function run() {
  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error('MONGODB_URL not found in env!');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const products = await Product.find({});
  console.log(`Found ${products.length} products to audit.`);

  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let productsUpdated = 0;
  let imagesDownloaded = 0;

  for (const p of products) {
    if (!p.images || p.images.length === 0) continue;

    let isModified = false;
    const updatedImages = [];

    for (const imageUrl of p.images) {
      if (!imageUrl) continue;
      
      const isExternal = imageUrl.startsWith('http') && !imageUrl.includes('/uploads/');
      
      if (isExternal) {
        console.log(`\n[Product: ${p.name}] Found external image: ${imageUrl}`);
        try {
          // Download raw image
          const imageBuffer = await downloadImageBuffer(imageUrl);
          
          // Generate unique filename
          const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
          const outputPath = path.join(uploadDir, filename);

          // Convert to standardized WebP (1000x1000 white container contain)
          await sharp(imageBuffer)
            .resize(1000, 1000, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .sharpen({ sigma: 0.5 })
            .webp({ quality: 85, effort: 4 })
            .toFile(outputPath);

          console.log(`Successfully converted and saved: ${filename}`);

          // Update URL to local server path
          const newImageUrl = `http://localhost:5000/uploads/${filename}`;
          updatedImages.push(newImageUrl);
          imagesDownloaded++;
          isModified = true;
        } catch (err) {
          console.error(`❌ Failed to process ${imageUrl}: ${err.message}`);
          updatedImages.push(imageUrl); // keep original url on failure
        }
      } else {
        // Keep local or empty URLs unchanged
        updatedImages.push(imageUrl);
      }
    }

    if (isModified) {
      p.images = updatedImages;
      await p.save();
      productsUpdated++;
      console.log(`✅ Saved product changes for: "${p.name}"`);
    }
  }

  await mongoose.disconnect();
  console.log(`\n🎉 Process Completed!`);
  console.log(`Products updated in DB: ${productsUpdated}`);
  console.log(`Total images downloaded and converted to WebP: ${imagesDownloaded}`);
}

run().catch(console.error);
