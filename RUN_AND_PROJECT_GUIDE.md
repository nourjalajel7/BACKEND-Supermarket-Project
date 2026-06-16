# Smart Supermarket Backend Guide

ظ‡ط°ط§ ط§ظ„ظ…ظ„ظپ ظٹط´ط±ط­ ظƒظٹظپ طھط´ط؛ظ„ ط§ظ„ظ…ط´ط±ظˆط¹طŒ ظƒظٹظپ طھظپط­طµظ‡طŒ ظˆظƒظٹظپ طھط´ط±ط­ ظƒظ„ ط¬ط²ط، ظ…ط¹ظ…ظˆظ„ ظپظٹ ط§ظ„ط¨ط§ظƒ ط¥ظ†ط¯.

## 1. ظپظƒط±ط© ط§ظ„ظ…ط´ط±ظˆط¹

ط§ظ„ظ…ط´ط±ظˆط¹ ظ‡ظˆ Backend API ظ„ظ†ط¸ط§ظ… Smart Supermarket Management Web Dashboard.

ط§ظ„ظ†ط¸ط§ظ… ظٹط¯ظٹط±:

- ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ† ظˆط§ظ„طµظ„ط§ط­ظٹط§طھ
- ط§ظ„ظ…ظ†طھط¬ط§طھ ظˆط§ظ„ط¨ط§ط±ظƒظˆط¯
- ط§ظ„طھطµظ†ظٹظپط§طھ
- ط§ظ„ط³ظ„ط©
- ط§ظ„ط·ظ„ط¨ط§طھ
- ط§ظ„ط¯ظپط¹
- ط§ظ„ظ…ط®ط²ظˆظ† ظˆط§ظ„طھظ†ط¨ظٹظ‡ط§طھ
- ط§ظ„ط¹ظ…ظ„ط§ط، ظˆظ†ظ‚ط§ط· ط§ظ„ظˆظ„ط§ط،
- ط§ظ„ظƒظˆط¨ظˆظ†ط§طھ
- ط§ظ„طھظ‚ظٹظٹظ…ط§طھ
- Dashboard analytics
- Inventory predictions

- OTP password reset
- Health check
- Validation
- Rate limiting
- Tests

## 2. ط§ظ„ظ…طھط·ظ„ط¨ط§طھ ظ‚ط¨ظ„ ط§ظ„طھط´ط؛ظٹظ„

ظ„ط§ط²ظ… ظٹظƒظˆظ† ظ…ط«ط¨طھ ط¹ظ†ط¯ظƒ:

- Node.js
- npm
- MongoDB
- REST Client extension ظپظٹ VS Code ط£ظˆ Postman

طھط£ظƒط¯ ظ…ظ† ظ†ط³ط®ط© Node:

```bash
node -v
```

طھط£ظƒط¯ ظ…ظ† npm:

```bash
npm -v
```

## 3. طھط«ط¨ظٹطھ ط§ظ„ط­ط²ظ…

ظ…ظ† ط¯ط§ط®ظ„ ظ…ط¬ظ„ط¯ ط§ظ„ظ…ط´ط±ظˆط¹:

```bash
npm install
```

## 4. ط¥ط¹ط¯ط§ط¯ ظ…ظ„ظپ ط§ظ„ط¨ظٹط¦ط©

ظ…ظ„ظپ `.env` ظٹط­طھظˆظٹ ط§ظ„ظ‚ظٹظ… ط§ظ„ط³ط±ظٹط© ظˆط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ.

ط§ظ„ظ‚ظٹظ… ط§ظ„ظ…ط³طھط®ط¯ظ…ط©:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_supermarket
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=7d
BOOTSTRAP_ADMIN_KEY=your_bootstrap_key
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX=5
OTP_EXPOSE_IN_RESPONSE=false
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

ط´ط±ط­ ط³ط±ظٹط¹:

