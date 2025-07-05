import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  wishlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wishlist",
    required: true,
  },
  name: { type: String, required: true },
  imageUrl: String,
  price: Number,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

export default mongoose.model("Product", productSchema);
