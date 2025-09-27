import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductApi, ProductResponse } from '../../../core/services/product.api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['../styles/admin-styles.scss']
})
export class ProductDetailComponent implements OnInit {
  id!: number;
  p?: ProductResponse;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    await this.reload();
  }

  private async reload() {
    this.p = await ProductApi.get(this.id);
  }

  async onFiles(e: any) {
    const files: File[] = Array.from(e.target.files || []);
    if (!files.length) return;
    await ProductApi.uploadImages(this.id, files);
    e.target.value = '';
    await this.reload();
  }

  async remove(imageId: number) {
    await ProductApi.deleteImage(this.id, imageId);
    await this.reload();
  }

  async setThumb(imageId: number) {
    await ProductApi.setThumbnail(this.id, imageId);
    await this.reload();
  }
}
