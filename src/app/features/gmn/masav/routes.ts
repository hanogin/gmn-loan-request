import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/masav-dashboard'),
  },
  {
    path: 'files',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/masav-files'),
  },
  {
    path: 'create-collection',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/masav-create-collection'),
  },
  {
    path: 'create-payment',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/masav-create-payment'),
  },
] as Routes;
