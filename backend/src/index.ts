import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user-routes.js";
import chatRoutes from "./routes/chat-routes.js";

const app = express();

// === Enable CORS ===
// Required for cross-origin cookies (frontend on Vercel, backend on Render)
app.use(cors({
  origin: true, // e.g., https://legal-assist-frontend-nkut.onrender.com
  credentials: true,
}));

// === Middlewares ===
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET)); // ensure COOKIE_SECRET is set in .env
app.use(morgan("dev"));

// === Routes ===
app.use("/api/user/", userRoutes);
app.use("/api/chat/", chatRoutes);

// === MongoDB & Server Start ===
mongoose
  .connect(process.env.MONGO_URL as string)
  .then(() => {
    const port = process.env.PORT ? Number(process.env.PORT) : 5000;
    app.listen(port, () => {
      console.log(`✅ Server started on port ${port}, MongoDB connected`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
