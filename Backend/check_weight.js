const mongoose = require('mongoose');
const Product = require('./Models/Product');

mongoose.connect('mongodb://localhost:27017/mynzo_db')
.then(async () => {
    const p = await Product.findById('6a3a53ed812fa974e1c2bc37');
    console.log("Weight:", p && p.shippingSpecs ? p.shippingSpecs.weight : 'No shipping specs or no product');
    process.exit(0);
})
.catch(console.error);
