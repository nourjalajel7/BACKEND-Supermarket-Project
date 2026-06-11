const assert = require("node:assert/strict");
const { validate, rule, validators, validateProductsArray } = require("../middleware/validateMiddleware");

const runMiddleware = (middleware, body) => {
  return new Promise((resolve) => {
    const req = { body, ip: "127.0.0.50" };
    const res = {
      statusCode: 200,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        resolve(this);
      }
    };

    middleware(req, res, () => resolve({ statusCode: 200, payload: null, nextCalled: true }));
  });
};

const testValidationAllowsValidProduct = async () => {
  const middleware = validate([
    rule("Product name is required", validators.required("name")),
    rule("Price must be valid", (body) => validators.number("price")(body) && validators.min("price", 0)(body))
  ]);

  const result = await runMiddleware(middleware, { name: "Juice", price: 2 });

  assert.equal(result.nextCalled, true);
};

const testValidationRejectsInvalidProduct = async () => {
  const middleware = validate([
    rule("Product name is required", validators.required("name")),
    rule("Price must be valid", (body) => validators.number("price")(body) && validators.min("price", 0)(body))
  ]);

  const result = await runMiddleware(middleware, { price: -1 });

  assert.equal(result.statusCode, 400);
  assert.equal(result.payload.message, "Validation failed");
  assert.deepEqual(result.payload.errors, ["Product name is required", "Price must be valid"]);
};

const testOrderProductsValidation = () => {
  assert.equal(validateProductsArray({
    products: [
      {
        productId: "507f1f77bcf86cd799439011",
        quantity: 2
      }
    ]
  }), true);

  assert.equal(validateProductsArray({
    products: [
      {
        productId: "bad-id",
        quantity: 0
      }
    ]
  }), false);
};

const testLoginRateLimit = async () => {
  process.env.LOGIN_RATE_LIMIT_WINDOW_MS = "60000";
  process.env.LOGIN_RATE_LIMIT_MAX = "2";

  delete require.cache[require.resolve("../middleware/rateLimitMiddleware")];
  const { loginRateLimit } = require("../middleware/rateLimitMiddleware");

  const run = () => runMiddleware(loginRateLimit, { email: "test@example.com" });

  assert.equal((await run()).nextCalled, true);
  assert.equal((await run()).nextCalled, true);

  const blocked = await run();

  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.payload.message, "Too many login attempts, please try again later");
};

const main = async () => {
  await testValidationAllowsValidProduct();
  await testValidationRejectsInvalidProduct();
  testOrderProductsValidation();
  await testLoginRateLimit();
  console.log("All tests passed");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});