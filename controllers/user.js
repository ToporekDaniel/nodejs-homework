const User = require("../models/userSchema");
const Jimp = require("jimp");
const fs = require("fs").promises;
const path = require("path");
const nanoid = require("nanoid");
const sendEmail = require("./nodemailer");

// całkiem fajna opcja z tym HttpError
// wszystkie błędy zwracane przez funkcje są w jednym formacie
// i można je łatwo obsłużyć w jednym miejscu
// muszę dodać to do wszystkich moich funkcji w wolnym czasie
class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const registerUser = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }
  const newUser = new User({ email });
  await newUser.setavatarURL(email);
  await newUser.setPassword(password);
  newUser.verificationToken = nanoid();
  await newUser.save();
  sendEmail(email, newUser.verificationToken);
  return newUser;
};

const authenticateUser = async (userData) => {
  const { email, password } = userData;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordCorrect = await user.validatePassword(password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid password");
  }
  return user;
};

const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.token = null;
  await user.save();
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");
  return user;
};

const makeAvatar = async (userId, filePath) => {
  const user = await User.findById(userId).select("-password");
  const image = await Jimp.read(filePath);
  await image.resize(250, 250).quality(90);
  const newFilename = `avatar-${userId}-${Date.now()}.jpg`;
  const outputPath = path.join(__dirname, "../public/avatars", newFilename);
  await image.writeAsync(outputPath);
  await fs.unlink(filePath);
  user.avatarURL = `/avatars/${newFilename}`;
  await user.save();
  return newFilename;
};

const emailVerification = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw new HttpError("User not found", 404);
  }
  if (user.verify) {
    throw new HttpError("Verification has already been passed", 400);
  }
  user.verify = true;
  user.verificationToken = null; // Clear the verification token
  await user.save();
};

const sendAnotherToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError("User not found", 404);
  }
  if (user.verify) {
    throw new HttpError("Verification has already been passed", 400);
  }
  user.verificationToken = nanoid();
  await user.save();
  sendEmail(email, user.verificationToken);
};

module.exports = {
  registerUser,
  authenticateUser,
  logoutUser,
  getCurrentUser,
  makeAvatar,
  emailVerification,
  sendAnotherToken,
};
