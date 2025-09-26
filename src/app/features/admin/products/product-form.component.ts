import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CategoryApi } from '../../../core/services/category.api';
import { BrandApi } from '../../../core/services/brand.api';
import { ProductApi, ProductResponse, ProductPayload } from '../../../core/services/product.api';

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="container py-4">
    <h3>{{ id ? 'Sửa' : 'Thêm' }} sản phẩm</h3>

    <form (ngSubmit)="save()" #f="ngForm" class="mt-3" novalidate>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Tên</label>
          <input class="form-control" [(ngModel)]="name" name="name" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Giá</label>
          <input type="number" class="form-control" [(ngModel)]="price" name="price" min="0" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Số lượng</label>
          <input type="number" class="form-control" [(ngModel)]="quantity" name="quantity" min="0" required />
        </div>

        <div class="col-md-6">
          <label class="form-label">Màu sắc</label>
          <input class="form-control" [(ngModel)]="color" name="color" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Danh mục</label>
          <select class="form-select" [(ngModel)]="categoryId" name="categoryId" required>
            <option [ngValue]="undefined" disabled>-- Chọn danh mục --</option>
            <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Thương hiệu</label>
          <select class="form-select" [(ngModel)]="brandId" name="brandId" required>
            <option [ngValue]="undefined" disabled>-- Chọn thương hiệu --</option>
            <option *ngFor="let b of brands" [ngValue]="b.id">{{ b.name }}</option>
          </select>
        </div>

        <div class="col-12">
          <label class="form-label">Mô tả</label>
          <textarea class="form-control" rows="4" [(ngModel)]="description" name="description"></textarea>
        </div>

        <div class="col-12" *ngIf="id">
          <small class="text-muted">Ảnh quản lý ở trang “Chi tiết sản phẩm”.</small>
        </div>
      </div>

      <div class="mt-3">
        <button class="btn btn-primary" [disabled]="!f.form.valid || saving">
          {{ id ? 'Cập nhật' : 'Tạo mới' }}
        </button>
        <a class="btn btn-secondary ms-2" [routerLink]="['/admin/products']">Quay lại</a>
      </div>
    </form>
  </div>
  `
})
export class ProductFormComponent implements OnInit {
  id?: number;

  // model
  name = '';
  price?: number;
  quantity = 0;
  color = '';
  description = '';
  categoryId?: number;
  brandId?: number;

  // options
  categories: Category[] = [];
  brands: Brand[] = [];

  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.id = rawId ? Number(rawId) : undefined;

    // load options trước
    const [cats, brs] = await Promise.all([
      CategoryApi.list(),
      BrandApi.list()
    ]);
    this.categories = cats as any;
    this.brands = brs as any;

    // nếu là edit -> load product và fill form
    if (this.id) {
      const p: ProductResponse = await ProductApi.get(this.id);
      this.name = p.name;
      this.price = p.price;
      this.quantity = p.quantity;
      this.color = p.color;
      this.description = p.description ?? '';

      // Nếu BE CHƯA trả categoryId/brandId thì chọn theo tên
      // (Khuyến nghị: thêm categoryId & brandId trong ProductDetailResponse để set chính xác)
      const cat = this.categories.find(c => c.name === p.categoryName);
      const br  = this.brands.find(b => b.name === p.brandName);
      if (cat) this.categoryId = cat.id;
      if (br)  this.brandId = br.id;
    }
  }

  async save() {
    if (this.saving) return;
    this.saving = true;

    try {
      const payload: ProductPayload = {
        name: this.name.trim(),
        color: this.color?.trim() || undefined,
        price: Number(this.price ?? 0),
        quantity: Number(this.quantity ?? 0),
        description: this.description?.trim() || undefined,
        categoryId: Number(this.categoryId),
        brandId: Number(this.brandId),
      };

      if (this.id) {
        await ProductApi.update(this.id, payload);
      } else {
        const res = await ProductApi.create(payload);
        this.id = res.id;
      }

      alert('Lưu thành công!');
      this.router.navigate(['/admin/products']);
    } catch (e: any) {
      console.error('[ProductForm.save] error', e?.response?.status, e?.response?.data || e?.message);
      const data = e?.response?.data;
      alert(typeof data === 'string' ? data : 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      this.saving = false;
    }
  }
}
