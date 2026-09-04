const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./Models/Product');

dotenv.config();

async function deleteProduct() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const productId = '6a3a6c7ad870b0fbe5cc6a46';
    const result = await Product.findByIdAndDelete(productId);

    if (result) {
      console.log('Successfully deleted product:', result.name);
    } else {
      console.log('Product not found with ID:', productId);
    }
  } catch (err) {
    console.error('Error deleting product:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteProduct();
