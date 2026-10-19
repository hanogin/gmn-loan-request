import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucidePlus,
  lucideEye,
  lucideEdit,
  lucidePiggyBank,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCheckCircle,
  lucideClock,
  lucideX,
  lucideTrendingUp,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-savings-list',
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
      lucideEye,
      lucideEdit,
      lucidePiggyBank,
      lucideChevronLeft,
      lucideChevronRight,
      lucideCheckCircle,
      lucideClock,
      lucideX,
      lucideTrendingUp,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('savings.title') }}</h1>
          <p class="text-muted-foreground">{{ t('savings.subtitle') }}</p>
        </div>
        <button hlmBtn routerLink="/gmn/savings/new">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('savings.newSaving') }}
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
              <p class="text-sm text-muted-foreground">{{ t('savings.stats.activeSavings') }}</p>
              <p class="text-xl font-bold">{{ activeCount() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideClock" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('savings.stats.upcomingMaturity') }}</p>
              <p class="text-xl font-bold">{{ upcomingMaturity() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucidePiggyBank" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('savings.stats.totalDeposits') }}</p>
              <p class="text-xl font-bold">{{ t('common.currency') }}{{ formatNumber(totalDeposits()) }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideTrendingUp" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('savings.stats.averageInterest') }}</p>
              <p class="text-xl font-bold">{{ averageInterest().toFixed(1) }}{{ t('common.percent') }}</p>
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
              [placeholder]="t('savings.searchPlaceholder')"
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
              <hlm-select-item value="ACTIVE">{{ t('savings.status.active') }}</hlm-select-item>
              <hlm-select-item value="MATURED">{{ t('savings.status.matured') }}</hlm-select-item>
              <hlm-select-item value="CLOSED">{{ t('savings.status.closed') }}</hlm-select-item>
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

      <!-- Savings Table -->
      <div hlmCard>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="p-3 text-start font-medium">{{ t('savings.fields.savingNumber') }}</th>
                <th class="p-3 text-start font-medium">{{ t('savings.fields.depositor') }}</th>
                <th class="p-3 text-start font-medium">{{ t('savings.fields.amount') }}</th>
                <th class="p-3 text-start font-medium">{{ t('savings.fields.interestRate') }}</th>
                <th class="p-3 text-start font-medium">{{ t('savings.fields.openDate') }}</th>
                <th class="p-3 text-start font-medium">{{ t('savings.fields.maturityDate') }}</th>
                <th class="p-3 text-start font-medium">{{ t('common.status') }}</th>
                <th class="p-3 text-center font-medium">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (saving of paginatedSavings(); track saving.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="p-3 font-mono text-sm">{{ saving.savingNumber }}</td>
                  <td class="p-3">
                    <a [routerLink]="['/gmn/people', saving.personId]" class="text-primary hover:underline">
                      {{ getPersonName(saving.personId) }}
                    </a>
                  </td>
                  <td class="p-3 font-semibold">{{ t('common.currency') }}{{ formatNumber(saving.currentBalance) }}</td>
                  <td class="p-3">{{ saving.interestRate }}{{ t('common.percent') }}</td>
                  <td class="p-3 text-sm text-muted-foreground">{{ formatDate(saving.openDate) }}</td>
                  <td class="p-3 text-sm" [class.text-amber-600]="isNearMaturity(saving.maturityDate)">
                    {{ formatDateSafe(saving.maturityDate) }}
                  </td>
                  <td class="p-3">
                    <span hlmBadge [variant]="getStatusVariant(saving.status)">
                      {{ getStatusTranslation(saving.status) }}
                    </span>
                  </td>
                  <td class="p-3">
                    <div class="flex items-center justify-center gap-1">
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/savings', saving.id]">
                        <ng-icon name="lucideEye" class="h-4 w-4" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/savings', saving.id, 'edit']">
                        <ng-icon name="lucideEdit" class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="p-8 text-center text-muted-foreground">
                    <ng-icon name="lucidePiggyBank" class="mx-auto mb-2 h-12 w-12 opacity-50" />
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
              {{ startIndex() + 1 }}-{{ endIndex() }} / {{ filteredSavings().length }}
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
export default class SavingsListPage {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  statusFilter = signal('');
  currentPage = signal(1);
  pageSize = 15;

  // Stats
  readonly activeCount = computed(() =>
    this.mockService.savings().filter(s => s.status === 'ACTIVE').length
  );
  readonly upcomingMaturity = computed(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.mockService.savings().filter(s =>
      s.status === 'ACTIVE' && s.maturityDate && new Date(s.maturityDate) <= thirtyDaysFromNow
    ).length;
  });
  readonly totalDeposits = computed(() =>
    this.mockService.savings()
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + s.currentBalance, 0)
  );
  readonly averageInterest = computed(() => {
    const active = this.mockService.savings().filter(s => s.status === 'ACTIVE');
    if (active.length === 0) return 0;
    return active.reduce((sum, s) => sum + (s.interestRate || 0), 0) / active.length;
  });

  readonly filteredSavings = computed(() => {
    let savings = this.mockService.savings();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      savings = savings.filter(saving => {
        const person = this.mockService.persons().find(p => p.id === saving.personId);
        const personName = person?.fullName?.toLowerCase() || '';
        return saving.savingNumber.toLowerCase().includes(query) || personName.includes(query);
      });
    }

    if (this.statusFilter()) {
      savings = savings.filter(saving => saving.status === this.statusFilter());
    }

    return savings.sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredSavings().length / this.pageSize));
  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredSavings().length));

  readonly paginatedSavings = computed(() =>
    this.filteredSavings().slice(this.startIndex(), this.endIndex())
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

  formatDateSafe(date: Date | undefined): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  isNearMaturity(date: Date | undefined): boolean {
    if (!date) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(date) <= thirtyDaysFromNow;
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'MATURED': return 'secondary';
      case 'CLOSED': return 'outline';
      default: return 'outline';
    }
  }

  getStatusTranslation(status: string): string {
    const key = `gmn.savings.status.${status.toLowerCase()}`;
    return this.transloco.translate(key);
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