- `PORT`: ط±ظ‚ظ… طھط´ط؛ظٹظ„ ط§ظ„ط³ظٹط±ظپط±.
- `MONGO_URI`: ط±ط§ط¨ط· ظ‚ط§ط¹ط¯ط© ط¨ظٹط§ظ†ط§طھ MongoDB.
- `JWT_SECRET`: ط§ظ„ط³ط± ط§ظ„ظ…ط³طھط®ط¯ظ… ظ„طھظˆظ‚ظٹط¹ JWT tokens.
- `JWT_EXPIRES_IN`: ظ…ط¯ط© طµظ„ط§ط­ظٹط© token.
- `BOOTSTRAP_ADMIN_KEY`: ظ…ظپطھط§ط­ ط®ط§طµ ظ„ط¥ظ†ط´ط§ط، admin.
- `LOGIN_RATE_LIMIT_WINDOW_MS`: ظ…ط¯ط© ظ†ط§ظپط°ط© ط§ظ„ط­ظ…ط§ظٹط© ط¹ظ„ظ‰ login.
- `LOGIN_RATE_LIMIT_MAX`: ط¹ط¯ط¯ ظ…ط­ط§ظˆظ„ط§طھ login ط§ظ„ظ…ط³ظ…ظˆط­ط©.
- `OTP_EXPOSE_IN_RESPONSE`: ط®ظ„ظٹظ‡ `false` ظپظٹ ط§ظ„طھط³ظ„ظٹظ…. ظ„ظˆ ط®ظ„ظٹطھظ‡ `true` ظٹط¸ظ‡ط± OTP ظپظٹ response ظ„ظ„طھط¬ط±ط¨ط© ظپظ‚ط·.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: ط¥ط¹ط¯ط§ط¯ط§طھ ط¥ط±ط³ط§ظ„ OTP ط¹ط¨ط± email.

ظ…ظ„ظپ `.env.example` ظ…ظˆط¬ظˆط¯ ظƒظ‚ط§ظ„ط¨ ط¨ط¯ظˆظ† ط£ط³ط±ط§ط± ط­ظ‚ظٹظ‚ظٹط©.

## 5. طھط´ط؛ظٹظ„ MongoDB

ط¥ط°ط§ MongoDB ظ…ط«ط¨طھ ظ…ط­ظ„ظٹط§ظ‹طŒ ط´ط؛ظ„ظ‡ ط¨ط§ظ„ط·ط±ظٹظ‚ط© ط§ظ„ظ…ظ†ط§ط³ط¨ط© ط¹ظ†ط¯ظƒ.

ط¹ظ„ظ‰ Windows ط؛ط§ظ„ط¨ط§ظ‹ ظٹظƒظˆظ† ط´ط؛ط§ظ„ ظƒط®ط¯ظ…ط©. ط¥ط°ط§ ظ…ط´ ط´ط؛ط§ظ„طŒ ط´ط؛ظ„ظ‡ ظ…ظ† Services ط£ظˆ ظ…ظ† terminal ط­ط³ط¨ ط·ط±ظٹظ‚ط© ط§ظ„طھط«ط¨ظٹطھ.

