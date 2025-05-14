const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Service = require("../models/service");
const User = require("../models/user");

const JWT_SECRET = "your_secret_key";

// إعداد Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    upload_preset: "uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

// تحقق من صلاحيات الأدمن
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

// 🔹 إنشاء خدمة جديدة
router.post("/", verifyAdmin, upload.fields([{ name: "image" }, { name: "icon" }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.files?.image?.[0]?.path;
    const icon = req.files?.icon?.[0]?.path;

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

// 🔹 جلب كل الخدمات
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 تعديل خدمة
router.put("/:id", verifyAdmin, upload.fields([{ name: "image" }, { name: "icon" }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.files?.image?.[0]?.path;
    const icon = req.files?.icon?.[0]?.path;

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

// 🔹 حذف خدمة
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
