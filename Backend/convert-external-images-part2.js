const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

dotenv.config();

const Product = require('./Models/Product');

async function processImageUrl(imageUrl, uploadDir) {
  if (!imageUrl) return '';
  const url = String(imageUrl).trim();

  // If it's not an external http/https URL, return as is
  // We only target URLs starting with http/https that don't contain '/uploads/' and 'localhost'
  const isExternal = (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/uploads/') && !url.includes('localhost');
  if (!isExternal) {
    return url;
  }

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      timeout: 15000 // 15 seconds timeout
    });

    const buffer = Buffer.from(response.data);
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, filename);

    // Standardize to 1000x1000 WebP centered on a white square canvas
    await sharp(buffer)
      .resize(1000, 1000, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .sharpen({ sigma: 0.5 })
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);

    console.log(`  Processed: ${url} -> /uploads/${filename}`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error(`  ❌ Failed to process remote URL (${url}):`, err.message);
    return url; // keep original url on failure
  }
}

async function run() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  let limitValue = 0;
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limitValue = parseInt(args[limitIdx + 1], 10) || 0;
  }

  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error('MONGODB_URL not found in env!');
    process.exit(1);
  }

  console.log(`Connecting to database... ${dryRun ? '[DRY RUN MODE]' : ''}`);
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    console.log(`Creating uploads directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Find all products
  const products = await Product.find({});
  console.log(`Found ${products.length} total products in database.`);

  let productsProcessed = 0;
  let productsUpdated = 0;
  let imagesDownloaded = 0;

  for (const p of products) {
    if (!p.images || p.images.length === 0) continue;

    let isModified = false;
    const updatedImages = [];

    for (const imageUrl of p.images) {
      if (!imageUrl) continue;
      
      const isExternal = (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) && 
                         !imageUrl.includes('/uploads/') && 
                         !imageUrl.includes('localhost');
      
      if (isExternal) {
        if (limitValue > 0 && productsUpdated >= limitValue) {
          updatedImages.push(imageUrl);
          continue;
        }

        console.log(`\n[Product: "${p.name}"] Found external image: ${imageUrl}`);
        
        if (dryRun) {
          console.log(`  [Dry Run] Would convert and save image.`);
          updatedImages.push(`/uploads/dry-run-placeholder-${Date.now()}.webp`);
          imagesDownloaded++;
          isModified = true;
        } else {
          const newUrl = await processImageUrl(imageUrl, uploadDir);
          if (newUrl !== imageUrl) {
            updatedImages.push(newUrl);
            imagesDownloaded++;
            isModified = true;
          } else {
            updatedImages.push(imageUrl);
          }
        }
      } else {
        updatedImages.push(imageUrl);
      }
    }

    if (isModified) {
      productsProcessed++;
      if (!dryRun) {
        p.images = updatedImages;
        await p.save();
        productsUpdated++;
        console.log(`  ✅ Saved changes in database.`);
      } else {
        productsUpdated++;
        console.log(`  [Dry Run] Would save changes in database.`);
      }
    }
  }

  await mongoose.disconnect();
  console.log(`\n🎉 Process Completed!`);
  console.log(`Products matching/updating: ${productsProcessed}`);
  console.log(`Total images processed/downloaded: ${imagesDownloaded}`);
}

run().catch(async (err) => {
  console.error('Fatal error running migration:', err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
