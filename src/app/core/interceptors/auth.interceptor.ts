import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from '../services/auth.service';

export function installAxiosInterceptors(auth: AuthService) {
  // Cho phép gửi cookie khi BE dùng session
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = auth.token;
    if (token) {
      if (!config.headers) config.headers = new AxiosHeaders();
      (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
    }
    return config;
  });
}
