const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key";
const multer = require("multer");
const Project = require("../models/project");
const User = require("../models/user");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// POST route to add a project
router.post("/", upload.single("image"), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      const { title, description } = req.body;
      const image = req.file?.path; // Use optional chaining
      if (!image) return res.status(400).json({ message: "Image is required" });

      const project = new Project({ title, description, image });
      await project.save(); // Save to database
      res.status(201).json(project); // Return the saved project
    } else {
      res.status(403).json({ message: "Only admins can add projects" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects); // Fixed variable name
  } catch (err) {
    res.status(500).json({ error: err.message }); // Fixed error variable
  }
});

// Update project
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id); // Fixed: Added await and findById
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      const project = await Project.findById(req.params.id); // Fixed method
      if (!project) return res.status(404).json({ message: "Project not found" });

      // Update fields
      if (req.body.title) project.title = req.body.title;
      if (req.body.description) project.description = req.body.description;
      if (req.file) project.image = req.file.path;

      await project.save();
      res.status(200).json(project);
    } else {
      res.status(403).json({ message: "Only admins can update projects" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message }); // Fixed error variable
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.status(200).json({ message: "Project deleted successfully" }); // Fixed message
    } else {
      res.status(403).json({ message: "Only admins can delete projects" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message }); // Fixed error variable and status code
  }
});

module.exports = router;