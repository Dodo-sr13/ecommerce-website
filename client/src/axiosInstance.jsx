import axios from "axios";

import {
  API_URL,
  NODE_ENV,
  REACT_APP_API_URL,
  STRIPE_API_KEY,
} from "./constants/index";

const API_BASE_PATH = NODE_ENV === "development" ? API_URL : REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_PATH,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you're using JWT for authentication and storing token in localStorage
  },
});

export default axiosInstance;
