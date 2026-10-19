import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layout/app/layout';
import { EmptyLayout } from './layout/empty/empty';

export const routes: Routes = [
  // Loan Request - Public facing (no auth required)
  {
    path: 'loan-request',
    title: 'Loan Request',
    loadChildren: () => import('./features/loan-request/routes'),
  },
  {
    path: '',
    redirectTo: 'gmn',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    redirectTo: 'gmn',
    pathMatch: 'full',
  },
  {
    path: '',
    component: EmptyLayout,
    loadChildren: () => import('./features/auth/routes'),
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'gmn', pathMatch: 'full' },

      // ==========================================
      // GMN - Gemach Management System
      // ==========================================
      {
        path: 'gmn',
        title: 'גמ"ח',
        data: { breadcrumb: 'גמ"ח' },
        children: [
          {
            path: '',
            title: 'לוח בקרה',
            data: { breadcrumb: 'לוח בקרה' },
            loadChildren: () => import('./features/gmn/dashboard/routes'),
          },
          {
            path: 'people',
            title: 'אנשי קשר',
            data: { breadcrumb: 'אנשי קשר', preload: true },
            loadChildren: () => import('./features/gmn/people/routes'),
          },
          {
            path: 'loan-requests',
            title: 'בקשות הלוואה',
            data: { breadcrumb: 'בקשות הלוואה', preload: true },
            loadChildren: () => import('./features/gmn/loan-requests/routes'),
          },
          {
            path: 'loans',
            title: 'הלוואות',
            data: { breadcrumb: 'הלוואות', preload: true },
            loadChildren: () => import('./features/gmn/loans/routes'),
          },
          {
            path: 'savings',
            title: 'פיקדונות',
            data: { breadcrumb: 'פיקדונות', preload: true },
            loadChildren: () => import('./features/gmn/savings/routes'),
          },
          {
            path: 'donations',
            title: 'תרומות',
            data: { breadcrumb: 'תרומות' },
            loadChildren: () => import('./features/gmn/donations/routes'),
          },
          {
            path: 'payments',
            title: 'תשלומים',
            data: { breadcrumb: 'תשלומים' },
            loadChildren: () => import('./features/gmn/payments/routes'),
          },
          {
            path: 'masav',
            title: 'מס"ב',
            data: { breadcrumb: 'מס"ב' },
            loadChildren: () => import('./features/gmn/masav/routes'),
          },
          {
            path: 'accounting',
            title: 'הנהלת חשבונות',
            data: { breadcrumb: 'הנהלת חשבונות' },
            loadChildren: () => import('./features/gmn/accounting/routes'),
          },
          {
            path: 'reports',
            title: 'דוחות',
            data: { breadcrumb: 'דוחות' },
            loadChildren: () => import('./features/gmn/reports/routes'),
          },
          {
            path: 'admin',
            title: 'ניהול',
            data: { breadcrumb: 'ניהול' },
            loadChildren: () => import('./features/gmn/admin/routes'),
          },
        ],
      },

      // ==========================================
      // Original Dashboard Features (can be removed later)
      // ==========================================
      {
        path: 'dashboard',
        title: 'dashboard',
        data: { breadcrumb: 'navigation.dashboard' },
        children: [
          {
            path: '',
            redirectTo: 'dashboard-1',
            pathMatch: 'full',
          },
          {
            path: 'dashboard-1',
            title: 'dashboard-1',
            data: { breadcrumb: 'navigation.dashboard-1' },
            loadChildren: () => import('./features/dashboards/dashboard-1/routes'),
          },
          {
            path: 'dashboard-2',
            title: 'dashboard-2',
            data: { breadcrumb: 'navigation.dashboard-2', preload: true },
            loadChildren: () => import('./features/dashboards/dashboard-2/routes'),
          },
        ],
      },
      {
        path: 'users',
        title: 'users',
        data: { breadcrumb: 'navigation.users', preload: true },
        loadChildren: () => import('./features/users/routes'),
      },
      {
        path: 'calendar',
        title: 'calendar',
        data: { breadcrumb: 'navigation.calendar', preload: true },
        loadChildren: () => import('./features/calendar/routes'),
      },
      {
        path: 'kanban',
        title: 'kanban',
        data: { breadcrumb: 'navigation.kanban' },
        loadChildren: () => import('./features/kanban/routes'),
      },
      {
        path: 'file-manager',
        title: 'fileManager',
        data: { breadcrumb: 'navigation.fileManager' },
        loadChildren: () => import('./features/file-manager/routes'),
      },
      {
        path: 'settings',
        title: 'settings',
        data: { breadcrumb: 'navigation.settings', preload: true },
        loadChildren: () => import('./features/settings/routes'),
      },
      {
        path: 'assistant',
        title: 'aiAssistant',
        data: { breadcrumb: 'navigation.aiAssistant', preload: true },
        loadChildren: () => import('./features/ai-assistant/routes'),
      },
    ],
  },

  {
    path: '',
    component: EmptyLayout,
    loadChildren: () => import('./features/errors/routes'),
  },

  { path: '**', redirectTo: '404-not-found' },
];
