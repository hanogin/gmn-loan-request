import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/savings-list'),
  },
  {
    path: 'new',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/saving-form'),
  },
  {
    path: ':id',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/saving-view'),
  },
  {
    path: ':id/edit',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/saving-form'),
  },
] as Routes;
