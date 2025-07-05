import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  try {
    const { wishlistId, name, imageUrl, price } = req.body;
    const product = new Product({
      wishlistId,
      name,
      imageUrl,
      price,
      addedBy: req.body.userId,
    });
    await product.save();
    const io = req.app.get("io");
    io.to(wishlistId.toString()).emit("product-added", product);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error adding product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, price } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        imageUrl,
        price,
        updatedBy: req.body.userId,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await Product.findByIdAndDelete(id);
    const io = req.app.get("io");
    io.to(product.wishlistId.toString()).emit("product-deleted", id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
};

export const getProductsByWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const products = await Product.find({ wishlistId }).populate(
      "addedBy",
      "name email"
    );
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
};
