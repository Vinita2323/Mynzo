const Product = require('../Models/Product');

const parseJsonField = (field, defaultVal = {}) => {
  if (!field) return defaultVal;
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (err) {
    return defaultVal;
  }
};

const resolveCategoryAndSubcategory = async (categoryInput, subCategoryInput) => {
  if (!categoryInput) return { categoryId: categoryInput, subCategoryId: subCategoryInput };
  
  const CategoryChip = require('../Models/CategoryChip');
  const SubCategoryChip = require('../Models/SubCategoryChip');
  const mongoose = require('mongoose');

  let categoryId = categoryInput;
  let subCategoryId = subCategoryInput;

  // Resolve Category
  if (categoryInput && !mongoose.Types.ObjectId.isValid(categoryInput)) {
    const foundCat = await CategoryChip.findOne({
      categoryName: { $regex: new RegExp(`^${categoryInput.trim()}$`, 'i') }
    });
    if (foundCat) {
      categoryId = foundCat._id.toString();
    } else {
      const newCat = await CategoryChip.create({
        categoryName: categoryInput.trim(),
        active: true
      });
      categoryId = newCat._id.toString();
    }
  }

  // Resolve Subcategory
  if (subCategoryInput && !mongoose.Types.ObjectId.isValid(subCategoryInput)) {
    const query = {
      subCategoryName: { $regex: new RegExp(`^${subCategoryInput.trim()}$`, 'i') }
    };
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.categoryId = categoryId;
    }
    const foundSub = await SubCategoryChip.findOne(query);
    if (foundSub) {
      subCategoryId = foundSub._id.toString();
    } else if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      const newSub = await SubCategoryChip.create({
        categoryId,
        subCategoryName: subCategoryInput.trim(),
        active: true
      });
      subCategoryId = newSub._id.toString();
    }
  }

  return { categoryId, subCategoryId };
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
      status,
      subCategory
    } = req.body;

    if (!name || !category || !sellingPrice) {
      return res.status(400).json({ success: false, message: 'Name, Category, and Selling Price are required' });
    }

    if (mrp && Number(mrp) < Number(sellingPrice)) {
      return res.status(400).json({ success: false, message: 'Actual Price (MRP) cannot be less than Selling Price' });
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

    const { categoryId, subCategoryId } = await resolveCategoryAndSubcategory(category, subCategory);

    const newProduct = new Product({
      name,
      category: categoryId,
      subCategory: subCategoryId,
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

    const finalSellingPrice = req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : product.sellingPrice;
    const finalMrp = req.body.mrp !== undefined ? (req.body.mrp ? Number(req.body.mrp) : undefined) : product.mrp;
    if (finalMrp !== undefined && finalMrp < finalSellingPrice) {
      return res.status(400).json({ success: false, message: 'Actual Price (MRP) cannot be less than Selling Price' });
    }

    if (req.body.category !== undefined || req.body.subCategory !== undefined) {
      const catVal = req.body.category !== undefined ? req.body.category : product.category;
      const subVal = req.body.subCategory !== undefined ? req.body.subCategory : product.subCategory;
      const { categoryId, subCategoryId } = await resolveCategoryAndSubcategory(catVal, subVal);
      if (req.body.category !== undefined) req.body.category = categoryId;
      if (req.body.subCategory !== undefined) req.body.subCategory = subCategoryId;
    }

    const fields = [
      'name', 'category', 'subCategory', 'description', 'sellingPrice',
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
    const mongoose = require('mongoose');
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const CategoryChip = require('../Models/CategoryChip');
    const SubCategoryChip = require('../Models/SubCategoryChip');

    let categoryLabel = product.category;
    if (product.category) {
      const isObjectId = mongoose.isValidObjectId(product.category);
      const cat = await CategoryChip.findOne({
        $or: [
          { id: product.category },
          ...(isObjectId ? [{ _id: product.category }] : [])
        ]
      });
      if (cat) {
        categoryLabel = cat.categoryName;
      }
    }

    let subCategoryLabel = product.subCategory;
    if (product.subCategory) {
      const isObjectId = mongoose.isValidObjectId(product.subCategory);
      const subcat = await SubCategoryChip.findOne({
        $or: [
          { id: product.subCategory },
          ...(isObjectId ? [{ _id: product.subCategory }] : [])
        ]
      });
      if (subcat) {
        subCategoryLabel = subcat.subCategoryName;
      }
    }

    const enrichedProduct = {
      ...product,
      categoryName: categoryLabel,
      subCategoryName: subCategoryLabel
    };

    res.status(200).json({ success: true, product: enrichedProduct });
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
      .select('name brandName mrp sellingPrice discountLabel images rating sales category subCategory description flags stock')
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

const getHomepageData = async (req, res) => {
  try {
    const CategoryChip = require('../Models/CategoryChip');
    const SubCategoryChip = require('../Models/SubCategoryChip');
    const Banner = require('../Models/Banner');

    const [chips, subchips, banners, products, topBuys, trendingBrands] = await Promise.all([
      CategoryChip.find({}).sort({ order: 1 }).lean(),
      SubCategoryChip.find({}).lean(),
      Banner.find({}).sort({ createdAt: -1 }).lean(),
      Product.find({ status: 'Approved' })
        .select('-highlights -technicalSpecs -description -variations -shippingSpecs')
        .sort({ createdAt: -1 })
        .lean(),
      Product.find({ status: 'Approved' })
        .select('name brandName mrp sellingPrice discountLabel images rating sales category subCategory description flags stock')
        .sort({ sales: -1 })
        .limit(10)
        .lean(),
      Product.aggregate([
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
      ])
    ]);

    res.status(200).json({
      success: true,
      chips,
      subchips,
      banners,
      products,
      topBuys,
      trendingBrands
    });
  } catch (error) {
    console.error('Get Homepage Data Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getCombinedCatalog = async (req, res) => {
  try {
    const CategoryChip = require('../Models/CategoryChip');
    const SubCategoryChip = require('../Models/SubCategoryChip');
    const mongoose = require('mongoose');

    // Extract query parameters
    const { 
      page = 1, 
      limit = 20, 
      category = 'for-you', 
      subCategory = 'all', 
      sortBy = 'none', 
      search = '' 
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (parsedPage - 1) * parsedLimit;

    // Base query: only approved products
    const andConditions = [{ status: 'Approved' }];

    // 1. Category filter
    if (category && category !== 'for-you') {
      const foundChip = await CategoryChip.findOne({
        $or: [
          { id: category },
          { _id: mongoose.Types.ObjectId.isValid(category) ? category : null },
          { categoryName: { $regex: new RegExp(`^${category.trim()}$`, 'i') } }
        ]
      }).lean();

      if (foundChip) {
        andConditions.push({
          $or: [
            { category: foundChip._id.toString() },
            { category: foundChip.id },
            { category: { $regex: new RegExp(`^${foundChip.categoryName.trim()}$`, 'i') } },
            { category: category }
          ]
        });
      } else {
        andConditions.push({
          category: { $regex: new RegExp(`^${category.trim()}$`, 'i') }
        });
      }
    }

    // 2. Subcategory filter
    if (subCategory && subCategory !== 'all') {
      const foundSubChip = await SubCategoryChip.findOne({
        $or: [
          { id: subCategory },
          { _id: mongoose.Types.ObjectId.isValid(subCategory) ? subCategory : null },
          { subCategoryName: { $regex: new RegExp(`^${subCategory.trim()}$`, 'i') } }
        ]
      }).lean();

      if (foundSubChip) {
        andConditions.push({
          $or: [
            { subCategory: foundSubChip._id.toString() },
            { subCategory: foundSubChip.id },
            { subCategory: { $regex: new RegExp(`^${foundSubChip.subCategoryName.trim()}$`, 'i') } },
            { subCategory: subCategory }
          ]
        });
      } else {
        andConditions.push({
          subCategory: { $regex: new RegExp(`^${subCategory.trim()}$`, 'i') }
        });
      }
    }

    // 3. Search query
    if (search && search.trim() !== '') {
      const escapedSearch = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      andConditions.push({
        $or: [
          { name: { $regex: escapedSearch, $options: 'i' } },
          { description: { $regex: escapedSearch, $options: 'i' } }
        ]
      });
    }

    const finalQuery = { $and: andConditions };

    // 4. Sorting option
    let sortOption = { createdAt: -1 };
    if (sortBy === 'price-low') {
      sortOption = { sellingPrice: 1 };
    } else if (sortBy === 'price-high') {
      sortOption = { sellingPrice: -1 };
    } else if (sortBy === 'rating') {
      sortOption = { rating: -1 };
    }

    // Run queries in parallel
    const chipsPromise = (parsedPage === 1)
      ? CategoryChip.find({}).sort({ order: 1 }).lean()
      : Promise.resolve([]);

    const subchipsPromise = (parsedPage === 1)
      ? SubCategoryChip.find({}).lean()
      : Promise.resolve([]);

    const productsPromise = Product.find(finalQuery)
      .select('-highlights -technicalSpecs -description -variations -shippingSpecs')
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const countPromise = Product.countDocuments(finalQuery);

    const [chips, subchips, products, totalProducts] = await Promise.all([
      chipsPromise,
      subchipsPromise,
      productsPromise,
      countPromise
    ]);

    res.status(200).json({
      success: true,
      chips: parsedPage === 1 ? chips : undefined,
      subchips: parsedPage === 1 ? subchips : undefined,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / parsedLimit),
      currentPage: parsedPage,
      hasMore: skip + products.length < totalProducts
    });
  } catch (error) {
    console.error('Get Combined Catalog Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const csvData = req.file.buffer.toString('utf-8');
    const rows = csvData.split('\n').filter(r => r.trim());
    if (rows.length < 2) {
      return res.status(400).json({ success: false, message: 'Empty CSV' });
    }

    const parseRow = (rowStr) => {
      const result = [];
      let insideQuote = false;
      let currentVal = '';
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          result.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      result.push(currentVal.trim());
      return result.map(v => v.replace(/^"|"$/g, '').trim());
    };

    const headers = parseRow(rows[0]);
    const requiredFields = ['Name', 'Category', 'Selling Price'];
    const missingHeaders = requiredFields.filter(f => !headers.includes(f));

    if (missingHeaders.length > 0) {
      return res.status(400).json({ success: false, message: `Missing columns: ${missingHeaders.join(', ')}` });
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const rowData = parseRow(rows[i]);
      if (rowData.length < 2) continue;

      const getValue = (colName) => {
        const idx = headers.indexOf(colName);
        return idx !== -1 ? rowData[idx] : undefined;
      };

      const name = getValue('Name');
      const rawCategory = getValue('Category');
      const sellingPrice = getValue('Selling Price');
      if (!name || !rawCategory || !sellingPrice) continue;

      const rawSubCategory = getValue('Sub Category');
      const { categoryId, subCategoryId } = await resolveCategoryAndSubcategory(rawCategory, rawSubCategory);

      const productData = {
        name,
        category: categoryId,
        subCategory: subCategoryId,
        description: getValue('Description'),
        sellingPrice: Number(sellingPrice),
        mrp: getValue('MRP') ? Number(getValue('MRP')) : undefined,
        stock: getValue('Stock') ? Number(getValue('Stock')) : 1,
        discountLabel: getValue('Discount Label'),
        sku: getValue('SKU') || `SKU-${Date.now()}-${i}`,
        highlights: {
          packOf: getValue('Pack Of'),
          fabric: getValue('Fabric'),
          sleeve: getValue('Sleeve'),
          pattern: getValue('Pattern'),
          collar: getValue('Collar'),
          color: getValue('Color')
        },
        technicalSpecs: {
          fit: getValue('Fit'),
          fabricCare: getValue('Fabric Care'),
          suitableFor: getValue('Suitable For'),
          hem: getValue('Hem')
        },
        shippingSpecs: {
          weight: getValue('Weight (kg)'),
          length: getValue('Length (cm)'),
          width: getValue('Width (cm)'),
          height: getValue('Height (cm)')
        },
        flags: {
          topSection: getValue('Top Section') === 'true',
          crazyDeals: getValue('Crazy Deals') === 'true',
          flashSale: getValue('Flash Sale') === 'true'
        },
        brandName: getValue('Brand Name') || 'Generic',
        tags: getValue('Tags') ? getValue('Tags').split(',').map(t => t.trim()) : [],
        manufacturerInfo: getValue('Manufacturer Info'),
        hsnCode: getValue('HSN Code'),
        status: 'Approved'
      };

      const imageURLsStr = getValue('Image URLs');
      if (imageURLsStr) {
        productData.images = imageURLsStr.split(',').map(url => url.trim()).filter(Boolean);
      }

      const newProduct = new Product(productData);
      try {
        await newProduct.save();
        successCount++;
      } catch (err) {
        if (err.code === 11000) {
          productData.sku = `SKU-${Date.now()}-${i}-${Math.random().toString().slice(2, 6)}`;
          const retryProduct = new Product(productData);
          await retryProduct.save();
          successCount++;
        }
      }
    }

    res.status(200).json({ success: true, message: `Successfully uploaded ${successCount} products.` });
  } catch (error) {
    console.error('Bulk Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server error during bulk upload', error: error.message });
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
  getCombinedCatalog,
  bulkUploadProducts,
  getHomepageData
};
