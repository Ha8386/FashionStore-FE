import axios from './axios.config';


export type Stats = {
  products: number;
  categories: number;
  brands: number;
  users: number;
  orders?: number;
  revenueToday?: number;
};

export type TopProduct = { id: number; name: string; sold: number; price: number; thumbnailUrl?: string; };
export type NewUser = { id: number; username: string; email: string; createdAt?: string; };

export const AdminApi = {
  stats: async () => (await axios.get<Stats>('/api/admin/stats')).data,
  topProducts: async () => (await axios.get<TopProduct[]>('/api/admin/top-products')).data,
  newUsers: async () => (await axios.get<NewUser[]>('/api/admin/new-users')).data,
};
