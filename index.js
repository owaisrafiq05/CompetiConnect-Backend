import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import SettingRoute from './routes/settingRoute.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-resume-analyzer";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Handle MongoDB events
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Basic Routes
app.get("/", (req, res) => {
  res.json({ message: "AI Resume Analyzer API Running" });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({
    server: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Auth Routes
app.use("/auth", authRoutes);
app.use("/setting", SettingRoute);

// New Route to get competitions from MongoDB
app.get("/competition", async (req, res) => {
  try {
    const competitions = await mongoose.connection.db.collection('competitions').find().toArray();
    res.status(200).json(competitions);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch the competitions" });
  }
});

// New Route to get competitions from MongoDB
app.get("/users", async (req, res) => {
  try {
    const competitions = await mongoose.connection.db.collection('registeredTeams').find().toArray();
    res.status(200).json(competitions);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch the competitions" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🔌 Database: ${MONGODB_URI}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit the process in production, just log the error
});
