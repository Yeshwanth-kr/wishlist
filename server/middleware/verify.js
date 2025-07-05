import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verify = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  } else {
    try {
      if (!req.body) {
        req.body = { ...req.body, userId: "" };
      } else {
        if (!req.body.userId) {
          req.body = { ...req.body, userId: "" };
        }
      }
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      if (!decoded) {
        return res.status(401).json({ message: "Token authorization failed" });
      } else {
        req.body.userId = decoded._id;

        next();
      }
    } catch (error) {
      console.log("Error in verify middleware: ", error);
    }
  }
};

export default verify;
