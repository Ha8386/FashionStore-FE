import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="d-flex align-items-center justify-content-center vh-100 bg-gradient">
    <div class="card shadow-lg border-0 rounded-4" style="width: 520px;">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-shop fs-1 text-primary"></i>
          <h2 class="fw-bold mt-2 text-dark">FashionStore</h2>
        </div>

        <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
          <div class="row g-3">
            <!-- Username -->
            <div class="col-md-6">
              <div class="form-floating">
                <input class="form-control rounded-3" id="username"
                       placeholder="Username" name="username"
                       [(ngModel)]="username" required>
                <label for="username"><i class="bi bi-person-circle me-2"></i>Username</label>
              </div>
              <div class="form-text text-danger" *ngIf="submitted && !username">Vui lòng nhập username</div>
            </div>

            <!-- Email -->
            <div class="col-md-6">
              <div class="form-floating">
                <input type="email" class="form-control rounded-3" id="email"
                       placeholder="Email" name="email"
                       [(ngModel)]="email" required email>
                <label for="email"><i class="bi bi-envelope-at me-2"></i>Email</label>
              </div>
             <div class="form-text text-danger" *ngIf="submitted && (!email || f.controls['email']?.invalid)">
                Email không hợp lệ
                </div>


            </div>

            <!-- Password -->
            <div class="col-md-6">
              <div class="form-floating">
                <input [type]="showPass ? 'text' : 'password'"
                       class="form-control rounded-3" id="password"
                       placeholder="Mật khẩu" name="password"
                       [(ngModel)]="password" required minlength="6">
                <label for="password"><i class="bi bi-lock-fill me-2"></i>Mật khẩu</label>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-1">
                <small class="text-muted">Tối thiểu 6 ký tự</small>
                <button type="button" class="btn btn-link btn-sm text-decoration-none"
                        (click)="showPass = !showPass">
                  <i class="bi" [ngClass]="showPass ? 'bi-eye-slash' : 'bi-eye'"></i>
                  {{ showPass ? 'Ẩn' : 'Hiện' }}
                </button>
              </div>
              <div class="form-text text-danger" *ngIf="submitted && (!password || password.length < 6)">
                Mật khẩu quá ngắn
              </div>
            </div>

            <!-- Confirm -->
            <div class="col-md-6">
              <div class="form-floating">
                <input [type]="showConfirm ? 'text' : 'password'"
                       class="form-control rounded-3" id="confirm"
                       placeholder="Nhập lại mật khẩu" name="confirm"
                       [(ngModel)]="confirm" required>
                <label for="confirm"><i class="bi bi-shield-lock me-2"></i>Nhập lại mật khẩu</label>
              </div>
              <div class="d-flex justify-content-end mt-1">
                <button type="button" class="btn btn-link btn-sm text-decoration-none"
                        (click)="showConfirm = !showConfirm">
                  <i class="bi" [ngClass]="showConfirm ? 'bi-eye-slash' : 'bi-eye'"></i>
                  {{ showConfirm ? 'Ẩn' : 'Hiện' }}
                </button>
              </div>
              <div class="form-text text-danger" *ngIf="submitted && confirm !== password">
                Mật khẩu nhập lại không khớp
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button class="btn btn-primary w-100 py-2 rounded-3 fw-semibold mt-3 shadow-sm"
                  type="submit" [disabled]="loading">
            <i *ngIf="loading" class="spinner-border spinner-border-sm me-2"></i>
            {{ loading ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
          </button>
        </form>

        <div class="text-center mt-4">
          <span class="text-muted me-1">Đã có tài khoản?</span>
          <a routerLink="/login" class="text-decoration-none fw-medium">Đăng nhập</a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .bg-gradient { background: linear-gradient(135deg, #f8f9fa, #e3f2fd); }
  `]
})
export class RegisterComponent {
  username = ''; email = ''; password = ''; confirm = '';
  showPass = false; showConfirm = false;
  loading = false; submitted = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(f: NgForm) {
    this.submitted = true;
    if (!f.valid || this.password !== this.confirm) return;
    this.loading = true;
    try {
      await this.auth.register({
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password
      });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      this.router.navigateByUrl('/login');
    } catch (e) {
      alert('Đăng ký thất bại. Vui lòng thử lại.');
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
