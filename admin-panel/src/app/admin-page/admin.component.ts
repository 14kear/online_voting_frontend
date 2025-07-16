import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  pages = [
    { link: '/create-poll', title: 'Создать опрос'},
    { link: '/users', title: 'Пользователи'},
    { link: '/results', title: 'Результаты'},
    { link: '/logs', title: 'Логи'}
  ];
}
