const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    // Get the token from the request headers
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({
        responseCode: 0,
        message: "Not authenticated!",
      });
    }

    const token = authHeader.split(" ")[1]; // Authorization: Bearer token

    if (token == "null") {
      return res.status(401).json({
        responseCode: 0,
        message: "Not authenticated!",
      });
    }

    let decodedToken;

    try {
      // Verify the token using the secret key used during signing
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        responseCode: 0,
        message: "Access denied!",
      });
    }

    console.log(decodedToken);

    if (!decodedToken) {
      return res.status(401).json({
        responseCode: 0,
        message: "Not authenticated.",
      });
    }

    req.userId = decodedToken.userId;

    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(401).json({
        responseCode: 0,
        message: "User not found.",
      });
    }

    if (decodedToken.isCustomer) {
      console.log("Not authorized!");
      return res.status(402).json({
        responseCode: 0,
        message: "Not authorized!",
      });
    }

    // Attach user object to the request for further use in route handlers
    req.user = user;

    next();
  } catch (err) {
    // Handle errors here
    console.error("Authorization error: ", err);
    err.statusCode = err.statusCode || 500;
    next(err); // Pass the error to the next middleware or error handler
  }
};
