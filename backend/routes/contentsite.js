const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Site = require("../models/contentsite");
const User = require("../models/user");

const JWT_SECRET = "your_secret_key"; // Use environment variable in production

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

// Middleware to verify admin permissions
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

// Add site data
router.post(
  "/",
  verifyAdmin,
  upload.fields([
    { name: "logoheader", maxCount: 1 },
    { name: "logohero", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        siteName,
        siteDescription,
        hero,
        footer,
        contactEmail,
        emailuser,
        passworduser,
        selected,
      } = req.body;

      const logoheader = req.files?.logoheader?.[0]?.path;
      const logohero = req.files?.logohero?.[0]?.path;

      if (!logoheader || !logohero) {
        return res
          .status(400)
          .json({ message: "Both logoheader and logohero are required" });
      }

      if (selected === "selected") {
        const alreadySelected = await Site.findOne({ selected: "selected" });
        if (alreadySelected) {
          return res
            .status(400)
            .json({ message: "Another site is already selected. Please deselect it first." });
        }
      }

      const site = new Site({
        siteName,
        siteDescription,
        hero,
        footer,
        contactEmail,
        emailuser,
        passworduser,
        logoheader,
        logohero,
        selected: selected || "not selected",
      });

      await site.save();
      res.status(201).json(site);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get all sites
router.get("/", async (req, res) => {
  try {
    const sites = await Site.find();
    res.status(200).json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get selected site
router.get("/selected", async (req, res) => {
  try {
    const site = await Site.findOne({ selected: "selected" });
    if (!site) return res.status(404).json({ message: "No site selected" });

    res.status(200).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update site
router.put(
  "/:id",
  verifyAdmin,
  upload.fields([
    { name: "logoheader", maxCount: 1 },
    { name: "logohero", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        siteName,
        siteDescription,
        hero,
        footer,
        contactEmail,
        emailuser,
        passworduser,
        selected,
      } = req.body;

      const logoheader = req.files?.logoheader?.[0]?.path;
      const logohero = req.files?.logohero?.[0]?.path;

      const site = await Site.findById(req.params.id);
      if (!site) return res.status(404).json({ message: "Site not found" });

      if (siteName) site.siteName = siteName;
      if (siteDescription) site.siteDescription = siteDescription;
      if (hero) site.hero = hero;
      if (footer) site.footer = footer;
      if (contactEmail) site.contactEmail = contactEmail;
      if (emailuser) site.emailuser = emailuser;
      if (passworduser) site.passworduser = passworduser;
      if (logoheader) site.logoheader = logoheader;
      if (logohero) site.logohero = logohero;
      if (selected) site.selected = selected;

      await site.save();
      res.status(200).json(site);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Select site
router.put("/:id/select", verifyAdmin, async (req, res) => {
  try {
    await Site.updateMany({}, { selected: "not selected" });
    const site = await Site.findByIdAndUpdate(
      req.params.id,
      { selected: "selected" },
      { new: true }
    );

    if (!site) return res.status(404).json({ message: "Site not found" });

    res.status(200).json({ message: "Site selected successfully", site });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deselect site
router.put("/:id/deselect", verifyAdmin, async (req, res) => {
  try {
    const site = await Site.findByIdAndUpdate(
      req.params.id,
      { selected: "not selected" },
      { new: true }
    );

    if (!site) return res.status(404).json({ message: "Site not found" });

    res.status(200).json({ message: "Site deselected successfully", site });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete site
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) return res.status(404).json({ message: "Site not found" });

    res.status(200).json({ message: "Site deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
