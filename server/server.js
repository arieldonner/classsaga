const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();

const authRoutes = require("./routes/authRoutes");
const classroomRoutes = require("./routes/classroomRoutes");
const pointRoutes = require("./routes/pointRoutes");
const petRoutes = require("./routes/petRoutes");
const shopRoutes = require("./routes/shopRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

//MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.status(200).send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/inventory", inventoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
