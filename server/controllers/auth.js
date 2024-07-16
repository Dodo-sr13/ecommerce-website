const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const MailGun = require('mailgun.js');
const jwt = require("jsonwebtoken");
const formData = require('form-data');
require("dotenv").config();

const { validationResult } = require('express-validator');

const User = require('../models/user');

const API_KEY = process.env.API_KEY;
const DOMAIN = process.env.DOMAIN;
const JWT_SECRET = process.env.JWT_SECRET;

const mailGun = new MailGun(formData);
const client = mailGun.client({ username: 'api', key: API_KEY });

const CLIENT_URL = process.env.CLIENT_URL;


exports.getLogin = (req, res, next) => {
  //
};

exports.getSignup = (req, res, next) => {
  //
};

exports.postLogin = async (req, res, next) => {
  // Validate incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      responseCode: 0,
      message: "Validation failed!",
      errors: errors.array().map((err) => err.msg),
    });
  }

  try {
    const { username, password } = req.body;

    // Find user in database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        responseCode: 0,
        message: "A user with this username could not be found!",
      });
    }

    // Compare passwords
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      return res.status(401).json({
        responseCode: 0,
        message: "Wrong password!",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: user.username,
        userId: user._id.toString(),
        isCustomer: user.isCustomer,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send success response
    res.status(200).json({
      responseCode: 1,
      message: "Logged in successfully",
      token: token,
      username: user.username,
      userId: user._id.toString(),
      isCustomer: user.isCustomer,
    });
  } catch (error) {
    // Handle other errors
    console.error("Login error:", error);
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};



exports.postLogout = (req, res, next) => {
  try {
    // Clear JWT token from client-side (localStorage, cookies, etc.)
    // For localStorage:
    // localStorage.removeItem("token"); // Adjust according to your client-side storage

    // It's important to note that JWT tokens are typically stored client-side,
    // so clearing it from localStorage or cookies is done on the client side.
    // There's no direct server-side operation to clear a client's localStorage.

    // Respond with successful logout message
    res.status(200).json({
      responseCode: 1,
      message: "Logged out successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.message = "Failed to logout!"
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        responseCode: 0,
        message: "Validation failed!",
        errors: errors.array().map((err) => err.msg), // Map errors to their messages
      });
    }

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const isCustomer = req.body.userType === "Customer";

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
      cart: { items: [] },
      isCustomer: isCustomer,
    });

    const result = await user.save();

    res.status(201).json({
      message: "Signup successful! Log in to your account.",
      responseCode: 1,
      userId: result._id,
    });
  } catch (err) {
     console.error("Signup error:", err);
     err.statusCode = err.statusCode || 500;
     next(err);
  }
};



exports.getReset = (req,res,next) => {
  //
};

exports.postReset = async (req, res, next) => {
  const { username } = req.body; // Assuming username is sent in the request body

  try {
    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(422).json({
        responseCode: 0,
        message: "No user found with that username",
      });
    }

    // Update user's reset token and token expiration
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour

    await user.save();

    console.log(user.email);

    // Send password reset email
    const messageData = {
      from: "e-commerce <roy.dodo2001@gmail.com>",
      to: [user.email], // Assuming email is a field in your User model
      subject: "Password Reset",
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${CLIENT_URL}/reset/${token}">link</a> to set a new password.</p>
      `,
    };

    // Code for sending email omitted for brevity
    await client.messages.create(
      "sandbox180aa2acda37449983046f23a1b270a8.mailgun.org",
      messageData
    );

    res.status(200).json({
      responseCode: 1,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      responseCode: 0,
      message: "Internal server error",
    });
  }
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(422).json({
          responseCode: 0,
          message: "Invalid or expired token",
        });
      }
      res.status(200).json({
        responseCode: 1,
        message: "Token validated successfully",
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        responseCode: 0,
        message: "Internal server error",
      });
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        return res.status(422).json({
          responseCode: 0,
          message: "Invalid or expired token",
        });
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.status(200).json({
        responseCode: 1,
        message: "Password reset successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        responseCode: 0,
        message: "Internal server error",
      });
    });
};
