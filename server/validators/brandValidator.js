const { body } = require('express-validator');

const brandValidator = [
  body('brandName').trim().notEmpty().withMessage('Brand name is required'),
];

module.exports = { brandValidator };
