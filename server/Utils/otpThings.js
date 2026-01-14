import nodemailer from "nodemailer";
import { OTP } from "../models/models.js";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dynamicsaish@gmail.com", 
    pass: "xwisxdntwrxboylk",
  },
});


export const sendOtp = async (email,otp) => {
  if (!email) {
    return false;
  }
  try {
    

    
    const otpInstance = await OTP.create({
      email,
      otpCode: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), 
    });

    await transporter.sendMail({
      from: `"Civic Issue Reporting" <${process.env.EMAIL_USER}>`,
      to: email, 
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b></p><p>It is valid for 5 minutes.</p>`,
    });

    return otpInstance.id;
  } catch (error) {
    console.log("❌ Error sending OTP:", error);
    return false;
  }
};


export const handleOtp = async (email, otp, id) => {
  if (!email || !otp || !id) {
    return false;
  }
  try {
    const record = await OTP.findOne({
      _id: id,
      email,
      otpCode: otp,
    });

    
    if (record && record.expiresAt > Date.now()) {
      await OTP.deleteOne({ _id: id }); 
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("❌ Error verifying OTP:", error);
    return false;
  }
};
