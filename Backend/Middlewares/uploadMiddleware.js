const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { getImageUrl } = require('../utils/imageHelper');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer memory storage (buffer is processed by sharp)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter: fileFilter
});

// Middleware to process image: convert to webp and save to uploads/
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, filename);

    // Get image metadata to decide on resize strategy
    const meta = await sharp(req.file.buffer).metadata();
    let pipeline = sharp(req.file.buffer);

    // Smart resize: cap very large images to keep file size reasonable,
    // but never upscale. Maintains aspect ratio.
    const MAX_DIM = 1200;
    if ((meta.width && meta.width > MAX_DIM) || (meta.height && meta.height > MAX_DIM)) {
      pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true });
    }

    // Sharpen slightly for crispness, then convert to webp at high quality
    await pipeline
      .sharpen({ sigma: 0.5 })
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);

    // Save details to req.file
    req.file.filename = filename;
    req.file.path = outputPath;
    req.file.url = `/uploads/${filename}`;
    next();
  } catch (err) {
    console.error('Sharp processing error:', err);
    return res.status(500).json({ success: false, message: 'Image conversion failed: ' + err.message });
  }
};

// Error handler for multer errors (e.g. file size exceeded)
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Image size cannot exceed 10MB!' });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    req.processedFiles = [];
    for (const file of req.files) {
      const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const outputPath = path.join(uploadDir, filename);

      const meta = await sharp(file.buffer).metadata();
      let pipeline = sharp(file.buffer);

      const MAX_DIM = 1200;
      if ((meta.width && meta.width > MAX_DIM) || (meta.height && meta.height > MAX_DIM)) {
        pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true });
      }

      await pipeline
        .sharpen({ sigma: 0.5 })
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);

      req.processedFiles.push({
        filename,
        path: outputPath,
        url: `/uploads/${filename}`
      });
    }
    next();
  } catch (err) {
    console.error('Sharp multiple processing error:', err);
    return res.status(500).json({ success: false, message: 'Image conversion failed: ' + err.message });
  }
};

const uploadBrandFiles = upload.fields([
  { name: 'logo', maxCount: 1 }
]);

const processBrandFiles = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  try {
    if (req.files.logo && req.files.logo[0]) {
      const file = req.files.logo[0];
      const filename = `brand-logo-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const outputPath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .sharpen({ sigma: 0.5 })
        .webp({ quality: 85 })
        .toFile(outputPath);

      req.logoUrl = getImageUrl(`/uploads/${filename}`);
    }

    next();
  } catch (err) {
    console.error('Sharp brand files processing error:', err);
    return res.status(500).json({ success: false, message: 'Image conversion failed: ' + err.message });
  }
};

module.exports = {
  uploadImage: upload.single('image'),
  uploadImages: upload.array('images', 5),
  uploadBrandFiles,
  processImage,
  processImages,
  processBrandFiles,
  handleUploadError
};
