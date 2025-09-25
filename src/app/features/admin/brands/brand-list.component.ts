// src/app/features/admin/brands/brand-list.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { BrandApi } from '../../../core/services/brand.api';
import { Brand } from '../../../core/models/brand';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="d-flex justify-content-between mb-3">
      <h2>Quản lý thương hiệu</h2>
      <a class="btn btn-primary" [routerLink]="['/admin/brands/new']">Thêm mới</a>
    </div>

    <table class="table table-bordered align-middle" *ngIf="brands.length; else empty">
      <thead><tr><th>ID</th><th>Tên</th><th>Ảnh</th><th style="width:160px">Thao tác</th></tr></thead>
      <tbody>
        <tr *ngFor="let b of brands">
          <td>{{ b.id }}</td>
          <td>{{ b.name }}</td>
          <td><img *ngIf="b.imageUrl" [src]="b.imageUrl" style="height:40px" class="border rounded"></td>
          <td>
            <a class="btn btn-sm btn-outline-primary me-2" [routerLink]="['/admin/brands/edit', b.id]">Sửa</a>
            <button class="btn btn-sm btn-outline-danger" (click)="remove(b.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
    <ng-template #empty><div class="text-muted">Chưa có thương hiệu nào.</div></ng-template>
  </div>
  `
})
export class BrandListComponent implements OnInit {
  brands: Brand[] = [];
  constructor(@Inject(PLATFORM_ID) private pid: Object, private router: Router) {}
  async ngOnInit() { if (isPlatformBrowser(this.pid)) await this.load(); }
  async load() { this.brands = await BrandApi.list(); }
  async remove(id: number) { if (confirm('Xóa thương hiệu này?')) { await BrandApi.remove(id); await this.load(); } }
}
