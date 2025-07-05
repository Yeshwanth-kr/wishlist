import Wishlist from "../models/Wishlist.js";
import User from "../models/User.js";

export const createWishlist = async (req, res) => {
  try {
    const title = req.body.title;
    const wishlist = new Wishlist({
      title,
      createdBy: req.body.userId,
      members: req.body.users.id,
    });
    await wishlist.save();
    const io = req.app.get("io");
    io.to(req.body.userId.toString()).emit("wishlist-created", wishlist); // only to creator
    res.status(201).json(wishlist);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating wishlist" });
  }
};

export const getUserWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ members: req.body.userId });
    res.status(200).json(wishlists);
  } catch (err) {
    res.status(500).json({ message: "Error fetching wishlists" });
  }
};

export const deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const wishlist = await Wishlist.findOneAndDelete({
      _id: id,
      createdBy: req.body.userId,
    });
    if (!wishlist)
      return res
        .status(404)
        .json({ message: "Wishlist not found or unauthorized" });
    const io = req.app.get("io");
    io.emit("wishlist-deleted", id);
    res.status(200).json({ message: "Wishlist deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting wishlist" });
  }
};

export const inviteMember = async (req, res) => {
  const wishlistId = req.params.id;
  const { email } = req.body;

  try {
    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });
    if (!wishlist.createdBy.equals(req.body.userId)) {
      return res
        .status(403)
        .json({ message: "Only the owner can invite members" });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite)
      return res.status(404).json({ message: "User not found" });

    if (wishlist.members.includes(userToInvite._id)) {
      return res.status(409).json({ message: "User already a member" });
    }

    wishlist.members.push(userToInvite._id);
    await wishlist.save();
    const io = req.app.get("io");
    io.to(userToInvite._id.toString()).emit("wishlist-invited", wishlist);
    res.status(200).json({ message: "User invited successfully", wishlist });
  } catch (err) {
    console.error("Invite Error:", err);
    res.status(500).json({ message: "Server error inviting member" });
  }
};
