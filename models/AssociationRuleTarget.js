const mongoose = require("mongoose");

const associationRuleTargetSchema = new mongoose.Schema(
  {
    antecedent: String,
    consequents: [String],
    targetConfidence: Number,
    reason: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssociationRuleTarget", associationRuleTargetSchema);