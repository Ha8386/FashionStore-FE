import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductApi } from '../../../core/services/product.api';
import { BrandApi } from '../../../core/services/brand.api';
import { CategoryApi } from '../../../core/services/category.api';
import { Product } from '../../../core/models/product';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">{{ id ? 'Sửa' : 'Thêm' }} Sản phẩm</h2>
      <div class="d-flex gap-2">
        <a class="btn btn-outline-secondary" [routerLink]="['/admin/products']">Quay lại</a>
        <button class="btn btn-primary" type="button" (click)="save($event)">Lưu</button>
      </div>
    </div>

    <form (ngSubmit)="save($event)" #f="ngForm" novalidate>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Tên sản phẩm</label>
          <input class="form-control" [(ngModel)]="name" name="name" required />
          <div class="text-danger small" *ngIf="submitted && !name">Vui lòng nhập tên</div>
        </div>
        <div class="col-md-3">
          <label class="form-label">Giá</label>
          <input class="form-control" type="number" [(ngModel)]="price" name="price" min="0" required />
          <div class="text-danger small" *ngIf="submitted && (price===undefined || price<0)">Giá không hợp lệ</div>
        </div>
        <div class="col-md-3">
          <label class="form-label">Số lượng</label>
          <input class="form-control" type="number" [(ngModel)]="quantity" name="quantity" min="0" required />
          <div class="text-danger small" *ngIf="submitted && (quantity===undefined || quantity<0)">Số lượng không hợp lệ</div>
        </div>

        <div class="col-md-4">
          <label class="form-label">Thương hiệu</label>
          <select class="form-select" [(ngModel)]="brandId" name="brandId" required>
            <option *ngFor="let b of brands" [ngValue]="b.id">{{ b.name }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Danh mục</label>
          <select class="form-select" [(ngModel)]="categoryId" name="categoryId" required>
            <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Màu sắc</label>
          <input class="form-control" [(ngModel)]="color" name="color" />
        </div>

        <div class="col-12">
          <label class="form-label">Mô tả</label>
          <textarea class="form-control" rows="4" [(ngModel)]="description" name="description"></textarea>
        </div>

        <!-- Ảnh -->
        <div class="col-md-6">
          <label class="form-label">Ảnh đại diện (URL)</label>
          <div class="input-group">
            <input class="form-control" [(ngModel)]="thumbnailUrl" name="thumbnailUrl" />
            <button class="btn btn-outline-secondary" type="button" (click)="fileInput.click()">
              Upload
            </button>
          </div>
          <input #fileInput type="file" class="d-none" accept="image/*" (change)="onFile($event)">
          <div class="mt-2" *ngIf="thumbnailUrl">
            <img [src]="thumbnailUrl" class="rounded border" style="max-width: 220px; max-height: 220px;">
          </div>
        </div>

        <div class="col-md-3">
          <label class="form-label">Trạng thái</label>
          <select class="form-select" [(ngModel)]="status" name="status">
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <button class="btn btn-primary mt-3" type="submit">Lưu</button>
      <a class="btn btn-secondary mt-3 ms-2" [routerLink]="['/admin/products']">Huỷ</a>
    </form>
  </div>
  `
})
export class ProductFormComponent implements OnInit {
  id?: number;

  // images
  imageUrls: string[] = [];
  thumbnailUrl: string = '';

  // form fields
  name = '';
  price: number = 0;
  quantity: number = 0;
  color = '';
  description = '';
  brandId?: number;
  categoryId?: number;
  status: 'Active' | 'Closed' = 'Active';

  brands: { id: number; name: string }[] = [];
  categories: { id: number; name: string }[] = [];
  submitted = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    [this.brands, this.categories] = await Promise.all([BrandApi.list(), CategoryApi.list()]);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      const p: Product = await ProductApi.get(this.id);
      this.name = p.name;
      this.price = p.price;
      this.quantity = p.quantity;
      this.color = p.color;
      this.description = p.description || '';
      this.thumbnailUrl = p.thumbnailUrl || '';
      this.brandId = p.brandId;
      this.categoryId = p.categoryId;
      this.status = (p.status || 'Active') as any;
    }
  }

  async onFile(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!this.id) { alert('Vui lòng lưu sản phẩm trước, sau đó mới upload ảnh.'); input.value = ''; return; }
  if (!input.files || input.files.length === 0) return;

  const files = Array.from(input.files);
  try {
    const urls = await ProductApi.uploadImages(this.id, files); // <- string[]
    if (urls?.length) {
      this.imageUrls = urls;
      this.thumbnailUrl = urls[0];      // <<< thay images[0].imageUrl
    }
  } catch (err) {
    alert('Upload ảnh thất bại'); console.error(err);
  } finally {
    input.value = '';
  }
}

  async save(e: Event) {
    e.preventDefault();
    this.submitted = true;
    if (!this.name?.trim() || this.price < 0 || this.quantity < 0 || !this.brandId || !this.categoryId) return;

    const payload = {
      name: this.name.trim(),
      slug: undefined,
      color: this.color?.trim() || '',
      price: Number(this.price),
      quantity: Number(this.quantity),
      description: this.description?.trim() || '',
      brandId: this.brandId!,
      categoryId: this.categoryId!,
      imageUrls: this.thumbnailUrl ? [this.thumbnailUrl.trim()] : [],
      thumbnailIndex: 0,
    } satisfies import('../../../core/services/product.api').ProductSaveReq;

    if (this.id) {
      await ProductApi.update(this.id, payload);
    } else {
      const { id } = await ProductApi.create(payload);
      this.id = id;
    }
    this.router.navigateByUrl('/admin/products');
  }
}
