import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="auth-bg d-flex align-items-center justify-content-center min-vh-100 position-relative overflow-hidden">
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>

    <div class="card auth-card shadow-2xl border-0 rounded-4 animate-rise" style="width: 560px;">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <div class="brand-circle mx-auto"><i class="bi bi-person-plus"></i></div>
          <h2 class="fw-bold mt-3 text-dark">Tạo tài khoản</h2>
          <p class="text-secondary mb-0">Tham gia FashionStore ngay hôm nay</p>
        </div>

        <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
          <div class="row g-3">
            <!-- Username -->
            <div class="col-md-6">
              <div class="form-floating">
                <input class="form-control rounded-3 form-control-elevate" id="username"
                       placeholder="Username" name="username"
                       [(ngModel)]="username" required>
                <label for="username"><i class="bi bi-person-circle me-2"></i>Username</label>
              </div>
              <div class="invalid-hint" *ngIf="submitted && !username">Vui lòng nhập username</div>
            </div>

            <!-- Email -->
            <div class="col-md-6">
              <div class="form-floating">
                <input type="email" class="form-control rounded-3 form-control-elevate" id="email"
                       placeholder="Email" name="email"
                       [(ngModel)]="email" required email>
                <label for="email"><i class="bi bi-envelope-at me-2"></i>Email</label>
              </div>
              <div class="invalid-hint" *ngIf="submitted && (!email || f.controls['email']?.invalid)">
                Email không hợp lệ
              </div>
            </div>

            <!-- Password -->
            <div class="col-md-6">
              <div class="form-floating position-relative">
                <input [type]="showPass ? 'text' : 'password'"
                       class="form-control rounded-3 form-control-elevate pe-5" id="password"
                       placeholder="Mật khẩu" name="password"
                       [(ngModel)]="password" required minlength="6" (input)="calcStrength()">
                <label for="password"><i class="bi bi-lock-fill me-2"></i>Mật khẩu</label>
                <button type="button" class="btn btn-link btn-sm toggle-eye" (click)="showPass = !showPass" tabindex="-1">
                  <i class="bi" [ngClass]="showPass ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
              <div class="d-flex align-items-center gap-2 mt-1">
                <div class="progress flex-grow-1" style="height: 6px;">
                  <div class="progress-bar" role="progressbar"
                       [style.width.%]="strength"
                       [class.bg-danger]="strength<40"
                       [class.bg-warning]="strength>=40 && strength<70"
                       [class.bg-success]="strength>=70"></div>
                </div>
                <small class="text-muted">{{ strengthLabel }}</small>
              </div>
              <div class="invalid-hint" *ngIf="submitted && (!password || password.length < 6)">
                Mật khẩu tối thiểu 6 ký tự
              </div>
            </div>

            <!-- Confirm -->
            <div class="col-md-6">
              <div class="form-floating position-relative">
                <input [type]="showConfirm ? 'text' : 'password'"
                       class="form-control rounded-3 form-control-elevate pe-5" id="confirm"
                       placeholder="Nhập lại mật khẩu" name="confirm"
                       [(ngModel)]="confirm" required>
                <label for="confirm"><i class="bi bi-shield-lock me-2"></i>Nhập lại mật khẩu</label>
                <button type="button" class="btn btn-link btn-sm toggle-eye" (click)="showConfirm = !showConfirm" tabindex="-1">
                  <i class="bi" [ngClass]="showConfirm ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
              <div class="invalid-hint" *ngIf="submitted && confirm !== password">
                Mật khẩu nhập lại không khớp
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button class="btn btn-primary w-100 py-2 rounded-3 fw-semibold mt-3 shadow-sm btn-ripple"
                  type="submit" [disabled]="loading" (click)="ripple($event)">
            <i *ngIf="loading" class="spinner-border spinner-border-sm me-2"></i>
            {{ loading ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
          </button>
        </form>

        <div class="text-center mt-4">
          <span class="text-muted me-1">Đã có tài khoản?</span>
          <a routerLink="/login" class="text-decoration-none fw-medium link-animated">Đăng nhập</a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    /* Reuse from Login */
    .auth-bg { background: radial-gradient(1200px 600px at 110% -10%, #cfe9ff 0%, #f5f7fb 40%, #ffffff 100%); }
    .bg-shape { position:absolute; filter:blur(40px); opacity:.45; border-radius:50%; animation: float 12s ease-in-out infinite; }
    .bg-shape-1 { width: 420px; height: 420px; background:#9fd0ff; top:-80px; left:-80px; }
    .bg-shape-2 { width: 520px; height: 520px; background:#ffd6e6; bottom:-120px; right:-120px; animation-delay:2s; }
    @keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(18px) } }

    .auth-card { backdrop-filter: blur(10px); background: rgba(255,255,255,.9); border:1px solid rgba(255,255,255,.5); }
    .shadow-2xl { box-shadow: 0 30px 80px rgba(20, 40, 90, .15); }
    .animate-rise { animation: rise .6s ease-out both; }
    @keyframes rise { from{ opacity:0; transform: translateY(12px) scale(.98) } to{ opacity:1; transform: translateY(0) scale(1) } }

    .brand-circle{ width:64px; height:64px; display:grid; place-items:center; border-radius:50%;
      background: linear-gradient(145deg, #4e8df5, #7ab8ff); color:#fff; font-size:28px; box-shadow: 0 8px 20px rgba(78,141,245,.35);
    }

    .form-control-elevate { transition: box-shadow .2s ease, transform .08s ease; box-shadow: 0 2px 10px rgba(0,0,0,.03); }
    .form-control-elevate:focus { box-shadow: 0 6px 22px rgba(37,99,235,.18), 0 0 0 .2rem rgba(13,110,253,.15); transform: translateY(-1px); }

    .invalid-hint { color:#dc3545; font-size:.85rem; margin-top:.25rem; }
    .toggle-eye { position:absolute; right:.5rem; top:50%; transform:translateY(-50%); padding:.25rem .5rem; color:#6c757d; }
    .toggle-eye:hover{ color:#0d6efd; }

    .link-animated { position:relative; }
    .link-animated::after{ content:""; position:absolute; left:0; bottom:-2px; width:0; height:2px; background:#0d6efd; transition:width .25s ease; }
    .link-animated:hover::after{ width:100%; }

    .btn-ripple{ position:relative; overflow:hidden; }
    .btn-ripple span.rip{ position:absolute; border-radius:50%; transform:translate(-50%,-50%); pointer-events:none; animation:rip .6s ease-out forwards; background:rgba(255,255,255,.5); }
    @keyframes rip { from{ width:0; height:0; opacity:.6 } to{ width:420px; height:420px; opacity:0 } }
  `]
})
export class RegisterComponent {
  username = ''; email = ''; password = ''; confirm = '';
  showPass = false; showConfirm = false;
  loading = false; submitted = false;
  strength = 0; strengthLabel = 'Yếu';

  constructor(private auth: AuthService, private router: Router) {}

  ripple(e: MouseEvent){
    const btn = e.currentTarget as HTMLElement;
    const s = document.createElement('span'); s.className = 'rip';
    s.style.left = e.offsetX + 'px'; s.style.top = e.offsetY + 'px';
    btn.appendChild(s); setTimeout(()=>s.remove(), 600);
  }

  calcStrength() {
    const p = this.password || '';
    let score = 0;
    if (p.length >= 6) score += 25;
    if (/[A-Z]/.test(p)) score += 20;
    if (/[a-z]/.test(p)) score += 15;
    if (/\d/.test(p)) score += 20;
    if (/[^A-Za-z0-9]/.test(p)) score += 20;
    this.strength = Math.min(score, 100);
    this.strengthLabel = this.strength >= 70 ? 'Mạnh' : (this.strength >= 40 ? 'Trung bình' : 'Yếu');
  }

  async onSubmit(f: NgForm) {
    this.submitted = true;
    if (!f.valid || this.password !== this.confirm) return;
    this.loading = true;
    try {
      await this.auth.register({
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password,
        role: 'USER'
      });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      this.router.navigateByUrl('/login');
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Đăng ký thất bại.';
      if (e?.response?.status === 400 && e?.response?.data?.fields) {
        const flds = e.response.data.fields;
        alert('Lỗi:\n' + Object.entries(flds).map(([k,v]) => `${k}: ${v}`).join('\n'));
      } else if (String(msg).includes('Username existed')) {
        alert('Tên đăng nhập đã tồn tại');
      } else {
        alert('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally { this.loading = false; }
  }
}
