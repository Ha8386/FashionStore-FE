export interface Product {
  id: number;
  name: string;
  color: string;
  price: number;
  quantity: number;
  description: string;
  brandId: number;
  brandName?: string;
  categoryId: number;
  categoryName?: string;
  thumbnailUrl?: string;
  status?: 'Active'|'Closed';
  createdAt?: string;
  updatedAt?: string;
}
