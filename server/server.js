//package imports
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv/config";

//other imports
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

//Middleware
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;

//routing
app.use("/api/auth", authRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/products", productRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection error: ", err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
//
io.on("connection", (socket) => {
  socket.on("register-user", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on("join-wishlist", (wishlistId) => {
    socket.join(wishlistId);
  });

  socket.on("disconnect", () => {});
});

app.set("io", io); // make it available to routes/controllers

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
