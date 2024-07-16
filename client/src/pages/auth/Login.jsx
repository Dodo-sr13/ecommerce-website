import React, { useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Head from "../../components/Head";
import Navigation from "../../components/Navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import "react-toastify/dist/ReactToastify.css";
import {
  API_URL,
  NODE_ENV,
  REACT_APP_API_URL,
  STRIPE_API_KEY,
} from "../../constants/index";

const API_BASE_PATH = NODE_ENV === "development" ? API_URL : REACT_APP_API_URL;

const LoginPage = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [forgotUsername, setForgotUsername] = useState(""); // State for forgot username

  const validateForm = () => {
    if (!username) {
      toast.error("Username cannot be empty!", {
        autoClose: 2000,
      });
      return false;
    }
    if (!password) {
      toast.error("Password cannot be empty!", {
        autoClose: 2000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_PATH}/login`,
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.responseCode === 1) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);

        if (response.data.isCustomer) {
          localStorage.setItem("type", "customer");
        } else {
          localStorage.setItem("type", "admin");
        }

        toast.success(response.data.message, {
          autoClose: 1500,
          onClose: () => {
            window.location.href = "/";
          },
        });
      } else {
        setError(response.data.message);
        toast.error(response.data.message, {
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.status === 422) {
        error.response.data.errors.forEach((err) => {
          toast.error(err, {
            autoClose: 1500,
            onClose: () => {
              window.location.reload();
            },
          });
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to login!", {
          autoClose: 1500,
          onClose: () => {
            window.location.reload();
          },
        });
      }
    } finally {
      setIsLoading(false); // Deactivate loader
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

  // Function to handle modal open
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Function to handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Function to handle forgot password form submission
  const handleForgotPassword = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_PATH}/reset`,
        {
          username: forgotUsername,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.responseCode === 1) {
        toast.success(response.data.message, {
          autoClose: 3000,
        });
        // Close the modal after success
        handleCloseModal();
      } else {
        toast.error(response.data.message, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(
        error.response?.data?.message || "Failed to reset password!",
        {
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div>
      <Head pageTitle="Login Page" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      {isLoading && <Loader />}
      <div className="login-container">
        <h1>Login to your account</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label>Username</label>
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="login-button" type="submit">
            Login
          </button>
        </form>
        <p
          onClick={handleOpenModal}
          style={{ cursor: "pointer", color: "white" }}>
          Forgot password?
        </p>
        <p style={{ color: "white" }}>
          Don't have an account? <Link to="/signup">Create new account</Link>
        </p>
      </div>

      {/* Modal for forgot password */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {/* <h2>Forgot Password</h2> */}
            <p className="modal-question">
              Please enter your username to reset your password.
            </p>
            <input
              type="text"
              placeholder="Enter username"
              value={forgotUsername}
              onChange={(e) => setForgotUsername(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleForgotPassword}>Submit</button>
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
