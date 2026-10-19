import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/admin-dashboard'),
  },
  {
    path: 'users',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/users-management'),
  },
  {
    path: 'lov',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/lov-management'),
  },
  {
    path: 'settings',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/system-settings'),
  },
] as Routes;
