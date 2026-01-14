import{ Staff ,Department} from "../models/models.js";
import nodemailer from "nodemailer"; // to send mail
import crypto from "crypto";

export const addDepartment = async (req, res) => {
    try {
        const { name, description, headEmail } = req.body;

        if (!name || !headEmail) {
            return res.status(400).json({ success: false, message: "Department name and staffEmail are required" });
        }
        // Check if department already exists
        const existingDept = await Department.findOne({ name });
        if (existingDept) {
            return res.status(400).json({ success: false, message: "Department already exists" });
        }

        // Check if staff exists
        const staff = await Staff.findOne({ email: headEmail });
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff with this email not found" });
        }

        // Create Department
        const newDept = new Department({ name, description, DepartmentHead: staff._id });

        // Update staff role
        staff.role = "DepartmentHead";
        staff.departmentId = newDept._id;
        staff.isFree = false;

        // Generate a temporary password (or reset token)
        // const tempPassword = crypto.randomBytes(6).toString("hex");
        // staff.password = tempPassword; // ⚠️ in real apps: hash before saving
        await staff.save();
        await newDept.save();

        // Send email
        // const transporter = nodemailer.createTransport({
        //     service: "gmail", // or your SMTP service
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS,
        //     },
        // });

        // await transporter.sendMail({
        //     from: `"Admin" <${process.env.EMAIL_USER}>`,
        //     to: staff.email,
        //     subject: "You are assigned as Department Head",
        //     text: `Hello ${staff.name},\n\nYou have been assigned as the Department Head for ${name}.\n\nYour temporary password is: ${tempPassword}\nPlease login and update it immediately.\n\nRegards,\nCollege Admin`,
        // });
        return res.status(201).json({
            success: true,
            message: "Department created and staff assigned as Department Head",
            data: { department: newDept, head: staff.email }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


export const getAllWorkers = async (req, res) => {
  try {
    const workers = await Staff.find({ role: "Worker" }).select("name email");
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching workers" });
  }
};

export const getAllDepartments = async (req, res) => {
    console.log("Fetching all departments with their heads...");
     try {
   const dep = await Department.find()
  .populate("DepartmentHead", "name email phone profilePicture role");

   res.json({
      success: true,
      data: dep
    });
    console.log(dep);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching departments with heads",
      details: error.message,
    });
  }
};

export const getStaffCountByDepartment = async (req, res) => {
    const { departmentId } = req.params;
    try {
        const count = await Staff.countDocuments({ departmentId });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Error fetching staff count" });
    }
};

export const updateWorkerStatus = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { status } = req.body;

        const worker = await Staff.findById(workerId);
        if (!worker) {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        // Update worker status based on the provided status
        if (status === 'available') {
            worker.isFree = true;
        } else if (status === 'busy') {
            worker.isFree = false;
        }

        await worker.save();

        res.json({
            success: true,
            message: "Worker status updated successfully",
            data: worker
        });
    } catch (error) {
        console.error("Error updating worker status:", error);
        res.status(500).json({ success: false, message: "Failed to update worker status" });
    }
};

export const getAllStaffWithDetails = async (req, res) => {
    try {
        const { departmentId, status } = req.query;
        
        // Build filter object
        const filter = {};
        if (departmentId) filter.departmentId = departmentId;
        if (status === 'available') filter.isFree = true;
        if (status === 'busy') filter.isFree = false;

        const staff = await Staff.find(filter)
            .populate('departmentId', 'name')
            .select('name email phone role departmentId isFree currentWorkload maxWorkload');

        res.json(staff);
    } catch (error) {
        console.error("Error fetching staff with details:", error);
        res.status(500).json({ error: "Error fetching staff details" });
    }
};
