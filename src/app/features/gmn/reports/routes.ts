import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/reports-dashboard'),
  },
  {
    path: 'late-payments',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/late-payments-report'),
  },
  {
    path: 'cpa',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/cpa-report'),
  },
  {
    path: 'loans-summary',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/loans-summary-report'),
  },
  {
    path: 'savings-summary',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/savings-summary-report'),
  },
  {
    path: 'donations-summary',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/donations-summary-report'),
  },
] as Routes;
