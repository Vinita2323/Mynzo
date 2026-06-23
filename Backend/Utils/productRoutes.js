const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopBuys,
  getTrendingBrands,
  getCombinedCatalog
} = require('../Controllers/productController');
const { protectAdmin } = require('../Middlewares/authMiddleware');
const { uploadImages, processImages, handleUploadError } = require('../Middlewares/uploadMiddleware');

// Public routes to list products/brands
router.get('/', getProducts);
router.get('/combined', getCombinedCatalog);
router.get('/top-buys', getTopBuys);
router.get('/trending-brands', getTrendingBrands);
router.get('/:id', getProductById);

// Admin protected routes
router.post('/', protectAdmin, uploadImages, processImages, handleUploadError, createProduct);
router.put('/:id', protectAdmin, uploadImages, processImages, handleUploadError, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

module.exports = router;
