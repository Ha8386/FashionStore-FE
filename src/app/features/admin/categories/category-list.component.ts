import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryApi } from '../../../core/services/category.api';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Danh mục</h2>
      <a class="btn btn-primary" [routerLink]="['/admin/categories/new']">Thêm</a>
    </div>

    <table class="table table-bordered">
      <thead><tr><th>ID</th><th>Tên</th><th>Ảnh</th><th style="width:140px"></th></tr></thead>
      <tbody>
        <tr *ngFor="let c of categories()">
          <td>{{c.id}}</td>
          <td>{{c.name}}</td>
          <td><img *ngIf="c.imageUrl" [src]="c.imageUrl" width="64" /></td>
          <td>
            <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/admin/categories', c.id]">Sửa</a>
            <button class="btn btn-sm btn-outline-danger" (click)="remove(c.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>`
})
export class CategoryListComponent implements OnInit {
  categories = signal<any[]>([]);
  async ngOnInit() { this.categories.set(await CategoryApi.list()); }
  async remove(id: number) {
    if (!confirm('Xóa danh mục?')) return;
    await CategoryApi.remove(id);
    this.categories.set(this.categories().filter(x => x.id !== id));
  }
}
