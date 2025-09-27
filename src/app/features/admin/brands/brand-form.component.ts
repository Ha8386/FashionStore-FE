import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { BrandApi } from '../../../core/services/brand.api';

@Component({
  standalone: true,
  selector: 'app-brand-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: 'brand-form.component.html',
  styleUrls: ['brand-form.component.scss']
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

  constructor(
    @Inject(PLATFORM_ID) private pid: Object,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.pid)) return;
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      const b = await BrandApi.get(this.id);
      if (b) {
        this.name = b.name;
        this.imageUrl = b.imageUrl ?? '';
      }
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
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = undefined;
      }
      if (this.fileInput) this.fileInput.nativeElement.value = '';
    }
  }
}
