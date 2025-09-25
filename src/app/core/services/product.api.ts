import axios from './axios.config';

import type { Page } from '../services/page';
import type { Product } from '../models/product';

export interface ProductSaveReq {
  categoryId: number;
  brandId: number;
  name: string;
  slug?: string;
  color?: string;
  price: number;
  quantity: number;
  description?: string;
  imageUrls: string[];
  thumbnailIndex: number;
}

const ADMIN_BASE = '/api/admin/products';
const PUBLIC_BASE = '/api/public/products';

export const ProductApi = {
  // ==== Admin ====
  async list(params: {
    keyword?: string;
    categoryId?: number;
    brandId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Page<Product>> {
    const res = await axios.get<Page<Product>>(ADMIN_BASE, { params });
    return res.data;
  },

  async get(id: number): Promise<Product> {
    const res = await axios.get<Product>(`${ADMIN_BASE}/${id}`);
    return res.data;
  },

  async create(payload: ProductSaveReq): Promise<{ id: number }> {
    const res = await axios.post<{ id: number }>(ADMIN_BASE, payload);
    return res.data;
  },

  async update(id: number, payload: ProductSaveReq): Promise<void> {
    await axios.put<void>(`${ADMIN_BASE}/${id}`, payload);
  },

  async remove(id: number): Promise<void> {
    await axios.delete<void>(`${ADMIN_BASE}/${id}`);
  },

  async bulkRemove(ids: number[]): Promise<void[]> {
    // Gọi trực tiếp ProductApi.remove để không phụ thuộc ngữ cảnh `this`
    return Promise.all(ids.map(id => ProductApi.remove(id)));
  },

  async toggleStatus(id: number): Promise<Product> {
    const res = await axios.patch<Product>(`${ADMIN_BASE}/${id}/status`, null);
    return res.data;
  },

  async uploadImages(productId: number, files: File[]): Promise<string[]> {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    const res = await axios.post<string[]>(
      `${ADMIN_BASE}/${productId}/images`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  // ==== Public ====
  async publicList(params: {
    keyword?: string;
    categoryId?: number;
    brandId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Page<Product>> {
    const res = await axios.get<Page<Product>>(PUBLIC_BASE, { params });
    return res.data;
  },

  async publicGet(id: number): Promise<Product> {
    const res = await axios.get<Product>(`${PUBLIC_BASE}/${id}`);
    return res.data;
  }
} as const;
