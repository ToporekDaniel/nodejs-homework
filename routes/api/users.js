const express = require("express");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  authenticateUser,
  logoutUser,
  getCurrentUser,
} = require("../../controllers/user");
const { registerSchema, loginSchema } = require("../../models/validateUser");
const authMiddleware = require("../../middleware/jwt");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await registerUser(req.body);
    res
      .status(201)
      .json({
        user: {
          email: user.email,
          subscription: user.subscription,
          avatar: user.avatarURL,
        },
      });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await authenticateUser(req.body);
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "12h",
    });
    user.token = token;
    await user.save();
    res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.put("/logout", authMiddleware, async (req, res) => {
  try {
    await logoutUser(req.user._id);
    res.status(204).send();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.get("/current", authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const user = await getCurrentUser(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ email: user.email, subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
