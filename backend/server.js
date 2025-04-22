require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

require("./config/connect"); // Ensure this file connects to MongoDB
// routes
const routeruser = require("./routes/user");
const routerproject = require("./routes/project");
const routerservice = require("./routes/service");
const routersite= require("./routes/contentsite");
const contactRouter = require("./routes/contactRouter");
app.use("/api/site", routersite);
app.use("/api/contact", contactRouter)
app.use("/api/service", routerservice);
app.use("/api/user", routeruser);
app.use("/api/project", routerproject);

app.listen(PORT, ()=>{
    console.log("server running on 3000");
});
