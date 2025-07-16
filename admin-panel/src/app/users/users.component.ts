import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface User {
  id: string;
  email: string;
  isBlocked: boolean;
  isAdmin: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;
    const userID = localStorage.getItem('user_id');

    const accessToken = localStorage.getItem('access_token');
    const app_id = 1;

    this.http.post<{ users: User[] }>('http://localhost:8080/auth/users', {
      access_token: accessToken,
      app_id
    }).subscribe({
      next: (res) => {
        this.users = res.users.sort((a, b) => +a.id - +b.id).filter(a => a.id != userID);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке пользователей';
        this.loading = false;
      }
    });
  }

  toggleBlock(user: User) {
    const accessToken = localStorage.getItem('access_token');
    const app_id = 1;

    const payload = {
      user_id: +user.id,
      block: !user.isBlocked,
      access_token: accessToken,
      app_id
    };

    this.http.post<{ success: boolean; message: string }>('http://localhost:8080/auth/block-status', payload)
      .subscribe({
        next: (res) => {
          if (res.success) {
            user.isBlocked = !user.isBlocked;
          } else {
            alert('Ошибка: ' + res.message);
          }
        },
        error: () => {
          alert('Не удалось изменить статус пользователя');
        }
      });
  }

  toggleRole(user: User){
    const accessToken = localStorage.getItem('access_token');
    const app_id = 1;

    const payload = {
      user_id: +user.id,
      admin: !user.isAdmin,
      access_token: accessToken,
      app_id
    };

    this.http.post<{ success: boolean; message: string }>('http://localhost:8080/auth/admin-status', payload)
      .subscribe({
        next: (res) => {
          if (res.success) {
            user.isAdmin = !user.isAdmin;
          } else {
            alert('Ошибка: ' + res.message);
          }
        },
        error: () => {
          alert('Не удалось изменить роль пользователя');
        }
      });
  }
}
