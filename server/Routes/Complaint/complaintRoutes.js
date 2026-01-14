import express from "express";
import {
  getAllComplaints,
  getComplaintsByDepartment,
  assignComplaint,
  updateComplaintStatus,
  getAvailableWorkers,
  getDepartmentStats,
  autoAssignComplaints
} from "../../controllers/complaintController.js";

const complaintRoute = express.Router();

// Get all complaints with filtering
complaintRoute.get("/", getAllComplaints);

// Get complaints by department
complaintRoute.get("/department/:departmentId", getComplaintsByDepartment);

// Assign complaint to department and worker
complaintRoute.post("/:complaintId/assign", assignComplaint);

// Update complaint status
complaintRoute.patch("/:complaintId/status", updateComplaintStatus);

// Get available workers for a department
complaintRoute.get("/workers/:departmentId", getAvailableWorkers);

// Get department statistics
complaintRoute.get("/stats/:departmentId", getDepartmentStats);

// Auto-assign complaints
complaintRoute.post("/auto-assign", autoAssignComplaints);

export default complaintRoute;