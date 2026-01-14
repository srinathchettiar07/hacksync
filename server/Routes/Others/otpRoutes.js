import { Router } from "express";
import {OTP} from "../../models/models.js"
import { sendOtp } from "../../Utils/otpThings.js";

const otpRoute = Router();

// ============ SEND OTP ============
otpRoute.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  try {
    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    // Save OTP in DB
    const otpDoc = await OTP.create({
      email,
      otpCode,
      expiresAt,
    });

    // Send OTP via email
    await sendOtp(email, otpCode);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otpId: otpDoc._id, // return ID so frontend can pass it in signup
    });
  } catch (error) {
    console.error("❌ OTP Send Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default otpRoute;
