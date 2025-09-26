import axios from './axios.config';
import { Category } from '../models/category';

type Page<T> = { content: T[]; totalElements?: number; totalPages?: number; number?: number; size?: number };
type MaybePage<T> = T[] | Page<T>;
export type Option = { id: number; name: string };

// helper: bóc dữ liệu từ mảng hoặc Page
function unwrap<T>(data: MaybePage<T>): T[] {
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// helper chung: bắt lỗi đẹp
async function req<T>(p: Promise<{ data: T }>): Promise<T> {
  try {
    const r = await p;
    return r.data;
  } catch (e: any) {
    const status = e?.response?.status;
    const msg = e?.response?.data ?? e?.message ?? 'Request failed';
    throw new Error(`[CategoryApi] ${status ?? ''} ${msg}`);
  }
}

export const CategoryApi = {
  get: (id: number) =>
    req<Category>(axios.get(`/api/admin/categories/${id}`)),

  // hỗ trợ params nếu BE có phân trang/tìm kiếm
  list: async (params?: { q?: string; page?: number; size?: number; sort?: string }) => {
    const data = await req<MaybePage<Category>>(axios.get('/api/admin/categories', { params }));
    return unwrap<Category>(data);
  },

  listOptions: async (): Promise<Option[]> => {
    const rows = await CategoryApi.list();
    return rows.map(c => ({ id: c.id as number, name: (c as any).name || (c as any).categoryName }));
  },

  create: (payload: Partial<Category>) =>
    req<{ id: number }>(axios.post('/api/admin/categories', payload)),

  update: (id: number, payload: Partial<Category>) =>
    req<void>(axios.put(`/api/admin/categories/${id}`, payload)),

  remove: (id: number) =>
    req<void>(axios.delete(`/api/admin/categories/${id}`)),

  // KHÔNG set headers Content-Type để browser tự add boundary
  uploadImage: async (id: number, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file); // backend @RequestParam("file")
    return req<string>(axios.post(`/api/admin/categories/${id}/upload-image`, form));
  },
};
