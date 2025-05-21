const validators = {
  required: (value, fieldName) => {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
    return true;
  },

  pattern: (value, pattern, fieldName, message) => {
    if (!pattern.test(value)) {
      throw new Error(message || `Invalid ${fieldName} format`);
    }
    return true;
  },
};

module.exports = validators;
