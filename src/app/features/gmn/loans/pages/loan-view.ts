import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucidePencil,
  lucideWallet,
  lucideUser,
  lucideCalendar,
  lucideLoader2,
  lucideCreditCard,
  lucideShieldCheck,
  lucideFileText,
  lucideCheckCircle,
  lucideXCircle,
  lucideClock,
  lucideAlertTriangle,
  lucideArrowUpRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmProgressImports } from '@spartan-ng/helm/progress';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Loan, PayLine, LoanGuarantor } from '../../../../core/models';

@Component({
  selector: 'gmn-loan-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTabsImports,
    HlmTableImports,
    HlmProgressImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucidePencil,
      lucideWallet,
      lucideUser,
      lucideCalendar,
      lucideLoader2,
      lucideCreditCard,
      lucideShieldCheck,
      lucideFileText,
      lucideCheckCircle,
      lucideXCircle,
      lucideClock,
      lucideAlertTriangle,
      lucideArrowUpRight,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      @if (isLoading()) {
        <div class="flex h-64 items-center justify-center">
          <ng-icon name="lucideLoader2" class="h-8 w-8 animate-spin text-primary" />
        </div>
      } @else if (loan()) {
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/loans">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold">{{ t('loans.fields.loanNumber') }}: {{ loan()?.loanNumber }}</h1>
                <span hlmBadge [variant]="getStatusVariant()">
                  {{ t('loans.status.' + loan()?.status?.toLowerCase()) }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ loan()?.person?.fullName }} | {{ loan()?.person?.identityNumber }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button hlmBtn variant="outline" [routerLink]="['/gmn/people', loan()?.personId]">
              <ng-icon name="lucideUser" class="me-2 h-4 w-4" />
              {{ t('loans.fields.borrower') }}
            </button>
            <button hlmBtn [routerLink]="['/gmn/loans', loan()?.id, 'edit']">
              <ng-icon name="lucidePencil" class="me-2 h-4 w-4" />
              {{ t('common.edit') }}
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
                <p class="text-2xl font-bold">{{ loan()?.loanAmount | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('loans.fields.loanAmount') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ng-icon name="lucideClock" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ loan()?.currentBalance | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('loans.fields.currentBalance') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ loan()?.totalPaid | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('loans.payments.paid') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <ng-icon name="lucideCreditCard" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ loan()?.monthlyPayment | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('loans.fields.monthlyPayment') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div hlmCard class="p-6">
          <div class="mb-2 flex justify-between text-sm">
            <span>{{ t('loans.fields.paidPayments') }}: {{ loan()?.paidPaymentsCount || 0 }} / {{ loan()?.numberOfPayments }}</span>
            <span>{{ paymentProgress() }}%</span>
          </div>
          <hlm-progress [value]="paymentProgress()" class="h-3" />
          <div class="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>{{ t('loans.fields.startDate') }}: {{ loan()?.startDate | date:'dd/MM/yyyy' }}</span>
            <span>{{ t('loans.fields.endDate') }}: {{ loan()?.endDate | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Left Column: Loan Details -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Loan Info -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideWallet" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('loans.tabs.details') }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loans.fields.numberOfPayments') }}</span>
                  <span class="font-medium">{{ loan()?.numberOfPayments }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loans.fields.paymentDay') }}</span>
                  <span class="font-medium">{{ loan()?.paymentDay }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loans.fields.interestRate') }}</span>
                  <span class="font-medium">{{ loan()?.interestRate }}%</span>
                </div>
                @if (loan()?.purpose) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('loans.fields.purpose') }}</span>
                    <span class="font-medium">{{ loan()?.purposeName || loan()?.purpose }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Payment Status -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideCreditCard" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('loans.tabs.payments') }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loans.fields.paidPayments') }}</span>
                  <span class="font-medium text-green-600">{{ loan()?.paidPaymentsCount || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loans.fields.remainingPayments') }}</span>
                  <span class="font-medium">{{ loan()?.remainingPaymentsCount || loan()?.numberOfPayments }}</span>
                </div>
                @if ((loan()?.overduePaymentsCount || 0) > 0) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('loans.payments.late') }}</span>
                    <span class="font-medium text-red-600">{{ loan()?.overduePaymentsCount }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Guarantors -->
            @if (loan()?.guarantorDetails && loan()!.guarantorDetails!.length > 0) {
              <div hlmCard class="p-6">
                <div class="mb-4 flex items-center gap-2">
                  <ng-icon name="lucideShieldCheck" class="h-5 w-5 text-primary" />
                  <h2 class="text-lg font-semibold">{{ t('loans.fields.guarantors') }}</h2>
                </div>
                <div class="space-y-3">
                  @for (guarantor of loan()?.guarantorDetails; track guarantor.id) {
                    <div class="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div>
                        <p class="font-medium">{{ guarantor.firstName }} {{ guarantor.lastName }}</p>
                        <p class="text-sm text-muted-foreground">{{ guarantor.identityNumber }}</p>
                      </div>
                      @if (guarantor.isVerified) {
                        <ng-icon name="lucideCheckCircle" class="h-5 w-5 text-green-500" />
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Payment Schedule -->
          <div class="lg:col-span-2">
            <hlm-tabs tab="schedule" class="w-full">
              <hlm-tabs-list class="w-full grid grid-cols-3">
                <button hlmTabsTrigger="schedule">
                  <ng-icon name="lucideCalendar" class="me-2 h-4 w-4" />
                  {{ t('loans.tabs.schedule') }}
                </button>
                <button hlmTabsTrigger="payments">
                  <ng-icon name="lucideCreditCard" class="me-2 h-4 w-4" />
                  {{ t('loans.tabs.payments') }}
                </button>
                <button hlmTabsTrigger="documents">
                  <ng-icon name="lucideFileText" class="me-2 h-4 w-4" />
                  {{ t('loans.tabs.documents') }}
                </button>
              </hlm-tabs-list>

              <!-- Schedule Tab -->
              <div hlmTabsContent="schedule">
                <div hlmCard class="mt-4">
                  <table hlmTable class="w-full">
                    <thead>
                      <tr hlmTrow>
                        <th hlmTh class="text-start">{{ t('loans.payments.paymentNumber') }}</th>
                        <th hlmTh class="text-start">{{ t('loans.payments.dueDate') }}</th>
                        <th hlmTh class="text-start">{{ t('loans.payments.amount') }}</th>
                        <th hlmTh class="text-start">{{ t('loans.payments.status') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (payment of paymentSchedule(); track payment.number) {
                        <tr hlmTrow>
                          <td hlmTd class="font-medium">{{ payment.number }}</td>
                          <td hlmTd>{{ payment.dueDate | date:'dd/MM/yyyy' }}</td>
                          <td hlmTd>{{ payment.amount | number:'1.0-0' }} ₪</td>
                          <td hlmTd>
                            @if (payment.status === 'PAID') {
                              <span hlmBadge variant="default" class="bg-green-500">
                                <ng-icon name="lucideCheckCircle" class="me-1 h-3 w-3" />
                                {{ t('loans.payments.paid') }}
                              </span>
                            } @else if (payment.status === 'OVERDUE') {
                              <span hlmBadge variant="destructive">
                                <ng-icon name="lucideAlertTriangle" class="me-1 h-3 w-3" />
                                {{ t('loans.payments.late') }}
                              </span>
                            } @else {
                              <span hlmBadge variant="secondary">
                                <ng-icon name="lucideClock" class="me-1 h-3 w-3" />
                                {{ t('loans.payments.unpaid') }}
                              </span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Payments Tab -->
              <div hlmTabsContent="payments">
                <div hlmCard class="mt-4">
                  @if (loanPayments().length > 0) {
                    <table hlmTable class="w-full">
                      <thead>
                        <tr hlmTrow>
                          <th hlmTh class="text-start">{{ t('payments.fields.date') }}</th>
                          <th hlmTh class="text-start">{{ t('payments.fields.amount') }}</th>
                          <th hlmTh class="text-start">{{ t('payments.fields.method') }}</th>
                          <th hlmTh class="text-start">{{ t('common.status') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (payment of loanPayments(); track payment.id) {
                          <tr hlmTrow>
                            <td hlmTd>{{ payment.paidDate || payment.dueDate | date:'dd/MM/yyyy' }}</td>
                            <td hlmTd>{{ payment.amount | number:'1.0-0' }} ₪</td>
                            <td hlmTd>{{ payment.paymentMethodName || '-' }}</td>
                            <td hlmTd>
                              <span hlmBadge [variant]="payment.status === 'PAID' ? 'default' : 'secondary'">
                                {{ payment.status }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  } @else {
                    <div class="p-8 text-center text-muted-foreground">
                      {{ t('common.noData') }}
                    </div>
                  }
                </div>
              </div>

              <!-- Documents Tab -->
              <div hlmTabsContent="documents">
                <div hlmCard class="mt-4 p-8 text-center text-muted-foreground">
                  {{ t('common.noData') }}
                </div>
              </div>
            </hlm-tabs>
          </div>
        </div>

        <!-- Notes -->
        @if (loan()?.notes) {
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideFileText" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.notes') }}</h2>
            </div>
            <p class="text-muted-foreground">{{ loan()?.notes }}</p>
          </div>
        }
      } @else {
        <div class="flex h-64 flex-col items-center justify-center text-center">
          <ng-icon name="lucideWallet" class="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 class="text-xl font-semibold">{{ t('common.noData') }}</h2>
          <button hlmBtn class="mt-4" routerLink="/gmn/loans">
            {{ t('common.back') }}
          </button>
        </div>
      }
    </div>
  `,
})
export default class LoanViewPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly loan = signal<Loan | null>(null);
  readonly loanPayments = signal<PayLine[]>([]);

  // Computed
  readonly paymentProgress = computed(() => {
    const l = this.loan();
    if (!l) return 0;
    const paid = l.paidPaymentsCount || 0;
    const total = l.numberOfPayments || 1;
    return Math.round((paid / total) * 100);
  });

  readonly paymentSchedule = computed(() => {
    const l = this.loan();
    if (!l) return [];

    const schedule = [];
    const startDate = new Date(l.startDate);
    const paidCount = l.paidPaymentsCount || 0;
    const today = new Date();

    for (let i = 1; i <= l.numberOfPayments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);
      dueDate.setDate(l.paymentDay);

      let status = 'PENDING';
      if (i <= paidCount) {
        status = 'PAID';
      } else if (dueDate < today) {
        status = 'OVERDUE';
      }

      schedule.push({
        number: i,
        dueDate,
        amount: l.monthlyPayment,
        status,
      });
    }

    return schedule;
  });

  ngOnInit(): void {
    const loanId = this.route.snapshot.params['id'];
    if (loanId) {
      this.loadLoan(parseInt(loanId, 10));
    } else {
      this.isLoading.set(false);
    }
  }

  private async loadLoan(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const loan = await this.mockService.getLoanById(id);
      this.loan.set(loan || null);

      if (loan) {
        // Load payments
        const paymentsResult = await this.mockService.getPayLines(
          { page: 1, pageSize: 100 },
          { entityType: 'LOAN', entityId: id }
        );
        this.loanPayments.set(paymentsResult.data);
      }
    } catch (error) {
      console.error('Error loading loan:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusVariant(): 'default' | 'secondary' | 'destructive' | 'outline' {
    const status = this.loan()?.status;
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'OVERDUE':
      case 'DEFAULTED':
        return 'destructive';
      default:
        return 'outline';
    }
  }
}
