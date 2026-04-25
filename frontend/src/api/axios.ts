// src/api/axios.ts
import axios from 'axios';

// Backend'imizin çalıştığı ana adresi tanımlıyoruz
const api = axios.create({
    baseURL: 'http://localhost:3000',
});

// INTERCEPTOR: Uygulamadan çıkan HER isteğin arasına girer
api.interceptors.request.use(
    (config) => {
        // LocalStorage'dan token'ı al
        const token = localStorage.getItem('token');

        // Eğer token varsa, bunu kargo paketinin (isteğin) üzerine "Bearer ..." olarak yapıştır
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;