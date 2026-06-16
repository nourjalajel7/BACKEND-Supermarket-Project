const assert = require("node:assert/strict");
const { validate, rule, validators, validateProductsArray } = require("../middleware/validateMiddleware");
const { parseCsv, productsToCsv } = require("../services/productCsvService");

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

const testProductCsvRoundTrip = () => {
  const csv = [
    "product_id,category,product_name,image_url,barcode,price_jd,stock_quantity,minimum_stock,health_tags,supplier_id",
    '1,Frozen Foods,"Pizza, Chicken",/pizza.jpg,614256845007,2.49,30,25,"gluten,high_sodium",Frozen Food Hub'
  ].join("\n");
  const rows = parseCsv(csv);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].product_name, "Pizza, Chicken");
  assert.equal(rows[0].health_tags, "gluten,high_sodium");

  const exported = productsToCsv([{
    _id: "507f1f77bcf86cd799439011",
    categoryName: "Frozen Foods",
    name: "Pizza, Chicken",
    imageUrl: "/pizza.jpg",
    barcode: "614256845007",
    price: 2.49,
    quantity: 30,
    minimumStock: 25,
    healthTags: ["gluten", "high_sodium"]
  }]);

  assert.equal(parseCsv(exported)[0].product_name, "Pizza, Chicken");
};

const main = async () => {
  await testValidationAllowsValidProduct();
  await testValidationRejectsInvalidProduct();
  testOrderProductsValidation();
  testProductCsvRoundTrip();
  await testLoginRateLimit();
  console.log("All tests passed");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
