// src/app/features/admin/brands/brand-form.component.ts
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { BrandApi } from '../../../core/services/brand.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="container py-4">
    <h2>{{ id ? 'Sửa' : 'Thêm' }} Thương hiệu</h2>

    <form class="mt-3" (ngSubmit)="save()" #f="ngForm" novalidate>
      <div class="mb-3">
        <label class="form-label">Tên thương hiệu</label>
        <input class="form-control" [(ngModel)]="name" name="name" required />
        <div class="text-danger small" *ngIf="submitted && !name.trim()">Vui lòng nhập tên</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Ảnh</label>
        <input #fileInput type="file" class="form-control" (change)="onFile($event)" accept="image/*" />
        <div class="mt-2" *ngIf="previewUrl || imageUrl">
          <img [src]="previewUrl || imageUrl" class="border rounded" style="max-height:120px">
        </div>
      </div>

      <button class="btn btn-primary me-2" type="submit" [disabled]="isSaving">
        {{ isSaving ? 'Đang lưu…' : 'Lưu' }}
      </button>
      <a class="btn btn-secondary" [routerLink]="['/admin/brands']" [class.disabled]="isSaving">Hủy</a>
    </form>
  </div>
  `
})
export class BrandFormComponent implements OnInit {
  id?: number;
  name = '';
  imageUrl = '';
  file?: File;
  previewUrl?: string;
  submitted = false;
  isSaving = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(@Inject(PLATFORM_ID) private pid: Object,
              private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.pid)) return;
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      const b = await BrandApi.get(this.id);
      if (b) { this.name = b.name; this.imageUrl = b.imageUrl ?? ''; }
    }
  }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    const f = input.files[0];
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.file = f;
    this.previewUrl = URL.createObjectURL(f);
  }

  async save() {
    if (this.isSaving) return;
    this.submitted = true;
    if (!this.name.trim()) return;

    this.isSaving = true;
    try {
      const payload: { name: string; imageUrl?: string } = { name: this.name.trim() };
      if (this.id && this.imageUrl) payload.imageUrl = this.imageUrl;

      let brandId = this.id;
      if (brandId) await BrandApi.update(brandId, payload);
      else brandId = (await BrandApi.create(payload)).id;

      if (this.file && brandId) {
        try {
          const url = await BrandApi.uploadImage(brandId, this.file);
          this.imageUrl = url;
        } catch (err) {
          console.error('Upload failed', err);
          alert('Upload ảnh thất bại.');
        }
      }
      await this.router.navigateByUrl('/admin/brands');
    } catch (e: any) {
      console.error('Save failed', e);
      alert(`Lưu thất bại: ${e?.response?.status || ''} ${e?.response?.statusText || ''}`);
    } finally {
      this.isSaving = false;
      if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = undefined; }
      if (this.fileInput) this.fileInput.nativeElement.value = '';
    }
  }
}
