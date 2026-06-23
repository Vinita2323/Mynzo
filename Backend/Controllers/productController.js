const Product = require('../Models/Product');

const parseJsonField = (field, defaultVal = {}) => {
  if (!field) return defaultVal;
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (err) {
    return defaultVal;
  }
};

// @desc    Get all Products
// @route   GET /api/admin/catalog/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { $text: { $search: search } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .select('-highlights -technicalSpecs -description -variations -shippingSpecs')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a Product
// @route   POST /api/admin/catalog/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      sellingPrice,
      mrp,
      stock,
      discountLabel,
      sku,
      gstCategory,
      hsnCode,
      brandName,
      manufacturerInfo,
      status
    } = req.body;

    if (!name || !category || !sellingPrice) {
      return res.status(400).json({ success: false, message: 'Name, Category, and Selling Price are required' });
    }

    // Process Images
    let imageUrls = [];
    if (req.processedFiles && req.processedFiles.length > 0) {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      imageUrls = req.processedFiles.map(f => `${backendUrl}${f.url}`);
    }

    // Check if additional image URLs were sent in body
    const bodyImages = parseJsonField(req.body.images, []);
    if (Array.isArray(bodyImages)) {
      imageUrls = [...imageUrls, ...bodyImages];
    }

    const newProduct = new Product({
      name,
      category,
      description,
      sellingPrice: Number(sellingPrice),
      mrp: mrp ? Number(mrp) : undefined,
      stock: stock ? Number(stock) : 1,
      discountLabel,
      sku: sku || `SKU-${Date.now()}`,
      highlights: parseJsonField(req.body.highlights),
      technicalSpecs: parseJsonField(req.body.technicalSpecs),
      shippingSpecs: parseJsonField(req.body.shippingSpecs),
      flags: parseJsonField(req.body.flags, { topSection: false, crazyDeals: false, flashSale: false }),
      gstCategory,
      hsnCode,
      images: imageUrls,
      brandName: brandName || 'Generic',
      tags: parseJsonField(req.body.tags, []),
      manufacturerInfo,
      status: status || 'Pending',
      variations: parseJsonField(req.body.variations, [])
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Create Product Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SKU must be unique' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update a Product
// @route   PUT /api/admin/catalog/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fields = [
      'name', 'category', 'description', 'sellingPrice',
      'mrp', 'stock', 'discountLabel', 'sku', 'gstCategory', 'hsnCode',
      'brandName', 'manufacturerInfo', 'status'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (['sellingPrice', 'mrp', 'stock'].includes(f)) {
          product[f] = Number(req.body[f]);
        } else {
          product[f] = req.body[f];
        }
      }
    });

    // Handle parsed nested objects/arrays if present in req.body
    if (req.body.highlights !== undefined) product.highlights = parseJsonField(req.body.highlights);
    if (req.body.technicalSpecs !== undefined) product.technicalSpecs = parseJsonField(req.body.technicalSpecs);
    if (req.body.shippingSpecs !== undefined) product.shippingSpecs = parseJsonField(req.body.shippingSpecs);
    if (req.body.flags !== undefined) product.flags = parseJsonField(req.body.flags);
    if (req.body.tags !== undefined) product.tags = parseJsonField(req.body.tags);
    if (req.body.variations !== undefined) product.variations = parseJsonField(req.body.variations, []);

    // Process Images
    let updatedImages = product.images || [];
    if (req.body.images !== undefined) {
      updatedImages = parseJsonField(req.body.images);
    }

    if (req.processedFiles && req.processedFiles.length > 0) {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const newUrls = req.processedFiles.map(f => `${backendUrl}${f.url}`);
      updatedImages = [...updatedImages, ...newUrls];
    }

    product.images = updatedImages;

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete a Product
// @route   DELETE /api/admin/catalog/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get Product by ID
// @route   GET /api/admin/catalog/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get Top 10 Buys (products sorted by sales)
// @route   GET /api/admin/catalog/products/top-buys
// @access  Public
const getTopBuys = async (req, res) => {
  try {
    const products = await Product.find({ status: 'Approved' })
      .sort({ sales: -1 })
      .limit(10)
      .lean();
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Get Top Buys Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get Trending Brands (brands aggregated by product sales)
// @route   GET /api/admin/catalog/products/trending-brands
// @access  Public
const getTrendingBrands = async (req, res) => {
  try {
    const brands = await Product.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: '$brandName',
          brand: { $first: '$brandName' },
          sales: { $sum: '$sales' },
          image: { $first: { $arrayElemAt: ['$images', 0] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 6 }
    ]);
    res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error('Get Trending Brands Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getCombinedCatalog = async (req, res) => {
  try {
    const CategoryChip = require('../Models/CategoryChip');
    const SubCategoryChip = require('../Models/SubCategoryChip');

    const [chips, subchips, products] = await Promise.all([
      CategoryChip.find({}).sort({ order: 1 }).lean(),
      SubCategoryChip.find({}).lean(),
      Product.find({ status: 'Approved' })
        .select('-highlights -technicalSpecs -description -variations -shippingSpecs')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    res.status(200).json({
      success: true,
      chips,
      subchips,
      products
    });
  } catch (error) {
    console.error('Get Combined Catalog Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopBuys,
  getTrendingBrands,
  getCombinedCatalog
};
