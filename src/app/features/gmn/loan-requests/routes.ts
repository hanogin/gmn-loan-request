import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loan-requests-list'),
  },
  {
    path: 'new',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loan-request-form'),
  },
  {
    path: ':id',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loan-request-view'),
  },
] as Routes;
