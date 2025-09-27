// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export type Role = 'USER' | 'ADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'fs_token';
  private tokenTypeKey = 'fs_token_type';
  private roleKey = 'fs_role';
  private loginFlagKey = 'fs_session'; // đánh dấu đã login (cho session phía BE nếu cần)
  private refreshKey = 'fs_refresh_token'; // nếu BE trả refreshToken thì dùng, không có cũng không sao

  constructor() {
    // Khởi tạo interceptor 1 lần
    this.setupAxiosAuthInterceptor();
    // Đồng bộ header Authorization nếu đã có token từ localStorage (F5)
    const tok = this.token;
    const typ = this.tokenType || 'Bearer';
    if (tok) {
      axios.defaults.headers.common['Authorization'] = `${typ} ${tok}`;
    }
  }

  /** localStorage chỉ tồn tại trên browser */
  private get storage() {
    return (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : undefined;
  }

  // ===== Getters =====
  get token() { return this.storage?.getItem(this.tokenKey) || null; }
  get tokenType() { return this.storage?.getItem(this.tokenTypeKey) || null; }
  get isLoggedIn() {
    const tok = this.token;
    if (!tok) return this.storage?.getItem(this.loginFlagKey) === '1';
    return !this.isTokenExpired(tok) || this.storage?.getItem(this.loginFlagKey) === '1';
  }
  get role() { return this.storage?.getItem(this.roleKey) as Role | null; }

  // ===== Core helpers =====
  private saveToken(token: string, type: string = 'Bearer') {
    this.storage?.setItem(this.tokenKey, token);
    this.storage?.setItem(this.tokenTypeKey, type);
    axios.defaults.headers.common['Authorization'] = `${type} ${token}`;
  }

  private clearToken() {
    this.storage?.removeItem(this.tokenKey);
    this.storage?.removeItem(this.tokenTypeKey);
    delete axios.defaults.headers.common['Authorization'];
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const exp = Number(payload?.exp);
      if (!exp) return false; // nếu không có exp thì coi như không kiểm
      const nowSec = Math.floor(Date.now() / 1000);
      return exp <= nowSec;
    } catch { return false; }
  }

  logout() {
    // Gọi API logout nếu có (không bắt buộc)
    axios.post('/api/auth/logout').catch(() => void 0);
    this.clearToken();
    this.storage?.removeItem(this.roleKey);
    this.storage?.removeItem(this.loginFlagKey);
    this.storage?.removeItem(this.refreshKey);
  }

  // ===== Role helpers =====
  private normalizeRole(v: any): Role {
    const s = String(v ?? '').toUpperCase();
    return s.includes('ADMIN') ? 'ADMIN' : 'USER';
  }

  private setRoleFromJwt(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const candidates: any[] = [
        payload?.role,
        ...(Array.isArray(payload?.authorities) ? payload.authorities : [payload?.authorities].filter(Boolean)),
        ...(Array.isArray(payload?.roles) ? payload.roles : [payload?.roles].filter(Boolean)),
      ];
      for (const c of candidates) {
        if (!c) continue;
        const val = typeof c === 'object' && c.authority ? c.authority : c;
        const norm = this.normalizeRole(val);
        if (norm) { this.storage?.setItem(this.roleKey, norm); return; }
      }
    } catch { /* ignore */ }
  }

  private setRoleFromBody(body: any) {
    if (!body) return;
    const candidates: any[] = [
      body?.role, body?.user?.role,
      ...(Array.isArray(body?.roles) ? body.roles : []),
      ...(Array.isArray(body?.user?.roles) ? body.user.roles : []),
      ...(Array.isArray(body?.authorities) ? body.authorities : []),
      ...(Array.isArray(body?.user?.authorities) ? body.user.authorities : []),
    ];
    for (const c of candidates) {
      if (!c) continue;
      const val = typeof c === 'object' && c.authority ? c.authority : c;
      const norm = this.normalizeRole(val);
      if (norm) { this.storage?.setItem(this.roleKey, norm); return; }
    }
  }

  private setRoleFromMe(me: any) {
    if (!me) return;
    const candidates: any[] = [
      me?.role,
      ...(Array.isArray(me?.roles) ? me.roles : []),
      ...(Array.isArray(me?.authorities) ? me.authorities : []),
    ];
    for (const c of candidates) {
      if (!c) continue;
      const val = typeof c === 'object' && c.authority ? c.authority : c;
      const norm = this.normalizeRole(val);
      if (norm) { this.storage?.setItem(this.roleKey, norm); return; }
    }
  }

  // ===== Axios auth interceptor =====
  private setupAxiosAuthInterceptor() {
  // Request
  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const tok = this.token;
    const typ = this.tokenType || 'Bearer';
    if (tok) {
      const h = config.headers as any;
      if (typeof h?.set === 'function') {
        h.set('Authorization', `${typ} ${tok}`);
      } else {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `${typ} ${tok}`;
      }
    }
    return config;
  });

  // Response
  axios.interceptors.response.use(
    (res) => res,  // không cần chỉ rõ AxiosResponse
    async (error: AxiosError) => {
      const status = error?.response?.status;
      if ((status === 401 || status === 403) && this.storage) {
        const tok = this.token;
        const rtk = this.storage.getItem(this.refreshKey);
        if (rtk && tok && this.isTokenExpired(tok)) {
          try {
            const { data } = await axios.post('/api/auth/refresh', { refreshToken: rtk });
            const newToken: string = (data as any)?.token || (data as any)?.accessToken || (data as any)?.jwt;
            const newType: string = (data as any)?.tokenType || 'Bearer';

            if (newToken) {
              this.saveToken(newToken, newType);
              this.setRoleFromJwt(newToken);

              const original = error.config as InternalAxiosRequestConfig;
              const h = original.headers as any;
              if (typeof h?.set === 'function') {
                h.set('Authorization', `${this.tokenType || 'Bearer'} ${newToken}`);
              } else {
                original.headers = original.headers || {};
                (original.headers as any)['Authorization'] = `${this.tokenType || 'Bearer'} ${newToken}`;
              }
              return axios.request(original);
            }
          } catch {
            this.logout();
          }
        }
      }
      return Promise.reject(error);
    }
  );
}


  // ===== Auth APIs =====
  async login(username: string, password: string) {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      const body: any = res.data || {};

      // Thu thập token từ body hoặc header
      let token: string | undefined =
        body.token || body.accessToken || body.jwt ||
        (res.headers && (res.headers['authorization'] as string | undefined)?.replace(/^Bearer\s+/i, ''));

      const tokenType = body.tokenType || 'Bearer';
      if (token) {
        this.saveToken(token, tokenType);
        this.setRoleFromJwt(token);
      }

      // refreshToken (nếu BE trả)
      if (body.refreshToken) {
        this.storage?.setItem(this.refreshKey, body.refreshToken);
      }

      // Nếu response có role/authorities → set luôn
      this.setRoleFromBody(body);

      // Nếu vẫn chưa có role thì /me (mềm)
      if (!this.storage?.getItem(this.roleKey)) {
        const me = await this.fetchMeSafe();
        if (me) this.setRoleFromMe(me);
      }

      // fallback role
      if (!this.storage?.getItem(this.roleKey)) this.storage?.setItem(this.roleKey, 'USER');

      // Đánh dấu đã login (kể cả BE dùng session)
      this.storage?.setItem(this.loginFlagKey, '1');

      return token || 'session';
    } catch (err) {
      const e = err as AxiosError<any>;
      // Log gọn gàng cho dev
      console.error('[AuthService.login] error', e.response?.status, e.response?.data || e.message);
      throw e; // để component hiện toast theo status/message
    }
  }

  async register(payload: { username: string; email: string; password: string; role?: Role }) {
    return axios.post('/api/auth/register', payload).then(r => r.data);
  }

  /** Lấy me; 401/403 → trả null, không redirect */
  async me() {
    try {
      const { data } = await axios.get('/api/auth/me');
      return data;
    } catch (e: any) {
      const st = e?.response?.status;
      if (st === 401 || st === 403) return null;
      return null;
    }
  }
  private async fetchMeSafe() { try { return await this.me(); } catch { return null; } }

  /** Đọc nhanh username từ token để hiển thị ngay */
  getUserFromToken(): { username?: string } | null {
    try {
      const token = this.storage?.getItem(this.tokenKey);
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return { username: payload.username || payload.sub };
    } catch { return null; }
  }
}
