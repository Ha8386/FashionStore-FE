// src/app/core/services/axios.config.ts
import axiosOriginal from 'axios';
import { environment } from '../../../environments/environment';

const axios = axiosOriginal.create({
  baseURL: (environment.apiUrl || 'http://localhost:8080').replace(/\/+$/, ''),
  withCredentials: false, // dùng JWT qua header
});

// Request: tự gắn Authorization từ localStorage (đồng bộ với AuthService)
axios.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem('fs_token');
    const type = localStorage.getItem('token_type') || 'Bearer';
    if (token) {
      cfg.headers = cfg.headers ?? {};
      (cfg.headers as any).Authorization = `${type} ${token}`;
    }
  } catch {}
  return cfg;
});

// Response: KHÔNG tự redirect khi 401 để tránh vòng lặp
axios.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default axios;
