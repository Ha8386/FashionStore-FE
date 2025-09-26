import axios from './axios.config';
import { Brand } from '../models/brand';
import type { Option } from './category.api';

type Page<T> = { content: T[] };
type MaybePage<T> = T[] | Page<T>;

function unwrap<T>(data: MaybePage<T>): T[] {
  return Array.isArray(data) ? data : (data?.content ?? []);
}

async function req<T>(p: Promise<{ data: T }>): Promise<T> {
  try {
    const r = await p;
    return r.data;
  } catch (e: any) {
    const status = e?.response?.status;
    const msg = e?.response?.data ?? e?.message ?? 'Request failed';
    throw new Error(`[BrandApi] ${status ?? ''} ${msg}`);
  }
}

export const BrandApi = {
  get: (id: number) =>
    req<Brand>(axios.get(`/api/admin/brands/${id}`)),

  list: async (params?: { q?: string; page?: number; size?: number; sort?: string }) => {
    const data = await req<MaybePage<Brand>>(axios.get('/api/admin/brands', { params }));
    return unwrap<Brand>(data);
  },

  listOptions: async (): Promise<Option[]> => {
    const rows = await BrandApi.list();
    return rows.map(b => ({ id: b.id as number, name: (b as any).name || (b as any).brandName }));
  },

  create: (payload: Partial<Brand>) =>
    req<{ id: number }>(axios.post('/api/admin/brands', payload)),

  update: (id: number, payload: Partial<Brand>) =>
    req<void>(axios.put(`/api/admin/brands/${id}`, payload)),

  remove: (id: number) =>
    req<void>(axios.delete(`/api/admin/brands/${id}`)),

  // KHÔNG set headers Content-Type để browser tự add boundary
  uploadImage: async (id: number, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file); // backend @RequestParam("file")
    return req<string>(axios.post(`/api/admin/brands/${id}/upload-image`, form));
  },
};
