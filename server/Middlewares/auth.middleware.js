import { isTokenValid } from "../Utils/token.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Allow access to auth routes, OTP routes, and public posts without authentication
    if (req.path.startsWith("/auth") || req.path.startsWith("/otp")) {
      return next();
    }    

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    const decoded = isTokenValid(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const userId = decoded.userId;
    const type = decoded.type;

    req.user = userId;
    req.type = type;

    next(); 
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};