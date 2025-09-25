import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-admin-layout',
  template: `
  <div class="admin-wrap d-flex">
    <!-- Sidebar -->
    <aside class="sidebar border-end">
      <div class="brand px-3 py-3">
        <a routerLink="/admin" class="d-inline-flex align-items-center text-decoration-none">
          <i class="bi bi-speedometer2 me-2 fs-5 text-primary"></i>
          <span class="fw-bold">Admin</span>
        </a>
      </div>

      <nav class="nav flex-column px-2">
        <a routerLink="/admin" routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }"
           class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-house"></i> <span>Dashboard</span>
        </a>

        <div class="text-uppercase small text-muted mt-3 mb-1 px-2">Quản lý</div>

        <a routerLink="/admin/products" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-box-seam"></i> <span>Sản phẩm</span>
        </a>
        <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-collection"></i> <span>Danh mục</span>
        </a>
        <a routerLink="/admin/brands" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-tags"></i> <span>Thương hiệu</span>
        </a>
        <a routerLink="/admin/users" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-people"></i> <span>Người dùng</span>
        </a>

        <!-- Bạn có thể mở thêm khi sẵn sàng:
        <a routerLink="/admin/orders" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-receipt"></i> <span>Đơn hàng</span>
        </a>
        -->
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-grow-1 d-flex flex-column">
      <!-- Topbar -->
      <header class="topbar d-flex align-items-center justify-content-between px-3 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary d-md-none" (click)="toggle()">
            <i class="bi bi-list"></i>
          </button>
          <span class="fw-semibold">Bảng điều khiển</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted small d-none d-sm-inline">{{ role || '—' }}</span>
          <button class="btn btn-sm btn-outline-danger" (click)="logout()">
            <i class="bi bi-box-arrow-right me-1"></i> Đăng xuất
          </button>
        </div>
      </header>

      <!-- Routed views -->
      <section class="p-3">
        <router-outlet></router-outlet>
      </section>
    </main>
  </div>
  `,
  styles: [`
    .admin-wrap { min-height: 100vh; background: #f8f9fa; }
    .sidebar { width: 240px; background: #fff; }
    .topbar { height: 56px; background: #fff; }
    .nav-link { color: #495057; border-radius: .5rem; padding: .5rem .75rem; }
    .nav-link.active, .nav-link:hover { background: #e9ecef; color: #0d6efd; }
    /* mobile */
    @media (max-width: 767.98px) {
      .sidebar { position: fixed; z-index: 1040; height: 100vh; transform: translateX(-100%); transition: transform .2s; }
      .sidebar.show { transform: translateX(0); }
      main { margin-left: 0 !important; }
    }
  `]
})
export class AdminLayoutComponent {
  role = localStorage.getItem('fs_role');
  constructor(private auth: AuthService, private router: Router) {}
  toggle() {
    const el = document.querySelector<HTMLElement>('.sidebar');
    if (el) el.classList.toggle('show');
  }
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
