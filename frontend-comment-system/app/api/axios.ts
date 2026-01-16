import axios from "axios";

console.log(import.meta.env.VITE_API_BASE_URL)

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://comment-system-backend-l30w.onrender.com/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor (token, etc.)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error.response?.data || error.message);
    }
);

export default api;
