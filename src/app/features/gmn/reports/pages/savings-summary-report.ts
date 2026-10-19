import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucidePiggyBank, lucideDownload } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Saving } from '../../../../core/models';

@Component({
  selector: 'gmn-savings-summary-report',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({ lucideArrowRight, lucidePiggyBank, lucideDownload }),
  ],
  template: `
    <div class="space-y-6" >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/reports">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">סיכום פיקדונות</h1>
            <p class="text-muted-foreground">סטטיסטיקה וניתוח פיקדונות</p>
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
          <p class="text-sm text-muted-foreground">סה"כ פיקדונות</p>
          <p class="text-3xl font-bold">{{ totalSavings() }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">פעילים</p>
          <p class="text-3xl font-bold text-green-600">{{ activeSavings() }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">סה"כ פיקדונות</p>
          <p class="text-3xl font-bold text-purple-600">₪{{ formatNumber(totalDeposits()) }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">ריבית חודשית</p>
          <p class="text-3xl font-bold text-amber-600">₪{{ formatNumber(monthlyInterest()) }}</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Financial Summary -->
        <div hlmCard class="p-6">
          <h3 class="font-semibold mb-4 border-b pb-2">סיכום כספי</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">סה"כ פיקדונות פעילים</span>
              <span class="font-semibold">₪{{ formatNumber(totalDeposits()) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">ריבית שנתית משוערת</span>
              <span class="font-semibold text-amber-600">₪{{ formatNumber(yearlyInterest()) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">ממוצע ריבית</span>
              <span class="font-semibold">{{ averageInterest().toFixed(2) }}%</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-muted-foreground">ממוצע פיקדון</span>
              <span class="font-semibold">₪{{ formatNumber(averageDeposit()) }}</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Maturities -->
        <div hlmCard class="p-6">
          <h3 class="font-semibold mb-4 border-b pb-2">פדיונות קרובים (30 יום)</h3>
          @if (upcomingMaturities().length > 0) {
            <div class="space-y-3">
              @for (saving of upcomingMaturities(); track saving.id) {
                <div class="flex justify-between items-center">
                  <span class="text-sm">{{ getPersonName(saving.personId) }}</span>
                  <div class="text-start">
                    <span class="font-semibold">₪{{ formatNumber(saving.currentBalance) }}</span>
                    <span class="text-xs text-muted-foreground block">{{ formatDateSafe(saving.maturityDate) }}</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-muted-foreground text-center py-4">אין פדיונות קרובים</p>
          }
        </div>
      </div>
    </div>
  `,
})
export default class SavingsSummaryReportPage {
  private readonly mockService = inject(GmnMockService);

  readonly totalSavings = computed(() => this.mockService.savings().length);
  readonly activeSavings = computed(() => this.mockService.savings().filter(s => s.status === 'ACTIVE').length);

  readonly totalDeposits = computed(() =>
    this.mockService.savings()
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + s.currentBalance, 0)
  );

  readonly monthlyInterest = computed(() =>
    this.mockService.savings()
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (s.currentBalance * (s.interestRate || 0) / 100 / 12), 0)
  );

  readonly yearlyInterest = computed(() => this.monthlyInterest() * 12);

  readonly averageInterest = computed(() => {
    const active = this.mockService.savings().filter(s => s.status === 'ACTIVE');
    if (active.length === 0) return 0;
    return active.reduce((sum, s) => sum + (s.interestRate || 0), 0) / active.length;
  });

  readonly averageDeposit = computed(() => {
    const active = this.mockService.savings().filter(s => s.status === 'ACTIVE');
    if (active.length === 0) return 0;
    return this.totalDeposits() / active.length;
  });

  readonly upcomingMaturities = computed(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.mockService.savings()
      .filter(s => s.status === 'ACTIVE' && s.maturityDate && new Date(s.maturityDate) <= thirtyDaysFromNow)
      .sort((a, b) => {
        const dateA = a.maturityDate ? new Date(a.maturityDate).getTime() : 0;
        const dateB = b.maturityDate ? new Date(b.maturityDate).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 5);
  });

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || `${person?.firstName} ${person?.lastName}` || 'לא ידוע';
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
}
