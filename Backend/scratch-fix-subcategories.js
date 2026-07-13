const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./Models/Product');

async function run() {
  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error('MONGODB_URL not found in env!');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  // Mapping from old/invalid subCategory IDs to the correct active subcategory IDs
  const mapping = {
    '6a4f96c8a8976d5cfd2f0d04': '6a5201e7667b3417d1cb7cbb', // Animal Soft Toys
    '6a4f96c8a8976d5cfd2f0d00': '6a5201e7667b3417d1cb7cb7', // Bird Soft Toys
    '6a4f96c8a8976d5cfd2f0d07': '6a5201e7667b3417d1cb7cb9', // Cartoon Soft Toys
    '6a4f96c8a8976d5cfd2f0d02': '6a5201e7667b3417d1cb7cbf', // Novelty Soft Toys
  };

  let totalUpdated = 0;
  for (const [oldId, newId] of Object.entries(mapping)) {
    const result = await Product.updateMany(
      { subCategory: oldId },
      { $set: { subCategory: newId } }
    );
    console.log(`Updated subCategory from "${oldId}" to "${newId}": ${result.modifiedCount} products updated.`);
    totalUpdated += result.modifiedCount;
  }

  console.log(`\nTotal updated products: ${totalUpdated}`);

  await mongoose.disconnect();
}

run().catch(console.error);
