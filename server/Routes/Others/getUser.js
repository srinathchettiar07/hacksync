import { Router } from "express";
import { Citizen, Staff } from "../../models/models.js";

const getUserRoute = Router();

getUserRoute.get("/get-user", async (req, res) => {
  const userId = req.user; 
  const type = req.type;   
  
    

  if (!userId || !type) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Missing user info",
    });
  }

  try {
    if (type === "Citizen") {
      const citizen = await Citizen.findById(userId).select("-password -_id");
      if (!citizen) {
        return res.status(404).json({ success: false, message: "Citizen not found" });
      }
      return res.status(200).json({
        success: true,
        type,
        user: citizen,
      });
    } else if (["Admin", "DepartmentHead", "Worker"].includes(type)) {
      const staff = await Staff.findById(userId).select("-password -_id");
      if (!staff) {
        return res.status(404).json({ success: false, message: "Staff not found" });
      }
      return res.status(200).json({
        success: true,
        type,
        user: staff,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default getUserRoute;
