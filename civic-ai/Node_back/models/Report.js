const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  description: { type: String, required: true },
  location: { type: String, required: true },
  imagePath: { type: String, required: true },
  predictedCategory: { type: String },
  confidence: { type: Number },
  status: { type: String, default: "pending" } // pending / in-progress / resolved
});

module.exports = mongoose.model("Report", ReportSchema);
