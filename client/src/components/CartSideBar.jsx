import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { API_URL, NODE_ENV, REACT_APP_API_URL } from "../constants/index";


const API_BASE_PATH = NODE_ENV === "development" ? API_URL : REACT_APP_API_URL;

const CartSidebar = ({ cartItems, totalSum, isOpen, onClose }) => {
    
    return (
      <>
        <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
          <button className="cart-sidebar__close" onClick={onClose}>
            &times;
          </button>
          <div className="cart-sidebar__items">
            <h3 style={{ textAlign: "center" }}>Cart Value: ${totalSum.toFixed(2)}</h3>
            <NavLink to="/cart" className="cart-sidebar__go-to-cart">
              Go to cart
            </NavLink>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item._id} className="cart-sidebar__item">
                  <img
                    src={`${API_BASE_PATH}/${item.productId.imageUrl}`}
                    alt={item.productId.title}
                    className="cart-sidebar__item-image"
                  />
                  <div className="cart-sidebar__item-details">
                    <p className="cart-sidebar__item-title">
                      {item.productId.title}
                    </p>
                    <p className="cart-sidebar__item-price">
                      ${item.productId.price.toFixed(2)}
                    </p>
                    <p className="cart-sidebar__item-quantity">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>
        </div>
        {isOpen && (
          <div className="cart-sidebar-backdrop" onClick={onClose}></div>
        )}
      </>
    );
};

export default CartSidebar;
