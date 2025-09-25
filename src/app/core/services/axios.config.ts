// src/app/core/services/axios.config.ts
import axios from 'axios';
import { environment } from '../../../environments/environment';

const isBrowser = typeof window !== 'undefined';

const serverBase =
  environment.apiUrl ||
  (globalThis as any).API_URL ||
  (typeof process !== 'undefined' ? process.env['API_URL'] : undefined) ||
  'http://localhost:8080';

const clientBase = environment.apiUrl || 'http://localhost:8080';

axios.defaults.baseURL = isBrowser ? clientBase : serverBase;

axios.interceptors.request.use(cfg => {
  if (!isBrowser && cfg.url && cfg.url.startsWith('/')) {
    cfg.url = serverBase.replace(/\/+$/, '') + cfg.url;
  }

  if (isBrowser) {
    const token = localStorage.getItem('access_token');
    const type  = localStorage.getItem('token_type') || 'Bearer';
    if (token) {
      cfg.headers = cfg.headers ?? {};
      (cfg.headers as any).Authorization = `${type} ${token}`;
    }
  }
  return cfg;
});

// 401 chung: xoá token + đưa về login (không còn logic “bị khóa”)
axios.interceptors.response.use(
  r => r,
  err => {
    if (isBrowser && err?.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('fs_role');
      window.location.href = '/login';
      return;
    }
    return Promise.reject(err);
  }
);

export default axios;
