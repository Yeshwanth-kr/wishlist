import express from "express";

const router = express.Router();
import { signup, login, userinfo, logout } from "../controllers/authController.js";
import verify from "../middleware/verify.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/userinfo", verify, userinfo);
router.post("/logout", verify, logout);

export default router;
