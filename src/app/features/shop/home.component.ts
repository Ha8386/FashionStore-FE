import { Component, OnDestroy, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header.component';
import { environment } from '../../../environments/environment';

type ProductImage = {
  url?: string; path?: string; image_url?: string; imageUrl?: string;
  is_thumbnail?: boolean | number; isThumbnail?: boolean;
  sort_order?: number; sortOrder?: number;
};
type ProductRow = {
  id: number; name?: string; productName?: string;
  thumbnailUrl?: string; thumbnail_url?: string; imageUrl?: string; image_url?: string;
  price?: number; quantity?: number; images?: ProductImage[];
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  q = '';

  banners = [
    { src: 'assets/banner5.jpg', alt: 'Giảm giá' },
    { src: 'assets/banner2.jpg', alt: 'Bộ sưu tập mới' },
    { src: 'assets/banner3.jpg', alt: 'Cuối mùa' },
    { src: 'assets/banner1.jpg', alt: 'Tuần lễ thời trang' },
  ];

  index = 0;
  private timer: any = null;
  private autoplayMs = 4000;
  private touchStartX = 0;

  loading = false;
  rows: { id: number; name: string; thumb?: string; price?: number; quantity?: number }[] = [];

  page = 0; size = 5; totalPages = 0; total = 0; pagers: number[] = [];

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      for (const b of this.banners) { const img = new Image(); img.src = b.src; }
      this.play();
      await this.loadPage(0);
    }
  }

  /* ==================== DATA ==================== */
  private async loadPage(i: number) {
    this.loading = true;
    try {
      const page = await this.fetchProducts(i, this.size);

      type MappedItem = {
        raw: ProductRow;
        item: { id: number; name: string; thumb?: string; price?: number; quantity?: number };
      };

      const mapped: MappedItem[] = page.content.map((p: ProductRow) => {
        const name = p.name ?? p.productName ?? 'Sản phẩm';
        const thumb0 = this.pickThumb(p);
        return { raw: p, item: { id: p.id, name, thumb: thumb0, price: p.price, quantity: p.quantity } };
      });

      // bổ sung ảnh nếu thiếu
      const needFetch: MappedItem[] = mapped.filter(m => !m.item.thumb);
      if (needFetch.length) {
        const imgs = await Promise.all(
          needFetch.map((m: MappedItem) => this.fetchProductImages(m.raw.id).catch(() => [] as ProductImage[]))
        );
        needFetch.forEach((m: MappedItem, idx: number) => {
          m.item.thumb = this.pickThumb({ ...m.raw, images: imgs[idx] } as ProductRow) || m.item.thumb;
        });
      }

      this.rows = mapped.map((m) => m.item);

      this.total = page.totalElements;
      this.totalPages = page.totalPages;
      this.page = page.number;
      this.size = page.size;
      this.pagers = Array.from({ length: this.totalPages }, (_, k: number) => k);
    } catch (e) {
      console.error('Load products failed', e);
      this.rows = []; this.total = this.totalPages = 0; this.pagers = [];
    } finally { this.loading = false; }
  }

  private async fetchProducts(page = 0, size = 5) {
    const base = (environment.apiUrl || '').replace(/\/+$/, '');
    const url = `${base}/api/public/products?page=${page}&size=${size}&sort=createdAt,desc`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  private async fetchProductImages(productId: number): Promise<ProductImage[]> {
    const base = (environment.apiUrl || '').replace(/\/+$/,'');
    const url = `${base}/api/public/products/${productId}/images`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? rows : (rows?.content ?? []);
  }

  private pickThumb(p: ProductRow): string | undefined {
    const direct = p.thumbnailUrl ?? p.thumbnail_url ?? p.imageUrl ?? p.image_url;
    if (direct) return this.normalizeUploadUrl(direct);
    const imgs = p.images ?? [];
    if (!imgs.length) return undefined;
    const thumb = imgs.find(x => x?.is_thumbnail === 1 || x?.is_thumbnail === true || x?.isThumbnail === true) || imgs[0];
    const candidate = thumb?.image_url ?? thumb?.imageUrl ?? thumb?.url ?? thumb?.path;
    return this.normalizeUploadUrl(candidate);
  }

  private normalizeUploadUrl(v?: string): string | undefined {
    if (!v) return undefined;
    v = v.trim();
    if (/^https?:\/\//i.test(v) || /^data:/i.test(v) || /^blob:/i.test(v)) return v;
    const base = (environment.apiUrl || '').replace(/\/+$/,'');
    if (v.startsWith('/uploads')) return `${base}${v}`;
    if (v.startsWith('uploads'))   return `${base}/${v}`;
    if (v.startsWith('/files'))    return `${base}${v}`;
    if (v.startsWith('files'))     return `${base}/${v}`;
    if (v.startsWith('assets/'))   return v;
    return `${base}/${v.replace(/^\/+/, '')}`;
  }

  /* ==================== UI actions ==================== */
  goPage(i: number) { if (i < 0 || i > this.totalPages - 1 || i === this.page) return; this.loadPage(i); }

  onImgErr(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (!img || img.dataset['errHandled'] === '1') return;
    img.dataset['errHandled'] = '1';
    img.src = 'assets/no-image.png';
  }

  search(ev: Event) {
    ev.preventDefault();
    this.router.navigate(['/search'], { queryParams: { keyword: this.q || undefined } });
  }

  /* ==================== Carousel ==================== */
  ngOnDestroy() { this.clearTimer(); }
  private restart() { this.pause(); this.play(); }
  next() { this.index = (this.index + 1) % this.banners.length; this.restart(); }
  prev() { this.index = (this.index - 1 + this.banners.length) % this.banners.length; this.restart(); }
  go(i: number) { this.index = i % this.banners.length; this.restart(); }
  play() {
    if (!isPlatformBrowser(this.platformId) || this.banners.length === 0) return;
    this.clearTimer();
    this.timer = setInterval(() => this.index = (this.index + 1) % this.banners.length, this.autoplayMs);
  }
  pause() { this.clearTimer(); }
  private clearTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  onTouchStart(e: TouchEvent) { this.touchStartX = e.changedTouches[0].clientX; this.pause(); }
  onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? this.next() : this.prev(); }
    this.play();
  }

  @HostListener('window:keydown.arrowright') onRight() { this.next(); }
  @HostListener('window:keydown.arrowleft')  onLeft() { this.prev(); }
}
