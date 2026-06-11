# Smart Supermarket Management Backend

Backend API for an AI-powered smart supermarket management dashboard. It manages users, roles, products, categories, barcode lookup, cart, orders, payments, stock updates, customers, loyalty points, coupons, reviews, notifications, dashboard analytics, and inventory predictions.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Fill the required environment variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_supermarket
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=7d
BOOTSTRAP_ADMIN_KEY=your_strong_bootstrap_key
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX=5
OTP_EXPOSE_IN_RESPONSE=false
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@example.com
```

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the server:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Base URL:

```text
http://localhost:5000/api
```

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `PORT` | No | Server port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWT tokens. |
| `JWT_EXPIRES_IN` | No | JWT expiration time. Defaults to `7d`. |
| `BOOTSTRAP_ADMIN_KEY` | Yes | Private key used only for creating or resetting the first admin account. |
| `LOGIN_RATE_LIMIT_WINDOW_MS` | No | Login rate limit time window in milliseconds. |
| `LOGIN_RATE_LIMIT_MAX` | No | Maximum login attempts per window. |
| `OTP_EXPOSE_IN_RESPONSE` | No | Development-only option to return OTP in API response. Keep `false` for real use. |
| `SMTP_HOST` | Yes for email OTP | SMTP server host. |
| `SMTP_PORT` | Yes for email OTP | SMTP server port. |
| `SMTP_SECURE` | No | Use TLS connection when `true`. |
| `SMTP_USER` | Depends on provider | SMTP username. |
| `SMTP_PASS` | Depends on provider | SMTP password or app password. |
| `SMTP_FROM` | Yes for email OTP | Sender email address. |

Do not commit `.env`. It is ignored by `.gitignore`.

## Roles

- `admin`: Full access, including deleting users, products, categories, coupons, and admin dashboard.
- `manager`: Management access for products, categories, dashboard, customers, coupons, and orders.
- `employee`: Operational access for orders, low stock, customers, and notifications.
- `user`: Customer access for cart, orders, payments, reviews, and profile.

## Authentication Flow

Bootstrap an admin:

```http
POST /api/auth/bootstrap-admin
```

Login:

```http
POST /api/auth/login
```

Use the returned token:

```http
Authorization: Bearer <token>
```

## Main Endpoints

### Auth

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/auth/bootstrap-admin` | Public with bootstrap key |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/profile` | Authenticated |
| `PUT` | `/api/auth/profile` | Authenticated |
| `PUT` | `/api/auth/change-password` | Authenticated |
| `POST` | `/api/auth/forgot-password` | Public |
| `POST` | `/api/auth/reset-password` | Public |

Forgot password sends the OTP through SMTP when email settings are configured. If SMTP settings are empty, the endpoint still generates an OTP and returns `emailSent: false`. For local development only, set `OTP_EXPOSE_IN_RESPONSE=true` to show the OTP in the response.

### Health

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |

### Products and Barcode

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/products` | Authenticated |
| `GET` | `/api/products?search=juice&category=Drinks&minPrice=1&maxPrice=5` | Authenticated |
| `GET` | `/api/products/autocomplete?q=ora` | Authenticated |
| `GET` | `/api/products/barcode/:barcode` | Authenticated |
| `GET` | `/api/products/low-stock` | Admin, manager, employee |
| `POST` | `/api/products` | Admin, manager |
| `PUT` | `/api/products/:id` | Admin, manager |
| `DELETE` | `/api/products/:id` | Admin |

Barcode lookup example:

```http
GET /api/products/barcode/6251000000012
Authorization: Bearer <token>
```

### Cart

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/cart` | Authenticated |
| `POST` | `/api/cart` | Authenticated |
| `PUT` | `/api/cart/:productId` | Authenticated |
| `DELETE` | `/api/cart/:productId` | Authenticated |
| `DELETE` | `/api/cart` | Authenticated |

### Orders and Payments

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/orders` | Authenticated |
| `GET` | `/api/orders` | Authenticated |
| `GET` | `/api/orders/:id` | Authenticated |
| `PUT` | `/api/orders/:id/status` | Admin, manager, employee |
| `PUT` | `/api/orders/:id/cancel` | Authenticated |
| `POST` | `/api/payments` | Authenticated |
| `GET` | `/api/payments` | Authenticated |

Payment methods:

- `cash`
- `fake_card`

Cash orders start with `paymentStatus: "pending"`. Paying later with `fake_card` marks the order as `paid` and `completed`.

### Management

| Module | Endpoint |
| --- | --- |
| Categories | `/api/categories` |
| Customers | `/api/customers` |
| Coupons | `/api/coupons` |
| Reviews | `/api/reviews` |
| Dashboard | `/api/dashboard` |
| Predictions | `/api/predictions/inventory` |
| Notifications | `/api/notifications` |

## Validation

The API validates important requests before reaching controllers:

- Required auth fields
- Valid email format
- Minimum password length
- Product price, stock, discount, and barcode
- Cart item product ID and quantity
- Order items and payment method
- Payment order ID and method
- Customer phone and email
- Coupon discount range
- Review rating range

Invalid requests return:

```json
{
  "message": "Validation failed",
  "errors": []
}
```

## Security Additions

- Login rate limiting protects `/api/auth/login`.
- JWT secrets and bootstrap admin key are loaded only from `.env`.
- Passwords are hashed with bcrypt.
- OTP reset emails are sent through SMTP when configured.
- `.env` is ignored by Git.

## Testing

REST Client file:

```text
endpoints.rest
```

Postman collection:

```text
postman_collection.json
```

Required Postman environment variables:

```text
baseUrl=http://localhost:5000/api
bootstrapKey=<your BOOTSTRAP_ADMIN_KEY>
adminEmail=admin@supermarket.com
adminPassword=Admin12345
userEmail=user@supermarket.com
userPassword=User12345
barcode=6251000000012
```

Recommended test order:

1. Bootstrap admin
2. Login admin
3. Register user
4. Create category
5. Create product with barcode
6. Lookup product by barcode
7. Add product to cart
8. Create cash order from cart
9. Pay order with fake card
10. Check dashboard and predictions

Run automated tests:

```bash
npm test
```
