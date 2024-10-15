import axios from 'axios';

// export const baseURL= 'http://localhost:4000/v1/api/';

export const baseURL=  'https://chartapp-expressjs-backend.onrender.com/v1/api/'

const axiosClient = axios.create({
    // baseURL: 'http://localhost:4000/v1/api',
    baseURL:'https://chartapp-expressjs-backend.onrender.com/v1/api/',
    headers: {
        'Content-Type': 'application/json',
    }
});

axiosClient.interceptors.request.use(config => {
    const phone = localStorage.getItem('phone');
    const password = localStorage.getItem('password');

    if (phone && password) {
        const token = btoa(`${phone}:${password}`);
        config.headers['Authorization'] = `Basic ${token}`;
    }

    return config;
});

export default axiosClient;
