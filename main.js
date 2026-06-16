require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
connectDB();

//to connect to the frontend, we need to allow CORS
const allowedOrigins = String(process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Smart Supermarket Backend is running" });
});

const authRoutes = require("./routes/authRoutes");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const healthRoutes = require("./routes/healthRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const financeRoutes = require("./routes/financeRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/finance", financeRoutes);

//Supermarket API Endpoints:
//POST /api/auth/register - Register a new user
//POST /api/auth/login - Login and get a token
//GET /api/products - Get all products
//GET /api/products/:id - Get product details
//POST /api/cart - Add item to cart
//GET /api/cart - Get current user's cart
//POST /api/orders - Place an order
//GET /api/orders - Get current user's orders
//GET /api/dashboard/sales - Get sales data for dashboard
//POST /api/predictions/sales - Get sales predictions based on input data
//POST /api/predictions/predict-stock - Proxy stock forecast request to the Flask inventory forecast API
//POST /api/predictions/recommend - Proxy product association-rule recommendations to the Flask association API
//POST /api/predictions/recommend-categories - Proxy category association-rule recommendations to the Flask association API
//GET /api/customers - Get all customers (admin only)
//POST /api/reviews - Submit a product review
//POST /api/coupons - Create a new coupon (admin only)
//GET /api/notifications - Get current user's notifications
//POST /api/payments/checkout - Create a payment session with Stripe


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
