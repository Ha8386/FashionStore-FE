import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductApi, ProductResponse } from '../../../core/services/product.api';
import { Page } from '../../../core/services/page';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['../styles/admin-styles.scss']
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
