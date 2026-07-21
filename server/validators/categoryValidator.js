const { body } = require('express-validator');

const categoryValidator = [
  body('categoryName').trim().notEmpty().withMessage('Category name is required'),
];

module.exports = { categoryValidator };
