import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserApi, User, UserUpdateRequest } from '../../../core/services/user.api';

@Component({
  standalone: true,
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: 'user-form.component.html',
  styleUrls: ['user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  id!: number;
  ready = false;
  saving = false;
  submitted = false;

  username = '';
  email = '';
  role: 'USER' | 'ADMIN' = 'USER';
  status: 'ACTIVE' | 'BLOCKED' = 'ACTIVE';
  password = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    // lấy id từ route param
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) {
      this.router.navigate(['/admin/users']);
      return;
    }
    try {
      const u: User = await UserApi.get(this.id);
      this.username = u.username;
      this.email = u.email;
      this.role = u.role;
      this.status = u.status;
      this.ready = true;
    } catch {
      alert('Không tìm thấy người dùng');
      this.router.navigate(['/admin/users']);
    }
  }

  async save() {
    this.submitted = true;
    if (!this.email.trim() || this.saving) return;

    this.saving = true;
    try {
      const body: UserUpdateRequest = {
        email: this.email.trim(),
        role: this.role,
        status: this.status,
        password: this.password?.trim() || undefined
      };
      await UserApi.update(this.id, body);
      alert('Lưu thành công');
      this.router.navigate(['/admin/users']);
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? 'Lưu thất bại');
    } finally {
      this.saving = false;
    }
  }
}
