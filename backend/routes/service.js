const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const JWT_SECRET = "your_secret_key";
const Service = require("../models/service");
const User = require("../models/user");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in the "uploads" folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Rename file to avoid conflicts
  },
});

const upload = multer({ storage: storage });

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST route to create a new service
router.post("/", verifyAdmin, upload.fields([{ name: "image" }, { name: "icon" }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.files?.image ? req.files.image[0].path : null;
    const icon = req.files?.icon ? req.files.icon[0].path : null;

    if (!title || !description || !image || !icon) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const service = new Service({ title, description, icon, image });
    await service.save();

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route to fetch all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT route to update a service
router.put("/:id", verifyAdmin, upload.fields([{ name: "image" }, { name: "icon" }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.files?.image ? req.files.image[0].path : null;
    const icon = req.files?.icon ? req.files.icon[0].path : null;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (title) service.title = title;
    if (description) service.description = description;
    if (image) service.image = image;
    if (icon) service.icon = icon;

    await service.save();
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE route to delete a service
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;