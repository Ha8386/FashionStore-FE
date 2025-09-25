// src/app/features/admin/users/user-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserApi, User } from '../../../core/services/user.api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Người dùng</h2>
    </div>

    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
        <tr>
          <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th>
          <th style="width:140px"></th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let u of users()">
          <td>{{u.id}}</td>
          <td>{{u.username}}</td>
          <td>{{u.email}}</td>
          <td><span class="badge bg-secondary">{{u.role}}</span></td>
          <td>
            <span class="badge" [ngClass]="u.status==='ACTIVE' ? 'bg-success' : 'bg-danger'">{{u.status}}</span>
          </td>
          <td>
            <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/admin/users', u.id]">Sửa</a>
            <button class="btn btn-sm btn-outline-danger" (click)="remove(u)">Xóa</button>
          </td>
        </tr>
        <tr *ngIf="users().length===0">
          <td colspan="6" class="text-center text-muted py-4">Chưa có người dùng</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  `
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  async ngOnInit() {
    this.users.set(await UserApi.list());
  }
  async remove(u: User) {
    if (!confirm(`Xóa người dùng "${u.username}"?`)) return;
    try {
      await UserApi.remove(u.id);
      this.users.set(this.users().filter(x => x.id !== u.id));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? 'Xóa thất bại');
    }
  }
}
