import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucidePlus,
  lucideFilter,
  lucideEye,
  lucideEdit,
  lucideWallet,
  lucideChevronLeft,
  lucideChevronRight,
  lucideArrowUpDown,
  lucideAlertCircle,
  lucideCheckCircle,
  lucideClock,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-loans-list',
  standalone: true,
  imports: [
    TranslocoModule,
    FormsModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucidePlus,
      lucideFilter,
      lucideEye,
      lucideEdit,
      lucideWallet,
      lucideChevronLeft,
      lucideChevronRight,
      lucideArrowUpDown,
      lucideAlertCircle,
      lucideCheckCircle,
      lucideClock,
      lucideX,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('loans.title') }}</h1>
          <p class="text-muted-foreground">{{ t('loans.subtitle') }}</p>
        </div>
        <button hlmBtn routerLink="/gmn/loans/new">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('loans.newLoan') }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('loans.stats.activeLoans') }}</p>
              <p class="text-xl font-bold">{{ activeCount() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              <ng-icon name="lucideAlertCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('loans.stats.latePayments') }}</p>
              <p class="text-xl font-bold">{{ overdueCount() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideWallet" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('loans.stats.totalBalance') }}</p>
              <p class="text-xl font-bold">{{ t('common.currency') }}{{ formatNumber(totalBalance()) }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideClock" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('loans.status.completed') }}</p>
              <p class="text-xl font-bold">{{ closedCount() }}</p>
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
              [placeholder]="t('loans.searchPlaceholder')"
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
            />
          </div>

          <brn-select [(ngModel)]="statusFilter" class="w-[180px]">
            <hlm-select-trigger>
              <hlm-select-value [placeholder]="t('common.status')" />
            </hlm-select-trigger>
            <hlm-select-content>
              <hlm-select-item value="">{{ t('common.all') }}</hlm-select-item>
              <hlm-select-item value="ACTIVE">{{ t('loans.status.active') }}</hlm-select-item>
              <hlm-select-item value="OVERDUE">{{ t('loans.payments.late') }}</hlm-select-item>
              <hlm-select-item value="CLOSED">{{ t('loans.status.completed') }}</hlm-select-item>
              <hlm-select-item value="FROZEN">{{ t('loans.status.frozen') }}</hlm-select-item>
            </hlm-select-content>
          </brn-select>

          @if (searchQuery() || statusFilter()) {
            <button hlmBtn variant="ghost" size="sm" (click)="clearFilters()">
              <ng-icon name="lucideX" class="me-1 h-4 w-4" />
              {{ t('common.filter') }}
            </button>
          }
        </div>
      </div>

      <!-- Loans Table -->
      <div hlmCard>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="p-3 text-start font-medium">{{ t('loans.fields.loanNumber') }}</th>
                <th class="p-3 text-start font-medium">{{ t('loans.fields.borrower') }}</th>
                <th class="p-3 text-start font-medium">{{ t('loans.fields.loanAmount') }}</th>
                <th class="p-3 text-start font-medium">{{ t('loans.fields.currentBalance') }}</th>
                <th class="p-3 text-start font-medium">{{ t('loans.fields.monthlyPayment') }}</th>
                <th class="p-3 text-start font-medium">{{ t('loans.fields.startDate') }}</th>
                <th class="p-3 text-start font-medium">{{ t('common.status') }}</th>
                <th class="p-3 text-center font-medium">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (loan of paginatedLoans(); track loan.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="p-3 font-mono text-sm">{{ loan.loanNumber }}</td>
                  <td class="p-3">
                    <a [routerLink]="['/gmn/people', loan.personId]" class="text-primary hover:underline">
                      {{ getPersonName(loan.personId) }}
                    </a>
                  </td>
                  <td class="p-3">{{ t('common.currency') }}{{ formatNumber(loan.loanAmount) }}</td>
                  <td class="p-3 font-semibold" [class.text-red-600]="loan.currentBalance > 0">
                    {{ t('common.currency') }}{{ formatNumber(loan.currentBalance) }}
                  </td>
                  <td class="p-3">{{ t('common.currency') }}{{ formatNumber(loan.monthlyPayment) }}</td>
                  <td class="p-3 text-sm text-muted-foreground">{{ formatDate(loan.startDate) }}</td>
                  <td class="p-3">
                    <span hlmBadge [variant]="getStatusVariant(loan.status)">
                      {{ getStatusTranslation(loan.status) }}
                    </span>
                  </td>
                  <td class="p-3">
                    <div class="flex items-center justify-center gap-1">
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/loans', loan.id]">
                        <ng-icon name="lucideEye" class="h-4 w-4" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/loans', loan.id, 'edit']">
                        <ng-icon name="lucideEdit" class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="p-8 text-center text-muted-foreground">
                    <ng-icon name="lucideWallet" class="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>{{ t('common.noData') }}</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between border-t p-4">
            <p class="text-sm text-muted-foreground">
              {{ startIndex() + 1 }}-{{ endIndex() }} / {{ filteredLoans().length }}
            </p>
            <div class="flex items-center gap-2">
              <button hlmBtn variant="outline" size="icon" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
                <ng-icon name="lucideChevronLeft" class="h-4 w-4" />
              </button>
              <span class="px-3 text-sm">{{ currentPage() }} / {{ totalPages() }}</span>
              <button hlmBtn variant="outline" size="icon" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
                <ng-icon name="lucideChevronRight" class="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class LoansListPage {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  statusFilter = signal('');
  currentPage = signal(1);
  pageSize = 15;

  // Stats
  readonly activeCount = computed(() =>
    this.mockService.loans().filter(l => l.status === 'ACTIVE').length
  );
  readonly overdueCount = computed(() =>
    this.mockService.loans().filter(l => l.status === 'OVERDUE').length
  );
  readonly closedCount = computed(() =>
    this.mockService.loans().filter(l => l.status === 'CLOSED').length
  );
  readonly totalBalance = computed(() =>
    this.mockService.loans()
      .filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .reduce((sum, l) => sum + l.currentBalance, 0)
  );

  readonly filteredLoans = computed(() => {
    let loans = this.mockService.loans();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      loans = loans.filter(loan => {
        const person = this.mockService.persons().find(p => p.id === loan.personId);
        const personName = person?.fullName?.toLowerCase() || '';
        return loan.loanNumber.toLowerCase().includes(query) || personName.includes(query);
      });
    }

    if (this.statusFilter()) {
      loans = loans.filter(loan => loan.status === this.statusFilter());
    }

    return loans.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredLoans().length / this.pageSize));
  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredLoans().length));

  readonly paginatedLoans = computed(() =>
    this.filteredLoans().slice(this.startIndex(), this.endIndex())
  );

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || `${person?.firstName} ${person?.lastName}` || '—';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'OVERDUE': return 'destructive';
      case 'CLOSED': return 'secondary';
      case 'FROZEN': return 'outline';
      default: return 'outline';
    }
  }

  getStatusTranslation(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'loans.status.active',
      'OVERDUE': 'loans.payments.late',
      'CLOSED': 'loans.status.completed',
      'FROZEN': 'loans.status.frozen',
    };
    return this.transloco.translate(`gmn.${statusMap[status] || 'common.pending'}`);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }
}
