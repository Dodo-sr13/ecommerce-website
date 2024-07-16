import React, { useEffect } from "react";
import { toast } from "react-toastify";
import Head from "../../components/Head";
import Navigation from "../../components/Navigation";
import End from "../../components/End";
import { jwtDecode } from "jwt-decode";

const CheckoutCancel = () => {
  useEffect(() => {
    toast.error("Payment failed!", {
      autoClose: 1500,
      onClose: () => {
        window.location.href = "/cart";
      },
    });
  }, []);
    
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
      <Head pageTitle="Checkout" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      <div>
        <p>Processing payment...</p>
      </div>
      <End />
    </>
  );
};

export default CheckoutCancel;
