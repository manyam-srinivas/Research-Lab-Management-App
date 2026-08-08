import axios from "axios";

const api = axios.create({
  // Override with VITE_API_URL in .env to point at a local backend,
  // e.g. VITE_API_URL=http://localhost:5000/api
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://research-lab-backend-x84w.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;