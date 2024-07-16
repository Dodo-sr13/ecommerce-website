const mongodb = require("mongodb");
const Product = require("../models/product");
const { validationResult } = require("express-validator");

const fileHelper = require("../utils/file");

const ITEMS_PER_PAGE = 8; // Set the number of items per page

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1; // Current page, default to 1
  const userId = req.userId;

  try {
    const totalItems = await Product.countDocuments({ userId }); // Total number of products for the specific user
    const products = await Product.find({ userId })
      .skip((page - 1) * ITEMS_PER_PAGE) // Skip products for previous pages
      .limit(ITEMS_PER_PAGE); // Limit products to ITEMS_PER_PAGE

    res.status(200).json({
      responseCode: 1,
      prods: products,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      message: "Fetched products successfully",
    });
  } catch (err) {
    console.error("Error fetching admin products :", err);
    // Set appropriate status code and pass error to the next middleware
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

// exports.getAddProduct = (req, res, next) => {
//   res.status(200).json({
//     responseCode: 1,
//     message: "Add product page data",
//     editing: false,
//     hasError: false,
//     errorMessage: null,
//     validationErrors: [],
//   });
// };

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  try {
    // Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(422).json({
        responseCode: 0,
        errors: errors.array().map((err) => err.msg),
      });
    }

    // Check if image is uploaded
    if (!image) {
      return res.status(404).json({
        responseCode: 0,
        message: "Please upload proper image!",
      });
    }

    const imageUrl = image.path;

    // Create a new product
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.userId,
    });

    // Save the product to the database
    const result = await product.save();

    // Send success response
    res.status(201).json({
      responseCode: 1,
      message: "Product added successfully!",
      product: result,
    });
  } catch (err) {
    console.error("Error uploading product :", err);

    // Set appropriate status code and pass error to the next middleware
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};


exports.getEditProduct = async (req, res, next) => {
  const prodId = req.params.productId;

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return res.status(404).json({
        responseCode: 0,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      responseCode: 1,
      message: "Edit product page data",
      product: product,
    });
  } catch (err) {
    console.error("Error fetching product data : ", err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};


exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      responseCode: 0,
      message: "Validation failed!",
      errors: errors.array().map((err) => err.msg),
    });
  }

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return res.status(404).json({
        responseCode: 0,
        message: "Product not found!",
      });
    }

    if (product.userId.toString() !== req.userId) {
      return res.status(401).json({
        responseCode: 0,
        message: "Not authorized!",
      });
    }

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;

    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }

    const result = await product.save();

    console.log("Updated Product!");
    res.status(200).json({
      responseCode: 1,
      message: "Product updated successfully!",
      product: result,
    });
  } catch (err) {
    console.error("Error updating product : ", err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};


exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId);

  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return res.status(404).json({
        responseCode: 0,
        message: "Product not found!",
      });
    }

    if (product.userId.toString() !== req.userId) {
      return res.status(401).json({
        responseCode: 0,
        message: "Not authorized to delete this product!",
      });
    }

    fileHelper.deleteFile(product.imageUrl);

    await Product.deleteOne({
      _id: prodId,
      userId: req.userId,
    });

    console.log("Deleted product!");

    res.status(200).json({
      responseCode: 1,
      message: "Product deleted successfully!",
    });
  } catch (err) {
    console.error("Error deleting product : ", err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Failed to delete product!";
    next(err);
  }
};

