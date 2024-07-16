// utils/auth.js

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (userId, email, role) => {
  return jwt.sign(
    {
      userId: userId,
      email: email,
      role: role,
    },
    "your-secret-key", // Replace with your actual secret
    { expiresIn: "1h" } // Token expiry time
  );
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  generateToken,
  verifyPassword,
};
