const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Report = require("../models/Report");

const router = express.Router();

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /reports - create a new report
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { description, location } = req.body;
    const imagePath = req.file.path;

    // Call FastAPI classify endpoint
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));

    const response = await axios.post("http://127.0.0.1:8000/classify", formData, {
      headers: formData.getHeaders()
    });

    const { predicted_category, confidence } = response.data;

    // Save to MongoDB
    const report = new Report({
      description,
      location,
      imagePath,
      predictedCategory: predicted_category,
      confidence
    });
    await report.save();

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create report", details: err.message });
  }
});

// GET /reports - get all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
