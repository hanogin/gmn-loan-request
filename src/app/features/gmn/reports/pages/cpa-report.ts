import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCalculator,
  lucideDownload,
  lucidePrinter,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-cpa-report',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideCalculator,
      lucideDownload,
      lucidePrinter,
    }),
  ],
  template: `
    <div class="space-y-6" >
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/reports">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">דוח רו"ח</h1>
            <p class="text-muted-foreground">סיכום מצב הגמ"ח לרואה החשבון</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button hlmBtn variant="outline" (click)="exportReport()">
            <ng-icon name="lucideDownload" class="me-2 h-4 w-4" />
            ייצוא Excel
          </button>
          <button hlmBtn variant="outline" (click)="printReport()">
            <ng-icon name="lucidePrinter" class="me-2 h-4 w-4" />
            הדפסה
          </button>
        </div>
      </div>

      <!-- Balance Sheet -->
      <div hlmCard>
        <div class="border-b p-4">
          <h3 class="font-semibold flex items-center gap-2">
            <ng-icon name="lucideCalculator" class="h-5 w-5" />
            מאזן הגמ"ח
          </h3>
        </div>
        <div class="p-6">
          <div class="grid gap-6 lg:grid-cols-2">
            <!-- Assets -->
            <div>
              <h4 class="font-semibold text-lg mb-4 pb-2 border-b">נכסים</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>יתרת הלוואות לגבייה</span>
                  <span class="font-mono font-semibold">₪{{ formatNumber(totalLoansBalance()) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>מזומנים ופיקדונות בנק</span>
                  <span class="font-mono font-semibold">₪{{ formatNumber(cashBalance()) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t font-semibold">
                  <span>סה"כ נכסים</span>
                  <span class="font-mono">₪{{ formatNumber(totalAssets()) }}</span>
                </div>
              </div>
            </div>

            <!-- Liabilities -->
            <div>
              <h4 class="font-semibold text-lg mb-4 pb-2 border-b">התחייבויות</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>פיקדונות להחזרה</span>
                  <span class="font-mono font-semibold">₪{{ formatNumber(totalDeposits()) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>ריבית לשלם</span>
                  <span class="font-mono font-semibold">₪{{ formatNumber(interestPayable()) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t font-semibold">
                  <span>סה"כ התחייבויות</span>
                  <span class="font-mono">₪{{ formatNumber(totalLiabilities()) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Equity -->
          <div class="mt-6 pt-6 border-t">
            <div class="flex justify-between text-lg font-bold">
              <span>הון עצמי (נכסים - התחייבויות)</span>
              <span class="font-mono" [class]="netEquity() >= 0 ? 'text-green-600' : 'text-red-600'">
                ₪{{ formatNumber(netEquity()) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Income Statement -->
      <div hlmCard>
        <div class="border-b p-4">
          <h3 class="font-semibold">דוח הכנסות והוצאות - שנה נוכחית</h3>
        </div>
        <div class="p-6">
          <div class="grid gap-6 lg:grid-cols-2">
            <!-- Income -->
            <div>
              <h4 class="font-semibold text-lg mb-4 pb-2 border-b text-green-600">הכנסות</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>תרומות</span>
                  <span class="font-mono">₪{{ formatNumber(totalDonationsThisYear()) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>ריבית הלוואות</span>
                  <span class="font-mono">₪{{ formatNumber(loanInterestIncome()) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t font-semibold text-green-600">
                  <span>סה"כ הכנסות</span>
                  <span class="font-mono">₪{{ formatNumber(totalIncome()) }}</span>
                </div>
              </div>
            </div>

            <!-- Expenses -->
            <div>
              <h4 class="font-semibold text-lg mb-4 pb-2 border-b text-red-600">הוצאות</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>ריבית פיקדונות</span>
                  <span class="font-mono">₪{{ formatNumber(depositInterestExpense()) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>הוצאות תפעול</span>
                  <span class="font-mono">₪{{ formatNumber(operatingExpenses()) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t font-semibold text-red-600">
                  <span>סה"כ הוצאות</span>
                  <span class="font-mono">₪{{ formatNumber(totalExpenses()) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Net -->
          <div class="mt-6 pt-6 border-t">
            <div class="flex justify-between text-lg font-bold">
              <span>רווח/הפסד נקי</span>
              <span class="font-mono" [class]="netProfit() >= 0 ? 'text-green-600' : 'text-red-600'">
                ₪{{ formatNumber(netProfit()) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class CpaReportPage {
  private readonly mockService = inject(GmnMockService);

  // Assets
  readonly totalLoansBalance = computed(() =>
    this.mockService.loans()
      .filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .reduce((sum, l) => sum + l.currentBalance, 0)
  );
  readonly cashBalance = () => 250000; // Placeholder
  readonly totalAssets = computed(() => this.totalLoansBalance() + this.cashBalance());

  // Liabilities
  readonly totalDeposits = computed(() =>
    this.mockService.savings()
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + s.currentBalance, 0)
  );
  readonly interestPayable = computed(() =>
    this.mockService.savings()
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (s.currentBalance * (s.interestRate || 0) / 100 / 12), 0) * 3 // 3 months accrued
  );
  readonly totalLiabilities = computed(() => this.totalDeposits() + this.interestPayable());

  // Equity
  readonly netEquity = computed(() => this.totalAssets() - this.totalLiabilities());

  // Income
  readonly totalDonationsThisYear = computed(() => {
    const thisYear = new Date().getFullYear();
    return this.mockService.donations()
      .filter(d => new Date(d.donationDate).getFullYear() === thisYear)
      .reduce((sum, d) => sum + d.amount, 0);
  });
  readonly loanInterestIncome = () => 15000; // Placeholder
  readonly totalIncome = computed(() => this.totalDonationsThisYear() + this.loanInterestIncome());

  // Expenses
  readonly depositInterestExpense = computed(() =>
    this.mockService.savings()
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (s.currentBalance * (s.interestRate || 0) / 100 / 12), 0) * 10 // 10 months
  );
  readonly operatingExpenses = () => 5000; // Placeholder
  readonly totalExpenses = computed(() => this.depositInterestExpense() + this.operatingExpenses());

  // Net Profit
  readonly netProfit = computed(() => this.totalIncome() - this.totalExpenses());

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  exportReport(): void {
    console.log('Export CPA report');
  }

  printReport(): void {
    window.print();
  }
}
