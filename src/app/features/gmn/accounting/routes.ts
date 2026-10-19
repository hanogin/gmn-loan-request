import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/accounting-dashboard'),
  },
  {
    path: 'journal',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/journal-entries'),
  },
  {
    path: 'accounts',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/chart-of-accounts'),
  },
  {
    path: 'trial-balance',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/trial-balance'),
  },
] as Routes;
