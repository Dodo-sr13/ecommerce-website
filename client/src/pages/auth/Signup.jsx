import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "../../components/Head";
import Navigation from "../../components/Navigation";
import Loader from "../../components/Loader"; 
import {
  API_URL,
  NODE_ENV,
  REACT_APP_API_URL,
  STRIPE_API,
} from "../../constants";

const API_BASE_PATH = NODE_ENV === "development" ? API_URL : REACT_APP_API_URL;

const SignupPage = (props) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("Customer"); // Assuming customer is default
  const [isLoading, setIsLoading] = useState(false); 

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = () => {
    if (!username) {
      toast.error("Username cannot be empty!", {
        autoClose: 2000,
      });
      return false;
    }

    if (!email) {
      toast.error("Email cannot be empty!", {
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

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address!", {
        autoClose: 2000,
      });
      return;
    }

    if (password.length < 5) {
      toast.error("Password must be at least 5 characters long!", {
        autoClose: 2000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match! Please try again.", {
        autoClose: 2000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(
        `${API_BASE_PATH}/signup`,
        {
          username,
          email,
          password,
          confirmPassword,
          userType,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.responseCode === 1) {
        // Handle successful signup
        toast.success(response.data.message, {
          autoClose: 2000,
          onClose: () => {
            window.location.href = "/login"; // Redirect to login after successful signup
          },
        });
      } else {
        toast.error(response.data.message, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (error.response && error.response.status === 422) {
        error.response.data.errors.forEach((err) => {
          toast.error(err, {
            autoClose: 2000,
            onClose: () => {
              window.location.reload();
            },
          });
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to signup!", {
          autoClose: 2000,
          onClose: () => {
            window.location.reload();
          },
        });
      }
    } finally {
      setIsLoading(false); // Set loading to false after request is complete
    }
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
    <div>
      <Head pageTitle="Signup Page" />
      <Navigation isAuthenticated={isAuthenticated} isCustomer={isCustomer} />
      {isLoading && <Loader />}
      <div className="login-container">
        <h1>Sign up your account</h1>
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
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="form-control">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label>User Type</label>
            <select
              className="input"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}>
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button className="login-button" type="submit">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