طھط£ظƒط¯ ط£ظ† ط§ظ„ط±ط§ط¨ط· ظپظٹ `.env` طµط­ظٹط­:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart_supermarket
```

## 6. طھط´ط؛ظٹظ„ ط§ظ„ط³ظٹط±ظپط±

طھط´ط؛ظٹظ„ ط¹ط§ط¯ظٹ:

```bash
npm start
```

طھط´ط؛ظٹظ„ development ظ…ط¹ nodemon:

```bash
npm run dev
```

ط¥ط°ط§ ظƒظ„ ط´ظٹط، طµط­ظٹط­طŒ ظٹط¸ظ‡ط±:

```text
Server running on port 5000
MongoDB connected
```

Base URL:

```text
https://backend-supermarket-project-1.onrender.com/api
```

## 7. Health Check

ط§ظپط­طµ ط­ط§ظ„ط© ط§ظ„ط³ظٹط±ظپط± ظˆظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ:

```http
GET https://backend-supermarket-project-1.onrender.com/api/health
```

Response ط§ظ„ظ…طھظˆظ‚ط¹:

```json
{
  "status": "ok",
  "server": "running",
  "database": "connected"
}
```

## 8. ط¥ظ†ط´ط§ط، Admin

ط£ظˆظ„ ط®ط·ظˆط© ظپظٹ ط§ظ„ط§ط®طھط¨ط§ط± ظ‡ظٹ ط¥ظ†ط´ط§ط، admin ط¨ط§ط³طھط®ط¯ط§ظ…:

```http
POST /api/auth/bootstrap-admin
```

Body:

```json
{
  "name": "System Admin",
  "email": "admin@supermarket.com",
  "password": "Admin12345",
  "bootstrapKey": "value_from_env"
}
```

`bootstrapKey` ظ„ط§ط²ظ… طھظƒظˆظ† ظ†ظپط³ ظ‚ظٹظ…ط©:

```env
BOOTSTRAP_ADMIN_KEY
```

## 9. طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@supermarket.com",
  "password": "Admin12345"
}
```

ط®ط° `token` ظ…ظ† response ظˆط§ط³طھط®ط¯ظ…ظ‡:

```http
Authorization: Bearer TOKEN_HERE
```

## 10. ط§ظ„طµظ„ط§ط­ظٹط§طھ

ط§ظ„ط£ط¯ظˆط§ط± ط§ظ„ظ…ظˆط¬ظˆط¯ط©:

- `admin`
- `manager`
- `employee`
- `user`

ط£ظ…ط«ظ„ط©:

- Admin ظٹظ‚ط¯ط± ظٹط¯ظٹط± ظƒظ„ ط´ظٹط،.
- Manager ظٹظ‚ط¯ط± ظٹط¯ظٹط± ط§ظ„ظ…ظ†طھط¬ط§طھ ظˆط§ظ„طھطµظ†ظٹظپط§طھ ظˆط§ظ„ظƒظˆط¨ظˆظ†ط§طھ ظˆط§ظ„ط¯ط§ط´ط¨ظˆط±ط¯.
- Employee ظٹظ‚ط¯ط± ظٹط´ظˆظپ ط§ظ„ط·ظ„ط¨ط§طھ ظˆط§ظ„ط¹ظ…ظ„ط§ط، ظˆط§ظ„طھظ†ط¨ظٹظ‡ط§طھ.
- User ظٹظ‚ط¯ط± ظٹط³طھط®ط¯ظ… ط§ظ„ط³ظ„ط© ظˆط§ظ„ط·ظ„ط¨ط§طھ ظˆط§ظ„ط¯ظپط¹ ظˆط§ظ„طھظ‚ظٹظٹظ…ط§طھ.

## 11. ط§ظ„ظ…ظ†طھط¬ط§طھ ظˆط§ظ„ط¨ط§ط±ظƒظˆط¯

ط¥ط¶ط§ظپط© ظ…ظ†طھط¬:

```http
POST /api/products
```

Body:

```json
{
  "name": "Orange Juice",
  "barcode": "6251000000012",
  "category": "Drinks",
  "description": "Fresh orange juice",
  "price": 1.5,
  "quantity": 50,
  "minimumStock": 10,
  "discountPercent": 5
}
```

ط§ظ„ط¨ط­ط« ط¨ط§ظ„ط¨ط§ط±ظƒظˆط¯:

```http
GET /api/products/barcode/6251000000012
```

ط§ظ„ط¨ط­ط« ظˆط§ظ„ظپظ„طھط±ط©:

```http
GET /api/products?search=juice&category=Drinks&minPrice=1&maxPrice=5
```

Autocomplete:

```http
GET /api/products/autocomplete?q=ora
```

Low stock:

```http
GET /api/products/low-stock
```

## 12. ط§ظ„ط³ظ„ط©

