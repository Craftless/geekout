import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BACKEND_BASE_URL || "http://localhost:3500";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivateCustomer = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const axiosPrivateSeller = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
