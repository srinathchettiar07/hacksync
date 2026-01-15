// adminRoute.js
import express from "express";
import { Complaint, Department, Staff, Citizen, ComplaintUpvote, ComplaintImage, ComplaintComment, Contract } from "../../models/models.js";
import {addDepartment ,getAllWorkers, getAllDepartments, getStaffCountByDepartment, updateWorkerStatus, getAllStaffWithDetails} from "../../controllers/admincontroller.js";
import { get } from "mongoose";
import pdfUpload from "../../Middlewares/pdfUpload.js";

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

// Get individual complaint details for admin
adminRoute.get("/complaint/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Find complaint with populated citizen info
    const complaint = await Complaint.findById(complaintId)
      .populate('citizenId', 'displayName profilePicture')
      .populate('assignedDepartmentId', 'name');

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Fetch images
    const images = await ComplaintImage.find({ complaintId }).select('imageUrl');

    // Fetch comments with user info
    const comments = await ComplaintComment.find({ complaintId })
      .populate('citizenId', 'displayName')
      .sort({ createdAt: -1 })
      .select('comment createdAt citizenId')
      .lean();

    const formattedComments = comments.map(c => ({
      _id: c._id,
      user: c.citizenId?.displayName || 'Unknown',
      text: c.comment,
      createdAt: c.createdAt
    }));

    // Count upvotes
    const totalUpvotes = await ComplaintUpvote.countDocuments({ complaintId });

    // Analysis data
    const totalImages = images.length;
    const totalComments = comments.length;
    const createdAt = new Date(complaint.createdAt);
    const now = new Date();
    const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    // Comment activity (last 7 days for simplicity)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentComments = await ComplaintComment.find({
      complaintId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    const commentActivity = {
      labels: [],
      counts: []
    };

    // Simple activity: count comments per day
    const activityMap = {};
    recentComments.forEach(comment => {
      const date = comment.createdAt.toISOString().split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      commentActivity.labels.push(dateStr);
      commentActivity.counts.push(activityMap[dateStr] || 0);
    }

    const analysis = {
      totalImages,
      totalComments,
      totalUpvotes,
      ageInDays,
      commentActivity
    };

    res.status(200).json({
      success: true,
      data: {
        complaint: {
          _id: complaint._id,
          category: complaint.category,
          description: complaint.description,
          address: complaint.address,
          locationLat: complaint.locationLat,
          locationLong: complaint.locationLong,
          status: complaint.status,
          priority: complaint.priority,
          createdAt: complaint.createdAt,
          updatedAt: complaint.updatedAt,
          user: {
            name: complaint.citizenId?.displayName || 'Citizen',
            avatar: complaint.citizenId?.profilePicture
          },
          assignedDepartment: complaint.assignedDepartmentId?.name
        },
        images: images.map(img => ({ imageUrl: img.imageUrl })),
        comments: formattedComments,
        analysis
      }
    });

  } catch (error) {
    console.error("Error fetching complaint details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint details",
      error: error.message
    });
  }
});

adminRoute.post("/save-report-metadata", async (req, res) => {
  try {
    console.log("Save report metadata called");
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);
    console.log("Request type:", req.type);

    const {
      project_name,
      budget,
      construction_details,
      department,
      timeline,
      location,
      contractor,
      status,
      gps_coordinates,
      additional_info
    } = req.body;

    // Get admin ID from token (assuming req.user is set by auth middleware)
    const adminId = req.user;

    const existingReport = await Contract.findOne({ project_name });
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "Report with this project name already exists"
      });
    }
    // Create new report metadata entry
    const newReport = new Contract({
      project_name,
      budget,
      construction_details,
      department,
      timeline,
      location,
      contractor,
      status: status || "Active",
      gps_coordinates,
      additional_info
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Report metadata saved successfully",
      data: newReport
    });

  } catch (error) {
    console.error("Error saving report metadata:", error);
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to save report metadata"
    });
  }
});

adminRoute.get("/reports", async (req, res) => {
  try {
    console.log("Fetching all reports");
    const reports = await Contract.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });
  }
});

export default adminRoute;

