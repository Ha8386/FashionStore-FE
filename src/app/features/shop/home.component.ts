import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,   // 👈 nếu dùng standalone
  imports: [CommonModule],
  template: `
    <h1>Home works!</h1>
  `
})
export class HomeComponent {}
