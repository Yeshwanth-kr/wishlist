import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  } else {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(409).json({ message: "User already exists" });
      else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
          expiresIn: 1000 * 60 * 60 * 24 * 15,
        });

        res
          .status(201)
          .cookie("jwt", token)
          .json({
            message: "Signup successful",
            user: { name: user.name, email: user.email },
          });
      }
    } catch (err) {
      console.error("Signup Error:", err);
      res.status(500).json({ message: "Server error during signup" });
    }
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
      expiresIn: 1000 * 60 * 60 * 24 * 15,
    });

    res
      .status(200)
      .cookie("jwt", token)
      .json({
        message: "Login successful",
        user: { name: user.name, email: user.email },
      });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = async (req, res) => {
  return res
    .status(200)
    .cookie("jwt", "", { expiresIn: 0 })
    .json({ message: "Logout successfull" });
};

export const userinfo = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId }, { password: 0 });
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in userinfo controller: ", error);
    return res.status(500);
  }
};
