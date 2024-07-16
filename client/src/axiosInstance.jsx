import axios from "axios";
import { API_BASE_PATH } from "./constants";

const axiosInstance = axios.create({
  baseURL: API_BASE_PATH,
  headers: {
    'Authorization' : `Bearer ${localStorage.getItem("token")}`, // Assuming you're using JWT for authentication and storing token in localStorage
  },
});
export default axiosInstance;
