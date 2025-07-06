import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import socket from "../socket.js";

export default function Dashboard() {
  const [wishlists, setWishlists] = useState([]);
  const [activeWishlistId, setActiveWishlistId] = useState(null);
  const [products, setProducts] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    name: "",
    imageUrl: "",
    price: "",
  });
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const getUserId = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL}/api/auth/userinfo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data = await res.json();
        const userId = data._id;
        if (userId) {
          socket.emit("register-user", userId);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getUserId();

    fetchWishlists();
  }, []);

  useEffect(() => {
    if (!activeWishlistId) return;

    const handleNewProduct = (product) => {
      setProducts((prev) => [...prev, product]);
    };

    const handleProductDeleted = (deletedId) => {
      setProducts((prev) => prev.filter((p) => p._id !== deletedId));
    };

    socket.on("product-added", handleNewProduct);
    socket.on("product-deleted", handleProductDeleted);

    return () => {
      socket.off("product-added", handleNewProduct);
      socket.off("product-deleted", handleProductDeleted);
    };
  }, [activeWishlistId]);

  useEffect(() => {
    const handleWishlistInvited = (newWishlist) => {
      setWishlists((prev) => [...prev, newWishlist]);
    };

    const handleWishlistDeleted = (deletedId) => {
      setWishlists((prev) => prev.filter((w) => w._id !== deletedId));

      // If the deleted wishlist was currently open, close it
      if (activeWishlistId === deletedId) {
        setActiveWishlistId(null);
        setProducts([]);
      }
    };

    socket.on("wishlist-invited", handleWishlistInvited);
    socket.on("wishlist-deleted", handleWishlistDeleted);

    return () => {
      socket.off("wishlist-invited", handleWishlistInvited);
      socket.off("wishlist-deleted", handleWishlistDeleted);
    };
  }, [activeWishlistId]);

  const fetchWishlists = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/api/wishlists`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch wishlists");
      }

      const data = await res.json();
      setWishlists(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateWishlist = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/api/wishlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle,
          users: { id: ["6867e1bae04499f4230ca845"] },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create wishlist");
      }

      setNewTitle("");
      await fetchWishlists(); // Refresh list
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleProducts = async (wishlistId) => {
    if (activeWishlistId === wishlistId) {
      setActiveWishlistId(null);
      setProducts([]);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_URL}/api/products/wishlist/${wishlistId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setProducts(data);
      setActiveWishlistId(wishlistId);
      socket.emit("join-wishlist", wishlistId);
    } catch {
      toast.error("Failed to load products");
    }
  };

  const handleProductChange = (e) => {
    setNewProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { name, imageUrl, price } = newProduct;
    try {
      await fetch(`${process.env.REACT_APP_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          imageUrl,
          price: parseFloat(price),
          wishlistId: activeWishlistId,
        }),
      });

      const res = await fetch(
        `${process.env.REACT_APP_URL}/api/products/wishlist/${activeWishlistId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      setProducts(data);
      setNewProduct({ name: "", imageUrl: "", price: "" });
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await fetch(`${process.env.REACT_APP_URL}/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleLogout = async () => {
    logout(); // clears token in context
    await fetch(`${process.env.REACT_APP_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    localStorage.removeItem("token"); // just in case
    navigate("/login");
  };

  const handleDeleteWishlist = async (wishlistId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_URL}/api/wishlists/${wishlistId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Delete failed");
      }

      // Remove from state
      setWishlists((prev) => prev.filter((w) => w._id !== wishlistId));

      // If active wishlist was deleted, reset state
      if (activeWishlistId === wishlistId) {
        setActiveWishlistId(null);
        setProducts([]);
      }
    } catch (err) {
      toast.error("Failed to delete wishlist: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Wishlists</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleCreateWishlist} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="New wishlist title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Wishlist
        </button>
      </form>

      {wishlists.map((wishlist) => (
        <div key={wishlist._id} className="border rounded p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">{wishlist.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => toggleProducts(wishlist._id)}
                className="text-blue-600 hover:underline"
              >
                {activeWishlistId === wishlist._id
                  ? "Hide Products"
                  : "View Products"}
              </button>
              <button
                onClick={() => handleDeleteWishlist(wishlist._id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>

          {activeWishlistId === wishlist._id && (
            <>
              <form onSubmit={handleAddProduct} className="space-y-2 mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Product name"
                  value={newProduct.name}
                  onChange={handleProductChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="Image URL"
                  value={newProduct.imageUrl}
                  onChange={handleProductChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={handleProductChange}
                  className="w-full border p-2 rounded"
                  required
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Add Product
                </button>
              </form>

              <ul className="space-y-3">
                {products.map((product) => (
                  <li key={product._id} className="p-3 border rounded shadow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>

                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-20 h-20 object-cover mt-1"
                          />
                        )}

                        <p className="text-sm text-gray-600">
                          ₹ {product.price}
                        </p>

                        {/* ✅ Show who added it */}
                        {product.addedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            Added by: {product.addedBy.name} (
                            {product.addedBy.email})
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Invite Member */}
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Invite Member</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target;
                    const email = form.email.value;

                    fetch(
                      `${process.env.REACT_APP_URL}/api/wishlists/${wishlist._id}/invite`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ email }),
                      }
                    )
                      .then(async (res) => {
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message);
                        alert("Member invited successfully!");
                        form.reset();
                      })
                      .catch((err) => {
                        alert("Invite failed: " + err.message);
                      });
                  }}
                  className="flex space-x-2 items-center"
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="User's email"
                    required
                    className="flex-1 border p-2 rounded"
                  />
                  <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Invite
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
