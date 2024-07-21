const express = require('express');
const path = require('path');
const adminController = require('../controllers/admin');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

// // /admin/products => GET
router.get('/products', isAdmin, adminController.getProducts);

// /admin/add-product => GET
// router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/add-product => POST
router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Title must contain atleast 3 characters!")
      .trim(),
    body("price").isFloat(),
    body("description")
      .isLength({ min: 5, max: 500 })
      .withMessage("Description should be within 5 - 500 characters!")
      .trim(),
  ],
  isAdmin,
  adminController.postAddProduct
);

// // /admin/edit-product/:productId => GET
router.get("/product/:productId", isAdmin, adminController.getEditProduct);

// // /admin/edit-product => POST
router.post(
  "/edit-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Title must contain atleast 3 characters!")
      .trim(),
    body("price").isFloat(),
    body("description")
      .isLength({ min: 5, max: 500 })
      .withMessage("Description should be within 5 - 500 characters!")
      .trim(),
  ],
  isAdmin,
  adminController.postEditProduct
);

// // /admin/delete-product => POST
router.delete("/product/:productId", isAdmin, adminController.deleteProduct);

module.exports = router;
