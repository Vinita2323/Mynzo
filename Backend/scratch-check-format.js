const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URL;
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const db = mongoose.connection.db;
  const products = await db.collection('products').find({}).limit(10).toArray();

  for (const p of products) {
    console.log(`Product: ${p.name}`);
    console.log(`Images:`, p.images);
    console.log('---');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
