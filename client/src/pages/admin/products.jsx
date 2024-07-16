import React, { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode"; // Import jwtDecode correctly
import axiosInstance from "../../axiosInstance";
import Navigation from "../../components/Navigation";
import Head from "../../components/Head";
import End from "../../components/End";
import Pagination from "../../components/Pagination";
import ProductCard from "../../components/ProductCard";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [lastPage, setLastPage] = useState(1);
  const [decodedUser, setDecodedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    // Fetch products when the component mounts
    fetchProducts(currentPage);

    // Decode user information from token on every render
    const decoded = decodeToken();
    setDecodedUser(decoded);
  }, [currentPage]); // Include currentPage in dependency array

  // Function to decode token
  const decodeToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Decode the JWT token to get user information
      const decoded = jwtDecode(token);
      return decoded;
    }
    return null;
  };

  const fetchProducts = async (page) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/admin/products/?page=${page}`);
      const { prods, currentPage, hasNextPage, hasPreviousPage, lastPage } =
        response.data;
      setProducts(prods);
      setCurrentPage(currentPage);
      setHasNextPage(hasNextPage);
      setHasPreviousPage(hasPreviousPage);
      setLastPage(lastPage);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.response.data.message, {
        autoClose: 1000,
        onClose: () => {
          window.location.href = '/';
        },
      });
    } finally {
      setIsLoading(false); // Set loading to false after fetching data
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Update currentPage state to trigger useEffect
  };

  // Check if user is authenticated and get user role
  const isAuthenticated = !!decodedUser; // Check if there's a valid decoded user
  const isCustomer = isAuthenticated ? decodedUser.isCustomer : false;

  return (
    <>
      <Head pageTitle="Admin Products" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      <main>
        {isLoading ? (
          <Loader /> // Show loader while loading
        ) : (
          <>
            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    admin={!isCustomer}
                  />
                ))}
              </div>
            ) : (
              <h1>No Products Found!</h1>
            )}
            {/* Pagination component */}
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={handlePageChange} // Pass the function to handle page changes
            />
          </>
        )}
      </main>
      <End />
    </>
  );
};

export default AdminProducts;
