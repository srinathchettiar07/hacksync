// adminRoute.js
import express from "express";
import { Complaint, Department, Staff, Citizen, ComplaintUpvote } from "../../models/models.js";
import {addDepartment ,getAllWorkers, getAllDepartments, getStaffCountByDepartment, updateWorkerStatus, getAllStaffWithDetails} from "../../controllers/admincontroller.js";
import { get } from "mongoose";

const adminRoute = express.Router();

// GET Complete Dashboard Data (Single Route)
adminRoute.get("/dashboard", async (req, res) => {
  try {
    // 1. HIGH-LEVEL SUMMARY (KPIs)
    const totalComplaints = await Complaint.countDocuments();

    // Complaints by Status
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusSummary = statusCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, { Pending: 0, "In Progress": 0, Resolved: 0 });

    // Today's Activity
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const newToday = await Complaint.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const resolvedToday = await Complaint.countDocuments({
      status: "Resolved",
      updatedAt: { $gte: startOfToday, $lte: endOfToday }
    });

    // Average Resolution Time
    const resolvedComplaints = await Complaint.find({ status: "Resolved" }).select("createdAt updatedAt");
    let totalResolutionTime = 0;
    resolvedComplaints.forEach(complaint => {
      totalResolutionTime += (complaint.updatedAt - complaint.createdAt) / (1000 * 60 * 60);
    });
    const avgResolutionTime = resolvedComplaints.length > 0 ? (totalResolutionTime / resolvedComplaints.length).toFixed(2) : 0;

    // System Overview
    const totalCitizens = await Citizen.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalDepartments = await Department.countDocuments();

    // 2. RECENT & HIGH-PRIORITY COMPLAINTS (for the table)
    const recentComplaints = await Complaint.find()
      .populate('citizenId', 'displayName')
      .populate('assignedDepartmentId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 3. ANALYTICS & CHARTS DATA
    // Complaints by Category
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Complaints Over Time (Last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const complaintsOverTime = await Complaint.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Department Performance (Top 5)
    const departmentPerformance = await Complaint.aggregate([
      { $match: { assignedDepartmentId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$assignedDepartmentId",
          totalAssigned: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } }
        }
      },
      { $sort: { totalAssigned: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "departmentInfo"
        }
      },
      { $unwind: "$departmentInfo" },
      {
        $project: {
          departmentName: "$departmentInfo.name",
          totalAssigned: 1,
          resolved: 1,
          resolutionRate: { 
            $cond: [
              { $eq: ["$totalAssigned", 0] }, 
              0, 
              { $multiply: [{ $divide: ["$resolved", "$totalAssigned"] }, 100] }
            ]
          }
        }
      }
    ]);

    // 4. MAP DATA (Essential fields only)
    const mapComplaints = await Complaint.find(
      { locationLat: { $ne: null }, locationLong: { $ne: null } },
      { _id: 1, category: 1, status: 1, priority: 1, locationLat: 1, locationLong: 1, address: 1, createdAt: 1 }
    ).limit(100); // Limit for initial load, can be paginated later

    // 5. HOT ISSUES (Most upvoted complaints)
    const hotIssues = await ComplaintUpvote.aggregate([
      { $group: { _id: "$complaintId", upvotes: { $sum: 1 } } },
      { $sort: { upvotes: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "complaints",
          localField: "_id",
          foreignField: "_id",
          as: "complaintDetails"
        }
      },
      { $unwind: "$complaintDetails" },
      {
        $project: {
          _id: 1,
          upvotes: 1,
          category: "$complaintDetails.category",
          description: "$complaintDetails.description",
          status: "$complaintDetails.status"
        }
      }
    ]);

    // Send all data in one response
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalComplaints,
          statusSummary,
          todayActivity: { new: newToday, resolved: resolvedToday },
          avgResolutionTime,
          systemOverview: { totalCitizens, totalStaff, totalDepartments }
        },
        recentComplaints,
        analytics: {
          byCategory: complaintsByCategory,
          overTime: complaintsOverTime,
          departmentPerformance
        },
        mapData: mapComplaints,
        hotIssues
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load dashboard data",
      error: error.message 
    });
  }
});

adminRoute.get("/map", async (req, res) => {
  try {
    const complaints = await Complaint.find(
      { locationLat: { $ne: null }, locationLong: { $ne: null } }, 
      "locationLat locationLong category description status"
    );
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});






//Srinath

adminRoute.post("/add-department", addDepartment);
adminRoute.get("/workers", getAllStaffWithDetails);
adminRoute.get("/departments",getAllDepartments);
adminRoute.get("/department/:departmentId/count", getStaffCountByDepartment);
adminRoute.patch("/workers/:workerId/status", updateWorkerStatus);
export default adminRoute;