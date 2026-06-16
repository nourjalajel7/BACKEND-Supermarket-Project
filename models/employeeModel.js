const mongoose = require("mongoose");

const weeklySchema = new mongoose.Schema(
  {
    Sun: { type: String, default: "Off" },
    Mon: { type: String, default: "Off" },
    Tue: { type: String, default: "Off" },
    Wed: { type: String, default: "Off" },
    Thu: { type: String, default: "Off" },
    Fri: { type: String, default: "Off" },
    Sat: { type: String, default: "Off" }
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    contact: { type: String, required: true, unique: true, trim: true },
    shift: { type: String, enum: ["Morning", "Evening", "Night"], default: "Morning" },
    status: { type: String, enum: ["Active", "On Leave", "Inactive"], default: "Active" },
    salary: { type: Number, required: true, min: 0 },
    joinDate: { type: Date, default: Date.now },
    weekly: { type: weeklySchema, default: () => ({}) }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