ط¥ط¶ط§ظپط© ظ…ظ†طھط¬ ظ„ظ„ط³ظ„ط©:

```http
POST /api/cart
```

Body:

```json
{
  "productId": "PRODUCT_ID",
  "quantity": 2
}
```

ط¹ط±ط¶ ط§ظ„ط³ظ„ط©:

```http
GET /api/cart
```

طھط¹ط¯ظٹظ„ ط§ظ„ظƒظ…ظٹط©:

```http
PUT /api/cart/PRODUCT_ID
```

Body:

```json
{
  "quantity": 3
}
```

ط­ط°ظپ ظ…ظ†طھط¬ ظ…ظ† ط§ظ„ط³ظ„ط©:

```http
DELETE /api/cart/PRODUCT_ID
```

طھظپط±ظٹط؛ ط§ظ„ط³ظ„ط©:

```http
DELETE /api/cart
```

## 13. ط§ظ„ط·ظ„ط¨ط§طھ

ط¥ظ†ط´ط§ط، ط·ظ„ط¨ ظ…ظ† ط§ظ„ط³ظ„ط©:

```http
POST /api/orders
```

Body:

```json
{
  "useCart": true,
  "customerName": "Authenticated User",
  "paymentMethod": "cash",
  "deliveryAddress": "Irbid"
}
```

ط¥ظ†ط´ط§ط، ط·ظ„ط¨ ظ…ط¨ط§ط´ط±:

```json
{
  "products": [
    {
      "productId": "PRODUCT_ID",
      "quantity": 1
    }
  ],
  "customerName": "Authenticated User",
  "paymentMethod": "card"
}
```

ظ…ظ„ط§ط­ط¸ط§طھ:

- ط¹ظ†ط¯ ط¥ظ†ط´ط§ط، ط§ظ„ط·ظ„ط¨طŒ ط§ظ„ظ…ط®ط²ظˆظ† ظٹظ†ظ‚طµ طھظ„ظ‚ط§ط¦ظٹط§ظ‹.
- ط¥ط°ط§ طµط§ط± ط§ظ„ظ…ظ†طھط¬ low stockطŒ ظٹطھظ… ط¥ظ†ط´ط§ط، notification.
- ط¥ط°ط§ ط§ظ„ط¯ظپط¹ `cash`طŒ ط§ظ„ط·ظ„ط¨ ظٹط¨ط¯ط£ `pending`.
- ط¥ط°ط§ ط§ظ„ط¯ظپط¹ `card`طŒ ط§ظ„ط·ظ„ط¨ ظٹطµظٹط± `paid` ظˆ `completed`.

## 14. ط§ظ„ط¯ظپط¹

ط§ظ„ط¯ظپط¹ ط¨ط¹ط¯ ط¥ظ†ط´ط§ط، ط·ظ„ط¨ cash:

```http
POST /api/payments
```

Body:

```json
{
  "orderId": "ORDER_ID",
  "method": "card"
}
```

Methods:

- `cash`
- `card`

## 15. Dashboard

```http
GET /api/dashboard
```

ظٹط¹ط±ط¶:

- ط¹ط¯ط¯ ط§ظ„ظ…ظ†طھط¬ط§طھ
- ط¹ط¯ط¯ ط§ظ„ط·ظ„ط¨ط§طھ
- ط¹ط¯ط¯ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†
- ط¹ط¯ط¯ ط§ظ„ط¹ظ…ظ„ط§ط،
- ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ط¨ظٹط¹ط§طھ
- ظ…طھظˆط³ط· ظ‚ظٹظ…ط© ط§ظ„ط·ظ„ط¨
- ط§ظ„ظ…ظ†طھط¬ط§طھ ظ…ظ†ط®ظپط¶ط© ط§ظ„ظ…ط®ط²ظˆظ†
- ط£ظƒط«ط± ط§ظ„ظ…ظ†طھط¬ط§طھ ظ…ط¨ظٹط¹ط§ظ‹
- ط¢ط®ط± ط§ظ„ط·ظ„ط¨ط§طھ

