import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideFileUp,
  lucideFileDown,
  lucideHistory,
  lucidePlus,
  lucideCalendar,
  lucideArrowLeftRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-masav-dashboard',
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
      lucideBuilding2,
      lucideFileUp,
      lucideFileDown,
      lucideHistory,
      lucidePlus,
      lucideCalendar,
      lucideArrowLeftRight,
    }),
  ],
  template: `
    <div class="space-y-6" >
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">מס"ב</h1>
          <p class="text-muted-foreground">ניהול קבצי מס"ב - גביות ותשלומים</p>
        </div>
      </div>

      <!-- Action Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Create Collection File -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideFileDown" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">יצירת קובץ גביה</h3>
              <p class="text-sm text-muted-foreground">הפקת קובץ לגביית תשלומי הלוואות</p>
            </div>
          </div>
          <div class="space-y-2 text-sm text-muted-foreground mb-4">
            <div class="flex justify-between">
              <span>תשלומים לחודש הבא:</span>
              <span class="font-semibold text-foreground">{{ nextMonthPayments() }}</span>
            </div>
            <div class="flex justify-between">
              <span>סכום לגבייה:</span>
              <span class="font-semibold text-foreground">₪{{ formatNumber(nextMonthAmount()) }}</span>
            </div>
          </div>
          <button hlmBtn class="w-full" routerLink="/gmn/masav/create-collection">
            <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
            צור קובץ גביה
          </button>
        </div>

        <!-- Create Payment File -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideFileUp" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">יצירת קובץ תשלום</h3>
              <p class="text-sm text-muted-foreground">הפקת קובץ לתשלום ריביות פיקדונות</p>
            </div>
          </div>
          <div class="space-y-2 text-sm text-muted-foreground mb-4">
            <div class="flex justify-between">
              <span>פיקדונות פעילים:</span>
              <span class="font-semibold text-foreground">{{ activeSavings() }}</span>
            </div>
            <div class="flex justify-between">
              <span>סכום לתשלום:</span>
              <span class="font-semibold text-foreground">₪{{ formatNumber(monthlyInterest()) }}</span>
            </div>
          </div>
          <button hlmBtn variant="outline" class="w-full" routerLink="/gmn/masav/create-payment">
            <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
            צור קובץ תשלום
          </button>
        </div>

        <!-- File History -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideHistory" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">היסטוריית קבצים</h3>
              <p class="text-sm text-muted-foreground">צפייה בקבצים שנוצרו</p>
            </div>
          </div>
          <div class="space-y-2 text-sm text-muted-foreground mb-4">
            <div class="flex justify-between">
              <span>קבצים השנה:</span>
              <span class="font-semibold text-foreground">{{ filesThisYear() }}</span>
            </div>
            <div class="flex justify-between">
              <span>קובץ אחרון:</span>
              <span class="font-semibold text-foreground">{{ lastFileDate() }}</span>
            </div>
          </div>
          <button hlmBtn variant="outline" class="w-full" routerLink="/gmn/masav/files">
            <ng-icon name="lucideHistory" class="me-2 h-4 w-4" />
            צפה בהיסטוריה
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div hlmCard class="p-6">
        <h3 class="font-semibold mb-4">הוראות שימוש</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <h4 class="font-medium text-sm">קובץ גביה</h4>
            <ol class="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>בחר את החודש לגביה</li>
              <li>בדוק את רשימת התשלומים</li>
              <li>צור את הקובץ</li>
              <li>העלה לבנק דרך מערכת מס"ב</li>
            </ol>
          </div>
          <div class="space-y-2">
            <h4 class="font-medium text-sm">קובץ תשלום</h4>
            <ol class="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>בחר את החודש לתשלום</li>
              <li>בדוק את רשימת הפיקדונות</li>
              <li>צור את הקובץ</li>
              <li>העלה לבנק דרך מערכת מס"ב</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class MasavDashboardPage {
  private readonly mockService = inject(GmnMockService);

  readonly nextMonthPayments = computed(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return this.mockService.payLines()
      .filter(p => {
        const dueDate = new Date(p.dueDate);
        return p.status === 'PENDING' &&
               dueDate.getMonth() === nextMonth.getMonth() &&
               dueDate.getFullYear() === nextMonth.getFullYear();
      }).length;
  });

  readonly nextMonthAmount = computed(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return this.mockService.payLines()
      .filter(p => {
        const dueDate = new Date(p.dueDate);
        return p.status === 'PENDING' &&
               dueDate.getMonth() === nextMonth.getMonth() &&
               dueDate.getFullYear() === nextMonth.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0);
  });

  readonly activeSavings = computed(() =>
    this.mockService.savings().filter(s => s.status === 'ACTIVE').length
  );

  readonly monthlyInterest = computed(() => {
    return this.mockService.savings()
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (s.currentBalance * (s.interestRate || 0) / 100 / 12), 0);
  });

  readonly filesThisYear = () => 24; // Placeholder
  readonly lastFileDate = () => '01/10/2026'; // Placeholder

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }
}
