import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucidePlus,
  lucideEye,
  lucideCreditCard,
  lucideChevronLeft,
  lucideChevronRight,
  lucideX,
  lucideCheckCircle,
  lucideClock,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-payments-list',
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
      lucideCreditCard,
      lucideChevronLeft,
      lucideChevronRight,
      lucideX,
      lucideCheckCircle,
      lucideClock,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('payments.title') }}</h1>
          <p class="text-muted-foreground">{{ t('payments.subtitle') }}</p>
        </div>
        <button hlmBtn routerLink="/gmn/payments/new">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('payments.newPayment') }}
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
              <p class="text-sm text-muted-foreground">{{ t('payments.status.completed') }}</p>
              <p class="text-xl font-bold">{{ paidCount() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideClock" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('payments.status.pending') }}</p>
              <p class="text-xl font-bold">{{ pendingCount() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              <ng-icon name="lucideAlertCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('loans.payments.late') }}</p>
              <p class="text-xl font-bold">{{ overdueCount() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideCreditCard" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('payments.stats.thisMonth') }}</p>
              <p class="text-xl font-bold">₪{{ formatNumber(toCollectThisMonth()) }}</p>
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
              [placeholder]="t('common.searchPlaceholder')"
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
              <hlm-select-item value="PAID">{{ t('loans.payments.paid') }}</hlm-select-item>
              <hlm-select-item value="PENDING">{{ t('payments.status.pending') }}</hlm-select-item>
              <hlm-select-item value="OVERDUE">{{ t('loans.payments.late') }}</hlm-select-item>
              <hlm-select-item value="PARTIAL">{{ t('loans.payments.partial') }}</hlm-select-item>
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

      <!-- Payments Table -->
      <div hlmCard>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="p-3 text-start font-medium">{{ t('payments.fields.dueDate') }}</th>
                <th class="p-3 text-start font-medium">{{ t('loans.title') }}</th>
                <th class="p-3 text-start font-medium">{{ t('common.name') }}</th>
                <th class="p-3 text-start font-medium">{{ t('common.amount') }}</th>
                <th class="p-3 text-start font-medium">{{ t('payments.fields.paidDate') }}</th>
                <th class="p-3 text-start font-medium">{{ t('common.status') }}</th>
                <th class="p-3 text-center font-medium">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (payment of paginatedPayments(); track payment.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="p-3 text-sm">{{ formatDate(payment.dueDate) }}</td>
                  <td class="p-3 font-mono text-sm">
                    @if (payment.entityType === 'LOAN') {
                      <a [routerLink]="['/gmn/loans', payment.entityId]" class="text-primary hover:underline">
                        {{ getLoanNumber(payment.entityId) }}
                      </a>
                    } @else {
                      <span class="text-muted-foreground">{{ payment.entityType }}</span>
                    }
                  </td>
                  <td class="p-3">{{ getPersonName(payment.personId) }}</td>
                  <td class="p-3 font-semibold">₪{{ formatNumber(payment.amount) }}</td>
                  <td class="p-3 text-sm">
                    @if (payment.paidDate) {
                      {{ formatDate(payment.paidDate) }}
                    } @else {
                      <span class="text-muted-foreground">-</span>
                    }
                  </td>
                  <td class="p-3">
                    <span hlmBadge [variant]="getStatusVariant(payment.status)">
                      {{ getStatusName(payment.status) }}
                    </span>
                  </td>
                  <td class="p-3">
                    <div class="flex items-center justify-center gap-1">
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/payments', payment.id]">
                        <ng-icon name="lucideEye" class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="p-8 text-center text-muted-foreground">
                    <ng-icon name="lucideCreditCard" class="mx-auto mb-2 h-12 w-12 opacity-50" />
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
              {{ startIndex() + 1 }}-{{ endIndex() }} / {{ filteredPayments().length }}
            </p>
            <div class="flex items-center gap-2">
              <button hlmBtn variant="outline" size="icon" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
                <ng-icon name="lucideChevronRight" class="h-4 w-4" />
              </button>
              <span class="px-3 text-sm">{{ currentPage() }} / {{ totalPages() }}</span>
              <button hlmBtn variant="outline" size="icon" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
                <ng-icon name="lucideChevronLeft" class="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class PaymentsListPage {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  statusFilter = signal('');
  currentPage = signal(1);
  pageSize = 20;

  // Stats
  readonly paidCount = computed(() =>
    this.mockService.payLines().filter(p => p.status === 'PAID').length
  );
  readonly pendingCount = computed(() =>
    this.mockService.payLines().filter(p => p.status === 'PENDING').length
  );
  readonly overdueCount = computed(() =>
    this.mockService.payLines().filter(p => p.status === 'OVERDUE').length
  );
  readonly toCollectThisMonth = computed(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return this.mockService.payLines()
      .filter(p => {
        const dueDate = new Date(p.dueDate);
        return p.status !== 'PAID' && dueDate >= startOfMonth && dueDate <= endOfMonth;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  });

  readonly filteredPayments = computed(() => {
    let payments = this.mockService.payLines();

    if (this.statusFilter()) {
      payments = payments.filter(p => p.status === this.statusFilter());
    }

    return payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredPayments().length / this.pageSize));
  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredPayments().length));

  readonly paginatedPayments = computed(() =>
    this.filteredPayments().slice(this.startIndex(), this.endIndex())
  );

  getLoanNumber(entityId: number): string {
    const loan = this.mockService.loans().find(l => l.id === entityId);
    return loan?.loanNumber || '-';
  }

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    if (!person) return this.transloco.translate('gmn.common.noData');
    return person.fullName || `${person.firstName} ${person.lastName}`;
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'PAID': return 'default';
      case 'PENDING': return 'secondary';
      case 'OVERDUE': return 'destructive';
      case 'PARTIAL': return 'outline';
      default: return 'outline';
    }
  }

  getStatusName(status: string): string {
    const key = status.toLowerCase();
    const keyMap: Record<string, string> = {
      'paid': 'gmn.loans.payments.paid',
      'pending': 'gmn.payments.status.pending',
      'overdue': 'gmn.loans.payments.late',
      'partial': 'gmn.loans.payments.partial',
    };
    return this.transloco.translate(keyMap[key] || status);
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
