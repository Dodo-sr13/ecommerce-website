const express = require("express");
const { body, check } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth"); // Assuming this middleware checks for JWT token

const router = express.Router();

// PUT /signup
router.put(
  "/signup",
  [
    body("username")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Username must be at least 4 characters long.")
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Username already exists! Please choose a different one."
            );
          }
        });
      }),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email already exists! Please choose a different one."
            );
          }
        });
      }),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long.")
      .isAlphanumeric()
      .withMessage("Password must only contain letters and numbers.")
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match.");
        }
        return true;
      }),
  ],
  authController.postSignup
);

// POST /login
router.post(
  "/login",
  // [
  //   body("username")
  //     .isEmail()
  //     .withMessage("Please enter a valid email address.")
  //     .normalizeEmail(),
  // ],
  authController.postLogin
);

// POST /auth/logout
router.post("/logout", isAuth, authController.postLogout);

// GET /auth/reset
router.get("/reset", authController.getReset);

// POST /auth/reset
router.post("/reset", authController.postReset);

// GET /auth/reset/:token
router.get("/reset/:token", authController.getNewPassword);

// POST /auth/new-password
router.post("/new-password", authController.postNewPassword);

module.exports = router;
