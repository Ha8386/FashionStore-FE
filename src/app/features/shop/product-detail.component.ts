import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header.component';
import { environment } from '../../../environments/environment';

type ImageItem = {
  id: number; image_url?: string; is_thumbnail?: boolean | number; sort_order?: number;
  imageUrl?: string; thumbnail?: boolean; sortOrder?: number; url?: string; path?: string;
};
type ProductDetail = {
  id: number; name: string; slug?: string; color?: string; price?: number; quantity?: number;
  description?: string; status?: string; categoryId?: number; categoryName?: string; brandId?: number; brandName?: string;
  images?: ImageItem[];
};

@Component({
  standalone: true,
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: 'product-detail.component.html',
  styleUrls: ['product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  p: ProductDetail | null = null;
  imgs: string[] = [];
  activeImg = '';
  qty = 1;
  loading = false;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (prm: Params) => {
      const id = +(prm['id'] || 0);
      if (!id) return;
      await this.loadDetail(id);
    });
  }

  private async loadDetail(id: number): Promise<void> {
    this.loading = true;
    try {
      const base = (environment.apiUrl || '').replace(/\/+$/, '');
      const r1 = await fetch(`${base}/api/public/products/${id}`);
      if (!r1.ok) throw new Error('detail HTTP ' + r1.status);
      const detail: ProductDetail = await r1.json();

      const r2 = await fetch(`${base}/api/public/products/${id}/images`);
      const rows: ImageItem[] = r2.ok ? await r2.json() : [];

      detail.images = Array.isArray(rows) ? rows : (rows as any)?.content ?? [];
      this.p = detail;

      this.imgs = this.buildImages(detail);
      this.activeImg = this.imgs[0] || 'assets/no-image.png';
      this.qty = 1;
    } catch (e) {
      console.error('[ProductDetail] load failed', e);
      this.p = null; this.imgs = []; this.activeImg = '';
    } finally { this.loading = false; }
  }

  private buildImages(p: ProductDetail): string[] {
    const list = p.images ?? [];
    const sorted = [...list].sort((a, b) => {
      const ath = (a.thumbnail ?? a.is_thumbnail) ? 1 : 0;
      const bth = (b.thumbnail ?? b.is_thumbnail) ? 1 : 0;
      if (ath !== bth) return bth - ath;
      const ao = (a.sortOrder ?? a.sort_order ?? 0) as number;
      const bo = (b.sortOrder ?? b.sort_order ?? 0) as number;
      return ao - bo;
    });

    return sorted
      .map(i => i.imageUrl ?? i.image_url ?? i.url ?? i.path)
      .filter(Boolean)
      .map(s => this.normalizeUrl(String(s)));
  }

  private normalizeUrl(v: string): string {
    const base = (environment.apiUrl || '').replace(/\/+$/, '');
    const s = (v || '').trim();
    if (/^https?:\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
    if (s.startsWith('/uploads')) return `${base}${s}`;
    if (s.startsWith('uploads'))   return `${base}/${s}`;
    if (s.startsWith('/files'))    return `${base}${s}`;
    if (s.startsWith('files'))     return `${base}/${s}`;
    if (s.startsWith('assets/'))   return s;
    return `${base}/${s.replace(/^\/+/, '')}`;
  }

  decQty(): void { if (this.qty > 1) this.qty--; }
  incQty(): void {
    const max = this.p?.quantity ?? 0;
    if (max <= 0) return;
    if (this.qty < max) this.qty++;
  }
  onQtyInput(ev: Event): void {
    const val = +(ev.target as HTMLInputElement).value;
    let v = Number.isFinite(val) ? val : 1;
    if (v < 1) v = 1;
    const max = this.p?.quantity ?? 0;
    if (max > 0 && v > max) v = max;
    this.qty = v;
  }

  onImgErr(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img?.dataset['errHandled'] === '1') return;
    img.dataset['errHandled'] = '1';
    img.src = 'assets/no-image.png';
  }
  onThumbErr(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (!img) return;
    img.style.visibility = 'hidden';
  }
}
