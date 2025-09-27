import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CategoryApi, Option } from '../core/services/category.api';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss']
})
export class HeaderComponent implements OnInit {
  categories: Option[] = [];
  loggedIn = false;
  userName = '';

  constructor(private router: Router, public auth: AuthService) {}

  async ngOnInit() {
    try { this.categories = await CategoryApi.listPublic(); } catch { this.categories = []; }

    const cached = this.auth.getUserFromToken();
    if (cached?.username) { this.loggedIn = true; this.userName = cached.username; }

    const me = await this.auth.me();
    if (me) { this.loggedIn = true; this.userName = me.username || this.userName; }
    else if (!cached) { this.loggedIn = false; this.userName = ''; }
  }

  logout() {
    this.auth.logout();
    this.loggedIn = false;
    this.userName = '';
    this.router.navigateByUrl('/login');
  }
}
