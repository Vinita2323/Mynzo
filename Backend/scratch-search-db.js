const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error('MONGODB_URL not found in env!');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log(`Found ${collections.length} collections. Searching for 'ibb.co'...`);

  for (const collInfo of collections) {
    const collName = collInfo.name;
    const collection = db.collection(collName);

    // Search for documents containing the string 'ibb.co' in any text field
    // We can use a regex search or a full text search if indexed, but regex is reliable for mock data.
    // Let's do a find with a regex on any field or inspect documents.
    // Since we don't know the schema of all collections, we can query documents and check their JSON representation, or use MongoDB regex.
    // Wait, regex search on specific fields or nested objects can be done, or we can fetch documents and search.
    // Let's fetch all documents if the collection is small, or use regex on known fields, or search via $or with regex.
    // Let's try to query using $or or just look at all documents if count is small.
    const count = await collection.countDocuments();
    if (count === 0) continue;

    console.log(`Searching collection: ${collName} (${count} documents)...`);
    
    // We'll search for 'ibb.co' by converting each doc to string or using mongo regex if we know fields.
    // Alternatively, let's fetch all documents (if small) and search them in JS.
    const docs = await collection.find({}).toArray();
    let foundCount = 0;
    for (const doc of docs) {
      const str = JSON.stringify(doc);
      if (str.includes('ibb.co')) {
        foundCount++;
        console.log(`Match in ${collName}: ID: ${doc._id || doc.id}`);
        // Log a snippet of the matching fields
        const matches = [];
        for (const [key, val] of Object.entries(doc)) {
          const valStr = JSON.stringify(val);
          if (valStr.includes('ibb.co')) {
            matches.push(`${key}: ${valStr.substring(0, 150)}`);
          }
        }
        console.log(`  Details: ${matches.join(', ')}`);
      }
    }
    if (foundCount > 0) {
      console.log(`Found ${foundCount} matches in ${collName}.\n`);
    }
  }

  await mongoose.disconnect();
  console.log('Disconnected.');
}

run().catch(console.error);
