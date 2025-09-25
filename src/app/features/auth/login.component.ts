import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="d-flex align-items-center justify-content-center vh-100 bg-gradient">
    <div class="card shadow-lg border-0 rounded-4 animate__animated animate__fadeInUp" style="width: 420px;">
      <div class="card-body p-5">
        <!-- Logo + Title -->
        <div class="text-center mb-4">
          <i class="bi bi-shop fs-1 text-primary"></i>
          <h2 class="fw-bold mt-2 text-dark">FashionStore</h2>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" #f="ngForm" novalidate>
          <!-- Username -->
          <div class="form-floating mb-3">
            <input type="text" class="form-control rounded-3" id="username"
                   placeholder="Tên đăng nhập"
                   [(ngModel)]="username" name="username" required autocomplete="username">
            <label for="username"><i class="bi bi-person-circle me-2"></i>Tên đăng nhập</label>
          </div>

          <!-- Password -->
          <div class="form-floating mb-3">
            <input type="password" class="form-control rounded-3" id="password"
                   placeholder="Mật khẩu"
                   [(ngModel)]="password" name="password" required autocomplete="current-password">
            <label for="password"><i class="bi bi-lock-fill me-2"></i>Mật khẩu</label>
          </div>

          <!-- Submit -->
          <button class="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm"
                  type="submit" [disabled]="loading || !f.form.valid">
            <i *ngIf="loading" class="spinner-border spinner-border-sm me-2"></i>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        <!-- Links -->
        <div class="d-flex justify-content-between mt-4">
          <a routerLink="/register" class="text-decoration-none fw-medium text-primary">
            <i class="bi bi-person-plus"></i> Đăng ký
          </a>
          <a href="#" class="text-decoration-none fw-medium text-secondary">
            <i class="bi bi-key"></i> Quên mật khẩu?
          </a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .bg-gradient {
      background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (this.loading) return;
    this.loading = true;
    try {
      await this.auth.login(this.username.trim(), this.password);

      // lấy role từ AuthService / localStorage
      const role = localStorage.getItem('fs_role');
      if (role === 'ADMIN') {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/');
      }
    } catch (e: any) {
  const status = e?.response?.status;
  if (status === 401 || status === 403) {
    alert('Sai tài khoản hoặc mật khẩu.');
  } else {
    alert('Đăng nhập thất bại. Vui lòng thử lại.');
  }
}
  }
}
