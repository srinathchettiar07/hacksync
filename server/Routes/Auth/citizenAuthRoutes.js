import { Router } from "express";
import bcrypt from "bcrypt";
import {Citizen} from "../../models/models.js";
import {OTP} from "../../models/models.js";
import { generateToken } from "../../Utils/token.js";

const citizenAuthRoute = Router();

// ================= SIGNUP =================
citizenAuthRoute.post("/signup", async (req, res) => {
  try {
    const { displayName, email, phone, password, aadhaar, dob, gender, address, otpId, otp } = req.body;

  
    if (!email || !phone || !password || !otpId || !otp)
      return res.status(400).json({ success: false, message: "Required fields missing" });

    const otpRecord = await OTP.findOne({ _id: otpId, email });

    if (!otpRecord) return res.status(400).json({ success: false, message: "OTP not found" });
    if (otpRecord.verified) return res.status(400).json({ success: false, message: "OTP already used" });
    if (otpRecord.expiresAt < Date.now()) return res.status(400).json({ success: false, message: "OTP expired" });
    if (otpRecord.otpCode !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });


    otpRecord.verified = true;
    await otpRecord.save();

    


    const existingUser = await Citizen.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ success: false, message: "Email or phone already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCitizen = await Citizen.create({
      displayName,
      email,
      phone,
      password: hashedPassword,
      aadhaar,
      dob,
      gender,
      address,
    });

    const { password: _, ...citizenData } = newCitizen.toObject();
    const token = generateToken(newCitizen._id, "Citizen");

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      type:"Citizen",
      user: citizenData,
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= LOGIN =================
citizenAuthRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const citizen = await Citizen.findOne({ email });
    if (!citizen) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const { password: _, ...citizenData } = citizen.toObject();
    const token = generateToken(citizen._id, "Citizen");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      type:"Citizen",
      user: citizenData,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default citizenAuthRoute;
