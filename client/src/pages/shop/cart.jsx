import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { jwtDecode } from "jwt-decode";
import Loader from "../../components/Loader";
import Navigation from "../../components/Navigation";
import Head from "../../components/Head";
import End from "../../components/End";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import "react-toastify/dist/ReactToastify.css";
import { API_URL, NODE_ENV, REACT_APP_API_URL, STRIPE_API_KEY } from "../../constants/index";


const API_BASE_PATH =
  NODE_ENV === "development"
    ? API_URL
    : REACT_APP_API_URL;

const stripePromise = loadStripe(STRIPE_API_KEY);

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axiosInstance.get("/cart");
      setCartItems(response.data.items);
      setTotalSum(response.data.totalSum);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setIsLoading(false);
      toast.error("Failed to fetch cart items!", {
        autoClose: 1500,
      });
    }
  };

  const handleIncrement = async (productId) => {
    try {
      const response = await axiosInstance.post("/cart", { productId });
      if (response.data.responseCode === 1) {
        fetchCartItems();
      } else {
        toast.error(response.data.message, {
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error incrementing product quantity:", error);
      toast.error("Failed to increment product quantity!", {
        autoClose: 1500,
      });
    }
  };

  const handleDecrement = async (productId) => {
    try {
      const response = await axiosInstance.post("/cart-delete-item", {
        productId,
      });
      if (response.data.responseCode === 1) {
        fetchCartItems();
      } else {
        toast.error(response.data.message, {
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error decrementing product quantity:", error);
      toast.error("Failed to decrement product quantity!", {
        autoClose: 1500,
      });
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await axiosInstance.get("/checkout-stripe");
      if (response.data.responseCode === 1) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });

        if (error) {
          toast.error(error.message, {
            autoClose: 1500,
          });
        }
      } else {
        toast.error(response.data.message, {
          autoClose: 1500,
        });
      }
    } catch (error) {
      toast.error("Failed to initiate checkout session.", {
        autoClose: 1500,
      });
    }
  };

  // Decode JWT token to get user information
  const decodeToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded;
    }
    return null;
  };

  const decodedUser = decodeToken();
  const isAuthenticated = !!decodedUser;
  const isCustomer = isAuthenticated ? decodedUser.isCustomer : false;

  return (
    <>
      <Head pageTitle="Your Cart" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      {isLoading && <Loader />}
      <main>
        <h1 className="orders-header">Shopping Cart</h1>
        {cartItems.length > 0 ? (
          <>
            <ul className="cart__item-list">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <p className="cart-item__title">{item.productId.title}</p>
                  <img
                    src={`${API_BASE_PATH}/${item.productId.imageUrl}`}
                    alt={item.productId.title}
                    className="cart-item__image"
                  />
                  <span className="cart-item__price">
                    Price: ${item.price.toFixed(2)}
                  </span>
                  <div className="cart-item__details">
                    <button
                      className="btn"
                      onClick={() => handleIncrement(item.productId._id)}>
                      +
                    </button>
                    <span className="cart-item__quantity">{item.quantity}</span>
                    <button
                      className="btn"
                      onClick={() => handleDecrement(item.productId._id)}>
                      -
                    </button>
                  </div>
                </div>
              ))}
            </ul>
            <div className="cart-value">
              <h3>Cart Value: $ {totalSum.toFixed(2)}</h3>
            </div>
            <hr />
            <div className="centered">
              <button
                className="btn place-order-button"
                onClick={handlePlaceOrder}>
                Place order
              </button>
            </div>
          </>
        ) : (
          <h1>No Products in Cart!</h1>
        )}
      </main>
      <End />
    </>
  );
};

export default Cart;
