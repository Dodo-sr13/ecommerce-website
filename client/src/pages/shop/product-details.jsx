import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import Navigation from "../../components/Navigation";
import axios from "axios";
import Head from "../../components/Head";
import End from "../../components/End";
import Loader from "../../components/Loader";
import axiosInstance from "../../axiosInstance";
import {
  API_URL,
  NODE_ENV,
  REACT_APP_API_URL,
  STRIPE_API_KEY,
} from "../../constants";

const API_BASE_PATH = NODE_ENV === "development" ? API_URL : REACT_APP_API_URL;

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_PATH}/products/${productId}`);
      setProduct(response.data.product);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to fetch product details!");
      setIsLoading(false);
    }
  };

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

  const handleAddToCart = async () => {
    // Add to cart functionality (you can implement this later)
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/cart`, {
        productId: productId,
      });
      if (response.data.responseCode === 1) {
        toast.success(response.data.message, {
          autoClose: 1500,
        });
      } else {
        toast.error(response.data.message, {
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error(
        error.response?.data?.message || "Failed to add product to cart!",
        {
          autoClose: 1500,
        }
      );
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <>
      <Head pageTitle="Product Details" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      {isLoading && <Loader />}
      <main>
        {product && !isLoading && (
          <article className="card product-details-card">
            <header className="card__header">
              <h1 className="product__title">{product.title}</h1>
            </header>
            <div className="card__image">
              <img
                src={`${API_BASE_PATH}/${product.imageUrl}`}
                alt={product.title}
              />
            </div>
            <div className="card__content">
              <h2 className="product__price">$ {product.price}</h2>
              <p className="product__description">{product.description}</p>
            </div>
            <div className="card__actions">
              {isAuthenticated && isCustomer && (
                <button
                  className="btn"
                  onClick={() => handleAddToCart()}>
                  Add to Cart
                </button>
              )}
            </div>
          </article>
        )}
      </main>
      <End />
    </>
  );
};

export default ProductDetails;
