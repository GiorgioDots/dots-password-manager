import axios, { AxiosResponse } from "axios";
import clientCrypto from "./client-crypto";
import { AuthResponse } from "./models/auth-response";

const baseUrl = import.meta.env.VITE_API_URL;
console.log(baseUrl);

// Token management
let isRefreshing = false; // Track if a token refresh is in progress
let refreshSubscribers: ((token: string) => void)[] = []; // Queue of requests waiting for the new token

// Utility to notify all subscribers waiting for a token refresh
function onAccessTokenRefreshed(newToken: string) {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
}

// Add subscribers who wait for the refreshed token
function addRefreshSubscriber(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

// Axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Update with your base URL
});

// Request interceptor to add the Authorization header
axiosInstance.interceptors.request.use(
    async (val) => {
        await clientCrypto.generateKeyPair()
        const publicKey = await clientCrypto.exportPublicKey();
        if(publicKey){
            val.headers.set('x-public-key', publicKey)
        }
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            val.headers.Authorization = `Bearer ${accessToken}`;
        }
        return val;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors and refresh tokens
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response, // Pass successful responses
    async (error) => {
        const originalRequest = error.config;

        // Check if the error status is 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If a token refresh is already in progress, queue the request
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken: string) => {
                        originalRequest._retry = true; // Prevent duplicate retry attempts
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(axiosInstance(originalRequest)); // Retry with new token
                    });
                });
            }

            // Start token refresh
            isRefreshing = true;
            originalRequest._retry = true;

            try {
                const response = await refreshAccessToken(); // Your token refresh logic
                localStorage.setItem("token", response.data.Token);
                localStorage.setItem('refreshToken', response.data.RefreshToken)
                if (response.data.Token) {
                    console.log(response.data.Token)
                    onAccessTokenRefreshed(response.data.Token); // Notify waiting requests
                }
                return axiosInstance(originalRequest); // Retry original request
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                location.reload();
                return Promise.reject(refreshError); // Reject all requests if refresh fails
            } finally {
                isRefreshing = false; // Mark refresh process as done
            }
        }

        return Promise.reject(error); // Propagate other errors
    }
);

// Function to refresh the token (replace with your logic)
async function refreshAccessToken() {
    // Use your API endpoint to refresh the token
    return axios.post<AuthResponse>(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
        Token: localStorage.getItem("refreshToken"), // Replace with your storage logic
    });
}

export default axiosInstance;
