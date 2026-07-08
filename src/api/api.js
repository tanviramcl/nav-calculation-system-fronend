import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5237/api/",
  // baseURL: process.env.REACT_APP_API_URL || "http://172.16.188.4:8088/api/",

  headers: {
    "Content-Type": "application/json",
  },
});


// Add token to headers automatically
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