## 16. Inventory Predictions

```http
GET /api/predictions/inventory
```

ظٹط¹ط·ظٹ طھظˆظ‚ط¹ط§طھ ط¨ط³ظٹط·ط© ظ„ظ„ظ…ط®ط²ظˆظ†:

- ظƒظ…ظٹط© ط§ظ„ظ…ظ†طھط¬ ط§ظ„ط­ط§ظ„ظٹط©
- ظ…ط¹ط¯ظ„ ط§ظ„ط¨ظٹط¹ ط§ظ„ظٹظˆظ…ظٹ ط§ظ„طھظ‚ط±ظٹط¨ظٹ
- ط¹ط¯ط¯ ط§ظ„ط£ظٹط§ظ… ط§ظ„ظ…طھط¨ظ‚ظٹط©
- ظ‡ظ„ ط§ظ„ظ…ظ†طھط¬ low stock
- ظƒظ…ظٹط© ط¥ط¹ط§ط¯ط© ط§ظ„ط·ظ„ط¨ ط§ظ„ظ…ظ‚طھط±ط­ط©

## 17. Customers and Loyalty

Endpoints:

```http
GET /api/customers
POST /api/customers
GET /api/customers/:id
PUT /api/customers/:id
PUT /api/customers/:id/points
DELETE /api/customers/:id
```

ظٹط¯ط¹ظ…:

- ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¹ظ…ظ„ط§ط،
- ظ†ظ‚ط§ط· ط§ظ„ظˆظ„ط§ط،
- ط¹ط¯ط¯ ظ…ط±ط§طھ ط§ظ„ط´ط±ط§ط،
- ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ط¥ظ†ظپط§ظ‚

## 18. Coupons

Endpoints:

```http
POST /api/coupons
GET /api/coupons
POST /api/coupons/validate
PUT /api/coupons/:id
DELETE /api/coupons/:id
```

ط§ظ„ظƒظˆط¨ظˆظ† ظٹط­طھظˆظٹ:

- code
- discountPercent
- expiresAt
- usageLimit
- usedCount
- isActive

## 19. Reviews

Endpoints:

```http
POST /api/reviews
GET /api/reviews/product/:productId
DELETE /api/reviews/:id
```

ط¹ظ†ط¯ ط¥ط¶ط§ظپط© review:

- ظٹطھظ… ط­ظپط¸ rating ظˆ comment
- ظٹطھظ… طھط­ط¯ظٹط« ظ…طھظˆط³ط· طھظ‚ظٹظٹظ… ط§ظ„ظ…ظ†طھط¬
- ظٹطھظ… طھط­ط¯ظٹط« ط¹ط¯ط¯ ط§ظ„طھظ‚ظٹظٹظ…ط§طھ

## 20. Notifications

Endpoints:

```http
GET /api/notifications
PUT /api/notifications/read-all
PUT /api/notifications/:id/read
DELETE /api/notifications/:id
```

ظٹطھظ… ط¥ظ†ط´ط§ط، notifications ط¹ظ†ط¯:

- ط·ظ„ط¨ ط¬ط¯ظٹط¯
- ظ…ظ†طھط¬ ظˆطµظ„ low stock

## 21. Forgot Password and OTP

ط·ظ„ط¨ OTP:

```http
POST /api/auth/forgot-password
```

Body:

```json
{
  "email": "user@supermarket.com"
}
```

ط¥ط°ط§ SMTP ظ…طھط¬ظ‡ط²طŒ ظٹطھظ… ط¥ط±ط³ط§ظ„ OTP ط¹ظ„ظ‰ ط§ظ„ط¥ظٹظ…ظٹظ„.

ط¥ط°ط§ SMTP ظ…ط´ ظ…طھط¬ظ‡ط²طŒ ظ„ط§ ظٹط®ط±ط¨ endpointطŒ ظˆظٹط±ط¬ط¹:

```json
{
  "message": "OTP generated but email service is not configured",
  "emailSent": false
}
```

