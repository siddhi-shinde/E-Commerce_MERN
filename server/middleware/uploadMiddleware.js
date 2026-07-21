const multer = require('multer');
const path = require('path');
const fs = require('fs');

const allowedTypes = /jpeg|jpg|png|webp/;

const makeStorage = (folder) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    return cb(null, true);
  }
  cb(new Error('Only .jpg, .jpeg, .png and .webp image files are allowed'));
};

const createUploader = (folder, maxSizeMB = 5) => {
  return multer({
    storage: makeStorage(folder),
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};

const uploadProfileImage = createUploader('profiles');
const uploadBrandImage = createUploader('brands');
const uploadCategoryImage = createUploader('categories');
const uploadProductImages = createUploader('products');

module.exports = {
  uploadProfileImage,
  uploadBrandImage,
  uploadCategoryImage,
  uploadProductImages,
};
