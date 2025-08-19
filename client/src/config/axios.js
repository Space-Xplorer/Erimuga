import axios from 'axios';

// Create axios instance with default config
const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true
});

export default instance;
