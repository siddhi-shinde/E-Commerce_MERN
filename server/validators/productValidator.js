const { body } = require('express-validator');

const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category_id').notEmpty().withMessage('Category is required'),
  body('brand_id').notEmpty().withMessage('Brand is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity cannot be negative'),
];

module.exports = { productValidator };
