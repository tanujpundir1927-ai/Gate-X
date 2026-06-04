require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const connectDB = require("./config/db");
const User = require("./models/User");
const Counter = require("./models/Counter");
const { sendPassEmail } = require("./utils/email");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "gatexsecretjwtkey123";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

// Root endpoint
app.get("/", (req, res) => {
  res.send("GateX Server is Running");
});

// Admin Login
app.post("/api/admin-login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid admin password" });
  }
});

// User Registration
app.post("/api/register", async (req, res) => {
  const { name, email, collegeId, branch, password } = req.body;

  if (!name || !email || !collegeId || !branch || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get sequential serial number
    const counter = await Counter.findOneAndUpdate(
      { id: "serialNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const formattedSeq = String(counter.seq).padStart(6, "0");
    const serialNumber = `GTX-2026-${formattedSeq}`;

    // Prepare QR payload
    const qrPayload = JSON.stringify({
      serialNumber,
      name,
      email,
      collegeId,
      branch
    });

    // Generate dynamic QR image data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    // Create and save User
    const newUser = new User({
      serialNumber,
      name,
      email,
      collegeId,
      branch,
      password: hashedPassword,
      qrCode: qrCodeDataUrl,
      used: false,
    });

    await newUser.save();

    // Trigger mock/SMTP email dispatch in background (don't block response)
    sendPassEmail({
      name,
      email,
      serialNumber,
      collegeId,
      branch,
      qrCode: qrCodeDataUrl,
    }).catch(err => console.error("Email send failed background task:", err));

    res.status(201).json({
      message: "User registered successfully! Check your email for the entry pass.",
      serialNumber,
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Scan Validation Endpoint
app.post("/api/scanner/validate", async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    return res.status(400).json({ message: "No QR code data provided" });
  }

  try {
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({ message: "INVALID QR ❌ (Unable to parse payload)" });
    }

    const { serialNumber, name, collegeId } = parsedData;

    if (!serialNumber) {
      return res.status(400).json({ message: "INVALID QR ❌ (Missing serial number)" });
    }

    // Find the user
    const user = await User.findOne({ serialNumber });
    if (!user) {
      return res.status(404).json({ message: "INVALID QR ❌ (Attendee not found)" });
    }

    // Double check details match roughly
    if (user.collegeId !== collegeId || user.name !== name) {
      return res.status(400).json({ message: "INVALID QR ❌ (Ticket details mismatch)" });
    }

    if (user.used) {
      const scanTimeStr = user.scannedAt ? new Date(user.scannedAt).toLocaleTimeString() : "previously";
      return res.status(400).json({
        message: "ALREADY USED ❌",
        user: {
          name: user.name,
          collegeId: user.collegeId,
          branch: user.branch,
          serialNumber: user.serialNumber,
          scannedAt: user.scannedAt
        }
      });
    }

    // Mark as used
    user.used = true;
    user.scannedAt = new Date();
    await user.save();

    return res.json({
      message: "VALID ENTRY ✅",
      user: {
        name: user.name,
        collegeId: user.collegeId,
        branch: user.branch,
        serialNumber: user.serialNumber,
        scannedAt: user.scannedAt
      }
    });

  } catch (error) {
    console.error("Scanner validation error:", error);
    return res.status(500).json({ message: "Server error during validation" });
  }
});

// Admin Dashboard stats
app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usedEntries = await User.countDocuments({ used: true });
    const remainingEntries = totalUsers - usedEntries;

    // Today's registrations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRegistrations = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Registrations timeline (past 7 days)
    const registrationsTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      
      const count = await User.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      
      const dayLabel = start.toLocaleDateString("en-US", { weekday: "short" });
      registrationsTimeline.push({ day: dayLabel, count });
    }

    // Scans timeline (past 7 hours or overall trends)
    // We will just send the counts of used and remaining for the trend chart
    const trends = [
      { name: "Scanned", value: usedEntries },
      { name: "Unscanned", value: remainingEntries }
    ];

    res.json({
      totalUsers,
      usedEntries,
      remainingEntries,
      todayRegistrations,
      timeline: registrationsTimeline,
      trends
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

// Admin User list with search and filter
app.get("/api/admin/users", authMiddleware, async (req, res) => {
  const { search, status } = req.query;

  try {
    let query = {};

    // Apply status filter
    if (status === "used") {
      query.used = true;
    } else if (status === "unused") {
      query.used = false;
    }

    // Apply search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { collegeId: searchRegex },
        { serialNumber: searchRegex }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Admin Reset Scan Status
app.post("/api/admin/users/:id/reset", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.used = false;
    user.scannedAt = undefined;
    await user.save();

    res.json({ message: `Scan status reset for ${user.name}`, user });
  } catch (error) {
    console.error("Error resetting scan status:", error);
    res.status(500).json({ message: "Failed to reset status" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});