const express = require("express");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  authenticateUser,
  logoutUser,
  getCurrentUser,
  makeAvatar,
} = require("../../controllers/user");
const { registerSchema, loginSchema } = require("../../models/validateUser");
const authMiddleware = require("../../middleware/jwt");
const upload = require("../../config/multer");

const router = express.Router();

const fs = require("fs").promises;
const path = require("path");

// Funkcja sprawdzająca istnienie i czytelność pliku
async function validateFilePath(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
    return true;
  } catch (error) {
    console.error("File does not exist or is not readable", error);
    return false;
  }
}

// Funkcja walidująca nazwę pliku
function isValidFileName(filePath) {
  return /^[a-zA-Z0-9_.-]+$/.test(path.basename(filePath));
}

router.post("/signup", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await registerUser(req.body);
    res.status(201).json({
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
    res.json({
      email: user.email,
      subscription: user.subscription,
      avatar: user.avatarURL,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch(
  "/avatars",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const filePatch = req.file.path;

    // Walidacja ścieżki pliku i nazwy pliku
    if (!(await validateFilePath(filePatch)) || !isValidFileName(filePatch)) {
      return res
        .status(400)
        .json({ message: "Invalid file path or file name" });
    }

    try {
      const user = req.user;
      const avatar = await makeAvatar(user._id, filePatch);
      res.status(200).json({ avatarURL: "/avatars/" + avatar });
    } catch (error) {
      // Czyść po sobie, jeśli coś pójdzie nie tak
      try {
        await fs.unlink(filePatch);
      } catch (fsError) {
        console.error("Failed to delete file after error", fsError);
      }
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
