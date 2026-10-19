import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCalendar,
  lucideCheck,
  lucideX,
  lucidePlus,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-loan-payments',
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
      lucideCalendar,
      lucideCheck,
      lucideX,
      lucidePlus,
    }),
  ],
  template: `
    <div class="space-y-6" >
      @if (loan()) {
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" [routerLink]="['/gmn/loans', loan()!.id]">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <h1 class="text-2xl font-bold">לוח תשלומים - {{ loan()!.loanNumber }}</h1>
              <p class="text-muted-foreground">{{ getPersonName(loan()!.personId) }}</p>
            </div>
          </div>
          <button hlmBtn>
            <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
            רשום תשלום
          </button>
        </div>

        <!-- Summary -->
        <div class="grid gap-4 sm:grid-cols-3">
          <div hlmCard class="p-4 text-center">
            <p class="text-sm text-muted-foreground">סה"כ תשלומים</p>
            <p class="text-2xl font-bold">{{ loan()!.numberOfPayments }}</p>
          </div>
          <div hlmCard class="p-4 text-center">
            <p class="text-sm text-muted-foreground">שולם</p>
            <p class="text-2xl font-bold text-green-600">{{ paidCount() }}</p>
          </div>
          <div hlmCard class="p-4 text-center">
            <p class="text-sm text-muted-foreground">נותר</p>
            <p class="text-2xl font-bold text-amber-600">{{ loan()!.numberOfPayments - paidCount() }}</p>
          </div>
        </div>

        <!-- Payments Table -->
        <div hlmCard>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b bg-muted/50">
                  <th class="p-3 text-start font-medium">#</th>
                  <th class="p-3 text-start font-medium">תאריך יעד</th>
                  <th class="p-3 text-start font-medium">סכום</th>
                  <th class="p-3 text-start font-medium">שולם</th>
                  <th class="p-3 text-start font-medium">תאריך תשלום</th>
                  <th class="p-3 text-start font-medium">סטטוס</th>
                  <th class="p-3 text-center font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                @for (payment of payments(); track payment.id; let i = $index) {
                  <tr class="border-b hover:bg-muted/50">
                    <td class="p-3 font-medium">{{ i + 1 }}</td>
                    <td class="p-3">{{ formatDate(payment.dueDate) }}</td>
                    <td class="p-3">₪{{ formatNumber(payment.amount) }}</td>
                    <td class="p-3">
                      @if (payment.status === 'PAID') {
                        <span class="text-green-600">₪{{ formatNumber(payment.amount) }}</span>
                      } @else {
                        <span class="text-muted-foreground">-</span>
                      }
                    </td>
                    <td class="p-3">
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
                    <td class="p-3 text-center">
                      @if (payment.status !== 'PAID') {
                        <button hlmBtn variant="ghost" size="sm">
                          <ng-icon name="lucideCheck" class="me-1 h-4 w-4" />
                          סמן כשולם
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="p-8 text-center text-muted-foreground">
                      אין תשלומים מתוכננים
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div hlmCard class="p-8 text-center text-muted-foreground">
          הלוואה לא נמצאה
        </div>
      }
    </div>
  `,
})
export default class LoanPaymentsPage {
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);

  readonly loan = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.mockService.loans().find(l => l.id === id);
  });

  readonly payments = computed(() => {
    if (!this.loan()) return [];
    return this.mockService.payLines()
      .filter(p => p.entityType === 'LOAN' && p.entityId === this.loan()!.id)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  readonly paidCount = computed(() =>
    this.payments().filter(p => p.status === 'PAID').length
  );

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

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'PAID': return 'default';
      case 'PENDING': return 'secondary';
      case 'OVERDUE': return 'destructive';
      default: return 'outline';
    }
  }

  getStatusName(status: string): string {
    const names: Record<string, string> = {
      'PAID': 'שולם',
      'PENDING': 'ממתין',
      'OVERDUE': 'באיחור',
      'PARTIAL': 'חלקי',
    };
    return names[status] || status;
  }
}
