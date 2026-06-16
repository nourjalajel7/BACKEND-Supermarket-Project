const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "manager", "employee", "user"], default: "user" },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    membershipLevel: { type: String, enum: ["Bronze", "Silver", "Gold"], default: "Bronze" },
    preferences: {
      fulfillment: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
      health: {
        diabetes: { type: Boolean, default: false },
        gluten: { type: Boolean, default: false },
        peanut: { type: Boolean, default: false },
        lowSodium: { type: Boolean, default: false },
        vegan: { type: Boolean, default: false }
      }
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    emailVerificationOtp: { type: String },
    emailVerificationOtpExpires: { type: Date },
    resetOtp: { type: String },
    resetOtpExpires: { type: Date }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
