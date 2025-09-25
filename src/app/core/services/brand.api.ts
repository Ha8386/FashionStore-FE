// src/app/core/services/brand.api.ts
import axios from './axios.config';
import { Brand } from '../models/brand';

export const BrandApi = {
  get: async (id: number): Promise<Brand> =>
    (await axios.get<Brand>(`/api/admin/brands/${id}`)).data,

  list: async (): Promise<Brand[]> =>
    (await axios.get<Brand[]>('/api/admin/brands')).data,

  create: async (payload: Partial<Brand>): Promise<{ id: number }> =>
    (await axios.post<{ id: number }>('/api/admin/brands', payload)).data,

  update: async (id: number, payload: Partial<Brand>): Promise<void> =>
    (await axios.put<void>(`/api/admin/brands/${id}`, payload)).data,

  remove: async (id: number): Promise<void> =>
    (await axios.delete<void>(`/api/admin/brands/${id}`)).data,

  // KHÔNG set headers Content-Type để browser tự add boundary
  uploadImage: async (id: number, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file); // <-- phải là "file"
    return (await axios.post<string>(`/api/admin/brands/${id}/upload-image`, form)).data;
  },
};
