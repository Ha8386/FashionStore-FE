import axios from './axios.config';
import { Page } from '../services/page'; // import interface Page<T>

export interface ProductPayload {
  name: string;
  slug?: string;
  color?: string;
  price?: number;
  quantity?: number;
  description?: string;
  categoryId: number;
  brandId: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  thumbnail: boolean;
  sortOrder: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  brandName: string;
  color: string;
  price: number;
  quantity: number;
  status: string;
  description?: string;
  images?: ProductImage[]; // khi gọi detail thì có
}

export const ProductApi = {
  // === LIST ===
  list: async (params?: {
    keyword?: string;
    categoryId?: number;
    brandId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Page<ProductResponse>> => {
    const r = await axios.get('/api/admin/products', { params });
    return r.data as Page<ProductResponse>; // ✅ đủ field: content, number, size, totalElements, totalPages, first, last
  },

  // === DETAIL ===
  get: async (id: number): Promise<ProductResponse> => {
    const r = await axios.get(`/api/admin/products/${id}`);
    return r.data;
  },

  // === CREATE ===
  create: async (payload: ProductPayload): Promise<{ id: number }> => {
    const r = await axios.post('/api/admin/products', payload);
    return r.data;
  },

  // === UPDATE ===
  update: async (id: number, payload: ProductPayload): Promise<void> => {
    await axios.put(`/api/admin/products/${id}`, payload);
  },

  // === DELETE ===
  remove: async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/products/${id}`);
  },

  // === UPLOAD IMAGES ===
  uploadImages: async (id: number, files: File[]): Promise<ProductImage[]> => {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    const r = await axios.post(`/api/admin/products/${id}/images`, form);
    return r.data as ProductImage[];
  },

  // === DELETE IMAGE ===
  deleteImage: async (productId: number, imageId: number): Promise<void> => {
    await axios.delete(`/api/admin/products/${productId}/images/${imageId}`);
  },

  // === SET THUMBNAIL ===
  setThumbnail: async (productId: number, imageId: number): Promise<void> => {
    await axios.put(`/api/admin/products/${productId}/images/${imageId}/thumbnail`, {});
  }
};
