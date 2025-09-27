import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CategoryApi } from '../../../core/services/category.api';

@Component({
  standalone: true,
  selector: 'app-category-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: 'category-form.component.html',
  styleUrls: ['category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
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
      const c = await CategoryApi.get(this.id);
      if (c) { this.name = c.name; this.imageUrl = c.imageUrl ?? ''; }
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

      let catId = this.id;
      if (catId) await CategoryApi.update(catId, payload);
      else catId = (await CategoryApi.create(payload)).id;

      if (this.file && catId) {
        try {
          const url = await CategoryApi.uploadImage(catId, this.file);
          this.imageUrl = url;
        } catch (err) {
          console.error('Upload failed', err);
          alert('Upload ảnh thất bại.');
        }
      }
      await this.router.navigateByUrl('/admin/categories');
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
