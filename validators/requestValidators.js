const { validate, rule, validators, validateProductsArray } = require("../middleware/validateMiddleware");

const registerValidator = validate([
  rule("Name is required", validators.required("name")),
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body)),
  rule("Password must be at least 6 characters", (body) => validators.required("password")(body) && validators.minLength("password", 6)(body))
]);

const bootstrapAdminValidator = validate([
  rule("Name is required", validators.required("name")),
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body)),
  rule("Password must be at least 6 characters", (body) => validators.required("password")(body) && validators.minLength("password", 6)(body)),
  rule("Bootstrap key is required", validators.required("bootstrapKey"))
]);

const loginValidator = validate([
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body)),
  rule("Password is required", validators.required("password"))
]);

const changePasswordValidator = validate([
  rule("Current password is required", validators.required("currentPassword")),
  rule("New password must be at least 6 characters", (body) => validators.required("newPassword")(body) && validators.minLength("newPassword", 6)(body))
]);

const forgotPasswordValidator = validate([
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body))
]);

const resetPasswordValidator = validate([
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body)),
  rule("OTP is required", validators.required("otp")),
  rule("New password must be at least 6 characters", (body) => validators.required("newPassword")(body) && validators.minLength("newPassword", 6)(body))
]);

const requestEmailVerificationValidator = validate([
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body))
]);

const verifyEmailValidator = validate([
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body)),
  rule("OTP is required", validators.required("otp"))
]);

const createUserValidator = validate([
  rule("Name is required", validators.required("name")),
  rule("Valid email is required", (body) => validators.required("email")(body) && validators.email("email")(body)),
  rule("Password must be at least 6 characters", (body) => validators.required("password")(body) && validators.minLength("password", 6)(body)),
  rule("Role must be admin, manager, employee or user", validators.oneOf("role", ["admin", "manager", "employee", "user"]))
]);

const updateUserValidator = validate([
  rule("Email must be valid", validators.email("email")),
  rule("Password must be at least 6 characters", (body) => body.password === undefined || validators.minLength("password", 6)(body)),
  rule("Role must be admin, manager, employee or user", validators.oneOf("role", ["admin", "manager", "employee", "user"]))
]);

const createCategoryValidator = validate([
  rule("Category name is required", validators.required("name"))
]);

const createProductValidator = validate([
  rule("Product name is required", validators.required("name")),
  rule("Barcode is required", validators.required("barcode")),
  rule("Price must be a number greater than or equal to 0", (body) => validators.number("price")(body) && validators.min("price", 0)(body)),
  rule("Quantity must be a number greater than or equal to 0", (body) => validators.number("quantity")(body) && validators.min("quantity", 0)(body)),
  rule("Minimum stock must be a number greater than or equal to 0", (body) => body.minimumStock === undefined || (validators.number("minimumStock")(body) && validators.min("minimumStock", 0)(body))),
  rule("Discount percent must be between 0 and 100", (body) => body.discountPercent === undefined || (validators.number("discountPercent")(body) && validators.min("discountPercent", 0)(body) && validators.max("discountPercent", 100)(body)))
]);

const updateProductValidator = validate([
  rule("Price must be a number greater than or equal to 0", (body) => body.price === undefined || (validators.number("price")(body) && validators.min("price", 0)(body))),
  rule("Quantity must be a number greater than or equal to 0", (body) => body.quantity === undefined || (validators.number("quantity")(body) && validators.min("quantity", 0)(body))),
  rule("Minimum stock must be a number greater than or equal to 0", (body) => body.minimumStock === undefined || (validators.number("minimumStock")(body) && validators.min("minimumStock", 0)(body))),
  rule("Discount percent must be between 0 and 100", (body) => body.discountPercent === undefined || (validators.number("discountPercent")(body) && validators.min("discountPercent", 0)(body) && validators.max("discountPercent", 100)(body)))
]);

const cartItemValidator = validate([
  rule("Product ID is required", (body) => validators.required("productId")(body) && validators.objectId("productId")(body)),
  rule("Quantity must be a positive integer", (body) => Number.isInteger(body.quantity) && body.quantity > 0)
]);

const cartQuantityValidator = validate([
  rule("Quantity must be an integer greater than or equal to 0", (body) => Number.isInteger(body.quantity) && body.quantity >= 0)
]);

const createOrderValidator = validate([
  rule("Products are required unless useCart is true", (body) => body.useCart === true || validateProductsArray(body)),
  rule("Payment method must be cash or card", validators.oneOf("paymentMethod", ["cash", "card"]))
]);

