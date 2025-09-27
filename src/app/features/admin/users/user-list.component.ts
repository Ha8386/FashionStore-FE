import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserApi, User } from '../../../core/services/user.api';

@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',  
  styleUrls: ['./user-list.component.scss']    
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);

  async ngOnInit() {
    this.users.set(await UserApi.list());
  }

  async remove(u: User) {
    if (!confirm(`Xóa người dùng "${u.username}"?`)) return;
    try {
      await UserApi.remove(u.id);
      this.users.set(this.users().filter(x => x.id !== u.id));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? e?.message ?? 'Xóa thất bại');
    }
  }
}
