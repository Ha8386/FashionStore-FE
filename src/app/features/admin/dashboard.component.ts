import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminApi, Stats, TopProduct, NewUser } from '../../core/services/admin.api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
  <div class="container py-4">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <h2 class="m-0 fw-bold">Dashboard</h2>
      <span class="text-muted">Cập nhật: {{ now | date:'HH:mm, dd/MM/yyyy' }}</span>
    </div>

    <!-- STAT CARDS -->
    <div class="row g-3">
      <div class="col-6 col-md-3" *ngFor="let c of cards()">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="icon-wrap" [ngClass]="c.bg">
              <i class="bi" [ngClass]="c.icon"></i>
            </div>
            <div class="flex-fill">
              <div class="text-muted small">{{ c.title }}</div>
              <div class="h4 m-0 fw-bold">
                <ng-container *ngIf="!loading(); else sk">{{ c.value }}</ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #sk>
        <span class="placeholder-wave"><span class="placeholder col-6"></span></span>
      </ng-template>
    </div>

    <!-- ROW: TABLES -->
    <div class="row g-3 mt-1">
      <!-- Top products -->
      <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
            <h5 class="m-0">Top sản phẩm bán chạy</h5>
            <a [routerLink]="['/admin/products']" class="btn btn-sm btn-outline-primary">Quản lý</a>
          </div>
          <div class="card-body">
            <div *ngIf="loading(); else productTable">
              <div class="placeholder-wave">
                <div class="placeholder col-12 mb-2" *ngFor="let _ of [1,2,3,4,5]"></div>
              </div>
            </div>
            <ng-template #productTable>
              <div class="table-responsive">
                <table class="table align-middle">
                  <thead>
                    <tr><th style="width:56px"></th><th>Tên</th><th class="text-end">Đã bán</th><th class="text-end">Giá</th><th style="width:110px"></th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of topProducts()">
                      <td>
                        <img *ngIf="p.thumbnailUrl" [src]="p.thumbnailUrl" class="rounded" width="48" height="48">
                      </td>
                      <td class="fw-medium">{{ p.name }}</td>
                      <td class="text-end">{{ p.sold | number }}</td>
                      <td class="text-end">{{ p.price | currency:'VND':'symbol':'1.0-0' }}</td>
                      <td class="text-end">
                        <a class="btn btn-sm btn-outline-primary" [routerLink]="['/admin/products', p.id]">Chi tiết</a>
                      </td>
                    </tr>
                    <tr *ngIf="topProducts().length === 0">
                      <td colspan="5" class="text-center text-muted py-4">Chưa có dữ liệu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- New users -->
      <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-header bg-white border-0 pt-3 pb-0">
            <h5 class="m-0">Người dùng mới</h5>
          </div>
          <div class="card-body">
            <div *ngIf="loading(); else userList">
              <div class="placeholder-wave">
                <div class="placeholder col-12 mb-2" *ngFor="let _ of [1,2,3,4]"></div>
              </div>
            </div>
            <ng-template #userList>
              <ul class="list-group list-group-flush">
                <li class="list-group-item px-0 d-flex justify-content-between align-items-center"
                    *ngFor="let u of newUsers()">
                  <div>
                    <div class="fw-medium">{{ u.username }}</div>
                    <div class="small text-muted">{{ u.email }}</div>
                  </div>
                  <span class="badge rounded-pill bg-light text-secondary border">{{ u.createdAt | date:'dd/MM' }}</span>
                </li>
                <li *ngIf="newUsers().length === 0" class="list-group-item px-0 text-muted text-center">
                  Chưa có dữ liệu
                </li>
              </ul>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .stat-card .icon-wrap{
      width:48px;height:48px; border-radius:14px;
      display:flex;align-items:center;justify-content:center;
      font-size:1.25rem;
    }
    .stat-card .icon-wrap.bg-p { background:#e3f2fd; color:#0d6efd; }
    .stat-card .icon-wrap.bg-s { background:#e8f5e9; color:#198754; }
    .stat-card .icon-wrap.bg-w { background:#fff3cd; color:#856404; }
    .stat-card .icon-wrap.bg-d { background:#f8d7da; color:#dc3545; }
  `]
})
export class DashboardComponent implements OnInit {
  now = new Date();
  loading = signal(true);

  cards = signal<{title:string; icon:string; bg:string; value:string|number}[]>([
    { title:'Sản phẩm',  icon:'bi-box-seam',  bg:'bg-p', value:'—' },
    { title:'Danh mục',  icon:'bi-collection', bg:'bg-s', value:'—' },
    { title:'Thương hiệu',icon:'bi-tags',     bg:'bg-w', value:'—' },
    { title:'Người dùng', icon:'bi-people',   bg:'bg-d', value:'—' },
  ]);

  topProducts = signal<TopProduct[]>([]);
  newUsers    = signal<NewUser[]>([]);

  async ngOnInit() {
    try {
      this.loading.set(true);
      const [stats, top, users] = await Promise.all([
        AdminApi.stats().catch(() => <Stats>{products:0,categories:0,brands:0,users:0}),
        AdminApi.topProducts().catch(() => [] as TopProduct[]),
        AdminApi.newUsers().catch(() => [] as NewUser[]),
      ]);

      this.cards.set([
        { title:'Sản phẩm',   icon:'bi-box-seam',  bg:'bg-p', value: stats.products ?? '0' },
        { title:'Danh mục',   icon:'bi-collection',bg:'bg-s', value: stats.categories ?? '0' },
        { title:'Thương hiệu',icon:'bi-tags',      bg:'bg-w', value: stats.brands ?? '0' },
        { title:'Người dùng', icon:'bi-people',    bg:'bg-d', value: stats.users ?? '0' },
      ]);

      this.topProducts.set(top);
      this.newUsers.set(users);
    } finally {
      this.loading.set(false);
    }
  }
}