const updateOrderStatusValidator = validate([
  rule("Status must be pending, completed or cancelled", validators.oneOf("status", ["pending", "completed", "cancelled"])),
  rule("Payment status must be pending, paid, failed or refunded", validators.oneOf("paymentStatus", ["pending", "paid", "failed", "refunded"])),
  rule("Delivery status is invalid", validators.oneOf("deliveryStatus", ["not_required", "preparing", "out_for_delivery", "delivered"]))
]);

const paymentValidator = validate([
  rule("Order ID is required", (body) => validators.required("orderId")(body) && validators.objectId("orderId")(body)),
  rule("Payment method must be cash or card", validators.oneOf("method", ["cash", "card"]))
]);

const customerValidator = validate([
  rule("Customer name is required", validators.required("name")),
  rule("Customer phone is required", validators.required("phone")),
  rule("Customer email must be valid", validators.email("email"))
]);

const customerPointsValidator = validate([
  rule("Points must be a number", validators.number("points"))
]);

const couponValidator = validate([
  rule("Coupon code is required", validators.required("code")),
  rule("Discount percent must be between 1 and 100", (body) => validators.number("discountPercent")(body) && validators.min("discountPercent", 1)(body) && validators.max("discountPercent", 100)(body)),
  rule("Usage limit must be greater than or equal to 0", (body) => body.usageLimit === undefined || (validators.number("usageLimit")(body) && validators.min("usageLimit", 0)(body)))
]);

const validateCouponValidator = validate([
  rule("Coupon code is required", validators.required("code")),
  rule("Subtotal must be greater than or equal to 0", (body) => body.subtotal === undefined || (validators.number("subtotal")(body) && validators.min("subtotal", 0)(body)))
]);

const reviewValidator = validate([
  rule("Product ID is required", (body) => validators.required("product")(body) && validators.objectId("product")(body)),
  rule("Rating must be between 1 and 5", (body) => validators.number("rating")(body) && validators.min("rating", 1)(body) && validators.max("rating", 5)(body))
]);

const supplierValidator = validate([
  rule("Supplier name is required", validators.required("name")),
  rule("Supplier category is required", validators.required("category")),
  rule("Supplier contact is required", validators.required("contact")),
  rule("Order multiple must be a positive number", (body) => body.orderMultiple === undefined || (validators.number("orderMultiple")(body) && validators.min("orderMultiple", 1)(body)))
]);

const employeeValidator = validate([
  rule("Employee name is required", validators.required("name")),
  rule("Employee role is required", validators.required("role")),
  rule("Employee contact is required", validators.required("contact")),
  rule("Salary must be greater than or equal to 0", (body) => validators.number("salary")(body) && validators.min("salary", 0)(body))
]);

const preferenceValidator = validate([
  rule("Fulfillment must be pickup or delivery", validators.oneOf("fulfillment", ["pickup", "delivery"])),
  rule("Health preferences must be an object", (body) => body.health === undefined || (body.health && typeof body.health === "object" && !Array.isArray(body.health)))
]);

const rewardValidator = validate([
  rule("Reward title is required", validators.required("title")),
  rule("Reward points must be greater than 0", (body) => validators.number("points")(body) && validators.min("points", 1)(body)),
  rule("Reward type is invalid", validators.oneOf("type", ["fixed", "percent", "delivery"])),
  rule("Reward value must be greater than or equal to 0", (body) => validators.number("value")(body) && validators.min("value", 0)(body))
]);

const expenseValidator = validate([
  rule("Expense name is required", validators.required("name")),
  rule("Expense category is required", validators.required("category")),
  rule("Expense amount must be greater than or equal to 0", (body) => validators.number("amount")(body) && validators.min("amount", 0)(body))
]);

module.exports = {
  registerValidator,
  bootstrapAdminValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  requestEmailVerificationValidator,
  verifyEmailValidator,
  createUserValidator,
  updateUserValidator,
  createCategoryValidator,
  createProductValidator,
  updateProductValidator,
  cartItemValidator,
  cartQuantityValidator,
  createOrderValidator,
  updateOrderStatusValidator,
  paymentValidator,
  customerValidator,
  customerPointsValidator,
  couponValidator,
  validateCouponValidator,
  reviewValidator,
  supplierValidator,
  employeeValidator,
  preferenceValidator,
  rewardValidator,
  expenseValidator
};
