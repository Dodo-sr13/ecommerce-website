const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const { response } = require("express");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CLIENT_URL = process.env.NODE_DEV === "development" ? process.env.CLIENT_URL : "https://ecommerce-website-fe.onrender.com";

const ITEMS_PER_PAGE = 8;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.status(200).json({
        responseCode: 1,
        prods: products,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          responseCode: 0,
          message: "Product not found!",
        });
      }
      res.status(200).json({
        responseCode: 1,
        product: product,
      });
    })
    .catch((err) => {
      res.status(500).json({
        responseCode: 0,
        message: "Fetching product failed!",
      });
    });
};

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1; // Current page, default to 1
  try {
    const totalItems = await Product.countDocuments(); // Total number of products
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE) // Skip products for previous pages
      .limit(ITEMS_PER_PAGE); // Limit products to ITEMS_PER_PAGE

    res.status(200).json({
      prods: products,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCart = async(req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('cart.items.productId');

    if (!user) {
      return res.status(404)
        .json({
          responseCode: 0,
          message: 'User not found!'
        });
    }
    const cartItems = user.cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    const totalSum = cartItems.reduce((sum, item) => sum + item.price, 0);
    res.status(200)
      .json({
        responseCode: 1,
        items: cartItems,
        totalSum: totalSum
      });
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).json({
      responseCode: 0,
      message: 'Failed to fetch cart items!'
    });
  }
};

exports.postCart = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const user = await User.findById(req.userId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404)
        .json({
          responseCode: 0,
          message: "Product not found!"
        });
    }
    await user.addToCart(product);
    res.status(200)
      .json({
        responseCode: 1,
        message: "Product added to cart!"
      });
  } catch (err) {
    console.error("Error adding product to cart:", err);
    res.status(500)
      .json({
        responseCode: 0,
        message: "Failed to add product to cart!"
      });
  }
};

exports.postCartRemove = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const user = await User.findById(req.userId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        responseCode: 0,
        message: 'Product not found!'
      });
    }
    await user.removeFromCart(product);
    res.status(200).json({
      responseCode: 1,
      message: 'Product removed from cart!'
    });
  } catch (err) {
    console.error('Error removing product from cart:', err);
    res.status(500).json({
      responseCode: 0,
      message: 'Failed to remove product from cart!'
    });
  }
};

exports.postCartDelete = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const user = await User.findById(req.userId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        responseCode: 0,
        message: "Product not found!",
      });
    }
    await user.deleteFromCart(product);
    res.status(200).json({
      responseCode: 1,
      message: "Product deleted from cart!",
    });
  } catch (err) {
    console.error("Error deleting product from cart:", err);
    res.status(500).json({
      responseCode: 0,
      message: "Failed to delete product from cart!",
    });
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      "user.userId": req.userId
    });
    res.status(200)
      .json({
        responseCode: 1,
        orders: orders
      });
  } catch (err) {
    res.status(500)
      .json({
        responseCode: 0,
        message: "Fetching orders failed."
      });
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    let products;
    let total = 0;

    await req.user.populate("cart.items.productId");

    products = req.user.cart.items;
    total = 0;
    products.forEach((p) => {
      total += p.quantity * p.productId.price;
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products.map((p) => {
        return {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(p.productId.price * 100), // Round to the nearest cent and convert to integer
            product_data: {
              name: p.productId.title,
              description: p.productId.description,
            },
          },
          quantity: p.quantity,
        };
      }),
      mode: "payment",
      success_url: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/checkout/cancel`,
    });

    res.status(200).json({
      responseCode: 1,
      products: products,
      totalSum: total,
      sessionId: session.id,
    });

  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({
      responseCode: 0,
      message: "Creating checkout session failed.",
    });
  }
};


exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    console.log(
      "getCheckoutSuccess called with session_id:",
      req.query.session_id
    );
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    if (session.payment_status === "paid") {
      console.log("Payment status: paid");

      // Check if the order for this session ID already exists
      const existingOrder = await Order.findOne({
        sessionId: req.query.session_id,
      });
      if (existingOrder) {
        console.log("Order processed!");
        return res.status(200).json({
          responseCode: 1,
          message: "Order processed!",
        });
      }

      // Fetch the user from the database
      const user = await User.findById(req.userId).populate(
        "cart.items.productId"
      );

      if (!user) {
        console.log("User not found");
        return res.status(404).json({
          responseCode: 0,
          message: "User not found!",
        });
      }

      const products = user.cart.items.map((i) => ({
        quantity: i.quantity,
        product: { ...i.productId._doc },
      }));

      const order = new Order({
        user: {
          email: user.email,
          userId: req.userId,
        },
        products: products,
        sessionId: req.query.session_id,
      });

      await order.save();
      await user.clearCart();

      console.log("Order saved successfully");

      res.status(201).json({
        responseCode: 1,
        message: "Payment successful!",
      });
    } else {
      console.log("Payment status: not paid");
      res.status(402).json({
        responseCode: 0,
        message: "Failed to process payment!",
      });
    }
  } catch (err) {
    console.error("Error processing order:", err);
    res.status(500).json({
      responseCode: 0,
      message: "Failed to process payment!",
    });
  }
};



exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return res
          .status(404)
          .json({ responseCode: 0, message: "No order found." });
      }
      if (order.user.userId.toString() !== req.userId.toString()) {
        return res
          .status(403)
          .json({ responseCode: 0, message: "Unauthorized" });
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-----------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total Price: $ " + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => {
      res
        .status(500)
        .json({ responseCode: 0, message: "Fetching invoice failed." });
    });
};


exports.handleStripeWebhook = async (req, res, next) => {
  let event;

  try {
    // Retrieve the event from the webhook payload
    event = req.body;

    // Verify the event signature using the signing secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error("Error verifying webhook signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      try {
        // Populate user's cart items with product details
        const user = await req.user.populate('cart.items.productId').execPopulate();

        // Map cart items to order products
        const products = user.cart.items.map((item) => ({
          quantity: item.quantity,
          product: { ...item.productId._doc },
        }));

        // Create new Order document
        const order = new Order({
          user: {
            email: req.user.email,
            userId: req.userId,
          },
          products: products,
        });

        // Save order to database
        await order.save();

        console.log('Order saved:', order);

        // Redirect to frontend orders page with success message
        return res.redirect('http://localhost:8080/orders?success=true');

      } catch (error) {
        console.error('Error saving order:', error);
        return res.status(500).send('Error saving order.');
      }
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

