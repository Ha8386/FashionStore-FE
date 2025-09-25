import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductApi } from '../../../core/services/product.api';
import { Product } from '../../../core/models/product';
import { Page } from '../../../core/services/page';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Quản lý sản phẩm</h2>
      <div>
        <button class="btn btn-danger me-2"
                [disabled]="selected.size===0"
                (click)="bulkDelete()">
          <i class="bi bi-trash"></i> Xoá ({{selected.size}})
        </button>
        <a class="btn btn-primary" routerLink="/admin/products/new">
          <i class="bi bi-plus-lg"></i> Thêm mới
        </a>
      </div>
    </div>

    <!-- Bảng sản phẩm -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th><input type="checkbox" (change)="toggleAll($event)"></th>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Thương hiệu</th>
            <th>Danh mục</th>
            <th class="text-end">Giá</th>
            <th class="text-end">SL</th>
            <th>Trạng thái</th>
            <th class="text-end">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of page?.content">
            <td>
              <input type="checkbox" [checked]="selected.has(p.id)"
                     (change)="toggle(p.id,$event)">
            </td>
            <td><img *ngIf="p.thumbnailUrl" [src]="p.thumbnailUrl" width="48" height="48" class="rounded"></td>
            <td>{{p.name}}</td>
            <td>{{p.brandName}}</td>
            <td>{{p.categoryName}}</td>
            <td class="text-end">{{p.price | number:'1.0-0'}}</td>
            <td class="text-end">{{p.quantity}}</td>
            <td>
              <span class="badge" [class.bg-success]="p.status==='Active'"
                    [class.bg-secondary]="p.status!=='Active'">
                {{p.status}}
              </span>
            </td>
            <td class="text-end">
              <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/admin/products', p.id]">Sửa</a>
              <button class="btn btn-sm btn-outline-danger" (click)="remove(p.id)">Xoá</button>
            </td>
          </tr>
          <tr *ngIf="page?.content?.length===0">
            <td colspan="9" class="text-center text-muted py-4">Không có sản phẩm</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <nav *ngIf="(page?.totalPages||0) > 1">
      <ul class="pagination">
        <li class="page-item" [class.disabled]="page?.number===0">
          <a class="page-link" href (click)="go($event,(page?.number||0)-1)">«</a>
        </li>
        <li class="page-item" *ngFor="let i of [].constructor(page?.totalPages||0); let idx=index"
            [class.active]="idx===page?.number">
          <a class="page-link" href (click)="go($event,idx)">{{idx+1}}</a>
        </li>
        <li class="page-item" [class.disabled]="(page?.number||0) >= (page?.totalPages||1)-1">
          <a class="page-link" href (click)="go($event,(page?.number||0)+1)">»</a>
        </li>
      </ul>
    </nav>
  </div>
  `
})
export class ProductListComponent {
  page?: Page<Product>;
  selected = new Set<number>();

  constructor() {
    this.load();
  }

  async load(page=0) {
    this.page = await ProductApi.list({ page, size: 12, sort: 'createdAt,desc' });
    this.selected.clear();
  }

  async go(e: Event, i: number) {
    e.preventDefault();
    await this.load(i);
  }

  toggle(id: number, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    checked ? this.selected.add(id) : this.selected.delete(id);
  }

  toggleAll(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    this.selected.clear();
    if (checked) this.page?.content.forEach(p => this.selected.add(p.id));
  }

  async remove(id: number) {
    if (!confirm('Xoá sản phẩm này?')) return;
    await ProductApi.remove(id);
    await this.load(this.page?.number||0);
  }

  async bulkDelete() {
    if (this.selected.size===0) return;
    if (!confirm(`Xoá ${this.selected.size} sản phẩm?`)) return;
    await ProductApi.bulkRemove([...this.selected]);
    await this.load(this.page?.number||0);
  }
}
