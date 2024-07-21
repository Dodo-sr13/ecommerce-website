import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import { jwtDecode } from "jwt-decode";
import Loader from "../../components/Loader";
import Navigation from "../../components/Navigation";
import Head from "../../components/Head";
import End from "../../components/End";
import { toast } from "react-toastify";
import { FaFileInvoice } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/orders");
        if (response.data.responseCode === 1) {
          setOrders(response.data.orders);
        } else {
            toast.error(response.data.message, {
                autoClose: 1500
            });
        }
      } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load orders!", {
            autoClose: 1500,
            onClose: () => {
              window.location.href = "/";
            },
          });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Decode JWT token to get user information
  const decodeToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded;
    }
    return null;
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  const decodedUser = decodeToken();
  const isAuthenticated = !!decodedUser;
  const isCustomer = isAuthenticated ? decodedUser.isCustomer : false;

  return (
    <>
      <Head pageTitle="Your Orders" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      {isLoading && <Loader />}
      <main>
        <h1 className="orders-header">Your Orders</h1>
        {isLoading ? (
          <Loader />
        ) : orders.length <= 0 ? (
          <h1>No orders yet!</h1>
        ) : (
          <ul className="orders">
            {orders.map((order) => (
              <li className="orders__item" key={order._id}>
                <h1>
                  Order - # {order._id} -{" "}
                  <a onClick={() => handleDownloadInvoice(order._id)} className="invoice-link">
                    <FaFileInvoice />
                  </a>
                </h1>
                <ul className="orders__products">
                  {order.products.map((p) => (
                    <li className="orders__products-item" key={p.product._id}>
                      {p.product.title} ({p.quantity})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </main>
      <End />
    </>
  );
};

export default Orders;
