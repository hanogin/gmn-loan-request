import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideDownload,
  lucidePrinter,
  lucideFilter,
  lucideLoader2,
  lucideWallet,
  lucideCheckCircle,
  lucideAlertTriangle,
  lucideUsers,
  lucideCalendar,
  lucideTrendingUp,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Loan } from '../../../../core/models';

interface LoanSummaryItem {
  id: number;
  loanNumber: string;
  personId: number;
  personName: string;
  identityNumber: string;
  loanAmount: number;
  currentBalance: number;
  totalPaid: number;
  numberOfPayments: number;
  paidPayments: number;
  remainingPayments: number;
  monthlyPayment: number;
  startDate: Date;
  endDate: Date;
  status: string;
  overduePayments: number;
}

@Component({
  selector: 'gmn-loans-summary-report',
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
      lucideDownload,
      lucidePrinter,
      lucideFilter,
      lucideLoader2,
      lucideWallet,
      lucideCheckCircle,
      lucideAlertTriangle,
      lucideUsers,
      lucideCalendar,
      lucideTrendingUp,
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
            <h1 class="text-2xl font-bold">{{ t('reports.loansSummary.title') }}</h1>
            <p class="text-muted-foreground">{{ t('loans.subtitle') }}</p>
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
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideWallet" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalLoans() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.loansSummary.totalLoans') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ activeLoans() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.loansSummary.activeLoans') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideTrendingUp" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalLoanAmount() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.loansSummary.totalAmount') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideAlertTriangle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ outstandingBalance() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.loansSummary.outstandingBalance') }}</p>
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
              [variant]="statusFilter() === 'ALL' ? 'default' : 'outline'"
              (click)="setStatusFilter('ALL')"
            >
              {{ t('common.all') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="statusFilter() === 'ACTIVE' ? 'default' : 'outline'"
              (click)="setStatusFilter('ACTIVE')"
            >
              {{ t('loans.status.active') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="statusFilter() === 'COMPLETED' ? 'default' : 'outline'"
              (click)="setStatusFilter('COMPLETED')"
            >
              {{ t('loans.status.completed') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="statusFilter() === 'OVERDUE' ? 'default' : 'outline'"
              (click)="setStatusFilter('OVERDUE')"
            >
              {{ t('loans.status.defaulted') }}
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
                <th hlmTh class="text-start">{{ t('loans.fields.loanNumber') }}</th>
                <th hlmTh class="text-start">{{ t('loans.fields.borrower') }}</th>
                <th hlmTh class="text-start">{{ t('loans.fields.loanAmount') }}</th>
                <th hlmTh class="text-start">{{ t('loans.fields.currentBalance') }}</th>
                <th hlmTh class="text-start">{{ t('loans.fields.paidPayments') }}</th>
                <th hlmTh class="text-start">{{ t('common.status') }}</th>
                <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (loan of filteredLoans(); track loan.id) {
                <tr hlmTrow>
                  <td hlmTd class="font-mono">{{ loan.loanNumber }}</td>
                  <td hlmTd>
                    <div>
                      <p class="font-medium">{{ loan.personName }}</p>
                      <p class="text-xs text-muted-foreground">{{ loan.identityNumber }}</p>
                    </div>
                  </td>
                  <td hlmTd class="font-medium">{{ loan.loanAmount | number:'1.0-0' }} ₪</td>
                  <td hlmTd>{{ loan.currentBalance | number:'1.0-0' }} ₪</td>
                  <td hlmTd>
                    <span class="text-sm">{{ loan.paidPayments }}/{{ loan.numberOfPayments }}</span>
                    <div class="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        class="h-full bg-primary transition-all"
                        [style.width.%]="(loan.paidPayments / loan.numberOfPayments) * 100"
                      ></div>
                    </div>
                  </td>
                  <td hlmTd>
                    <span hlmBadge [variant]="getStatusBadge(loan.status)">
                      {{ getStatusText(loan.status, t) }}
                    </span>
                  </td>
                  <td hlmTd class="text-center">
                    <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/loans', loan.id]" title="{{ t('common.view') }}">
                      <ng-icon name="lucideUsers" class="h-4 w-4" />
                    </button>
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
        }

        <!-- Summary Footer -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-t p-4">
          <div class="text-sm text-muted-foreground">
            {{ t('common.showing') }} {{ filteredLoans().length }} {{ t('common.of') }} {{ loans().length }}
          </div>
          <div class="flex gap-6 text-sm">
            <div>
              <span class="text-muted-foreground">{{ t('reports.loansSummary.totalAmount') }}:</span>
              <span class="ms-2 font-bold">{{ filteredTotalAmount() | number:'1.0-0' }} ₪</span>
            </div>
            <div>
              <span class="text-muted-foreground">{{ t('reports.loansSummary.outstandingBalance') }}:</span>
              <span class="ms-2 font-bold">{{ filteredOutstandingBalance() | number:'1.0-0' }} ₪</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class LoansSummaryReportPage implements OnInit {
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly loans = signal<LoanSummaryItem[]>([]);
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE'>('ALL');

  // Computed
  readonly filteredLoans = computed(() => {
    const filter = this.statusFilter();
    const items = this.loans();

    if (filter === 'ALL') return items;
    if (filter === 'OVERDUE') return items.filter(l => l.overduePayments > 0);
    return items.filter(l => l.status === filter);
  });

  readonly totalLoans = computed(() => this.loans().length);
  readonly activeLoans = computed(() => this.loans().filter(l => l.status === 'ACTIVE').length);
  readonly totalLoanAmount = computed(() => this.loans().reduce((sum, l) => sum + l.loanAmount, 0));
  readonly outstandingBalance = computed(() => this.loans().reduce((sum, l) => sum + l.currentBalance, 0));

  readonly filteredTotalAmount = computed(() => this.filteredLoans().reduce((sum, l) => sum + l.loanAmount, 0));
  readonly filteredOutstandingBalance = computed(() => this.filteredLoans().reduce((sum, l) => sum + l.currentBalance, 0));

  ngOnInit(): void {
    this.loadLoans();
  }

  private async loadLoans(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.mockService.getLoans({ page: 1, pageSize: 1000 });
      const items: LoanSummaryItem[] = result.data.map(loan => ({
        id: loan.id,
        loanNumber: loan.loanNumber,
        personId: loan.personId,
        personName: loan.person?.fullName || '',
        identityNumber: loan.person?.identityNumber || '',
        loanAmount: loan.loanAmount,
        currentBalance: loan.currentBalance || 0,
        totalPaid: loan.totalPaid || 0,
        numberOfPayments: loan.numberOfPayments,
        paidPayments: loan.paidPaymentsCount || 0,
        remainingPayments: loan.remainingPaymentsCount || 0,
        monthlyPayment: loan.monthlyPayment,
        startDate: new Date(loan.startDate),
        endDate: loan.endDate ? new Date(loan.endDate) : new Date(),
        status: loan.status,
        overduePayments: loan.overduePaymentsCount || 0,
      }));

      // Sort by loan number descending (newest first)
      items.sort((a, b) => b.loanNumber.localeCompare(a.loanNumber));
      this.loans.set(items);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE'): void {
    this.statusFilter.set(status);
  }

  getStatusBadge(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'OVERDUE':
      case 'DEFAULTED': return 'destructive';
      default: return 'outline';
    }
  }

  getStatusText(status: string, t: (key: string) => string): string {
    switch (status) {
      case 'ACTIVE': return t('loans.status.active');
      case 'COMPLETED': return t('loans.status.completed');
      case 'OVERDUE':
      case 'DEFAULTED': return t('loans.status.defaulted');
      case 'FROZEN': return t('loans.status.frozen');
      default: return status;
    }
  }

  exportReport(): void {
    const headers = ['Loan #', 'Borrower', 'ID', 'Amount', 'Balance', 'Paid', 'Total', 'Status'];
    const rows = this.filteredLoans().map(l => [
      l.loanNumber,
      l.personName,
      l.identityNumber,
      l.loanAmount.toString(),
      l.currentBalance.toString(),
      l.paidPayments.toString(),
      l.numberOfPayments.toString(),
      l.status,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loans-summary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
