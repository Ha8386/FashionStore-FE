import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Shop
  { path: '', loadComponent: () => import('./features/shop/home.component').then(m => m.HomeComponent) },
  { path: 'product/:id', loadComponent: () => import('./features/shop/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'search', loadComponent: () => import('./features/shop/search.component').then(m => m.SearchComponent) },

  // Auth
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },

  // Admin
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard], // nếu muốn cả check login + quyền admin
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard.component').then(m => m.DashboardComponent) },

      // Users
      { path: 'users', loadComponent: () => import('./features/admin/users/user-list.component').then(m => m.UserListComponent) },
      { path: 'users/new', loadComponent: () => import('./features/admin/users/user-form.component').then(m => m.UserFormComponent) },
      { path: 'users/:id', loadComponent: () => import('./features/admin/users/user-form.component').then(m => m.UserFormComponent) },

      // Brands
      { path: 'brands', loadComponent: () => import('./features/admin/brands/brand-list.component').then(m => m.BrandListComponent) },
      { path: 'brands/edit/:id', loadComponent: () => import('./features/admin/brands/brand-form.component').then(m => m.BrandFormComponent) },
      { path: 'brands/new', loadComponent: () => import('./features/admin/brands/brand-form.component').then(m => m.BrandFormComponent) },
      { path: 'brands/:id', loadComponent: () => import('./features/admin/brands/brand-form.component').then(m => m.BrandFormComponent) },

      // Categories
      { path: 'categories', loadComponent: () => import('./features/admin/categories/category-list.component').then(m => m.CategoryListComponent) },
      { path: 'categories/new', loadComponent: () => import('./features/admin/categories/category-form.component').then(m => m.CategoryFormComponent) },
      { path: 'categories/:id', loadComponent: () => import('./features/admin/categories/category-form.component').then(m => m.CategoryFormComponent) },

      // Products
      { path: 'products', loadComponent: () => import('./features/admin/products/product-list.component').then(m => m.ProductListComponent) },
      { path: 'products/new', loadComponent: () => import('./features/admin/products/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'products/:id', loadComponent: () => import('./features/admin/products/product-form.component').then(m => m.ProductFormComponent) },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
