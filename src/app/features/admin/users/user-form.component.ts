// src/app/features/admin/users/user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserApi, User, UserUpdateRequest } from '../../../core/services/user.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="container py-4" *ngIf="ready">
    <h2>Sửa Người dùng</h2>

    <form class="mt-3" (ngSubmit)="save()" #f="ngForm" novalidate>
      <div class="mb-3">
        <label class="form-label">Username</label>
        <input class="form-control" [ngModel]="username" name="username" disabled />
      </div>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input class="form-control" [(ngModel)]="email" name="email" required email maxlength="150"/>
        <div class="text-danger small" *ngIf="submitted && !email.trim()">Vui lòng nhập email</div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Role</label>
          <select class="form-select" [(ngModel)]="role" name="role" required>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Trạng thái</label>
          <select class="form-select" [(ngModel)]="status" name="status" required>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Đổi mật khẩu (tùy chọn)</label>
        <input type="password" class="form-control" [(ngModel)]="password" name="password" maxlength="255"
               placeholder="Để trống nếu không đổi">
      </div>

      <button class="btn btn-primary me-2" type="submit">{{saving ? 'Đang lưu…' : 'Lưu'}}</button>
      <a class="btn btn-secondary" [routerLink]="['/admin/users']">Hủy</a>
    </form>
  </div>
  `
})
export class UserFormComponent implements OnInit {
  id!: number;
  ready = false; saving = false; submitted = false;

  username = '';
  email = '';
  role: 'USER' | 'ADMIN' = 'USER';
  status: 'ACTIVE' | 'BLOCKED' = 'ACTIVE';
  password = '';

  async ngOnInit() {
    const idParam = history.state?.id || null;
    // hoặc lấy từ route:
    const routeId = (location.pathname.split('/').pop() ?? '').trim();
    this.id = Number(routeId);

    try {
      const u: User = await UserApi.get(this.id);
      this.username = u.username;
      this.email = u.email;
      this.role = u.role;
      this.status = u.status;
      this.ready = true;
    } catch (e: any) {
      alert('Không tìm thấy người dùng');
      window.history.back();
    }
  }

  async save() {
    this.submitted = true;
    if (!this.email.trim()) return;
    this.saving = true;
    try {
      const body: UserUpdateRequest = {
        email: this.email.trim(),
        role: this.role,
        status: this.status,
        password: this.password?.trim() || undefined
      };
      await UserApi.update(this.id, body);
      alert('Lưu thành công');
      location.assign('/admin/users');
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? 'Lưu thất bại');
    } finally {
      this.saving = false;
    }
  }
}
