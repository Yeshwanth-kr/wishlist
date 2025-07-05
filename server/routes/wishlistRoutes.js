import express from "express";

import {
  createWishlist,
  getUserWishlists,
  deleteWishlist,
  inviteMember,
} from "../controllers/wishlistController.js";
import verify from "../middleware/verify.js";

const router = express.Router();

router.post("/", verify, createWishlist);
router.get("/", verify, getUserWishlists);
router.delete("/:id", verify, deleteWishlist);
router.post("/:id/invite", verify, inviteMember);

export default router;
