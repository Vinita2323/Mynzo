const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Successfully connected to MongoDB!');

    const CategoryChip = require('./Models/CategoryChip');
    const SubCategoryChip = require('./Models/SubCategoryChip');
    const Product = require('./Models/Product');

    const totalCategories = await CategoryChip.countDocuments({});
    const activeCategories = await CategoryChip.countDocuments({ active: true });
    console.log(`CategoryChips: Total = ${totalCategories}, Active = ${activeCategories}`);

    const categories = await CategoryChip.find({});
    console.log('Categories in DB:');
    categories.forEach(c => {
      console.log(`- ID: "${c.id}", Name: "${c.categoryName || c.name}", Active: ${c.active}, Order: ${c.order}`);
    });

    const totalSubcategories = await SubCategoryChip.countDocuments({});
    const activeSubcategories = await SubCategoryChip.countDocuments({ active: true });
    console.log(`SubCategoryChips: Total = ${totalSubcategories}, Active = ${activeSubcategories}`);

    const totalProducts = await Product.countDocuments({});
    const approvedProducts = await Product.countDocuments({ status: 'Approved' });
    console.log(`Products: Total = ${totalProducts}, Approved = ${approvedProducts}`);

    // Print distinct categories of products
    const productCategories = await Product.distinct('category');
    console.log('Distinct product categories in DB:', productCategories);

    // Print count of products per category
    for (const cat of productCategories) {
      const count = await Product.countDocuments({ category: cat });
      const approvedCount = await Product.countDocuments({ category: cat, status: 'Approved' });
      console.log(`- Category "${cat}": Total = ${count}, Approved = ${approvedCount}`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
