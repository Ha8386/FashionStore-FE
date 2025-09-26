import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductApi, ProductResponse } from '../../../core/services/product.api';
import { Page } from '../../../core/services/page';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Quản lý sản phẩm</h3>
      <a class="btn btn-primary" [routerLink]="['/admin/products/new']">
        <i class="bi bi-plus-lg"></i> Thêm sản phẩm
      </a>
    </div>

    <form class="row g-2 mb-3" (submit)="$event.preventDefault(); load()">
      <div class="col-auto">
        <input class="form-control"
               [(ngModel)]="keyword"
               name="q"
               placeholder="Tìm theo tên...">
      </div>
      <div class="col-auto">
        <button class="btn btn-outline-secondary" (click)="load()">Tìm</button>
      </div>
    </form>

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Tên</th>
            <th>Danh mục</th>
            <th>Thương hiệu</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of page?.content">
            <td>{{p.id}}</td>
            <td><a [routerLink]="['/admin/products', p.id]">{{p.name}}</a></td>
            <td>{{p.categoryName}}</td>
            <td>{{p.brandName}}</td>
            <td>{{p.price | number:'1.0-0'}}</td>
            <td>{{p.quantity}}</td>
            <td class="text-end">
              <a class="btn btn-sm btn-outline-primary me-2"
                 [routerLink]="['/admin/products', p.id, 'edit']">Sửa</a>
              <button class="btn btn-sm btn-outline-danger"
                      (click)="del(p)">Xoá</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav *ngIf="page">
      <ul class="pagination">
        <li class="page-item" [class.disabled]="page.first">
          <button class="page-link" (click)="go(0)">«</button>
        </li>
        <li class="page-item" [class.disabled]="page.first">
          <button class="page-link" (click)="go(page.number-1)">‹</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">{{page.number+1}} / {{page.totalPages || 1}}</span>
        </li>
        <li class="page-item" [class.disabled]="page.last">
          <button class="page-link" (click)="go(page.number+1)">›</button>
        </li>
        <li class="page-item" [class.disabled]="page.last">
          <button class="page-link" (click)="go(page.totalPages-1)">»</button>
        </li>
      </ul>
    </nav>
  </div>
  `
})
export class ProductListComponent implements OnInit {
  keyword = '';
  page?: Page<ProductResponse>;
  size = 12;
  index = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.page = await ProductApi.list({
      keyword: this.keyword,
      page: this.index,
      size: this.size,
      sort: 'id,desc'
    });
  }

  async go(i: number) {
    if (!this.page) return;
    this.index = Math.max(0, Math.min(i, this.page.totalPages - 1));
    await this.load();
  }

  async del(p: ProductResponse) {
    if (!confirm(`Xoá sản phẩm #${p.id} - ${p.name}?`)) return;
    await ProductApi.remove(p.id);
    await this.load();
  }
}
