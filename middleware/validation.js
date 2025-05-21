const validators = require('../utils/validators');
const logger = require('../utils/logger');

const createValidationMiddleware = (validationRules) => {
  return (req, res, next) => {
    try {
      Object.entries(validationRules).forEach(([param, rules]) => {
        const value = req.params[param];
        rules.forEach(rule => rule(value, param));
      });
      next();
    } catch (error) {
      logger.error('Validation error:', error);
      res.status(400).json({ error: error.message });
    }
  };
};

// Predefined validation rules
const validationRules = {
  userId: [
    validators.required
  ],
  month: [
    validators.required,
    (value, fieldName) => validators.pattern(
      value,
      /^\d{4}-\d{2}$/,
      fieldName,
      'Invalid month format. Use YYYY-MM'
    )
  ]
};

module.exports = {
  validateUserId: createValidationMiddleware({ userId: validationRules.userId }),
  validateMonth: createValidationMiddleware({ month: validationRules.month })
}; 