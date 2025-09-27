import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { BrandApi } from '../../../core/services/brand.api';
import { Brand } from '../../../core/models/brand';

@Component({
  standalone: true,
  selector: 'app-brand-list',
  imports: [CommonModule, RouterModule],
  templateUrl: 'brand-list.component.html',
  styleUrls: ['brand-list.component.scss']
})
export class BrandListComponent implements OnInit {
  brands: Brand[] = [];

  constructor(@Inject(PLATFORM_ID) private pid: Object, private router: Router) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.pid)) await this.load();
  }

  async load() {
    this.brands = await BrandApi.list();
  }

  async remove(id: number) {
    if (confirm('Xóa thương hiệu này?')) {
      await BrandApi.remove(id);
      await this.load();
    }
  }
}
