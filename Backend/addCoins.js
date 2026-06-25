const mongoose = require('mongoose');

const MONGODB_URL = 'mongodb://mohammadrehan00121_db_user:OEQpI7e4loBYudaV@ac-hcoqomx-shard-00-00.x8ddlwp.mongodb.net:27017,ac-hcoqomx-shard-00-01.x8ddlwp.mongodb.net:27017,ac-hcoqomx-shard-00-02.x8ddlwp.mongodb.net:27017/Mynzo-Test?ssl=true&replicaSet=atlas-scmpry-shard-0&authSource=admin&appName=Cluster0';

const userSchema = new mongoose.Schema({
  referralCoins: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB.');

    const userId = '6a3cd4d61d6904cdbf802a53';
    const updated = await User.findByIdAndUpdate(
      userId,
      { $inc: { referralCoins: 500 } },
      { new: true }
    );

    if (updated) {
      console.log(`Success! Updated user coins balance. New Balance: ${updated.referralCoins}`);
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Error running update:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
