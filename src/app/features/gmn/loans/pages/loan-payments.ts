import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCreditCard,
  lucideLoader2,
  lucideCheckCircle,
  lucideClock,
  lucideAlertTriangle,
  lucidePlus,
  lucideFilter,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Loan, PayLine } from '../../../../core/models';

@Component({
  selector: 'gmn-loan-payments',
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
      lucideCreditCard,
      lucideLoader2,
      lucideCheckCircle,
      lucideClock,
      lucideAlertTriangle,
      lucidePlus,
      lucideFilter,
      lucideChevronLeft,
      lucideChevronRight,
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
            <button hlmBtn variant="outline" size="icon" [routerLink]="['/gmn/loans', loan()?.id]">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <h1 class="text-2xl font-bold">{{ t('loans.tabs.payments') }}</h1>
              <p class="text-sm text-muted-foreground">
                {{ t('loans.fields.loanNumber') }}: {{ loan()?.loanNumber }} | {{ loan()?.person?.fullName }}
              </p>
            </div>
          </div>
          <button hlmBtn>
            <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
            {{ t('payments.newPayment') }}
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <ng-icon name="lucideCreditCard" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ loan()?.numberOfPayments }}</p>
                <p class="text-sm text-muted-foreground">{{ t('common.total') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ paidCount() }}</p>
                <p class="text-sm text-muted-foreground">{{ t('loans.payments.paid') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ng-icon name="lucideClock" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ pendingCount() }}</p>
                <p class="text-sm text-muted-foreground">{{ t('loans.payments.unpaid') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <ng-icon name="lucideAlertTriangle" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ overdueCount() }}</p>
                <p class="text-sm text-muted-foreground">{{ t('loans.payments.late') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div hlmCard class="p-4">
          <div class="flex flex-wrap gap-2">
            <button
              hlmBtn
              [variant]="statusFilter() === 'ALL' ? 'default' : 'outline'"
              size="sm"
              (click)="setStatusFilter('ALL')"
            >
              {{ t('common.all') }}
            </button>
            <button
              hlmBtn
              [variant]="statusFilter() === 'PAID' ? 'default' : 'outline'"
              size="sm"
              (click)="setStatusFilter('PAID')"
            >
              <ng-icon name="lucideCheckCircle" class="me-1 h-3 w-3" />
              {{ t('loans.payments.paid') }}
            </button>
            <button
              hlmBtn
              [variant]="statusFilter() === 'PENDING' ? 'default' : 'outline'"
              size="sm"
              (click)="setStatusFilter('PENDING')"
            >
              <ng-icon name="lucideClock" class="me-1 h-3 w-3" />
              {{ t('loans.payments.unpaid') }}
            </button>
            <button
              hlmBtn
              [variant]="statusFilter() === 'OVERDUE' ? 'default' : 'outline'"
              size="sm"
              (click)="setStatusFilter('OVERDUE')"
            >
              <ng-icon name="lucideAlertTriangle" class="me-1 h-3 w-3" />
              {{ t('loans.payments.late') }}
            </button>
          </div>
        </div>

        <!-- Payments Table -->
        <div hlmCard>
          <table hlmTable class="w-full">
            <thead>
              <tr hlmTrow>
                <th hlmTh class="text-start">{{ t('loans.payments.paymentNumber') }}</th>
                <th hlmTh class="text-start">{{ t('loans.payments.dueDate') }}</th>
                <th hlmTh class="text-start">{{ t('loans.payments.paidDate') }}</th>
                <th hlmTh class="text-start">{{ t('loans.payments.amount') }}</th>
                <th hlmTh class="text-start">{{ t('loans.payments.status') }}</th>
                <th hlmTh class="text-center w-[120px]">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (payment of filteredPayments(); track payment.number) {
                <tr hlmTrow>
                  <td hlmTd class="font-medium">{{ payment.number }}</td>
                  <td hlmTd>{{ payment.dueDate | date:'dd/MM/yyyy' }}</td>
                  <td hlmTd>
                    @if (payment.paidDate) {
                      {{ payment.paidDate | date:'dd/MM/yyyy' }}
                    } @else {
                      -
                    }
                  </td>
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
                  <td hlmTd class="text-center">
                    @if (payment.status !== 'PAID') {
                      <button hlmBtn variant="outline" size="sm">
                        {{ t('payments.newPayment') }}
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr hlmTrow>
                  <td hlmTd colspan="6" class="py-8 text-center text-muted-foreground">
                    {{ t('common.noData') }}
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="flex items-center justify-between border-t p-4">
            <div class="text-sm text-muted-foreground">
              {{ t('common.showing') }} {{ filteredPayments().length }} {{ t('common.of') }} {{ paymentSchedule().length }}
            </div>
          </div>
        </div>
      } @else {
        <div class="flex h-64 flex-col items-center justify-center text-center">
          <ng-icon name="lucideCreditCard" class="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 class="text-xl font-semibold">{{ t('common.noData') }}</h2>
          <button hlmBtn class="mt-4" routerLink="/gmn/loans">
            {{ t('common.back') }}
          </button>
        </div>
      }
    </div>
  `,
})
export default class LoanPaymentsPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly loan = signal<Loan | null>(null);
  readonly statusFilter = signal<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');

  // Computed payment schedule
  readonly paymentSchedule = computed(() => {
    const l = this.loan();
    if (!l) return [];

    const schedule: Array<{
      number: number;
      dueDate: Date;
      paidDate: Date | null;
      amount: number;
      status: 'PAID' | 'PENDING' | 'OVERDUE';
    }> = [];
    const startDate = new Date(l.startDate);
    const paidCount = l.paidPaymentsCount || 0;
    const today = new Date();

    for (let i = 1; i <= l.numberOfPayments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);
      dueDate.setDate(l.paymentDay);

      let status: 'PAID' | 'PENDING' | 'OVERDUE' = 'PENDING';
      let paidDate: Date | null = null;

      if (i <= paidCount) {
        status = 'PAID';
        paidDate = new Date(dueDate);
      } else if (dueDate < today) {
        status = 'OVERDUE';
      }

      schedule.push({
        number: i,
        dueDate,
        paidDate,
        amount: l.monthlyPayment,
        status,
      });
    }

    return schedule;
  });

  // Filtered payments
  readonly filteredPayments = computed(() => {
    const filter = this.statusFilter();
    const schedule = this.paymentSchedule();

    if (filter === 'ALL') return schedule;
    return schedule.filter(p => p.status === filter);
  });

  // Counts
  readonly paidCount = computed(() => this.paymentSchedule().filter(p => p.status === 'PAID').length);
  readonly pendingCount = computed(() => this.paymentSchedule().filter(p => p.status === 'PENDING').length);
  readonly overdueCount = computed(() => this.paymentSchedule().filter(p => p.status === 'OVERDUE').length);

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
    } catch (error) {
      console.error('Error loading loan:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setStatusFilter(filter: 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'): void {
    this.statusFilter.set(filter);
  }
}
