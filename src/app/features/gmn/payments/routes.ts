import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/payments-list'),
  },
  {
    path: 'new',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/payment-form'),
  },
  {
    path: ':id',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/payment-view'),
  },
] as Routes;
