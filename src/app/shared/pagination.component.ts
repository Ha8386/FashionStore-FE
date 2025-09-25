import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-pagination',
  imports: [CommonModule],            // ⬅️ THÊM DÒNG NÀY
  template: `
  <nav *ngIf="totalPages && totalPages > 1">
    <ul class="pagination">
      <li class="page-item" [class.disabled]="page<=0">
        <a class="page-link" href (click)="emit($event, page-1)">«</a>
      </li>
      <li class="page-item" *ngFor="let _ of [].constructor(totalPages); let i = index"
          [class.active]="i===page">
        <a class="page-link" href (click)="emit($event, i)">{{i+1}}</a>
      </li>
      <li class="page-item" [class.disabled]="page>=totalPages-1">
        <a class="page-link" href (click)="emit($event, page+1)">»</a>
      </li>
    </ul>
  </nav>`
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Output() go = new EventEmitter<number>();
  emit(e: Event, i: number) { e.preventDefault(); this.go.emit(i); }
}
