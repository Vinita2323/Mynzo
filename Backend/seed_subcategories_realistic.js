const mongoose = require('mongoose');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const SubCategoryChip = require('./Models/SubCategoryChip');

dotenv.config();

const parentCategories = {
  'skincare-organic': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/skincare_organic_1782206718918.png',
  'smart-wearables': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/smart_wearables_1782206735610.png',
  'bags-wallets': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/bags_wallets_1782206751482.png',
  'fine-jewellery': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/fine_jewellery_1782206770235.png',
  'home-appliances': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/home_appliances_1782206787074.png',
  'trendy-sneakers': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/trendy_sneakers_1782206802674.png',
  'kids-clothing': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/kids_clothing_1782206818680.png'
};

const predefinedSubcategoryImages = {
  'skincare-organic-face-serums': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/sub_serums_1782207156399.png',
  'skincare-organic-facial-oils': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/sub_oils_1782207175525.png',
  'skincare-organic-face-wash': 'C:/Users/admin/.gemini/antigravity-ide/brain/7c8eadc7-07de-4c66-975a-21e5621e7f12/sub_facewash_1782207191380.png'
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

async function seedRealisticSubcategories() {
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
      const parentImageSrc = parentCategories[catId];

      if (!fs.existsSync(parentImageSrc)) {
        console.error(`Parent image not found: ${parentImageSrc}`);
        continue;
      }

      // Read parent image metadata to get dimensions
      const metadata = await sharp(parentImageSrc).metadata();
      const width = metadata.width;
      const height = metadata.height;

      // Define 5 smart crop regions dynamically based on parent image size
      const cropWidth = Math.floor(width * 0.45);
      const cropHeight = Math.floor(height * 0.45);

      const cropRegions = [
        { left: Math.floor(width * 0.05), top: Math.floor(height * 0.05), width: cropWidth, height: cropHeight },  // Top-Left Focus
        { left: Math.floor(width * 0.5),  top: Math.floor(height * 0.05), width: cropWidth, height: cropHeight },  // Top-Right Focus
        { left: Math.floor(width * 0.05), top: Math.floor(height * 0.5),  width: cropWidth, height: cropHeight },  // Bottom-Left Focus
        { left: Math.floor(width * 0.5),  top: Math.floor(height * 0.5),  width: cropWidth, height: cropHeight },  // Bottom-Right Focus
        { left: Math.floor(width * 0.27), top: Math.floor(height * 0.27), width: cropWidth, height: cropHeight }   // Center Focus
      ];

      for (let i = 0; i < subs.length; i++) {
        const subName = subs[i];
        const subId = `${catId}-${subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const filename = `subcategory-${subId}.webp`;
        const destPath = path.join(destDir, filename);

        // Check if there is a predefined subcategory image
        const predefinedSrc = predefinedSubcategoryImages[subId];
        if (predefinedSrc && fs.existsSync(predefinedSrc)) {
          console.log(`Processing predefined image: ${predefinedSrc} -> ${destPath}`);
          await sharp(predefinedSrc)
            .resize(200, 200)
            .webp({ quality: 80 })
            .toFile(destPath);
        } else {
          // Crop from parent image
          const region = cropRegions[i];
          console.log(`Cropping parent image: ${parentImageSrc} [Region ${i}] -> ${destPath}`);
          await sharp(parentImageSrc)
            .extract(region)
            .resize(200, 200)
            .webp({ quality: 80 })
            .toFile(destPath);
        }

        console.log(`Successfully generated and compressed: ${filename}`);

        const relativeUrlPath = `/uploads/subcategories/${filename}`;
        const chipData = {
          id: subId,
          categoryId: catId,
          subCategoryName: subName,
          image: relativeUrlPath,
          active: true,
          order: i + 1
        };

        // Upsert SubCategoryChip in MongoDB
        const chip = await SubCategoryChip.findOneAndUpdate(
          { id: subId },
          chipData,
          { new: true, upsert: true }
        );
        seededChips.push(chip);
      }
    }

    console.log(`Successfully seeded ${seededChips.length} realistic subcategories in MongoDB!`);
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Error seeding realistic subcategories:', err);
    process.exit(1);
  }
}

seedRealisticSubcategories();
