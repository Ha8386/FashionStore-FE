import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProductApi } from '../../core/services/product.api';
import type { Page } from '../../core/services/page';
import { Product } from '../../core/models/product';
import { PaginationComponent } from '../../shared/pagination.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  template: `
  <div class="container py-4">
    <h1 class="mb-3">Tìm kiếm</h1>
    <form class="row g-2 mb-3" (submit)="onSubmit($event)">
      <div class="col-auto">
        <input class="form-control" [(ngModel)]="q" name="q" placeholder="Tên sản phẩm..." />
      </div>
      <div class="col-auto">
        <button class="btn btn-primary">Tìm</button>
      </div>
    </form>

    <div *ngIf="page?.totalElements === 0" class="text-muted">Không có kết quả.</div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
      <div class="col" *ngFor="let p of page?.content">
        <div class="card h-100">
          <img *ngIf="p.thumbnailUrl" [src]="p.thumbnailUrl" class="card-img-top" />
          <div class="card-body">
            <h6 class="card-title">{{ p.name }}</h6>
            <div class="text-muted">{{ p.brandName }} • {{ p.categoryName }}</div>
            <div class="fw-bold mt-1">{{ p.price | currency:'VND':'symbol':'1.0-0' }}</div>
            <a [routerLink]="['/product', p.id]" class="btn btn-sm btn-outline-primary mt-2">Chi tiết</a>
          </div>
        </div>
      </div>
    </div>

    <app-pagination class="mt-3"
      [page]="page?.number || 0"
      [totalPages]="page?.totalPages || 0"
      (go)="go($event)">
    </app-pagination>
  </div>
  `
})
export class SearchComponent {
  q = '';
  page?: Page<Product>;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.q = this.route.snapshot.queryParamMap.get('q') || '';
    this.load();
  }

  async load(page = 0) {
    // đổi q -> keyword cho đúng kiểu tham số API
    this.page = await ProductApi.publicList({ keyword: this.q, page, size: 12 });
  }

  async go(i: number) {
    await this.load(i);
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.router.navigate([], { queryParams: { q: this.q || null } });
    this.load(0);
  }
}
