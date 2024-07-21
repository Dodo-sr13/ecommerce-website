// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/shop";
import AdminProducts from "./pages/admin/products";
import AddProduct from "./pages/admin/add-product";
import EditProduct from "./pages/admin/edit-product";
import ProductDetails from "./pages/shop/product-details";
import Products from "./pages/shop/product-list";
import Cart from "./pages/shop/cart";
import Orders from "./pages/shop/orders";
import CheckoutSuccess from "./pages/shop/checkoutsuccess";
import CheckoutCancel from "./pages/shop/checkoutfailed";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute
                element={<AdminProducts />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/admin/add-product"
            element={
              <ProtectedRoute
                element={<AddProduct />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/admin/edit-product/:productId"
            element={
              <ProtectedRoute
                element={<EditProduct />}
                allowedRoles={["admin"]}
              />
            }
          />
          <Route
            path="/product-details/:productId"
            element={<ProductDetails />}
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute element={<Cart />} allowedRoles={["customer"]} />
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute
                element={<Orders />}
                allowedRoles={["customer"]}
              />
            }
          />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
