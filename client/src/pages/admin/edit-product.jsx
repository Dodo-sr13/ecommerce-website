import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../axiosInstance";
import Navigation from "../../components/Navigation";
import Head from "../../components/Head";
import End from "../../components/End";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Loader";

const EditProduct = () => {
  const { productId } = useParams();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
    try {
      const response = await axiosInstance.get(`/admin/product/${productId}`);
      const { product } = response.data;

      setTitle(product.title);
      setPrice(product.price.toString());
      setDescription(product.description);
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to fetch product details!");
      setIsLoading(false);
      toast.error(error.response?.data?.message || "Failed to fetch product!", {
        autoClose: 1500,
        onClose: () => {
          window.location.reload();
        },
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("title", title);
      formData.append("price", price);
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
      }

      const response = await axiosInstance.post(
        `/admin/edit-product`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.responseCode === 1) {
        toast.success(response.data.message, {
          autoClose: 1500,
          onClose: () => {
            window.location.href = "/admin/products";
          },
        });
      } else {
        setError(response.data.message);
        toast.error(response.data.message, {
          autoClose: 1500,
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        error.response.data.errors.forEach((err) => {
          toast.error(err, {
            autoClose: 1500,
          });
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to update product!", {
          autoClose: 1500,
          onClose: () => {
            window.location.reload();
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
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

  return (
    <>
      <Head pageTitle="Edit Product" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      {isLoading && <Loader />}
      <main>
        <div className="form-container">
          {error && <p>{error}</p>}
          <form
            className="product-form"
            onSubmit={handleSubmit}
            encType="multipart/form-data">
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="image">Image</label>
              <input
                type="file"
                id="image"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
            <div className="form-control">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required></textarea>
            </div>
            <button className="button" type="submit">
              Update Product
            </button>
          </form>
        </div>
      </main>
      <End />
    </>
  );
};

export default EditProduct;
