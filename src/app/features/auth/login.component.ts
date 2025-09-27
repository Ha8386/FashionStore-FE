import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="auth-bg d-flex align-items-center justify-content-center min-vh-100 position-relative overflow-hidden">
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>

    <div class="card auth-card shadow-2xl border-0 rounded-4 animate-rise">
      <div class="card-body p-5">
        <!-- Logo + Title -->
        <div class="text-center mb-4">
          <div class="brand-circle mx-auto">
            <i class="bi bi-shop"></i>
          </div>
          <h2 class="fw-bold mt-3 text-dark">FashionStore</h2>
          <p class="text-secondary mb-0">Đăng nhập để tiếp tục</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" #f="ngForm" novalidate>
          <!-- Username -->
          <div class="form-floating mb-3">
            <input type="text" class="form-control rounded-3 form-control-elevate"
                   id="username" placeholder="Tên đăng nhập"
                   [(ngModel)]="username" name="username" required autocomplete="username">
            <label for="username"><i class="bi bi-person-circle me-2"></i>Tên đăng nhập</label>
            <div class="invalid-hint" *ngIf="submitted && !username">Vui lòng nhập tên đăng nhập</div>
          </div>

          <!-- Password (toggle) -->
          <div class="form-floating mb-3 position-relative">
            <input [type]="showPass ? 'text' : 'password'"
                   class="form-control rounded-3 form-control-elevate pe-5"
                   id="password" placeholder="Mật khẩu"
                   [(ngModel)]="password" name="password" required autocomplete="current-password">
            <label for="password"><i class="bi bi-lock-fill me-2"></i>Mật khẩu</label>
            <button type="button" class="btn btn-link btn-sm toggle-eye" (click)="showPass = !showPass" tabindex="-1">
              <i class="bi" [ngClass]="showPass ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
            <div class="invalid-hint" *ngIf="submitted && !password">Vui lòng nhập mật khẩu</div>
          </div>

          <!-- Submit -->
          <button class="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm btn-ripple"
                  type="submit" [disabled]="loading || !f.form.valid" (click)="ripple($event)">
            <i *ngIf="loading" class="spinner-border spinner-border-sm me-2"></i>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        <!-- Links -->
        <div class="d-flex justify-content-between mt-4 small">
          <a routerLink="/register" class="text-decoration-none fw-medium link-animated">
            <i class="bi bi-person-plus"></i> Đăng ký
          </a>
          <a href="#" class="text-decoration-none fw-medium text-secondary link-animated">
            <i class="bi bi-key"></i> Quên mật khẩu?
          </a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    /* ===== Background & floating blobs ===== */
    .auth-bg { background: radial-gradient(1200px 600px at 110% -10%, #cfe9ff 0%, #f5f7fb 40%, #ffffff 100%); }
    .bg-shape {
      position: absolute; filter: blur(40px); opacity: .45; border-radius: 50%;
      animation: float 12s ease-in-out infinite;
    }
    .bg-shape-1 { width: 420px; height: 420px; background: #9fd0ff; top: -80px; left: -80px; }
    .bg-shape-2 { width: 520px; height: 520px; background: #ffd6e6; bottom: -120px; right: -120px; animation-delay: 2s; }
    @keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(18px) } }

    /* ===== Card ===== */
    .auth-card {
      width: 420px; backdrop-filter: blur(10px);
      background: rgba(255,255,255,.85); border: 1px solid rgba(255,255,255,.5);
    }
    .shadow-2xl { box-shadow: 0 30px 80px rgba(20, 40, 90, .15); }
    .animate-rise { animation: rise .6s ease-out both; }
    @keyframes rise { from { opacity: 0; transform: translateY(12px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }

    /* ===== Brand circle ===== */
    .brand-circle{
      width: 64px; height: 64px; display:grid; place-items:center; border-radius:50%;
      background: linear-gradient(145deg, #4e8df5, #7ab8ff); color:#fff; font-size: 28px;
      box-shadow: 0 8px 20px rgba(78,141,245,.35);
    }

    /* ===== Inputs ===== */
    .form-control-elevate {
      transition: box-shadow .2s ease, transform .08s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,.03);
    }
    .form-control-elevate:focus {
      box-shadow: 0 6px 22px rgba(37,99,235,.18), 0 0 0 .2rem rgba(13,110,253,.15);
      transform: translateY(-1px);
    }
    .invalid-hint { color: #dc3545; font-size: .85rem; margin-top: .25rem; }

    .toggle-eye {
      position: absolute; right: .5rem; top: 50%; transform: translateY(-50%);
      padding: .25rem .5rem; color: #6c757d;
    }
    .toggle-eye:hover{ color: #0d6efd; }

    /* ===== Links ===== */
    .link-animated { position: relative; }
    .link-animated::after{
      content:""; position:absolute; left:0; bottom:-2px; width:0; height:2px; background:#0d6efd; transition:width .25s ease;
    }
    .link-animated:hover::after{ width:100%; }

    /* ===== Ripple on button ===== */
    .btn-ripple{ position: relative; overflow: hidden; }
    .btn-ripple span.rip {
      position:absolute; border-radius:50%; transform:translate(-50%,-50%);
      pointer-events:none; animation:rip .6s ease-out forwards; background:rgba(255,255,255,.5);
    }
    @keyframes rip { from{ width:0; height:0; opacity:.6 } to{ width:380px; height:380px; opacity:0 } }
  `]
})
export class LoginComponent {
  username = ''; password = ''; loading = false; submitted = false; showPass = false;

  constructor(private auth: AuthService, private router: Router) {}

  ripple(e: MouseEvent){
    const btn = e.currentTarget as HTMLElement;
    const s = document.createElement('span'); s.className = 'rip';
    s.style.left = e.offsetX + 'px'; s.style.top = e.offsetY + 'px';
    btn.appendChild(s); setTimeout(()=>s.remove(), 600);
  }

  async onSubmit() {
    if (this.loading) return;
    this.submitted = true;
    this.loading = true;
    try {
      await this.auth.login(this.username.trim(), this.password);
      const role = localStorage.getItem('fs_role');
      this.router.navigateByUrl(role === 'ADMIN' ? '/admin' : '/');
    } catch (e: any) {
      const status = e?.response?.status;
      const body   = e?.response?.data;
      const blocked =
        status === 423 ||
        String(body).includes('ACCOUNT_BLOCKED') ||
        String(body?.message).includes('ACCOUNT_BLOCKED');

      if (blocked) {
        alert('Tài khoản bị khóa');
      } else if (status === 401 || status === 403) {
        alert('Sai tài khoản hoặc mật khẩu.');
      } else {
        alert('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      this.loading = false;
    }
  }
}
