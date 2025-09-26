import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductApi, ProductResponse } from '../../../core/services/product.api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4" *ngIf="p">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Chi tiết sản phẩm #{{p.id}}</h3>
      <div>
        <a class="btn btn-outline-primary me-2" [routerLink]="['/admin/products', p.id, 'edit']">Sửa</a>
        <a class="btn btn-secondary" [routerLink]="['/admin/products']">Danh sách</a>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card card-body">
          <h5 class="mb-3">{{p.name}}</h5>
          <div>Danh mục: <b>{{p.categoryName}}</b></div>
          <div>Thương hiệu: <b>{{p.brandName}}</b></div>
          <div>Giá: <b>{{p.price | number:'1.0-0'}}</b></div>
          <div>Số lượng: <b>{{p.quantity}}</b></div>
          <div class="mt-2"><small class="text-muted">Slug: {{p.slug}}</small></div>
          <div class="mt-3">{{p.description}}</div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card card-body">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Ảnh</h5>
            <label class="btn btn-sm btn-outline-primary mb-0">
              Tải lên
              <input type="file" multiple hidden (change)="onFiles($event)">
            </label>
          </div>
          <div class="row mt-3">
            <div class="col-6 col-md-4 mb-3" *ngFor="let img of p.images">
              <div class="position-relative border rounded">
                <img [src]="img.imageUrl" class="img-fluid rounded-top" />
                <div class="p-2 d-flex justify-content-between">
                  <button class="btn btn-sm btn-outline-success" [disabled]="img.thumbnail" (click)="setThumb(img.id)">Thumb</button>
                  <button class="btn btn-sm btn-outline-danger" (click)="remove(img.id)">Xoá</button>
                </div>
                <div *ngIf="img.thumbnail" class="badge bg-success position-absolute top-0 start-0 m-1">Thumbnail</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ProductDetailComponent implements OnInit {
  id!: number;
  p?: ProductResponse;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit(){
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    await this.reload();
  }

  private async reload(){
    this.p = await ProductApi.get(this.id);
  }

  async onFiles(e: any){
    const files: File[] = Array.from(e.target.files || []);
    if (!files.length) return;
    await ProductApi.uploadImages(this.id, files);
    e.target.value = '';
    await this.reload();
  }

  async remove(imageId: number){
    await ProductApi.deleteImage(this.id, imageId);
    await this.reload();
  }

  async setThumb(imageId: number){
    await ProductApi.setThumbnail(this.id, imageId);
    await this.reload();
  }
}
