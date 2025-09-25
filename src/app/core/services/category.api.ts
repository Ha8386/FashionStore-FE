import axios from './axios.config';
import { Category } from '../models/category';

export const CategoryApi = {
  get: async (id: number): Promise<Category> =>
    (await axios.get<Category>(`/api/admin/categories/${id}`)).data,

  list: async (): Promise<Category[]> =>
    (await axios.get<Category[]>('/api/admin/categories')).data,

  create: async (payload: Partial<Category>): Promise<{ id: number }> =>
    (await axios.post<{ id: number }>('/api/admin/categories', payload)).data,

  update: async (id: number, payload: Partial<Category>): Promise<void> =>
    (await axios.put<void>(`/api/admin/categories/${id}`, payload)).data,

  remove: async (id: number): Promise<void> =>
    (await axios.delete<void>(`/api/admin/categories/${id}`)).data,

  uploadImage: async (id: number, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    return (await axios.post<string>(`/api/admin/categories/${id}/upload-image`, form)).data;
  },
};
