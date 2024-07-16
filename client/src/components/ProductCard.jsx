import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader"; // Assuming you have a Loader component

const ProductCard = ({ product, admin, customer }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (productId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(
        `/admin/product/${productId}`
      );
      if (response.data.responseCode === 1) {
        toast.success(response.data.message, {
          autoClose: 1500,
          onClose: () => {
            window.location.href = "/admin/products";
          },
        });
      } else {
        toast.error(response.data.message, {
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to fetch product!", {
        autoClose: 1500,
        onClose: () => {
          window.location.reload();
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
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
      {isLoading && <Loader />}
      <article className="card product-item">

        <header className="card__header">
          <h2 className="product__title">{product.title}</h2>
        </header>
        <div className="card__image">
          <img
            src={`http://localhost:3000/${product.imageUrl}`}
            alt={product.title}
          />
        </div>
        <div className="card__content">
          <h2 className="product__price">$ {product.price}</h2>
          <p className="product__description">{product.description}</p>
        </div>
        <div className="card__actions">
          {admin ? (
            <>
              <a href={`/admin/edit-product/${product._id}`} className="btn">
                Edit
              </a>
              <button
                className="btn btn-delete"
                onClick={() => handleDelete(product._id)}>
                Delete
              </button>
            </>
          ) : customer ? (
            <>
              <a href={`/product-details/${product._id}`} className="btn">
                Details
              </a>
              <button
                className="btn"
                onClick={() => handleAddToCart(product._id)}>
                Add to cart
              </button>
            </>
          ) : (
            <a href={`/product-details/${product._id}`} className="btn">
              Details
            </a>
          )}
        </div>
      </article>
    </>
  );
};

export default ProductCard;
