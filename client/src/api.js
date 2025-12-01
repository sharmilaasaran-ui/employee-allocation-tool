import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '', // Uses env var in prod, or default (proxy) in dev
});

export default api;
