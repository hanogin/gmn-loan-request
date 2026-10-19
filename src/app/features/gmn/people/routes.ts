import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export default [
  {
    path: '',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/people-list'),
  },
  {
    path: 'new',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/person-form'),
  },
  {
    path: ':id',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/person-view'),
  },
  {
    path: ':id/edit',
    providers: [provideTranslocoScope('gmn')],
    loadComponent: () => import('./pages/person-form'),
  },
] as Routes;
