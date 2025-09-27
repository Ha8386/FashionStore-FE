import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CategoryApi } from '../../../core/services/category.api';
import { BrandApi } from '../../../core/services/brand.api';
import { ProductApi, ProductResponse, ProductPayload } from '../../../core/services/product.api';

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['../styles/admin-styles.scss']
})
export class ProductFormComponent implements OnInit {
  id?: number;
  name = '';
  price?: number;
  quantity = 0;
  color = '';
  description = '';
  categoryId?: number;
  brandId?: number;

  categories: Category[] = [];
  brands: Brand[] = [];
  saving = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.id = rawId ? Number(rawId) : undefined;

    const [cats, brs] = await Promise.all([CategoryApi.list(), BrandApi.list()]);
    this.categories = cats as any;
    this.brands = brs as any;

    if (this.id) {
      const p: ProductResponse = await ProductApi.get(this.id);
      this.name = p.name;
      this.price = p.price;
      this.quantity = p.quantity;
      this.color = p.color;
      this.description = p.description ?? '';

      const cat = this.categories.find(c => c.name === p.categoryName);
      const br  = this.brands.find(b => b.name === p.brandName);
      if (cat) this.categoryId = cat.id;
      if (br)  this.brandId = br.id;
    }
  }

  async save() {
    if (this.saving) return;
    this.saving = true;

    try {
      const payload: ProductPayload = {
        name: this.name.trim(),
        color: this.color?.trim() || undefined,
        price: Number(this.price ?? 0),
        quantity: Number(this.quantity ?? 0),
        description: this.description?.trim() || undefined,
        categoryId: Number(this.categoryId),
        brandId: Number(this.brandId),
      };

      if (this.id) {
        await ProductApi.update(this.id, payload);
      } else {
        const res = await ProductApi.create(payload);
        this.id = res.id;
      }

      alert('Lưu thành công!');
      this.router.navigate(['/admin/products']);
    } catch (e: any) {
      const data = e?.response?.data;
      alert(typeof data === 'string' ? data : 'Lưu thất bại. Vui lòng thử lại.');
    } finally {
      this.saving = false;
    }
  }
}
