import { Complaint, Department, Staff, Citizen, Notification } from "../models/models.js";

// Get all complaints with department-wise filtering
export const getAllComplaints = async (req, res) => {
  try {
    const { departmentId, status, workerId, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (departmentId) filter.assignedDepartmentId = departmentId;
    if (status) filter.status = status;
    if (workerId) filter.assignedStaffId = workerId;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'displayName email phone')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Failed to fetch complaints" });
  }
};

// Get complaints by department
export const getComplaintsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const complaints = await Complaint.find({ assignedDepartmentId: departmentId })
      .populate('citizenId', 'displayName email phone')
      .populate('assignedStaffId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error("Error fetching department complaints:", error);
    res.status(500).json({ success: false, message: "Failed to fetch department complaints" });
  }
};

// Assign complaint to department and worker
export const assignComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { departmentId, staffId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ success: false, message: "Department ID is required" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    // Check if staff exists and belongs to the department
    let staff = null;
    if (staffId) {
      staff = await Staff.findById(staffId);
      if (!staff) {
        return res.status(404).json({ success: false, message: "Staff member not found" });
      }
      if (staff.departmentId.toString() !== departmentId) {
        return res.status(400).json({ success: false, message: "Staff member does not belong to this department" });
      }
    }

    // Update complaint
    complaint.assignedDepartmentId = departmentId;
    complaint.assignedStaffId = staffId || null;
    complaint.status = staffId ? "In Progress" : "Pending";
    
    await complaint.save();

    // Update staff workload if assigned
    if (staff) {
      staff.currentWorkload = (staff.currentWorkload || 0) + 1;
      staff.isFree = staff.currentWorkload < (staff.maxWorkload || 5);
      await staff.save();

      // Send notification to worker
      const notification = new Notification({
        userId: staff._id,
        type: 'complaint_assigned',
        title: 'New Complaint Assigned',
        message: `You have been assigned a new ${complaint.category} complaint. Please review and take action.`,
        data: {
          complaintId: complaint._id,
          category: complaint.category,
          priority: complaint.priority
        }
      });
      await notification.save();
    }

    // Populate the updated complaint
    const updatedComplaint = await Complaint.findById(complaintId)
      .populate('citizenId', 'displayName email phone')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email');

    res.json({
      success: true,
      message: "Complaint assigned successfully",
      data: updatedComplaint
    });
  } catch (error) {
    console.error("Error assigning complaint:", error);
    res.status(500).json({ success: false, message: "Failed to assign complaint" });
  }
};

// Update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    await complaint.save();

    // Update staff workload if resolved
    if (status === "Resolved" && complaint.assignedStaffId) {
      const staff = await Staff.findById(complaint.assignedStaffId);
      if (staff) {
        staff.currentWorkload = Math.max(0, (staff.currentWorkload || 0) - 1);
        staff.isFree = staff.currentWorkload < (staff.maxWorkload || 5);
        await staff.save();

        // Send notification to worker about resolution
        const notification = new Notification({
          userId: staff._id,
          type: 'complaint_resolved',
          title: 'Complaint Resolved',
          message: `Great job! The ${complaint.category} complaint has been marked as resolved.`,
          data: {
            complaintId: complaint._id,
            category: complaint.category
          }
        });
        await notification.save();
      }
    }

    const updatedComplaint = await Complaint.findById(complaintId)
      .populate('citizenId', 'displayName email phone')
      .populate('assignedDepartmentId', 'name')
      .populate('assignedStaffId', 'name email');

    res.json({
      success: true,
      message: "Complaint status updated successfully",
      data: updatedComplaint
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ success: false, message: "Failed to update complaint status" });
  }
};

// Get available workers for a department
export const getAvailableWorkers = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const workers = await Staff.find({ 
      departmentId: departmentId,
      role: "Worker"
    }).select('name email isFree currentWorkload maxWorkload');

    res.json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error("Error fetching available workers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch workers" });
  }
};

// Get department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const stats = await Complaint.aggregate([
      { $match: { assignedDepartmentId: departmentId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalComplaints = await Complaint.countDocuments({ assignedDepartmentId: departmentId });
    const totalWorkers = await Staff.countDocuments({ departmentId: departmentId, role: "Worker" });
    const availableWorkers = await Staff.countDocuments({ 
      departmentId: departmentId, 
      role: "Worker", 
      isFree: true 
    });

    const statusCounts = {
      Pending: 0,
      "In Progress": 0,
      Resolved: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        totalComplaints,
        statusCounts,
        totalWorkers,
        availableWorkers
      }
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch department statistics" });
  }
};

// Auto-assign complaints based on category
export const autoAssignComplaints = async (req, res) => {
  try {
    const unassignedComplaints = await Complaint.find({
      assignedDepartmentId: null,
      status: "Pending"
    });

    const assignments = [];

    for (const complaint of unassignedComplaints) {
      // Find department based on category
      const department = await Department.findOne({ name: complaint.category });
      
      if (department) {
        // Find available worker in that department
        const availableWorker = await Staff.findOne({
          departmentId: department._id,
          role: "Worker",
          isFree: true
        });

        if (availableWorker) {
          complaint.assignedDepartmentId = department._id;
          complaint.assignedStaffId = availableWorker._id;
          complaint.status = "In Progress";
          await complaint.save();

          // Update worker workload
          availableWorker.currentWorkload = (availableWorker.currentWorkload || 0) + 1;
          availableWorker.isFree = availableWorker.currentWorkload < (availableWorker.maxWorkload || 5);
          await availableWorker.save();

          assignments.push({
            complaintId: complaint._id,
            departmentId: department._id,
            staffId: availableWorker._id
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Auto-assigned ${assignments.length} complaints`,
      data: assignments
    });
  } catch (error) {
    console.error("Error auto-assigning complaints:", error);
    res.status(500).json({ success: false, message: "Failed to auto-assign complaints" });
  }
};