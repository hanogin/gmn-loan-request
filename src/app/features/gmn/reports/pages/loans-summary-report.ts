import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideWallet, lucideDownload } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-loans-summary-report',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({ lucideArrowRight, lucideWallet, lucideDownload }),
  ],
  template: `
    <div class="space-y-6" >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/reports">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">סיכום הלוואות</h1>
            <p class="text-muted-foreground">סטטיסטיקה וניתוח הלוואות</p>
          </div>
        </div>
        <button hlmBtn variant="outline">
          <ng-icon name="lucideDownload" class="me-2 h-4 w-4" />
          ייצוא
        </button>
      </div>

      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">סה"כ הלוואות</p>
          <p class="text-3xl font-bold">{{ totalLoans() }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">פעילות</p>
          <p class="text-3xl font-bold text-green-600">{{ activeLoans() }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">באיחור</p>
          <p class="text-3xl font-bold text-red-600">{{ overdueLoans() }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">נסגרו</p>
          <p class="text-3xl font-bold text-muted-foreground">{{ closedLoans() }}</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Financial Summary -->
        <div hlmCard class="p-6">
          <h3 class="font-semibold mb-4 border-b pb-2">סיכום כספי</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">סה"כ הלוואות שניתנו</span>
              <span class="font-semibold">₪{{ formatNumber(totalLoanAmount()) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">סה"כ נגבה</span>
              <span class="font-semibold text-green-600">₪{{ formatNumber(totalCollected()) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">יתרה לגבייה</span>
              <span class="font-semibold text-blue-600">₪{{ formatNumber(totalBalance()) }}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-muted-foreground">ממוצע הלוואה</span>
              <span class="font-semibold">₪{{ formatNumber(averageLoan()) }}</span>
            </div>
          </div>
        </div>

        <!-- By Status -->
        <div hlmCard class="p-6">
          <h3 class="font-semibold mb-4 border-b pb-2">לפי סטטוס</h3>
          <div class="space-y-3">
            @for (status of statusBreakdown(); track status.status) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" [style.background-color]="status.color"></div>
                  <span>{{ status.label }}</span>
                </div>
                <div class="text-start">
                  <span class="font-semibold">{{ status.count }}</span>
                  <span class="text-sm text-muted-foreground ms-2">({{ status.percentage }}%)</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class LoansSummaryReportPage {
  private readonly mockService = inject(GmnMockService);

  readonly totalLoans = computed(() => this.mockService.loans().length);
  readonly activeLoans = computed(() => this.mockService.loans().filter(l => l.status === 'ACTIVE').length);
  readonly overdueLoans = computed(() => this.mockService.loans().filter(l => l.status === 'OVERDUE').length);
  readonly closedLoans = computed(() => this.mockService.loans().filter(l => l.status === 'CLOSED').length);

  readonly totalLoanAmount = computed(() =>
    this.mockService.loans().reduce((sum, l) => sum + l.loanAmount, 0)
  );
  readonly totalBalance = computed(() =>
    this.mockService.loans()
      .filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .reduce((sum, l) => sum + l.currentBalance, 0)
  );
  readonly totalCollected = computed(() => this.totalLoanAmount() - this.totalBalance());
  readonly averageLoan = computed(() => {
    const loans = this.mockService.loans();
    return loans.length > 0 ? this.totalLoanAmount() / loans.length : 0;
  });

  readonly statusBreakdown = computed(() => {
    const total = this.totalLoans();
    const active = this.activeLoans();
    const overdue = this.overdueLoans();
    const closed = this.closedLoans();
    const frozen = this.mockService.loans().filter(l => l.status === 'FROZEN').length;

    return [
      { status: 'ACTIVE', label: 'פעיל', count: active, percentage: Math.round((active / total) * 100), color: '#22c55e' },
      { status: 'OVERDUE', label: 'באיחור', count: overdue, percentage: Math.round((overdue / total) * 100), color: '#ef4444' },
      { status: 'CLOSED', label: 'נסגר', count: closed, percentage: Math.round((closed / total) * 100), color: '#9ca3af' },
      { status: 'FROZEN', label: 'מוקפא', count: frozen, percentage: Math.round((frozen / total) * 100), color: '#3b82f6' },
    ];
  });

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }
}
