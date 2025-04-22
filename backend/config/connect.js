require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB without deprecated options ArASS3uL4BvFZvj2  achrafkhmirii
mongoose.connect("mongodb+srv://achrafkhmirii:ArASS3uL4BvFZvj2@cluster0.tl8m6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Connection error:", error));

// Expose the database connection
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));

module.exports = db;