export interface User {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role: 'ADMIN'|'USER';
  status?: 'Active'|'Closed';
}