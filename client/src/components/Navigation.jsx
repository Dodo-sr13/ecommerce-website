import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";
import CartSideBar from "./CartSideBar";
import { FiShoppingCart } from "react-icons/fi";

const Navigation = ({ isAuthenticated, isCustomer }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [loading, setLoading] = useState(false);

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      const fetchCartItems = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get("/cart");
          if (response.data.responseCode === 1) {
            setCartItems(response.data.items || []);
            setTotalSum(response.data.totalSum);
          } else {
            toast.error(response.data.message, {
              autoClose: 2000,
            });
          }
        } catch (error) {
          //
        } finally {
          setLoading(false);
        }
      };

      fetchCartItems();
    }
  }, [isAuthenticated, isCustomer]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/logout");

      if (response.data.responseCode === 1) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("type");
        setShowLogoutModal(false); // Close the logout modal

        // Display success toast
        toast.success(response.data.message, {
          autoClose: 2000, // Close the toast after 2 seconds
          onClose: () => {
            window.location.href = "/"; // Redirect to home page after successful login
          },
        });
      } else {
        // Display error toast if logout fails
        toast.error(response.data.message, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout!", {
        autoClose: 2000,
      });
    }
  };

  const handleLogoutModalOpen = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutModalClose = () => {
    setShowLogoutModal(false);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="main-header">
      <button id="side-menu-toggle">Menu</button>
      <nav className="main-header__nav">
        <ul className="main-header__item-list">
          <li className="main-header__item">
            <NavLink className="nav-link" to="/">
              Shop
            </NavLink>
          </li>
          {isCustomer && (
            <li className="main-header__item">
              <NavLink className="nav-link" to="/products">
                Products
              </NavLink>
            </li>
          )}
          {isAuthenticated && (
            <>
              {isCustomer && (
                <>
                  <li className="main-header__item">
                    <NavLink className="nav-link" to="/cart">
                      Cart
                    </NavLink>
                  </li>
                  <li className="main-header__item">
                    <NavLink className="nav-link" to="/orders">
                      Orders
                    </NavLink>
                  </li>
                </>
              )}
              {!isCustomer && (
                <>
                  <li className="main-header__item">
                    <NavLink className="nav-link" to="/admin/add-product">
                      Add Product
                    </NavLink>
                  </li>
                  <li className="main-header__item">
                    <NavLink className="nav-link" to="/admin/products">
                      Admin Products
                    </NavLink>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
        <ul className="main-header__item-list">
          {!isAuthenticated ? (
            <>
              <li className="main-header__item">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>
              <li className="main-header__item">
                <NavLink className="nav-link" to="/signup">
                  Signup
                </NavLink>
              </li>
            </>
          ) : (
            <>
              {username && (
                <li className="main-header__item">
                  <span className="nav-username">{username}</span>
                </li>
              )}

              <li className="main-header__item">
                <button onClick={handleLogoutModalOpen}>Logout</button>
              </li>
              {isCustomer && (
                <li className="main-header__item">
                  <button onClick={handleSidebarToggle}>
                    <FiShoppingCart />
                  </button>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal">
          <div className="modal-content">
            <p className="modal-question">Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button onClick={handleLogout}>Yes</button>
              <button onClick={handleLogoutModalClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSideBar
        cartItems={cartItems}
        totalSum={totalSum}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </header>
  );
};

export default Navigation;
