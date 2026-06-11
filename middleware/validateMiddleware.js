const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));

const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ""));

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const validators = {
  required: (field) => (body) => body[field] !== undefined && body[field] !== null && body[field] !== "",
  email: (field) => (body) => !body[field] || isEmail(body[field]),
  minLength: (field, min) => (body) => !body[field] || String(body[field]).length >= min,
  oneOf: (field, values) => (body) => !body[field] || values.includes(body[field]),
  objectId: (field) => (body) => !body[field] || isObjectId(body[field]),
  number: (field) => (body) => body[field] === undefined || isNumber(body[field]),
  min: (field, min) => (body) => body[field] === undefined || (isNumber(body[field]) && body[field] >= min),
  max: (field, max) => (body) => body[field] === undefined || (isNumber(body[field]) && body[field] <= max),
  array: (field) => (body) => Array.isArray(body[field]),
  nonEmptyArray: (field) => (body) => Array.isArray(body[field]) && body[field].length > 0
};

const validate = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const rule of rules) {
      if (!rule.check(req.body, req)) {
        errors.push(rule.message);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
  };
};

const rule = (message, check) => ({ message, check });

const validateProductsArray = (body) => {
  if (!Array.isArray(body.products) || body.products.length === 0) {
    return false;
  }

  return body.products.every((item) => {
    const productId = item.productId || item.product;
    return isObjectId(productId) && Number.isInteger(item.quantity) && item.quantity > 0;
  });
};

module.exports = {
  validate,
  rule,
  validators,
  validateProductsArray,
  isObjectId
};
