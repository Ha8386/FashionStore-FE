import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryApi } from '../../../core/services/category.api';

@Component({
  standalone: true,
  selector: 'app-category-list',
  imports: [CommonModule, RouterModule],
  templateUrl: 'category-list.component.html',
  styleUrls: ['category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories = signal<any[]>([]);

  async ngOnInit() {
    this.categories.set(await CategoryApi.list());
  }

  async remove(id: number) {
    if (!confirm('Xóa danh mục?')) return;
    await CategoryApi.remove(id);
    this.categories.set(this.categories().filter(x => x.id !== id));
  }
}
