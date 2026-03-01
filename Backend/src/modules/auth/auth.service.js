import client from "../../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

const JWT_OPTIONS = {
  expiresIn: "15m", // short-lived access token
  issuer: process.env.JWT_ISSUER || "trainer-platform",
  audience: process.env.JWT_AUDIENCE || "trainer-users",
};

// ================= SIGNUP SERVICE =================
export const signupService = async ({ email, password, role }) => {
  if (!email || !password || !role) {
    throw new AppError("Missing required fields", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Prevent role escalation
  const allowedRoles = ["TRAINER", "INSTITUTION", "STUDENT"];
  if (!allowedRoles.includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  const existingUser = await client.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const createdUser = await client.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const token = jwt.sign(
    {
      userId: createdUser.id,
      role: createdUser.role,
    },
    process.env.JWT_SECRET,
    JWT_OPTIONS,
  );

  // Debug logging
  console.log(
    "Generated token for user:",
    createdUser.email,
    "Role:",
    createdUser.role,
  );
  console.log("JWT_SECRET set:", process.env.JWT_SECRET ? "YES" : "NO");
  console.log("JWT_ISSUER:", process.env.JWT_ISSUER);
  console.log("JWT_AUDIENCE:", process.env.JWT_AUDIENCE);

  return {
    token,
    user: {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
    },
  };
};

// ================= LOGIN SERVICE =================
export const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Missing credentials", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await client.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Prevent user enumeration
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Suspended or soft-deleted check
  if (user.deletedAt) {
    throw new AppError("Account inactive", 403);
  }

  if (user.isSuspended) {
    throw new AppError("Account suspended", 403);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    JWT_OPTIONS,
  );

  // Debug logging
  console.log(
    "Generated login token for user:",
    user.email,
    "Role:",
    user.role,
  );
  console.log("JWT_SECRET set:", process.env.JWT_SECRET ? "YES" : "NO");
  console.log("JWT_ISSUER:", process.env.JWT_ISSUER);
  console.log("JWT_AUDIENCE:", process.env.JWT_AUDIENCE);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};
