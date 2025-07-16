import { Routes } from '@angular/router';
import { CreatePollComponent } from './create-poll/create-poll.component';
import { authGuard } from './guard/auth.guard';
import { LogoutComponent } from './logout/logout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin-page/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'create-poll',
    component: CreatePollComponent,
    canActivate: [authGuard]
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'results',
    canActivate: [authGuard],
    loadComponent: () => import('./results/results.component').then(m => m.ResultsComponent)
  },
  {
    path: 'logs',
    canActivate: [authGuard],
    loadComponent: () => import('./logs/logs.component').then(m => m.LogsComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: 'admin'
  }, 
  {
    path: 'logout',
    component: LogoutComponent
}
];