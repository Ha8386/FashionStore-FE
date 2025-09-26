import { Injectable } from '@angular/core';
import axios, { AxiosError } from 'axios';

export type Role = 'USER' | 'ADMIN';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'fs_token';
  private roleKey  = 'fs_role';
  private loginFlagKey = 'fs_session';

  constructor() { axios.defaults.withCredentials = true; }

  /** helper: chỉ dùng localStorage khi chạy browser */
  private get storage() {
    return (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : undefined;
  }

  get token()      { return this.storage?.getItem(this.tokenKey) || null; }
  get isLoggedIn() { return !!this.token || this.storage?.getItem(this.loginFlagKey) === '1'; }
  get role()       { return this.storage?.getItem(this.roleKey) as ('ADMIN'|'USER'|null); }

  logout() {
    this.storage?.removeItem(this.tokenKey);
    this.storage?.removeItem(this.roleKey);
    this.storage?.removeItem(this.loginFlagKey);
  }

  private normalizeRole(v: any): 'ADMIN'|'USER' {
    const s = String(v ?? '').toUpperCase();
    if (s.includes('ADMIN')) return 'ADMIN';
    return 'USER';
  }

  /** Giải mã JWT (không verify) để lấy claim role/authorities */
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
      const val = typeof c === 'object' && c.authority ? c.authority : c;
      const norm = this.normalizeRole(val);
      if (norm) { this.storage?.setItem(this.roleKey, norm); return; }
    }
  }

  async login(username: string, password: string) {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      const body: any = res.data || {};

      let token: string | undefined;
      if (body.token) token = body.token;
      else if (body.accessToken) token = body.accessToken;
      else if (body.jwt) token = body.jwt;
      else if (res.headers && res.headers['authorization']) {
        token = String(res.headers['authorization']).replace(/^Bearer\s+/i, '');
      }

      if (token) {
        this.storage?.setItem(this.tokenKey, token);
        this.setRoleFromJwt(token);
      }

      this.setRoleFromBody(body);

      if (!this.storage?.getItem(this.roleKey)) {
        const me = await this.fetchMeSafe();
        if (me) {
          this.storage?.setItem(this.loginFlagKey, '1');
          this.setRoleFromMe(me);
        }
      }

      if (!this.storage?.getItem(this.roleKey)) {
        this.storage?.setItem(this.roleKey, 'USER');
      }

      return token || 'session';
    } catch (err) {
      const e = err as AxiosError<any>;
      console.error('[AuthService.login] error', e.response?.status, e.response?.data || e.message);
      throw e;
    }
  }

  async register(payload: { username: string; email: string; password: string; role?: Role }) {
    return axios.post('/api/auth/register', payload).then(r => r.data);
  }

  async me() { return axios.get('/api/auth/me').then(r => r.data); }
  private async fetchMeSafe() { try { return await this.me(); } catch { return null; } }
}
