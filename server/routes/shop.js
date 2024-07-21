const express = require('express');

const path = require('path');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

const isCustomer = require('../middleware/is-customer');

const router = express.Router();

router.get('/',shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isCustomer, shopController.getCart);

router.post("/cart", isCustomer, shopController.postCart);

router.post("/cart-remove-item", isCustomer, shopController.postCartRemove);

router.post("/cart-delete-item", isCustomer, shopController.postCartDelete);

// router.post('/create-order',isAuth, shopController.postOrders);

router.get("/orders", isCustomer, shopController.getOrders);

router.get("/checkout-stripe", isCustomer, shopController.getCheckout);

router.get("/checkout/success", isCustomer, shopController.getCheckoutSuccess);

router.post("/stripe-webhook", isAuth, shopController.handleStripeWebhook);

router.get("/orders/:orderId", isCustomer, shopController.getInvoice);

module.exports = router;