ظ„ظ„طھط¬ط±ط¨ط© ط§ظ„ظ…ط­ظ„ظٹط© ظپظ‚ط·طŒ ظٹظ…ظƒظ† ظˆط¶ط¹:

```env
OTP_EXPOSE_IN_RESPONSE=true
```

ط¥ط¹ط§ط¯ط© طھط¹ظٹظٹظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±:

```http
POST /api/auth/reset-password
```

Body:

```json
{
  "email": "user@supermarket.com",
  "otp": "123456",
  "newPassword": "NewPass123"
}
```

## 22. Rate Limiting

طھظ…طھ ط¥ط¶ط§ظپط© ط­ظ…ط§ظٹط© ط¹ظ„ظ‰ login:

```http
POST /api/auth/login
```

ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ:

```env
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX=5
```

ط¥ط°ط§ ط§ظ„ظ…ط³طھط®ط¯ظ… طھط¬ط§ظˆط² ط§ظ„ط­ط¯:

```json
{
  "message": "Too many login attempts, please try again later",
  "retryAfterSeconds": 900
}
```

## 23. Validation

طھظ…طھ ط¥ط¶ط§ظپط© validation ظ‚ط¨ظ„ controllers.

ط¥ط°ط§ ط§ظ„ط·ظ„ط¨ ظ†ط§ظ‚طµ ط£ظˆ ط؛ظ„ط·:

```json
{
  "message": "Validation failed",
  "errors": [
    "Product name is required"
  ]
}
```

ط§ظ„ظ€ validation ظٹط؛ط·ظٹ:

- auth
- products
- cart
- orders
- payments
- categories
- customers
- coupons
- reviews

## 24. Error Handling

طھظ…طھ ط¥ط¶ط§ظپط© error middleware ظ…ظˆط­ط¯.

ط¥ط°ط§ endpoint ط؛ظٹط± ظ…ظˆط¬ظˆط¯:

```json
{
  "success": false,
  "message": "Route not found: /api/wrong-route"
}
```

## 25. طھط´ط؛ظٹظ„ ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ ط§ظ„ط¢ظ„ظٹط©

ط´ط؛ظ„:

```bash
npm test
```

ط§ظ„ظ…طھظˆظ‚ط¹:

```text
All tests passed
```

ط§ظ„ط§ط®طھط¨ط§ط±ط§طھ طھط؛ط·ظٹ:

- validation ط§ظ„طµط­ظٹط­
- validation ط§ظ„ط®ط§ط·ط¦
- products array ظ„ظ„ط·ظ„ط¨ط§طھ
- login rate limit

## 26. ط§ط®طھط¨ط§ط± ظƒظ„ endpoints ظ…ظ† VS Code

ط§ط³طھط®ط¯ظ… ط§ظ„ظ…ظ„ظپ:

```text
endpoints.rest
```

ط§ظ„ط®ط·ظˆط§طھ ط§ظ„ظ…ظ‚طھط±ط­ط©:

1. ط´ط؛ظ„ ط§ظ„ط³ظٹط±ظپط±.
2. ط§ظپطھط­ `endpoints.rest`.
3. ظ†ظپط° Health check.
4. ظ†ظپط° Bootstrap admin.
5. ظ†ظپط° Login admin.
6. ظ†ظپط° Register user.
7. ط£ط¶ظپ category.
8. ط£ط¶ظپ product ظ…ط¹ barcode.
9. ط§ظپط­طµ barcode lookup.
10. ط£ط¶ظپ product ظ„ظ„ط³ظ„ط©.
11. ط£ظ†ط´ط¦ order.
12. ط§ط¯ظپط¹ card.
13. ط§ظپط­طµ dashboard ظˆ predictions.

## 27. ط§ط®طھط¨ط§ط± Postman

ط§ط³طھظˆط±ط¯ ط§ظ„ظ…ظ„ظپ:

```text
postman_collection.json
```

