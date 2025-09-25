import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../../shared/pagination.component';
import { ProductApi } from '../../core/services/product.api';
import { Page } from '../../core/services/page'; 
import { Product } from '../../core/models/product';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  template: `
  <div class="container py-4">
    <h1 class="mb-3">Sản phẩm mới</h1>

    <form class="row g-2 mb-3" (submit)="$event.preventDefault(); load()">
      <div class="col-auto">
        <input class="form-control"
               [ngModel]="q()"
               (ngModelChange)="q.set($event)"
               name="q"
               placeholder="Tìm kiếm..." />
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" (click)="load()">Tìm</button>
      </div>
    </form>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
      <div class="col" *ngFor="let p of page()?.content">
        <div class="card h-100">
          <img *ngIf="p.thumbnailUrl" [src]="p.thumbnailUrl" class="card-img-top" alt="thumb"/>
          <div class="card-body">
            <h6 class="card-title">{{p.name}}</h6>
            <div class="text-muted">{{p.brandName}} • {{p.categoryName}}</div>
            <div class="fw-bold mt-1">{{p.price | currency:'VND':'symbol':'1.0-0'}}</div>
            <a [routerLink]="['/product', p.id]" class="btn btn-sm btn-outline-primary mt-2">Xem chi tiết</a>
          </div>
        </div>
      </div>
    </div>

    <app-pagination class="mt-3"
      [page]="page()?.number || 0" [totalPages]="page()?.totalPages || 0"
      (go)="go($event)"></app-pagination>
  </div>`
})
export class HomeComponent implements OnInit {
  q = signal<string>('');                       // <-- giữ signal
  page = signal<Page<Product> | null>(null);

  async ngOnInit() { await this.load(); }
  async load(pageIndex: number = 0) {
    this.page.set(await ProductApi.publicList({ keyword: this.q(), page: pageIndex, size: 12 }));
  }
  go(i: number) { this.load(i); }
}
