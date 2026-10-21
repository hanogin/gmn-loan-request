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
  lucideChevronDown,
  lucideChevronRight,
  lucideBookOpen,
  lucideTrendingUp,
  lucideTrendingDown,
  lucideWallet,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { GmnMockService } from '../../../../core/services/mock-data';

interface AccountItem {
  id: number;
  accountNumber: string;
  accountName: string;
  accountNameHe: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  parentId?: number;
  balance: number;
  isActive: boolean;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

@Component({
  selector: 'gmn-chart-of-accounts',
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
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucidePlus,
      lucideSearch,
      lucideEdit,
      lucideChevronDown,
      lucideChevronRight,
      lucideBookOpen,
      lucideTrendingUp,
      lucideTrendingDown,
      lucideWallet,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/accounting">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('accounting.chartOfAccounts.title') }}</h1>
            <p class="text-muted-foreground">{{ t('accounting.subtitle') }}</p>
          </div>
        </div>
        <button hlmBtn (click)="addAccount()">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('accounting.chartOfAccounts.newAccount') }}
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        @for (type of accountTypes; track type.code) {
          <div hlmCard class="p-4 cursor-pointer hover:shadow-md transition-shadow"
               [class.ring-2]="selectedType() === type.code"
               [class.ring-primary]="selectedType() === type.code"
               (click)="selectType(type.code)">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full" [class]="type.bgClass">
                <ng-icon [name]="type.icon" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-lg font-bold">{{ getTypeTotal(type.code) | number:'1.0-0' }} ₪</p>
                <p class="text-xs text-muted-foreground">{{ t('accounting.accountTypes.' + type.code.toLowerCase()) }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Search -->
      <div hlmCard class="p-4">
        <div class="flex items-center gap-4">
          <div class="relative flex-1">
            <ng-icon name="lucideSearch" class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              hlmInput
              type="text"
              placeholder="Search accounts..."
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
            />
          </div>
          @if (selectedType()) {
            <button hlmBtn variant="outline" size="sm" (click)="selectType('')">
              Clear Filter
            </button>
          }
        </div>
      </div>

      <!-- Accounts Table -->
      <div hlmCard>
        <table hlmTable class="w-full">
          <thead>
            <tr hlmTrow>
              <th hlmTh class="text-start w-[120px]">{{ t('accounting.chartOfAccounts.accountNumber') }}</th>
              <th hlmTh class="text-start">{{ t('accounting.chartOfAccounts.accountName') }}</th>
              <th hlmTh class="text-start">{{ t('accounting.chartOfAccounts.accountType') }}</th>
              <th hlmTh class="text-end">{{ t('accounting.chartOfAccounts.balance') }}</th>
              <th hlmTh class="text-start">{{ t('common.status') }}</th>
              <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (account of filteredAccounts(); track account.id) {
              <tr hlmTrow class="hover:bg-muted/50">
                <td hlmTd class="font-mono">
                  <div class="flex items-center gap-1" [style.paddingInlineStart.px]="account.level * 20">
                    @if (account.hasChildren) {
                      <button class="p-0.5 rounded hover:bg-muted" (click)="toggleExpand(account)">
                        <ng-icon [name]="account.isExpanded ? 'lucideChevronDown' : 'lucideChevronRight'" class="h-4 w-4" />
                      </button>
                    } @else {
                      <span class="w-5"></span>
                    }
                    {{ account.accountNumber }}
                  </div>
                </td>
                <td hlmTd>
                  <div>
                    <p [class.font-semibold]="account.hasChildren">{{ account.accountNameHe }}</p>
                    <p class="text-xs text-muted-foreground">{{ account.accountName }}</p>
                  </div>
                </td>
                <td hlmTd>
                  <span hlmBadge [variant]="getTypeBadge(account.accountType)">
                    {{ t('accounting.accountTypes.' + account.accountType.toLowerCase()) }}
                  </span>
                </td>
                <td hlmTd class="text-end font-medium" [class]="account.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ account.balance | number:'1.0-0' }} ₪
                </td>
                <td hlmTd>
                  <span hlmBadge [variant]="account.isActive ? 'default' : 'secondary'">
                    {{ account.isActive ? t('common.active') : t('common.inactive') }}
                  </span>
                </td>
                <td hlmTd class="text-center">
                  <button hlmBtn variant="ghost" size="icon" (click)="editAccount(account)">
                    <ng-icon name="lucideEdit" class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            } @empty {
              <tr hlmTrow>
                <td hlmTd colspan="6" class="py-8 text-center text-muted-foreground">
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
export default class ChartOfAccountsPage {
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  selectedType = signal('');

  accountTypes = [
    { code: 'ASSET', icon: 'lucideWallet', bgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
    { code: 'LIABILITY', icon: 'lucideTrendingDown', bgClass: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    { code: 'EQUITY', icon: 'lucideBookOpen', bgClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
    { code: 'INCOME', icon: 'lucideTrendingUp', bgClass: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    { code: 'EXPENSE', icon: 'lucideTrendingDown', bgClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' },
  ];

  // Mock chart of accounts
  private readonly accounts = signal<AccountItem[]>([
    // Assets
    { id: 1, accountNumber: '1000', accountName: 'Assets', accountNameHe: 'נכסים', accountType: 'ASSET', balance: 850000, isActive: true, level: 0, hasChildren: true, isExpanded: true },
    { id: 2, accountNumber: '1100', accountName: 'Cash', accountNameHe: 'מזומנים', accountType: 'ASSET', parentId: 1, balance: 150000, isActive: true, level: 1, hasChildren: true, isExpanded: true },
    { id: 3, accountNumber: '1110', accountName: 'Petty Cash', accountNameHe: 'קופה קטנה', accountType: 'ASSET', parentId: 2, balance: 5000, isActive: true, level: 2, hasChildren: false, isExpanded: false },
    { id: 4, accountNumber: '1120', accountName: 'Bank Account', accountNameHe: 'חשבון בנק', accountType: 'ASSET', parentId: 2, balance: 145000, isActive: true, level: 2, hasChildren: false, isExpanded: false },
    { id: 5, accountNumber: '1200', accountName: 'Loans Receivable', accountNameHe: 'הלוואות לגבייה', accountType: 'ASSET', parentId: 1, balance: 700000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
    // Liabilities
    { id: 6, accountNumber: '2000', accountName: 'Liabilities', accountNameHe: 'התחייבויות', accountType: 'LIABILITY', balance: 450000, isActive: true, level: 0, hasChildren: true, isExpanded: true },
    { id: 7, accountNumber: '2100', accountName: 'Deposits Payable', accountNameHe: 'פיקדונות לתשלום', accountType: 'LIABILITY', parentId: 6, balance: 450000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
    // Equity
    { id: 8, accountNumber: '3000', accountName: 'Equity', accountNameHe: 'הון עצמי', accountType: 'EQUITY', balance: 400000, isActive: true, level: 0, hasChildren: true, isExpanded: true },
    { id: 9, accountNumber: '3100', accountName: 'Donations Fund', accountNameHe: 'קרן תרומות', accountType: 'EQUITY', parentId: 8, balance: 350000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
    { id: 10, accountNumber: '3200', accountName: 'Retained Earnings', accountNameHe: 'עודפים', accountType: 'EQUITY', parentId: 8, balance: 50000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
    // Income
    { id: 11, accountNumber: '4000', accountName: 'Income', accountNameHe: 'הכנסות', accountType: 'INCOME', balance: 125000, isActive: true, level: 0, hasChildren: true, isExpanded: true },
    { id: 12, accountNumber: '4100', accountName: 'Donations', accountNameHe: 'תרומות', accountType: 'INCOME', parentId: 11, balance: 100000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
    { id: 13, accountNumber: '4200', accountName: 'Interest Income', accountNameHe: 'הכנסות ריבית', accountType: 'INCOME', parentId: 11, balance: 25000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
    // Expenses
    { id: 14, accountNumber: '5000', accountName: 'Expenses', accountNameHe: 'הוצאות', accountType: 'EXPENSE', balance: 75000, isActive: true, level: 0, hasChildren: true, isExpanded: true },
    { id: 15, accountNumber: '5100', accountName: 'Administrative', accountNameHe: 'הנהלה וכלליות', accountType: 'EXPENSE', parentId: 14, balance: 30000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
    { id: 16, accountNumber: '5200', accountName: 'Interest Expense', accountNameHe: 'הוצאות ריבית', accountType: 'EXPENSE', parentId: 14, balance: 45000, isActive: true, level: 1, hasChildren: false, isExpanded: false },
  ]);

  private readonly expandedIds = signal<Set<number>>(new Set([1, 2, 6, 8, 11, 14]));

  readonly filteredAccounts = computed(() => {
    let accounts = this.accounts();
    const expanded = this.expandedIds();

    // Filter by type
    if (this.selectedType()) {
      accounts = accounts.filter(a => a.accountType === this.selectedType());
    }

    // Filter by search
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      accounts = accounts.filter(a =>
        a.accountNumber.includes(query) ||
        a.accountName.toLowerCase().includes(query) ||
        a.accountNameHe.includes(query)
      );
    }

    // Filter by expansion state (show children only if parent is expanded)
    return accounts.filter(account => {
      if (!account.parentId) return true;
      const parent = accounts.find(a => a.id === account.parentId);
      return parent && expanded.has(parent.id);
    });
  });

  getTypeTotal(type: string): number {
    return this.accounts()
      .filter(a => a.accountType === type && a.level === 0)
      .reduce((sum, a) => sum + a.balance, 0);
  }

  getTypeBadge(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (type) {
      case 'ASSET': return 'default';
      case 'LIABILITY': return 'destructive';
      case 'EQUITY': return 'secondary';
      case 'INCOME': return 'default';
      case 'EXPENSE': return 'destructive';
      default: return 'outline';
    }
  }

  selectType(type: string): void {
    this.selectedType.set(this.selectedType() === type ? '' : type);
  }

  toggleExpand(account: AccountItem): void {
    const expanded = new Set(this.expandedIds());
    if (expanded.has(account.id)) {
      expanded.delete(account.id);
    } else {
      expanded.add(account.id);
    }
    this.expandedIds.set(expanded);
  }

  addAccount(): void {
    console.log('Add account');
  }

  editAccount(account: AccountItem): void {
    console.log('Edit account:', account);
  }
}
