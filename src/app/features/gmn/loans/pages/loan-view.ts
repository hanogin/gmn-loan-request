import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideEdit,
  lucideWallet,
  lucideUser,
  lucideCalendar,
  lucideHash,
  lucideCreditCard,
  lucideFileText,
  lucideHistory,
  lucidePlus,
  lucideCheck,
  lucideX,
  lucideAlertCircle,
  lucidePause,
  lucidePlay,
  lucideReceipt,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Loan, PayLine } from '../../../../core/models';

@Component({
  selector: 'gmn-loan-view',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTabsImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideEdit,
      lucideWallet,
      lucideUser,
      lucideCalendar,
      lucideHash,
      lucideCreditCard,
      lucideFileText,
      lucideHistory,
      lucidePlus,
      lucideCheck,
      lucideX,
      lucideAlertCircle,
      lucidePause,
      lucidePlay,
      lucideReceipt,
    }),
  ],
  template: `
    <div class="space-y-6" >
      @if (loan()) {
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/loans">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold">הלוואה {{ loan()!.loanNumber }}</h1>
                <span hlmBadge [variant]="getStatusVariant(loan()!.status)">
                  {{ loan()!.statusName || getStatusName(loan()!.status) }}
                </span>
              </div>
              <p class="text-muted-foreground">{{ getPersonName(loan()!.personId) }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            @if (loan()!.status === 'ACTIVE') {
              <button hlmBtn variant="outline" (click)="recordPayment()">
                <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
                רשום תשלום
              </button>
            }
            <button hlmBtn variant="outline" [routerLink]="['/gmn/loans', loan()!.id, 'edit']">
              <ng-icon name="lucideEdit" class="me-2 h-4 w-4" />
              עריכה
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
                <p class="text-sm text-muted-foreground">סכום מקורי</p>
                <p class="text-xl font-bold">₪{{ formatNumber(loan()!.loanAmount) }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full"
                   [class]="loan()!.currentBalance > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'">
                <ng-icon name="lucideReceipt" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">יתרה לתשלום</p>
                <p class="text-xl font-bold" [class.text-red-600]="loan()!.currentBalance > 0">
                  ₪{{ formatNumber(loan()!.currentBalance) }}
                </p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <ng-icon name="lucideCreditCard" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">תשלום חודשי</p>
                <p class="text-xl font-bold">₪{{ formatNumber(loan()!.monthlyPayment) }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ng-icon name="lucideCalendar" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">תשלומים</p>
                <p class="text-xl font-bold">{{ loan()!.paidPayments || 0 }} / {{ loan()!.numberOfPayments }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <hlm-tabs tab="details" class="w-full">
          <hlm-tabs-list class="w-full justify-start" aria-label="Loan tabs">
            <button hlmTabsTrigger="details">פרטי הלוואה</button>
            <button hlmTabsTrigger="payments">לוח תשלומים ({{ loanPayments().length }})</button>
            <button hlmTabsTrigger="guarantors">ערבים ({{ loan()!.guarantors?.length || 0 }})</button>
            <button hlmTabsTrigger="history">היסטוריה</button>
          </hlm-tabs-list>

          <!-- Details Tab -->
          <div hlmTabsContent="details">
            <div hlmCard class="mt-4">
              <div class="grid gap-6 p-6 sm:grid-cols-2">
                <div class="space-y-4">
                  <h3 class="font-semibold border-b pb-2">פרטי הלוואה</h3>
                  <div class="grid gap-3">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">מספר הלוואה:</span>
                      <span class="font-mono">{{ loan()!.loanNumber }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">סכום מקורי:</span>
                      <span class="font-semibold">₪{{ formatNumber(loan()!.loanAmount) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">מספר תשלומים:</span>
                      <span>{{ loan()!.numberOfPayments }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">תשלום חודשי:</span>
                      <span>₪{{ formatNumber(loan()!.monthlyPayment) }}</span>
                    </div>
                    @if (loan()!.interestRate) {
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">ריבית:</span>
                        <span>{{ loan()!.interestRate }}%</span>
                      </div>
                    }
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">מטרה:</span>
                      <span>{{ loan()!.purposeName || loan()!.purpose || '-' }}</span>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="font-semibold border-b pb-2">תאריכים ותשלום</h3>
                  <div class="grid gap-3">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">תאריך פתיחה:</span>
                      <span>{{ formatDate(loan()!.startDate) }}</span>
                    </div>
                    @if (loan()!.endDate) {
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">תאריך סיום:</span>
                        <span>{{ formatDateSafe(loan()!.endDate) }}</span>
                      </div>
                    }
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">יום גבייה:</span>
                      <span>{{ loan()!.paymentDay }} לחודש</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">אמצעי תשלום:</span>
                      <span>{{ loan()!.paymentMethodName || loan()!.paymentMethod || '-' }}</span>
                    </div>
                    @if (loan()!.bankAccountId) {
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">חשבון בנק:</span>
                        <span>{{ getBankAccountDisplay(loan()!.bankAccountId) }}</span>
                      </div>
                    }
                  </div>
                </div>

                @if (loan()!.notes) {
                  <div class="sm:col-span-2 space-y-2">
                    <h3 class="font-semibold border-b pb-2">הערות</h3>
                    <p class="text-muted-foreground whitespace-pre-wrap">{{ loan()!.notes }}</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Payments Tab -->
          <div hlmTabsContent="payments">
            <div hlmCard class="mt-4">
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
                    </tr>
                  </thead>
                  <tbody>
                    @for (payment of loanPayments(); track payment.id; let i = $index) {
                      <tr class="border-b hover:bg-muted/50">
                        <td class="p-3">{{ i + 1 }}</td>
                        <td class="p-3">{{ formatDate(payment.dueDate) }}</td>
                        <td class="p-3">₪{{ formatNumber(payment.amount) }}</td>
                        <td class="p-3">
                          @if (payment.status === 'PAID') {
                            ₪{{ formatNumber(payment.amount) }}
                          } @else {
                            -
                          }
                        </td>
                        <td class="p-3">
                          @if (payment.paidDate) {
                            {{ formatDate(payment.paidDate) }}
                          } @else {
                            -
                          }
                        </td>
                        <td class="p-3">
                          <span hlmBadge [variant]="getPaymentStatusVariant(payment.status)">
                            {{ getPaymentStatusName(payment.status) }}
                          </span>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="p-8 text-center text-muted-foreground">
                          אין תשלומים מתוכננים
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Guarantors Tab -->
          <div hlmTabsContent="guarantors">
            <div hlmCard class="mt-4 p-6">
              @if (loan()!.guarantors && loan()!.guarantors!.length > 0) {
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  @for (guarantorId of loan()!.guarantors; track guarantorId) {
                    <div class="flex items-center gap-3 rounded-lg border p-4">
                      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <ng-icon name="lucideUser" class="h-5 w-5" />
                      </div>
                      <div>
                        <a [routerLink]="['/gmn/people', guarantorId]" class="font-medium text-primary hover:underline">
                          {{ getPersonName(guarantorId) }}
                        </a>
                        <p class="text-sm text-muted-foreground">ערב</p>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ng-icon name="lucideUser" class="mb-2 h-12 w-12 opacity-50" />
                  <p>לא הוגדרו ערבים להלוואה זו</p>
                </div>
              }
            </div>
          </div>

          <!-- History Tab -->
          <div hlmTabsContent="history">
            <div hlmCard class="mt-4 p-6">
              <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ng-icon name="lucideHistory" class="mb-2 h-12 w-12 opacity-50" />
                <p>היסטוריית פעולות בקרוב...</p>
              </div>
            </div>
          </div>
        </hlm-tabs>
      } @else {
        <div hlmCard class="p-8 text-center">
          <ng-icon name="lucideAlertCircle" class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p class="text-lg font-medium">הלוואה לא נמצאה</p>
          <button hlmBtn class="mt-4" routerLink="/gmn/loans">חזרה לרשימה</button>
        </div>
      }
    </div>
  `,
})
export default class LoanViewPage {
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loan = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.mockService.loans().find(l => l.id === id);
  });

  readonly loanPayments = computed(() => {
    if (!this.loan()) return [];
    return this.mockService.payLines()
      .filter(p => p.entityType === 'LOAN' && p.entityId === this.loan()!.id)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || `${person?.firstName} ${person?.lastName}` || 'לא ידוע';
  }

  getBankAccountDisplay(accountId?: number): string {
    if (!accountId) return '-';
    // TODO: Lookup from bank accounts
    return `חשבון ${accountId}`;
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

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'OVERDUE': return 'destructive';
      case 'CLOSED': return 'secondary';
      case 'FROZEN': return 'outline';
      default: return 'outline';
    }
  }

  getStatusName(status: string): string {
    const names: Record<string, string> = {
      'ACTIVE': 'פעיל',
      'OVERDUE': 'באיחור',
      'CLOSED': 'נסגר',
      'FROZEN': 'מוקפא',
    };
    return names[status] || status;
  }

  getPaymentStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'PAID': return 'default';
      case 'PENDING': return 'secondary';
      case 'OVERDUE': return 'destructive';
      case 'PARTIAL': return 'outline';
      default: return 'outline';
    }
  }

  getPaymentStatusName(status: string): string {
    const names: Record<string, string> = {
      'PAID': 'שולם',
      'PENDING': 'ממתין',
      'OVERDUE': 'באיחור',
      'PARTIAL': 'חלקי',
    };
    return names[status] || status;
  }

  recordPayment(): void {
    // TODO: Open payment dialog
    console.log('Record payment for loan:', this.loan()?.id);
  }
}
