import { Router } from "express";
import bcrypt from "bcrypt";
import { Staff } from "../../models/models.js";
import { generateToken } from "../../Utils/token.js";

const staffAuthRoute = Router();

// Staff Signup (For testing purposes)
staffAuthRoute.post("/signup", async (req, res) => {
    try {
        const { name, email, phone, password, role, departmentId } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, email, password, and role are required" 
            });
        }

        // Validate role
        const validRoles = ["Admin", "DepartmentHead", "Worker"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid role. Must be Admin, DepartmentHead, or Worker" 
            });
        }

        // Check if staff already exists
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already registered" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new staff
        const newStaff = await Staff.create({
            name,
            email,
            phone: phone || "",
            password: hashedPassword,
            role,
            departmentId: departmentId || null
        });

        // Prepare response data (excluding password)
        const { password: _, ...staffData } = newStaff.toObject();
        
        // Generate token
        const token = generateToken(newStaff._id, role);

        res.status(201).json({
            success: true,
            message: "Staff registered successfully",
            token,
            staff: staffData,
        });
    } catch (error) {
        console.error("❌ Staff Signup Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during registration" 
        });
    }
});

// Staff Login (Updated with role validation)
staffAuthRoute.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, password, and role are required" 
            });
        }

        // Check if role is valid
        const validRoles = ["Admin", "DepartmentHead", "Worker"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid role specified" 
            });
        }

        // Find staff by email
        const staff = await Staff.findOne({ email }).populate("departmentId", "name");
        if (!staff) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Verify role matches
        if (staff.role !== role) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. This account is registered as ${staff.role}, not ${role}.` 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, staff.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        // Prepare response data
        const { password: _, ...staffData } = staff.toObject();
        
        // Generate token
        const token = generateToken(staff._id, staff.role);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            staff: staffData,
        });
    } catch (error) {
        console.error("❌ Staff Login Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

export default staffAuthRoute;