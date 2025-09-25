// src/app/core/services/user.api.ts
import axios from './axios.config';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BLOCKED';
}

export interface UserUpdateRequest {
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BLOCKED';
  password?: string;
}

export const UserApi = {
  list: async (): Promise<User[]> =>
    (await axios.get<User[]>('/api/admin/users')).data,

  get: async (id: number): Promise<User> =>
    (await axios.get<User>(`/api/admin/users/${id}`)).data,

  update: async (id: number, body: UserUpdateRequest): Promise<void> =>
    (await axios.put<void>(`/api/admin/users/${id}`, body)).data,

  remove: async (id: number): Promise<void> =>
    (await axios.delete<void>(`/api/admin/users/${id}`)).data,
};