ط¬ظ‡ط² environment variables:

```text
baseUrl=https://backend-supermarket-project-1.onrender.com/api
bootstrapKey=BOOTSTRAP_ADMIN_KEY_FROM_ENV
adminEmail=admin@supermarket.com
adminPassword=Admin12345
userEmail=user@supermarket.com
userPassword=User12345
barcode=6251000000012
```

Postman collection ظٹط­ظپط¸ طھظ„ظ‚ط§ط¦ظٹط§ظ‹:

- `adminToken`
- `userToken`
- `categoryId`
- `categoryName`
- `productId`
- `orderId`

## 28. ط£ظˆط§ظ…ط± ط§ظ„ظپط­طµ ظ‚ط¨ظ„ ط§ظ„طھط³ظ„ظٹظ…

ط´ط؛ظ„ ظ‡ط°ظ‡ ط§ظ„ط£ظˆط§ظ…ط±:

```bash
npm install
npm test
npm audit --omit=dev
npm start
```

ط«ظ… ط§ظپط­طµ:

```http
GET https://backend-supermarket-project-1.onrender.com/api/health
```

## 29. ط£ظ‡ظ… ط§ظ„ظ…ظ„ظپط§طھ

```text
main.js
db.js
.env
.env.example
README.md
RUN_AND_PROJECT_GUIDE.md
endpoints.rest
postman_collection.json
controllers/
models/
routes/
middleware/
validators/
services/
tests/
```

## 30. ظ…ظ„ط®طµ ظ…ط§ طھظ… ط¥ظ†ط¬ط§ط²ظ‡

طھظ… ط¨ظ†ط§ط، Backend ظƒط§ظ…ظ„ ظٹط­طھظˆظٹ ط¹ظ„ظ‰:

- JWT authentication
- Role-based authorization
- Password hashing
- Profile management
- Change password
- Forgot/reset password OTP
- SMTP email OTP support
- Products CRUD
- Barcode lookup
- Product search/filter/autocomplete
- Categories CRUD
- User cart
- Orders
- Auto stock reduction
- Low stock notifications
- Cash and card payment
- Customers and loyalty points
- Coupons
- Reviews and ratings
- Dashboard analytics
- Inventory predictions
- Health check
- Rate limiting
- Validation middleware
- Central error handling
- REST Client test file
- Postman collection
- Automated tests

## 31. ظ…ظ„ط§ط­ط¸ط§طھ ظ…ظ‡ظ…ط© ظ„ظ„طھط³ظ„ظٹظ…

- ظ„ط§ طھط´ط§ط±ظƒ ظ…ظ„ظپ `.env` ط¹ظ„ظ†ط§ظ‹ ظ„ط£ظ†ظ‡ ظٹط­طھظˆظٹ ط£ط³ط±ط§ط±.
- ظ…ظ„ظپ `.env.example` ط¢ظ…ظ† ظ„ظ„طھط³ظ„ظٹظ….
- ط¥ط°ط§ ط§ظ„ط¯ظƒطھظˆط± ظٹط±ظٹط¯ طھط¬ط±ط¨ط© OTP ط¹ط¨ط± ط§ظ„ط¥ظٹظ…ظٹظ„طŒ ط¹ط¨ط¦ SMTP settings.
- ط¥ط°ط§ ظ„ط§ طھط±ظٹط¯ SMTPطŒ ط§ظ„ظ†ط¸ط§ظ… ظ„ط§ ظٹطھط¹ط·ظ„طŒ ظپظ‚ط· ظٹط±ط¬ط¹ `emailSent: false`.
- ط§ظ„ط¨ط§ط±ظƒظˆط¯ ظˆط§ظ„ط¯ظپط¹ طھظ… ظپط­طµظ‡ظ… ط¹ظ…ظ„ظٹط§ظ‹.
- ظ‚ط¨ظ„ ط§ظ„ط¹ط±ط¶ ط´ط؛ظ„ MongoDB ط«ظ… `npm start`.
