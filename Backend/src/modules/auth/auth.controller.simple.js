import { signupService, loginService } from "./auth.service.js";
import prisma from "../../db.js";

// ================= SIMPLE SIGNUP CONTROLLER =================
export const signup = async (req, res, next) => {
  try {
    console.log("Simple signup - request body:", req.body);

    // Direct validation without complex schema
    const { email, password, role, phone, organization } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    // Convert role to uppercase to match frontend lowercase values
    const normalizedRole = role ? role.toUpperCase() : role;

    // Basic role validation
    const allowedRoles = ["TRAINER", "INSTITUTION", "STUDENT"];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be TRAINER, INSTITUTION, or STUDENT",
      });
    }

    // Call service directly
    const result = await signupService({
      email,
      password,
      role: normalizedRole,
      phone,
      organization
    });


    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Simple signup error:", err);
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
};

// ================= SIMPLE LOGIN CONTROLLER =================
export const login = async (req, res, next) => {
  try {
    console.log("Simple login - request body:", req.body);

    // Direct validation without complex schema
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Call service directly
    const result = await loginService({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    console.error("Simple login error:", err);
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Login failed",
    });
  }
};
