import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Loader";
import Navigation from "../../components/Navigation";
import Head from "../../components/Head";
import End from "../../components/End";

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("image", image);

      const response = await axios.post(
        "http://localhost:3000/api/admin/add-product",
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
        toast.error(error.response?.data?.message || "Failed to add product!", {
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
      <Head pageTitle="Add Product" />
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
                required
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
              Add Product
            </button>
          </form>
        </div>
      </main>
      <End />
    </>
  );
};

export default AddProduct;
