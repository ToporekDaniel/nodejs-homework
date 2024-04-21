const User = require("../models/userSchema");

const registerUser = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }
  const newUser = new User({ email });
  await newUser.setPassword(password);
  await newUser.save();
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

module.exports = {
  registerUser,
  authenticateUser,
};
