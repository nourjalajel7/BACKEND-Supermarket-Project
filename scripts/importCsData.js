require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const CustomerLoyalty = require("../models/CustomerLoyalty");
const MonthlyFinance = require("../models/MonthlyFinance");
const SeasonEvent = require("../models/SeasonEvent");
const AssociationRuleTarget = require("../models/AssociationRuleTarget");
const Product = require("../models/productModel");

const readCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`CSV file not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  return Number(value);
};

const splitList = (value, separator = ",") => {
  if (!value) return [];

  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const dataDir = path.join(__dirname, "../DATA");

    const customers = await readCsv(path.join(dataDir, "customers.csv"));
    const finance = await readCsv(path.join(dataDir, "finance_summary.csv"));
    const seasons = await readCsv(path.join(dataDir, "seasonal_rules.csv"));
    const rules = await readCsv(path.join(dataDir, "trend_rules.csv"));
    const products = await readCsv(path.join(dataDir, "products.csv"));

    await CustomerLoyalty.deleteMany();
    await MonthlyFinance.deleteMany();
    await SeasonEvent.deleteMany();
    await AssociationRuleTarget.deleteMany();

    await CustomerLoyalty.insertMany(
      customers.map((row) => ({
        customerId: row.customer_id,
        customerName: row.customer_name,
        joinDate: new Date(row.join_date),
        loyaltyTier: row.loyalty_tier,
        pointsEarnedTotal: toNumber(row.points_earned_total),
        pointsRedeemedTotal: toNumber(row.points_redeemed_total),
        pointsBalance: toNumber(row.points_balance),
        totalSpentJd: toNumber(row.total_spent_jd),
        visits2026Until0617: toNumber(row.visits_2026_until_0617)
      }))
    );

    await MonthlyFinance.insertMany(
      finance.map((row) => ({
        year: toNumber(row.year),
        monthNumber: toNumber(row.month_number),
        month: row.month,
        orders: toNumber(row.orders),
        unitsSold: toNumber(row.units_sold),
        grossSalesJd: toNumber(row.gross_sales_jd),
        discountsJd: toNumber(row.discounts_jd),
        netRevenueJd: toNumber(row.net_revenue_jd),
        estimatedCostJd: toNumber(row.estimated_cost_jd),
        estimatedProfitJd: toNumber(row.estimated_profit_jd),
        pointsIssued: toNumber(row.points_issued),
        pointsRedeemed: toNumber(row.points_redeemed)
      }))
    );

    await SeasonEvent.insertMany(
      seasons.map((row) => ({
        seasonEvent: row["Season/Event"],
        dateWindowUsed: row["2026 Date Window Used"],
        productsBoosted: splitList(row["Products boosted"], ","),
        whyItMatters: row["Why it matters"]
      }))
    );

    await AssociationRuleTarget.insertMany(
      rules.map((row) => ({
        antecedent: row.antecedent,
        consequents: splitList(row.consequents, "|"),
        targetConfidence: toNumber(row.target_confidence),
        reason: row.reason
      }))
    );

    if (products.length) {
      await Product.bulkWrite(
        products
          .filter((row) => row.barcode && row.product_name)
          .map((row) => ({
            updateOne: {
              filter: { barcode: String(row.barcode).trim() },
              update: {
                $set: {
                  name: row.product_name,
                  barcode: String(row.barcode).trim(),
                  category: row.category || "General",
                  categoryName: row.category || "General",
                  description: row.product_type || row.category || "",
                  imageUrl: row.image_url || "",
                  healthTags: splitList(row.health_tags, ","),
                  price: toNumber(row.price_jd),
                  quantity: toNumber(row.stock_quantity),
                  minimumStock: toNumber(row.minimum_stock),
                  isActive: true
                }
              },
              upsert: true
            }
          }))
      );
    }

    console.log("All CSV data imported successfully");
    process.exit();
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
};

importData();
