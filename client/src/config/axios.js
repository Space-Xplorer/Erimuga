import axios from 'axios';

// Create axios instance with default config
const instance = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true
});

export default instance;
