import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loans-list'),
  },
  {
    path: 'new',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loan-form'),
  },
  {
    path: ':id',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loan-view'),
  },
  {
    path: ':id/edit',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loan-form'),
  },
  {
    path: ':id/payments',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loan-payments'),
  },
] as Routes;
