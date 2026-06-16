# Smart Supermarket Backend Guide

هذا الملف يشرح كيف تشغل المشروع، كيف تفحصه، وكيف تشرح كل جزء معمول في الباك إند.

## 1. فكرة المشروع

المشروع هو Backend API لنظام Smart Supermarket Management Web Dashboard.

النظام يدير:

- المستخدمين والصلاحيات
- المنتجات والباركود
- التصنيفات
- السلة
- الطلبات
- الدفع
- المخزون والتنبيهات
- العملاء ونقاط الولاء
- الكوبونات
- التقييمات
- Dashboard analytics
- Inventory predictions

- OTP password reset
- Health check
- Validation
- Rate limiting
- Tests

## 2. المتطلبات قبل التشغيل

لازم يكون مثبت عندك:

- Node.js
- npm
- MongoDB
- REST Client extension في VS Code أو Postman

تأكد من نسخة Node:

```bash
node -v
```

تأكد من npm:

```bash
npm -v
```

## 3. تثبيت الحزم

من داخل مجلد المشروع:

```bash
npm install
```

## 4. إعداد ملف البيئة

ملف `.env` يحتوي القيم السرية والإعدادات.

القيم المستخدمة:

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

شرح سريع:

- `PORT`: رقم تشغيل السيرفر.
- `MONGO_URI`: رابط قاعدة بيانات MongoDB.
- `JWT_SECRET`: السر المستخدم لتوقيع JWT tokens.
- `JWT_EXPIRES_IN`: مدة صلاحية token.
- `BOOTSTRAP_ADMIN_KEY`: مفتاح خاص لإنشاء admin.
- `LOGIN_RATE_LIMIT_WINDOW_MS`: مدة نافذة الحماية على login.
- `LOGIN_RATE_LIMIT_MAX`: عدد محاولات login المسموحة.
- `OTP_EXPOSE_IN_RESPONSE`: خليه `false` في التسليم. لو خليته `true` يظهر OTP في response للتجربة فقط.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: إعدادات إرسال OTP عبر email.

ملف `.env.example` موجود كقالب بدون أسرار حقيقية.

## 5. تشغيل MongoDB

إذا MongoDB مثبت محلياً، شغله بالطريقة المناسبة عندك.

على Windows غالباً يكون شغال كخدمة. إذا مش شغال، شغله من Services أو من terminal حسب طريقة التثبيت.

