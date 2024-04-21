const express = require("express");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  authenticateUser,
  logoutUser,
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
      .json({ user: { email: user.email, subscription: user.subscription } });
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

router.put("/logout/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    await logoutUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;
