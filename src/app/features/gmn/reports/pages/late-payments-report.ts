import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideAlertTriangle,
  lucideDownload,
  lucidePrinter,
  lucideFilter,
  lucideLoader2,
  lucidePhone,
  lucideMail,
  lucideUser,
  lucideCalendar,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Loan, PayLine } from '../../../../core/models';

interface LatePaymentItem {
  loanId: number;
  loanNumber: string;
  personId: number;
  personName: string;
  identityNumber: string;
  phone: string;
  dueDate: Date;
  daysLate: number;
  amount: number;
  totalOverdue: number;
}

@Component({
  selector: 'gmn-late-payments-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTableImports,
    HlmInputImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideAlertTriangle,
      lucideDownload,
      lucidePrinter,
      lucideFilter,
      lucideLoader2,
      lucidePhone,
      lucideMail,
      lucideUser,
      lucideCalendar,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/reports">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('reports.latePayments.title') }}</h1>
            <p class="text-muted-foreground">{{ t('dashboard.stats.latePayments') }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button hlmBtn variant="outline" (click)="exportReport()">
            <ng-icon name="lucideDownload" class="me-2 h-4 w-4" />
            {{ t('common.export') }}
          </button>
          <button hlmBtn variant="outline" (click)="printReport()">
            <ng-icon name="lucidePrinter" class="me-2 h-4 w-4" />
            {{ t('common.print') }}
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              <ng-icon name="lucideAlertTriangle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ latePayments().length }}</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.latePayments.title') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideUser" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ uniqueBorrowers() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('loans.fields.borrower') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideCalendar" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ avgDaysLate() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.latePayments.daysLate') }} ({{ t('common.average') || 'Avg' }})</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideAlertTriangle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalOverdueAmount() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('common.total') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideFilter" class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('common.filter') }}:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              hlmBtn
              size="sm"
              [variant]="daysFilter() === 0 ? 'default' : 'outline'"
              (click)="setDaysFilter(0)"
            >
              {{ t('common.all') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="daysFilter() === 7 ? 'default' : 'outline'"
              (click)="setDaysFilter(7)"
            >
              1-7 {{ t('reports.latePayments.daysLate') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="daysFilter() === 30 ? 'default' : 'outline'"
              (click)="setDaysFilter(30)"
            >
              8-30 {{ t('reports.latePayments.daysLate') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="daysFilter() === 90 ? 'default' : 'outline'"
              (click)="setDaysFilter(90)"
            >
              30+ {{ t('reports.latePayments.daysLate') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Report Table -->
      <div hlmCard>
        @if (isLoading()) {
          <div class="flex h-40 items-center justify-center">
            <ng-icon name="lucideLoader2" class="h-8 w-8 animate-spin text-primary" />
          </div>
        } @else {
          <table hlmTable class="w-full">
            <thead>
              <tr hlmTrow>
                <th hlmTh class="text-start">{{ t('reports.latePayments.borrower') }}</th>
                <th hlmTh class="text-start">{{ t('reports.latePayments.loanNumber') }}</th>
                <th hlmTh class="text-start">{{ t('reports.latePayments.dueDate') }}</th>
                <th hlmTh class="text-start">{{ t('reports.latePayments.daysLate') }}</th>
                <th hlmTh class="text-start">{{ t('reports.latePayments.amount') }}</th>
                <th hlmTh class="text-center w-[100px]">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredPayments(); track item.loanId + '-' + item.dueDate) {
                <tr hlmTrow>
                  <td hlmTd>
                    <div>
                      <p class="font-medium">{{ item.personName }}</p>
                      <p class="text-xs text-muted-foreground">{{ item.identityNumber }}</p>
                    </div>
                  </td>
                  <td hlmTd class="font-mono">{{ item.loanNumber }}</td>
                  <td hlmTd>{{ item.dueDate | date:'dd/MM/yyyy' }}</td>
                  <td hlmTd>
                    <span hlmBadge [variant]="getDaysLateBadge(item.daysLate)">
                      {{ item.daysLate }} {{ t('reports.latePayments.daysLate') }}
                    </span>
                  </td>
                  <td hlmTd class="font-medium">{{ item.amount | number:'1.0-0' }} ₪</td>
                  <td hlmTd class="text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/loans', item.loanId]" title="{{ t('common.view') }}">
                        <ng-icon name="lucideUser" class="h-4 w-4" />
                      </button>
                      <a [href]="'tel:' + item.phone" hlmBtn variant="ghost" size="icon" title="{{ t('common.phone') }}">
                        <ng-icon name="lucidePhone" class="h-4 w-4" />
                      </a>
                    </div>
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
        }

        <!-- Footer -->
        <div class="flex items-center justify-between border-t p-4">
          <div class="text-sm text-muted-foreground">
            {{ t('common.showing') }} {{ filteredPayments().length }} {{ t('common.of') }} {{ latePayments().length }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class LatePaymentsReportPage implements OnInit {
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly latePayments = signal<LatePaymentItem[]>([]);
  readonly daysFilter = signal(0); // 0 = all, 7 = 1-7, 30 = 8-30, 90 = 30+

  // Computed
  readonly filteredPayments = computed(() => {
    const filter = this.daysFilter();
    const items = this.latePayments();

    if (filter === 0) return items;
    if (filter === 7) return items.filter(i => i.daysLate >= 1 && i.daysLate <= 7);
    if (filter === 30) return items.filter(i => i.daysLate > 7 && i.daysLate <= 30);
    if (filter === 90) return items.filter(i => i.daysLate > 30);

    return items;
  });

  readonly uniqueBorrowers = computed(() => {
    const personIds = new Set(this.latePayments().map(p => p.personId));
    return personIds.size;
  });

  readonly avgDaysLate = computed(() => {
    const items = this.latePayments();
    if (items.length === 0) return 0;
    return Math.round(items.reduce((sum, i) => sum + i.daysLate, 0) / items.length);
  });

  readonly totalOverdueAmount = computed(() => {
    return this.latePayments().reduce((sum, i) => sum + i.amount, 0);
  });

  ngOnInit(): void {
    this.loadLatePayments();
  }

  private async loadLatePayments(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Get all loans and calculate overdue payments
      const loansResult = await this.mockService.getLoans({ page: 1, pageSize: 1000 });
      const loans = loansResult.data.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');

      const today = new Date();
      const lateItems: LatePaymentItem[] = [];

      for (const loan of loans) {
        const startDate = new Date(loan.startDate);
        const paidCount = loan.paidPaymentsCount || 0;

        // Calculate overdue payments
        for (let i = paidCount + 1; i <= loan.numberOfPayments; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i - 1);
          dueDate.setDate(loan.paymentDay);

          if (dueDate < today) {
            const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

            lateItems.push({
              loanId: loan.id,
              loanNumber: loan.loanNumber,
              personId: loan.personId,
              personName: loan.person?.fullName || '',
              identityNumber: loan.person?.identityNumber || '',
              phone: loan.person?.contact?.mobilePhone || '',
              dueDate,
              daysLate,
              amount: loan.monthlyPayment,
              totalOverdue: (loan.numberOfPayments - paidCount) * loan.monthlyPayment,
            });
          }
        }
      }

      // Sort by days late descending
      lateItems.sort((a, b) => b.daysLate - a.daysLate);
      this.latePayments.set(lateItems);
    } catch (error) {
      console.error('Error loading late payments:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setDaysFilter(days: number): void {
    this.daysFilter.set(days);
  }

  getDaysLateBadge(days: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (days > 30) return 'destructive';
    if (days > 7) return 'default';
    return 'secondary';
  }

  exportReport(): void {
    // Generate CSV
    const headers = ['Borrower', 'ID', 'Loan #', 'Due Date', 'Days Late', 'Amount'];
    const rows = this.filteredPayments().map(p => [
      p.personName,
      p.identityNumber,
      p.loanNumber,
      new Date(p.dueDate).toLocaleDateString('he-IL'),
      p.daysLate.toString(),
      p.amount.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `late-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
