import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideAlertCircle,
  lucideDownload,
  lucidePrinter,
  lucidePhone,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-late-payments-report',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideAlertCircle,
      lucideDownload,
      lucidePrinter,
      lucidePhone,
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
            <h1 class="text-2xl font-bold">דוח איחורים</h1>
            <p class="text-muted-foreground">הלוואות עם תשלומים באיחור</p>
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

      <!-- Summary -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">הלוואות באיחור</p>
          <p class="text-3xl font-bold text-red-600">{{ overdueLoans().length }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">סה"כ חוב באיחור</p>
          <p class="text-3xl font-bold text-red-600">₪{{ formatNumber(totalOverdue()) }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">ממוצע ימי איחור</p>
          <p class="text-3xl font-bold text-amber-600">{{ averageDaysLate() }}</p>
        </div>
      </div>

      <!-- Report Table -->
      <div hlmCard>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="p-3 text-start font-medium">הלוואה</th>
                <th class="p-3 text-start font-medium">שם הלווה</th>
                <th class="p-3 text-start font-medium">טלפון</th>
                <th class="p-3 text-start font-medium">תשלומים באיחור</th>
                <th class="p-3 text-start font-medium">סכום באיחור</th>
                <th class="p-3 text-start font-medium">ימי איחור</th>
                <th class="p-3 text-center font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              @for (item of overdueLoans(); track item.loan.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="p-3 font-mono text-sm">
                    <a [routerLink]="['/gmn/loans', item.loan.id]" class="text-primary hover:underline">
                      {{ item.loan.loanNumber }}
                    </a>
                  </td>
                  <td class="p-3">
                    <a [routerLink]="['/gmn/people', item.person.id]" class="hover:underline">
                      {{ item.person.fullName }}
                    </a>
                  </td>
                  <td class="p-3 font-mono text-sm">{{ item.person.contact?.mobilePhone || item.person.contact?.homePhone || '-' }}</td>
                  <td class="p-3">
                    <span hlmBadge="destructive">{{ item.overduePayments }}</span>
                  </td>
                  <td class="p-3 font-semibold text-red-600">₪{{ formatNumber(item.overdueAmount) }}</td>
                  <td class="p-3">
                    <span [class]="item.daysLate > 60 ? 'text-red-600 font-bold' : item.daysLate > 30 ? 'text-amber-600' : ''">
                      {{ item.daysLate }}
                    </span>
                  </td>
                  <td class="p-3 text-center">
                    <button hlmBtn variant="ghost" size="sm" (click)="callBorrower(item.person)">
                      <ng-icon name="lucidePhone" class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="p-8 text-center text-muted-foreground">
                    <ng-icon name="lucideAlertCircle" class="mx-auto mb-2 h-12 w-12 opacity-50 text-green-500" />
                    <p class="text-green-600">מצוין! אין הלוואות באיחור</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export default class LatePaymentsReportPage {
  private readonly mockService = inject(GmnMockService);

  readonly overdueLoans = computed(() => {
    const today = new Date();
    const result: Array<{
      loan: any;
      person: any;
      overduePayments: number;
      overdueAmount: number;
      daysLate: number;
    }> = [];

    for (const loan of this.mockService.loans()) {
      if (loan.status !== 'ACTIVE' && loan.status !== 'OVERDUE') continue;

      const overduePayments = this.mockService.payLines().filter(p =>
        p.entityType === 'LOAN' && p.entityId === loan.id &&
        p.status === 'OVERDUE'
      );

      if (overduePayments.length > 0) {
        const person = this.mockService.persons().find(p => p.id === loan.personId);
        if (!person) continue;

        const oldestOverdue = overduePayments.reduce((oldest, p) =>
          new Date(p.dueDate) < new Date(oldest.dueDate) ? p : oldest
        );
        const daysLate = Math.floor(
          (today.getTime() - new Date(oldestOverdue.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        result.push({
          loan,
          person,
          overduePayments: overduePayments.length,
          overdueAmount: overduePayments.reduce((sum, p) => sum + p.amount, 0),
          daysLate,
        });
      }
    }

    return result.sort((a, b) => b.daysLate - a.daysLate);
  });

  readonly totalOverdue = computed(() =>
    this.overdueLoans().reduce((sum, item) => sum + item.overdueAmount, 0)
  );

  readonly averageDaysLate = computed(() => {
    const loans = this.overdueLoans();
    if (loans.length === 0) return 0;
    return Math.round(loans.reduce((sum, item) => sum + item.daysLate, 0) / loans.length);
  });

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  exportReport(): void {
    console.log('Export late payments report');
    // TODO: Implement Excel export
  }

  printReport(): void {
    window.print();
  }

  callBorrower(person: any): void {
    const phone = person.phone || person.mobile;
    if (phone) {
      window.open(`tel:${phone}`);
    }
  }
}