تأكد أن الرابط في `.env` صحيح:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smart_supermarket
```

## 6. تشغيل السيرفر

تشغيل عادي:

```bash
npm start
```

تشغيل development مع nodemon:

```bash
npm run dev
```

إذا كل شيء صحيح، يظهر:

```text
Server running on port 5000
MongoDB connected
```

Base URL:

```text
https://backend-supermarket-project-1.onrender.com/api
```

## 7. Health Check

افحص حالة السيرفر وقاعدة البيانات:

```http
GET https://backend-supermarket-project-1.onrender.com/api/health
```

Response المتوقع:

```json
{
  "status": "ok",
  "server": "running",
  "database": "connected"
}
```

## 8. إنشاء Admin

أول خطوة في الاختبار هي إنشاء admin باستخدام:

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

`bootstrapKey` لازم تكون نفس قيمة:

```env
BOOTSTRAP_ADMIN_KEY
```

## 9. تسجيل الدخول

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

خذ `token` من response واستخدمه:

```http
Authorization: Bearer TOKEN_HERE
```

## 10. الصلاحيات

الأدوار الموجودة:

- `admin`
- `manager`
- `employee`
- `user`

أمثلة:

- Admin يقدر يدير كل شيء.
- Manager يقدر يدير المنتجات والتصنيفات والكوبونات والداشبورد.
- Employee يقدر يشوف الطلبات والعملاء والتنبيهات.
- User يقدر يستخدم السلة والطلبات والدفع والتقييمات.

## 11. المنتجات والباركود

إضافة منتج:

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

البحث بالباركود:

```http
GET /api/products/barcode/6251000000012
```

البحث والفلترة:

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

## 12. السلة

إضافة منتج للسلة:

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

عرض السلة:

```http
GET /api/cart
```

تعديل الكمية:

```http
PUT /api/cart/PRODUCT_ID
```

Body:

```json
{
  "quantity": 3
}
```

حذف منتج من السلة:

```http
DELETE /api/cart/PRODUCT_ID
```

تفريغ السلة:

```http
DELETE /api/cart
```

## 13. الطلبات

إنشاء طلب من السلة:

```http
POST /api/orders
```

Body:

```json
{
  "useCart": true,
  "customerName": "Normal User",
  "paymentMethod": "cash",
  "deliveryAddress": "Irbid"
}
```

إنشاء طلب مباشر:

```json
{
  "products": [
    {
      "productId": "PRODUCT_ID",
      "quantity": 1
    }
  ],
  "customerName": "Normal User",
  "paymentMethod": "fake_card"
}
```

ملاحظات:

- عند إنشاء الطلب، المخزون ينقص تلقائياً.
- إذا صار المنتج low stock، يتم إنشاء notification.
- إذا الدفع `cash`، الطلب يبدأ `pending`.
- إذا الدفع `fake_card`، الطلب يصير `paid` و `completed`.

## 14. الدفع

الدفع بعد إنشاء طلب cash:

```http
POST /api/payments
```

Body:

```json
{
  "orderId": "ORDER_ID",
  "method": "fake_card"
}
```

Methods:

- `cash`
- `fake_card`

## 15. Dashboard

```http
GET /api/dashboard
```

يعرض:

- عدد المنتجات
- عدد الطلبات
- عدد المستخدمين
- عدد العملاء
- إجمالي المبيعات
- متوسط قيمة الطلب
- المنتجات منخفضة المخزون
- أكثر المنتجات مبيعاً
- آخر الطلبات

## 16. Inventory Predictions

```http
GET /api/predictions/inventory
```

يعطي توقعات بسيطة للمخزون:

- كمية المنتج الحالية
- معدل البيع اليومي التقريبي
- عدد الأيام المتبقية
- هل المنتج low stock
- كمية إعادة الطلب المقترحة

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

يدعم:

- بيانات العملاء
- نقاط الولاء
- عدد مرات الشراء
- إجمالي الإنفاق

## 18. Coupons

Endpoints:

```http
POST /api/coupons
GET /api/coupons
POST /api/coupons/validate
PUT /api/coupons/:id
DELETE /api/coupons/:id
```

الكوبون يحتوي:

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

عند إضافة review:

- يتم حفظ rating و comment
- يتم تحديث متوسط تقييم المنتج
- يتم تحديث عدد التقييمات

## 20. Notifications

Endpoints:

```http
GET /api/notifications
PUT /api/notifications/read-all
PUT /api/notifications/:id/read
DELETE /api/notifications/:id
```

يتم إنشاء notifications عند:

- طلب جديد
- منتج وصل low stock

## 21. Forgot Password and OTP

طلب OTP:

```http
POST /api/auth/forgot-password
```

Body:

```json
{
  "email": "user@supermarket.com"
}
```

إذا SMTP متجهز، يتم إرسال OTP على الإيميل.

إذا SMTP مش متجهز، لا يخرب endpoint، ويرجع:

```json
{
  "message": "OTP generated but email service is not configured",
  "emailSent": false
}
```

للتجربة المحلية فقط، يمكن وضع:

```env
OTP_EXPOSE_IN_RESPONSE=true
```

إعادة تعيين كلمة المرور:

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

تمت إضافة حماية على login:

```http
POST /api/auth/login
```

الإعدادات:

```env
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX=5
```

إذا المستخدم تجاوز الحد:

```json
{
  "message": "Too many login attempts, please try again later",
  "retryAfterSeconds": 900
}
```

## 23. Validation

تمت إضافة validation قبل controllers.

إذا الطلب ناقص أو غلط:

```json
{
  "message": "Validation failed",
  "errors": [
    "Product name is required"
  ]
}
```

الـ validation يغطي:

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

تمت إضافة error middleware موحد.

إذا endpoint غير موجود:

```json
{
  "success": false,
  "message": "Route not found: /api/wrong-route"
}
```

## 25. تشغيل الاختبارات الآلية

شغل:

```bash
npm test
```

المتوقع:

```text
All tests passed
```

الاختبارات تغطي:

- validation الصحيح
- validation الخاطئ
- products array للطلبات
- login rate limit

## 26. اختبار كل endpoints من VS Code

استخدم الملف:

```text
endpoints.rest
```

الخطوات المقترحة:

1. شغل السيرفر.
2. افتح `endpoints.rest`.
3. نفذ Health check.
4. نفذ Bootstrap admin.
5. نفذ Login admin.
6. نفذ Register user.
7. أضف category.
8. أضف product مع barcode.
9. افحص barcode lookup.
10. أضف product للسلة.
11. أنشئ order.
12. ادفع fake_card.
13. افحص dashboard و predictions.

## 27. اختبار Postman

استورد الملف:

```text
postman_collection.json
```

جهز environment variables:

```text
baseUrl=https://backend-supermarket-project-1.onrender.com/api
bootstrapKey=BOOTSTRAP_ADMIN_KEY_FROM_ENV
adminEmail=admin@supermarket.com
adminPassword=Admin12345
userEmail=user@supermarket.com
userPassword=User12345
barcode=6251000000012
```

Postman collection يحفظ تلقائياً:

- `adminToken`
- `userToken`
- `categoryId`
- `categoryName`
- `productId`
- `orderId`

## 28. أوامر الفحص قبل التسليم

شغل هذه الأوامر:

```bash
npm install
npm test
npm audit --omit=dev
npm start
```

ثم افحص:

```http
GET https://backend-supermarket-project-1.onrender.com/api/health
```

## 29. أهم الملفات

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

## 30. ملخص ما تم إنجازه

تم بناء Backend كامل يحتوي على:

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
- Cash and fake card payment
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

## 31. ملاحظات مهمة للتسليم

- لا تشارك ملف `.env` علناً لأنه يحتوي أسرار.
- ملف `.env.example` آمن للتسليم.
- إذا الدكتور يريد تجربة OTP عبر الإيميل، عبئ SMTP settings.
- إذا لا تريد SMTP، النظام لا يتعطل، فقط يرجع `emailSent: false`.
- الباركود والدفع تم فحصهم عملياً.
- قبل العرض شغل MongoDB ثم `npm start`.
