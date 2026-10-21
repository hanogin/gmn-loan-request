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
  lucideCalculator,
  lucideTrendingUp,
  lucideTrendingDown,
  lucideWallet,
  lucideArrowUpRight,
  lucideArrowDownRight,
  lucideCalendar,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { GmnMockService } from '../../../../core/services/mock-data';

interface CpaLineItem {
  category: string;
  categoryName: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  month?: number;
  year: number;
}

interface MonthlySummary {
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  netIncome: number;
}

@Component({
  selector: 'gmn-cpa-report',
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
      lucideCalculator,
      lucideTrendingUp,
      lucideTrendingDown,
      lucideWallet,
      lucideArrowUpRight,
      lucideArrowDownRight,
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
            <h1 class="text-2xl font-bold">{{ t('reports.cpa.title') }}</h1>
            <p class="text-muted-foreground">{{ t('accounting.subtitle') }}</p>
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

      <!-- Year Filter -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideCalendar" class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('reports.cpa.period') }}:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            @for (year of availableYears; track year) {
              <button
                hlmBtn
                size="sm"
                [variant]="yearFilter() === year ? 'default' : 'outline'"
                (click)="setYearFilter(year)"
              >
                {{ year }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideArrowUpRight" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ totalIncome() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.cpa.income') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              <ng-icon name="lucideArrowDownRight" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold text-red-600">{{ totalExpenses() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.cpa.expenses') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full" [class]="netIncome() >= 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'">
              <ng-icon name="lucideWallet" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold" [class]="netIncome() >= 0 ? 'text-blue-600' : 'text-amber-600'">
                {{ netIncome() | number:'1.0-0' }} ₪
              </p>
              <p class="text-sm text-muted-foreground">{{ t('reports.cpa.netIncome') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Summary -->
      <div hlmCard>
        <div class="border-b p-4">
          <h3 class="font-semibold">Monthly Summary - {{ yearFilter() }}</h3>
        </div>
        @if (isLoading()) {
          <div class="flex h-40 items-center justify-center">
            <ng-icon name="lucideLoader2" class="h-8 w-8 animate-spin text-primary" />
          </div>
        } @else {
          <table hlmTable class="w-full">
            <thead>
              <tr hlmTrow>
                <th hlmTh class="text-start">Month</th>
                <th hlmTh class="text-end">{{ t('reports.cpa.income') }}</th>
                <th hlmTh class="text-end">{{ t('reports.cpa.expenses') }}</th>
                <th hlmTh class="text-end">{{ t('reports.cpa.netIncome') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (month of monthlySummary(); track month.month) {
                <tr hlmTrow>
                  <td hlmTd class="font-medium">{{ month.monthName }}</td>
                  <td hlmTd class="text-end text-green-600">{{ month.income | number:'1.0-0' }} ₪</td>
                  <td hlmTd class="text-end text-red-600">{{ month.expenses | number:'1.0-0' }} ₪</td>
                  <td hlmTd class="text-end font-medium" [class]="month.netIncome >= 0 ? 'text-blue-600' : 'text-amber-600'">
                    {{ month.netIncome | number:'1.0-0' }} ₪
                  </td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr hlmTrow class="bg-muted/50 font-bold">
                <td hlmTd>{{ t('common.total') }}</td>
                <td hlmTd class="text-end text-green-600">{{ totalIncome() | number:'1.0-0' }} ₪</td>
                <td hlmTd class="text-end text-red-600">{{ totalExpenses() | number:'1.0-0' }} ₪</td>
                <td hlmTd class="text-end" [class]="netIncome() >= 0 ? 'text-blue-600' : 'text-amber-600'">
                  {{ netIncome() | number:'1.0-0' }} ₪
                </td>
              </tr>
            </tfoot>
          </table>
        }
      </div>

      <!-- Detailed Breakdown -->
      <div class="grid gap-4 lg:grid-cols-2">
        <!-- Income Breakdown -->
        <div hlmCard>
          <div class="flex items-center gap-2 border-b p-4">
            <ng-icon name="lucideTrendingUp" class="h-5 w-5 text-green-600" />
            <h3 class="font-semibold">{{ t('reports.cpa.income') }} Breakdown</h3>
          </div>
          <div class="p-4">
            <div class="space-y-3">
              @for (item of incomeBreakdown(); track item.category) {
                <div class="flex items-center justify-between">
                  <span class="text-sm">{{ item.categoryName }}</span>
                  <span class="font-medium text-green-600">{{ item.amount | number:'1.0-0' }} ₪</span>
                </div>
              } @empty {
                <p class="text-sm text-muted-foreground">{{ t('common.noData') }}</p>
              }
            </div>
          </div>
        </div>

        <!-- Expenses Breakdown -->
        <div hlmCard>
          <div class="flex items-center gap-2 border-b p-4">
            <ng-icon name="lucideTrendingDown" class="h-5 w-5 text-red-600" />
            <h3 class="font-semibold">{{ t('reports.cpa.expenses') }} Breakdown</h3>
          </div>
          <div class="p-4">
            <div class="space-y-3">
              @for (item of expensesBreakdown(); track item.category) {
                <div class="flex items-center justify-between">
                  <span class="text-sm">{{ item.categoryName }}</span>
                  <span class="font-medium text-red-600">{{ item.amount | number:'1.0-0' }} ₪</span>
                </div>
              } @empty {
                <p class="text-sm text-muted-foreground">{{ t('common.noData') }}</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class CpaReportPage implements OnInit {
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly lineItems = signal<CpaLineItem[]>([]);
  readonly yearFilter = signal(new Date().getFullYear());
  readonly availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  private readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Computed
  readonly filteredItems = computed(() => {
    return this.lineItems().filter(item => item.year === this.yearFilter());
  });

  readonly totalIncome = computed(() => {
    return this.filteredItems()
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
  });

  readonly totalExpenses = computed(() => {
    return this.filteredItems()
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  });

  readonly netIncome = computed(() => this.totalIncome() - this.totalExpenses());

  readonly monthlySummary = computed(() => {
    const items = this.filteredItems();
    const summary: MonthlySummary[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthItems = items.filter(item => item.month === month);
      const income = monthItems.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
      const expenses = monthItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);

      summary.push({
        month,
        monthName: this.monthNames[month - 1],
        income,
        expenses,
        netIncome: income - expenses,
      });
    }

    return summary;
  });

  readonly incomeBreakdown = computed(() => {
    const items = this.filteredItems().filter(item => item.type === 'income');
    const categoryMap = new Map<string, { category: string; categoryName: string; amount: number }>();

    for (const item of items) {
      const existing = categoryMap.get(item.category);
      if (existing) {
        existing.amount += item.amount;
      } else {
        categoryMap.set(item.category, {
          category: item.category,
          categoryName: item.categoryName,
          amount: item.amount,
        });
      }
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  });

  readonly expensesBreakdown = computed(() => {
    const items = this.filteredItems().filter(item => item.type === 'expense');
    const categoryMap = new Map<string, { category: string; categoryName: string; amount: number }>();

    for (const item of items) {
      const existing = categoryMap.get(item.category);
      if (existing) {
        existing.amount += item.amount;
      } else {
        categoryMap.set(item.category, {
          category: item.category,
          categoryName: item.categoryName,
          amount: item.amount,
        });
      }
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  });

  ngOnInit(): void {
    this.loadCpaData();
  }

  private async loadCpaData(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Generate CPA data from mock service data
      const items: CpaLineItem[] = [];
      const currentYear = new Date().getFullYear();

      // Get loans for loan repayment income
      const loansResult = await this.mockService.getLoans({ page: 1, pageSize: 1000 });

      // Get donations for donation income
      const donationsResult = await this.mockService.getDonations({ page: 1, pageSize: 1000 });

      // Get savings for interest expense
      const savingsResult = await this.mockService.getSavings({ page: 1, pageSize: 1000 });

      // Process loans - loan repayments as income
      for (const loan of loansResult.data) {
        if (loan.status === 'ACTIVE' || loan.status === 'COMPLETED') {
          const paidCount = loan.paidPaymentsCount || 0;
          const startDate = new Date(loan.startDate);

          for (let i = 0; i < paidCount && i < 12; i++) {
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + i);

            if (paymentDate.getFullYear() >= currentYear - 2) {
              items.push({
                category: 'LOAN_REPAYMENT',
                categoryName: 'Loan Repayments',
                description: `Loan ${loan.loanNumber} - Payment ${i + 1}`,
                amount: loan.monthlyPayment,
                type: 'income',
                month: paymentDate.getMonth() + 1,
                year: paymentDate.getFullYear(),
              });
            }
          }
        }
      }

      // Process donations as income
      for (const donation of donationsResult.data) {
        const donationDate = new Date(donation.donationDate);
        if (donationDate.getFullYear() >= currentYear - 2) {
          items.push({
            category: 'DONATIONS',
            categoryName: 'Donations',
            description: `Donation ${donation.donationNumber}`,
            amount: donation.amount,
            type: 'income',
            month: donationDate.getMonth() + 1,
            year: donationDate.getFullYear(),
          });
        }
      }

      // Process savings - interest as expense (simplified calculation)
      for (const saving of savingsResult.data) {
        if (saving.status === 'ACTIVE' && saving.interestRate > 0) {
          const openDate = new Date(saving.openDate);
          const monthlyInterest = (saving.currentBalance * (saving.interestRate / 100)) / 12;

          // Add monthly interest expense for active savings
          for (let year = currentYear - 2; year <= currentYear; year++) {
            for (let month = 1; month <= 12; month++) {
              const checkDate = new Date(year, month - 1, 1);
              if (checkDate >= openDate && checkDate <= new Date()) {
                items.push({
                  category: 'INTEREST_EXPENSE',
                  categoryName: 'Interest on Deposits',
                  description: `Interest for ${saving.savingNumber}`,
                  amount: Math.round(monthlyInterest),
                  type: 'expense',
                  month,
                  year,
                });
              }
            }
          }
        }
      }

      // Add some general operating expenses (mock data)
      const expenseCategories = [
        { category: 'ADMIN', name: 'Administrative', monthlyAmount: 2000 },
        { category: 'RENT', name: 'Rent & Utilities', monthlyAmount: 3500 },
        { category: 'SALARIES', name: 'Salaries', monthlyAmount: 8000 },
        { category: 'OFFICE', name: 'Office Supplies', monthlyAmount: 500 },
        { category: 'PROFESSIONAL', name: 'Professional Services', monthlyAmount: 1500 },
      ];

      for (const expCat of expenseCategories) {
        for (let year = currentYear - 2; year <= currentYear; year++) {
          const maxMonth = year === currentYear ? new Date().getMonth() + 1 : 12;
          for (let month = 1; month <= maxMonth; month++) {
            // Add some randomness to make it realistic
            const variance = (Math.random() - 0.5) * 0.2; // +/- 10%
            items.push({
              category: expCat.category,
              categoryName: expCat.name,
              description: `${expCat.name} - ${month}/${year}`,
              amount: Math.round(expCat.monthlyAmount * (1 + variance)),
              type: 'expense',
              month,
              year,
            });
          }
        }
      }

      // Add loan disbursements as expense
      for (const loan of loansResult.data) {
        const startDate = new Date(loan.startDate);
        if (startDate.getFullYear() >= currentYear - 2) {
          items.push({
            category: 'LOAN_DISBURSEMENT',
            categoryName: 'Loan Disbursements',
            description: `Loan ${loan.loanNumber} disbursement`,
            amount: loan.loanAmount,
            type: 'expense',
            month: startDate.getMonth() + 1,
            year: startDate.getFullYear(),
          });
        }
      }

      this.lineItems.set(items);
    } catch (error) {
      console.error('Error loading CPA data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setYearFilter(year: number): void {
    this.yearFilter.set(year);
  }

  exportReport(): void {
    const headers = ['Month', 'Income', 'Expenses', 'Net Income'];
    const rows = this.monthlySummary().map(m => [
      m.monthName,
      m.income.toString(),
      m.expenses.toString(),
      m.netIncome.toString(),
    ]);

    // Add totals row
    rows.push(['Total', this.totalIncome().toString(), this.totalExpenses().toString(), this.netIncome().toString()]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cpa-report-${this.yearFilter()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
