import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductApi } from '../../core/services/product.api';
import { Product } from '../../core/models/product';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container py-4" *ngIf="p() as prod">
    <div class="row">
      <div class="col-md-5"><img *ngIf="prod.thumbnailUrl" [src]="prod.thumbnailUrl" class="img-fluid rounded"/></div>
      <div class="col-md-7">
        <h2>{{prod.name}}</h2>
        <div class="text-muted mb-2">{{prod.brandName}} • {{prod.categoryName}} • Màu: {{prod.color}}</div>
        <div class="h4">{{prod.price | currency:'VND':'symbol':'1.0-0'}}</div>
        <p class="mt-3">{{prod.description}}</p>
      </div>
    </div>
  </div>`
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  p = signal<Product | null>(null);

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.p.set(await ProductApi.publicGet(id));
  }
}
