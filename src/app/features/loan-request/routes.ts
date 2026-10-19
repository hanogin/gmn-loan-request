import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./loan-request.component').then(m => m.LoanRequestComponent),
  },
] satisfies Routes;
