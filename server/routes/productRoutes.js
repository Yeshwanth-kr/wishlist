import express from "express";

import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsByWishlist,
} from "../controllers/productController.js";
import verify from "../middleware/verify.js";

const router = express.Router();

router.post("/", verify, addProduct);
router.put("/:id", verify, updateProduct);
router.delete("/:id", verify, deleteProduct);
router.get("/wishlist/:wishlistId", verify, getProductsByWishlist);

export default router;
