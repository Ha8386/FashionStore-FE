// src/app/core/services/product.api.ts
import axios from './axios.config';
import { Page } from '../services/page';

/* ====== Types ====== */
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

export type ProductRow = {
  id: number;
  name: string;
  price?: number;
  quantity?: number;
  description?: string;
  status?: string;
};

export interface ProductImage {
  id: number;
  imageUrl: string;      // camelCase cho Admin (BE trả imageUrl)
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

/* ====== API ====== */
export const ProductApi = {
  /* ---------- PUBLIC (shop/search) ---------- */

  /** Danh sách sản phẩm public + lọc + sắp xếp + phân trang */
  listPublic: (params?: {
    keyword?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    sort?: string; // "createdAt,desc" | "price,asc" ...
  }): Promise<Page<ProductResponse>> =>
    axios.get('/api/public/products', { params }).then(r => r.data as Page<ProductResponse>),

  /** Chi tiết public */
  getPublic: (id: number): Promise<ProductResponse> =>
    axios.get(`/api/public/products/${id}`).then(r => r.data as ProductResponse),

  /** Ảnh sản phẩm (public) – nếu cần lấy riêng */
  imagesPublic: (productId: number): Promise<Array<{
    id: number;
    image_url: string;
    is_thumbnail: boolean;
    sort_order: number;
  }>> => axios.get(`/api/public/products/${productId}/images`).then(r => r.data),

  /** Danh mục/Thương hiệu (public) */
  categories: () =>
    axios.get<Array<{ id: number; name: string }>>('/api/public/categories').then(r => r.data),

  brands: () =>
    axios.get<Array<{ id: number; name: string }>>('/api/public/brands').then(r => r.data),

  /* ---------- ADMIN (quản trị) ---------- */

  listAdmin: (params?: {
    keyword?: string;
    categoryId?: number;
    brandId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Page<ProductResponse>> =>
    axios.get('/api/admin/products', { params }).then(r => r.data as Page<ProductResponse>),

  getAdmin: (id: number): Promise<ProductResponse> =>
    axios.get(`/api/admin/products/${id}`).then(r => r.data as ProductResponse),

  create: (payload: ProductPayload): Promise<{ id: number }> =>
    axios.post('/api/admin/products', payload).then(r => r.data),

  update: (id: number, payload: ProductPayload): Promise<void> =>
    axios.put(`/api/admin/products/${id}`, payload).then(() => {}),

  remove: (id: number): Promise<void> =>
    axios.delete(`/api/admin/products/${id}`).then(() => {}),

  uploadImages: (id: number, files: File[]): Promise<ProductImage[]> => {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    return axios.post(`/api/admin/products/${id}/images`, form).then(r => r.data as ProductImage[]);
  },

  deleteImage: (productId: number, imageId: number): Promise<void> =>
    axios.delete(`/api/admin/products/${productId}/images/${imageId}`).then(() => {}),

  setThumbnail: (productId: number, imageId: number): Promise<void> =>
    axios.put(`/api/admin/products/${productId}/images/${imageId}/thumbnail`, {}).then(() => {}),

  /* ---------- ALIASES (tương thích code cũ) ---------- */
  list(params?: any) {
    return (this as any).listAdmin(params);
  },
  get(id: number) {
    return (this as any).getAdmin(id);
  },
};
