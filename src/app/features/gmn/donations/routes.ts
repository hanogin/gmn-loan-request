import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/donations-list'),
  },
  {
    path: 'new',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/donation-form'),
  },
  {
    path: ':id',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/donation-view'),
  },
  {
    path: ':id/edit',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/donation-form'),
  },
] as Routes;
