import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getSessionId = async () => {
      try {
        const sessionId = new URLSearchParams(window.location.search).get(
          "session_id"
        );

        if (!sessionId) {
          toast.error("Session ID not found!", {
            autoClose: 1500,
            onClose: () => {
              navigate("/cart");
            },
          });
          return;
        }

        const response = await axiosInstance.get(
          `/checkout/success?session_id=${sessionId}`
        );

        if (response.data.responseCode === 1) {
          toast.success(response.data.message, {
            autoClose: 1500,
            onClose: () => {
              navigate("/orders");
            },
          });
        } else {
          toast.error(response.data.message, {
            autoClose: 1500,
            onClose: () => {
              navigate("/cart");
            },
          });
        }
      } catch (error) {
        console.error("Failed to process payment:", error);
        toast.error(
          error.response?.data?.message || "Failed to process payment",
          {
            autoClose: 1500,
            onClose: () => {
              navigate("/cart");
            },
          }
        );
      }
    };

    getSessionId();
  }, [navigate]); // Include navigate as a dependency

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
      <div>
        <p>Processing payment...</p>
      </div>
    </>
  );
};

export default CheckoutSuccess;
