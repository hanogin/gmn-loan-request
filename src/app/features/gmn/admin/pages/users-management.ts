import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucidePlus,
  lucideSearch,
  lucideEdit,
  lucideTrash2,
  lucideUsers,
  lucideShield,
  lucideKey,
  lucideCheck,
  lucideX,
  lucideLoader2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';

import { GmnMockService } from '../../../../core/services/mock-data';

interface MockUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user' | 'readonly';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

@Component({
  selector: 'gmn-users-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
    HlmTableImports,
    BrnSelectImports,
    HlmSelectImports,
    BrnDialogImports,
    HlmDialogImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucidePlus,
      lucideSearch,
      lucideEdit,
      lucideTrash2,
      lucideUsers,
      lucideShield,
      lucideKey,
      lucideCheck,
      lucideX,
      lucideLoader2,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/admin">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('admin.users.title') }}</h1>
            <p class="text-muted-foreground">{{ t('admin.subtitle') }}</p>
          </div>
        </div>
        <button hlmBtn (click)="openAddUserDialog()">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('admin.users.newUser') }}
        </button>
      </div>

      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideUsers" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalUsers() }}</p>
              <p class="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideCheck" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ activeUsers() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('common.active') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideShield" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ adminUsers() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('admin.roles.admin') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideKey" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ managerUsers() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('admin.roles.manager') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="relative flex-1 min-w-[200px]">
            <ng-icon name="lucideSearch" class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              hlmInput
              type="text"
              placeholder="Search users..."
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
            />
          </div>
          <brn-select [(ngModel)]="roleFilter" class="w-[160px]">
            <hlm-select-trigger>
              <hlm-select-value [placeholder]="t('admin.users.role')" />
            </hlm-select-trigger>
            <hlm-select-content>
              <hlm-select-item value="">{{ t('common.all') }}</hlm-select-item>
              <hlm-select-item value="admin">{{ t('admin.roles.admin') }}</hlm-select-item>
              <hlm-select-item value="manager">{{ t('admin.roles.manager') }}</hlm-select-item>
              <hlm-select-item value="user">{{ t('admin.roles.user') }}</hlm-select-item>
              <hlm-select-item value="readonly">{{ t('admin.roles.readonly') }}</hlm-select-item>
            </hlm-select-content>
          </brn-select>
        </div>
      </div>

      <!-- Users Table -->
      <div hlmCard>
        <table hlmTable class="w-full">
          <thead>
            <tr hlmTrow>
              <th hlmTh class="text-start">{{ t('admin.users.username') }}</th>
              <th hlmTh class="text-start">{{ t('common.name') }}</th>
              <th hlmTh class="text-start">{{ t('admin.users.email') }}</th>
              <th hlmTh class="text-start">{{ t('admin.users.role') }}</th>
              <th hlmTh class="text-start">{{ t('common.status') }}</th>
              <th hlmTh class="text-start">{{ t('admin.users.lastLogin') }}</th>
              <th hlmTh class="text-center w-[100px]">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (user of filteredUsers(); track user.id) {
              <tr hlmTrow>
                <td hlmTd class="font-mono">{{ user.username }}</td>
                <td hlmTd class="font-medium">{{ user.fullName }}</td>
                <td hlmTd class="text-sm">{{ user.email }}</td>
                <td hlmTd>
                  <span hlmBadge [variant]="getRoleVariant(user.role)">
                    {{ getRoleName(user.role, t) }}
                  </span>
                </td>
                <td hlmTd>
                  <span hlmBadge [variant]="user.isActive ? 'default' : 'secondary'">
                    {{ user.isActive ? t('common.active') : t('common.inactive') }}
                  </span>
                </td>
                <td hlmTd class="text-sm text-muted-foreground">
                  {{ user.lastLogin ? formatDate(user.lastLogin) : '-' }}
                </td>
                <td hlmTd class="text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button hlmBtn variant="ghost" size="icon" (click)="editUser(user)">
                      <ng-icon name="lucideEdit" class="h-4 w-4" />
                    </button>
                    <button hlmBtn variant="ghost" size="icon" (click)="resetPassword(user)">
                      <ng-icon name="lucideKey" class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr hlmTrow>
                <td hlmTd colspan="7" class="py-8 text-center text-muted-foreground">
                  {{ t('common.noData') }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export default class UsersManagementPage {
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  roleFilter = signal('');

  // Mock users data
  private readonly users = signal<MockUser[]>([
    { id: 1, username: 'admin', email: 'admin@gemach.org', fullName: 'מנהל מערכת', role: 'admin', isActive: true, lastLogin: new Date(), createdAt: new Date(2023, 0, 1) },
    { id: 2, username: 'manager1', email: 'manager@gemach.org', fullName: 'יוסי כהן', role: 'manager', isActive: true, lastLogin: new Date(Date.now() - 86400000), createdAt: new Date(2023, 3, 15) },
    { id: 3, username: 'user1', email: 'user1@gemach.org', fullName: 'שרה לוי', role: 'user', isActive: true, lastLogin: new Date(Date.now() - 172800000), createdAt: new Date(2023, 6, 20) },
    { id: 4, username: 'user2', email: 'user2@gemach.org', fullName: 'דוד ישראלי', role: 'user', isActive: false, createdAt: new Date(2024, 1, 10) },
    { id: 5, username: 'readonly1', email: 'readonly@gemach.org', fullName: 'מרים אברהם', role: 'readonly', isActive: true, lastLogin: new Date(Date.now() - 604800000), createdAt: new Date(2024, 5, 1) },
  ]);

  readonly filteredUsers = computed(() => {
    let users = this.users();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      users = users.filter(u =>
        u.username.toLowerCase().includes(query) ||
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    if (this.roleFilter()) {
      users = users.filter(u => u.role === this.roleFilter());
    }

    return users;
  });

  readonly totalUsers = computed(() => this.users().length);
  readonly activeUsers = computed(() => this.users().filter(u => u.isActive).length);
  readonly adminUsers = computed(() => this.users().filter(u => u.role === 'admin').length);
  readonly managerUsers = computed(() => this.users().filter(u => u.role === 'manager').length);

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date));
  }

  getRoleVariant(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  }

  getRoleName(role: string, t: (key: string) => string): string {
    const keyMap: Record<string, string> = {
      'admin': 'admin.roles.admin',
      'manager': 'admin.roles.manager',
      'user': 'admin.roles.user',
      'readonly': 'admin.roles.readonly',
    };
    return t(keyMap[role] || role);
  }

  openAddUserDialog(): void {
    console.log('Open add user dialog');
    // TODO: Implement dialog
  }

  editUser(user: MockUser): void {
    console.log('Edit user:', user);
    // TODO: Implement edit
  }

  resetPassword(user: MockUser): void {
    console.log('Reset password for:', user);
    // TODO: Implement password reset
  }
}
