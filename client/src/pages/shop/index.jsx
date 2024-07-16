import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navigation from "../../components/Navigation";
import Head from "../../components/Head";
import End from "../../components/End";
import Pagination from "../../components/Pagination";
import ProductCard from "../../components/ProductCard";
import Loader from "../../components/Loader"; // Import Loader component

import {
  API_URL,
  NODE_ENV,
  REACT_APP_API_URL,
  STRIPE_API_KEY,
} from "../../constants";

const API_BASE_PATH = NODE_ENV === "development" ? API_URL : REACT_APP_API_URL;


const Shop = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true); // State for loading status

  useEffect(() => {
    fetchProducts(currentPage); // Fetch products for the initial page when component mounts
  }, []);

  const fetchProducts = async (page) => {
    setLoading(true); // Set loading to true when fetching products
    try {

      const response = await axios.get(`${API_BASE_PATH}/?page=${page}`);

      const { prods, currentPage, hasNextPage, hasPreviousPage, lastPage } =
        response.data;
      setProducts(prods);
      setCurrentPage(currentPage);
      setHasNextPage(hasNextPage);
      setHasPreviousPage(hasPreviousPage);
      setLastPage(lastPage);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false); // Set loading to false after products are fetched (successful or not)
    }
  };

  const handlePageChange = (page) => {
    fetchProducts(page);
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
  const isAuthenticated = !!decodedUser; // Check if there's a valid decoded user
  const isCustomer = isAuthenticated ? decodedUser.isCustomer : false;

  return (
    <>
      <Head pageTitle="Shop Page" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      <main>
        {loading ? (
          <Loader /> // Display loader while loading products
        ) : (
          <>
            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
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

export default Shop;
