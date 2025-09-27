import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header.component';
import { ProductApi, ProductResponse } from '../../core/services/product.api';
import { Page } from '../../core/services/page';
import { environment } from '../../../environments/environment';

type Opt = { id: number; name: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  rows: ProductResponse[] = [];
  total = 0; totalPages = 0; page = 0;
  size = 8;
  pagers: number[] = [];

  categories: Opt[] = [];
  brands: Opt[] = [];

  private thumbs: Record<number, string> = {};

  ui: {
    keyword?: string;
    categoryId?: number | null;
    brandId?: number | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sort: string;
  } = { sort: '' };

  private sub: any;

  constructor(private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    [this.categories, this.brands] = await Promise.all([
      ProductApi.categories(),
      ProductApi.brands().then(arr => arr.map((x:any)=>({ id:x.id, name:x.name })))
    ]);
    this.sub = this.route.queryParams.subscribe(params => { this.hydrateFromParams(params); this.query(); });
  }
  ngOnDestroy() { this.sub?.unsubscribe?.(); }

  hydrateFromParams(params: Params) {
    this.ui.keyword    = params['keyword'] ?? '';
    this.ui.categoryId = params['categoryId'] ? +params['categoryId'] : null;
    this.ui.brandId    = params['brandId'] ? +params['brandId'] : null;
    this.ui.minPrice   = params['minPrice'] ? +params['minPrice'] : null;
    this.ui.maxPrice   = params['maxPrice'] ? +params['maxPrice'] : null;
    this.ui.sort       = params['sort'] ?? '';
    this.page          = params['page'] ? +params['page'] : 0;
  }

  toParams(): Params {
    return {
      keyword:   this.ui.keyword || undefined,
      categoryId:this.ui.categoryId || undefined,
      brandId:   this.ui.brandId || undefined,
      minPrice:  this.ui.minPrice || undefined,
      maxPrice:  this.ui.maxPrice || undefined,
      sort:      this.ui.sort || undefined,
      page:      this.page || 0,
      size:      this.size,
    };
  }

  apply() {
    this.page = 0;
    this.router.navigate([], { relativeTo: this.route, queryParams: this.toParams(), queryParamsHandling: '' });
  }

  clearCategory(){ this.ui.categoryId = null; this.apply(); }
  clearBrand(){ this.ui.brandId = null; this.apply(); }
  clearPrice(){ this.ui.minPrice = this.ui.maxPrice = null; this.apply(); }
  setSort(v:string){ this.ui.sort = v; this.apply(); }

  async query() {
    const page: Page<ProductResponse> = await ProductApi.listPublic({
      keyword: this.ui.keyword || undefined,
      categoryId: this.ui.categoryId || undefined,
      brandId: this.ui.brandId || undefined,
      minPrice: this.ui.minPrice || undefined,
      maxPrice: this.ui.maxPrice || undefined,
      page: this.page, size: this.size, sort: this.ui.sort || undefined
    });

    this.rows = page.content;
    this.total = page.totalElements;
    this.totalPages = page.totalPages;
    this.page = page.number;
    this.size = page.size;

    const window = 5;
    const start = Math.max(0, Math.min(this.page - Math.floor(window/2), this.totalPages - window));
    const end = Math.min(this.totalPages, start + window);
    this.pagers = Array.from({length: end - start}, (_, i) => start + i);

    this.loadThumbs();
  }

  private async loadThumbs() {
    const tasks = this.rows.map(async (p) => {
      try {
        const imgs = await ProductApi.imagesPublic(p.id);
        const t = (imgs || []).find(i => (i as any).is_thumbnail) ?? imgs[0];
        const url = (t as any)?.image_url ?? (t as any)?.imageUrl;
        if (url) this.thumbs[p.id] = this.normalizeUploadUrl(url);
      } catch {}
    });
    await Promise.allSettled(tasks);
  }

  go(i:number) {
    if (i<0 || i>this.totalPages-1) return;
    this.page = i;
    this.router.navigate([], { relativeTo: this.route, queryParams: this.toParams(), queryParamsHandling: '' });
  }

  thumb(p: ProductResponse): string {
    return this.thumbs[p.id] || 'assets/no-image.png';
  }

  onImgErr(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img.dataset['errHandled']==='1') return;
    img.dataset['errHandled']='1';
    img.src = 'assets/no-image.png';
  }

  private normalizeUploadUrl(v?: string): string {
    if (!v) return 'assets/no-image.png';
    const s = v.trim();
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
    const base = (environment.apiUrl || '').replace(/\/+$/,'');
    if (s.startsWith('/uploads')) return `${base}${s}`;
    if (s.startsWith('uploads'))   return `${base}/${s}`;
    if (s.startsWith('/files'))    return `${base}${s}`;
    if (s.startsWith('files'))     return `${base}/${s}`;
    if (s.startsWith('assets/'))   return s;
    return `${base}/${s.replace(/^\/+/, '')}`;
  }
}
