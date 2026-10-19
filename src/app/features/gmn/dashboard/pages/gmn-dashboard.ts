import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucideFileText,
  lucideWallet,
  lucidePiggyBank,
  lucideHeart,
  lucideTrendingUp,
  lucideTrendingDown,
  lucideAlertCircle,
  lucideClock,
  lucideArrowUpRight,
  lucidePlus,
  lucideBuilding2,
  lucideReceiptText,
  lucideCalendar,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-dashboard',
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
      lucideUsers,
      lucideFileText,
      lucideWallet,
      lucidePiggyBank,
      lucideHeart,
      lucideTrendingUp,
      lucideTrendingDown,
      lucideAlertCircle,
      lucideClock,
      lucideArrowUpRight,
      lucidePlus,
      lucideBuilding2,
      lucideReceiptText,
      lucideCalendar,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('dashboard.title') }}</h1>
          <p class="text-muted-foreground">{{ t('dashboard.subtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <button hlmBtn variant="outline" routerLink="/gmn/loan-requests/new">
            <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
            {{ t('dashboard.quickActions.newLoanRequest') }}
          </button>
          <button hlmBtn routerLink="/gmn/people/new">
            <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
            {{ t('people.newPerson') }}
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- People Card -->
        <div hlmCard class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">{{ t('people.title') }}</p>
              <h2 class="mt-1 text-3xl font-bold">{{ stats().totalPersons }}</h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideUsers" class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-muted-foreground">
            <ng-icon name="lucideTrendingUp" class="me-1 h-4 w-4 text-green-500" />
            <span class="text-green-500 font-medium">+12%</span>
          </div>
        </div>

        <!-- Active Loans Card -->
        <div hlmCard class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">{{ t('dashboard.stats.activeLoans') }}</p>
              <h2 class="mt-1 text-3xl font-bold">{{ stats().activeLoans }}</h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideWallet" class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="font-medium text-primary">{{ t('common.currency') }}{{ formatNumber(stats().totalLoansBalance) }}</span>
          </div>
        </div>

        <!-- Deposits Card -->
        <div hlmCard class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">{{ t('savings.title') }}</p>
              <h2 class="mt-1 text-3xl font-bold">{{ stats().totalSavings }}</h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucidePiggyBank" class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="font-medium text-primary">{{ t('common.currency') }}{{ formatNumber(stats().totalDepositsBalance) }}</span>
          </div>
        </div>

        <!-- Pending Requests Card -->
        <div hlmCard class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">{{ t('dashboard.stats.pendingRequests') }}</p>
              <h2 class="mt-1 text-3xl font-bold">{{ stats().pendingLoanRequests }}</h2>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideClock" class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4">
            @if (stats().pendingLoanRequests > 0) {
              <button hlmBtn variant="link" size="sm" class="h-auto p-0 text-primary" routerLink="/gmn/loan-requests">
                {{ t('common.view') }}
                <ng-icon name="lucideArrowUpRight" class="ms-1 h-3 w-3" />
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Second Row: Alerts & Quick Actions -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Alerts Section -->
        <div hlmCard class="lg:col-span-2">
          <div class="border-b p-4">
            <h3 class="flex items-center gap-2 font-semibold">
              <ng-icon name="lucideAlertCircle" class="h-5 w-5 text-amber-500" />
              {{ t('dashboard.stats.requiresAttention') }}
            </h3>
          </div>
          <div class="divide-y">
            @if (stats().overdueLoans > 0) {
              <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                    <ng-icon name="lucideAlertCircle" class="h-5 w-5" />
                  </div>
                  <div>
                    <p class="font-medium">{{ t('dashboard.stats.latePayments') }}</p>
                    <p class="text-sm text-muted-foreground">{{ stats().overdueLoans }}</p>
                  </div>
                </div>
                <button hlmBtn variant="outline" size="sm" routerLink="/gmn/reports/late-payments">
                  {{ t('common.view') }}
                </button>
              </div>
            }
            @if (stats().pendingLoanRequests > 0) {
              <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                    <ng-icon name="lucideFileText" class="h-5 w-5" />
                  </div>
                  <div>
                    <p class="font-medium">{{ t('dashboard.stats.pendingRequests') }}</p>
                    <p class="text-sm text-muted-foreground">{{ stats().pendingLoanRequests }}</p>
                  </div>
                </div>
                <button hlmBtn variant="outline" size="sm" routerLink="/gmn/loan-requests">
                  {{ t('common.view') }}
                </button>
              </div>
            }
            @if (stats().overdueLoans === 0 && stats().pendingLoanRequests === 0) {
              <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ng-icon name="lucideTrendingUp" class="mb-2 h-8 w-8 text-green-500" />
                <p>{{ t('common.noData') }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Quick Actions -->
        <div hlmCard>
          <div class="border-b p-4">
            <h3 class="font-semibold">{{ t('dashboard.quickActions.title') }}</h3>
          </div>
          <div class="p-4">
            <div class="space-y-2">
              <button hlmBtn variant="outline" class="w-full justify-start" routerLink="/gmn/people">
                <ng-icon name="lucideUsers" class="me-3 h-4 w-4" />
                {{ t('people.title') }}
              </button>
              <button hlmBtn variant="outline" class="w-full justify-start" routerLink="/gmn/loan-requests">
                <ng-icon name="lucideFileText" class="me-3 h-4 w-4" />
                {{ t('loanRequests.title') }}
              </button>
              <button hlmBtn variant="outline" class="w-full justify-start" routerLink="/gmn/loans">
                <ng-icon name="lucideWallet" class="me-3 h-4 w-4" />
                {{ t('loans.title') }}
              </button>
              <button hlmBtn variant="outline" class="w-full justify-start" routerLink="/gmn/savings">
                <ng-icon name="lucidePiggyBank" class="me-3 h-4 w-4" />
                {{ t('savings.title') }}
              </button>
              <button hlmBtn variant="outline" class="w-full justify-start" routerLink="/gmn/donations">
                <ng-icon name="lucideHeart" class="me-3 h-4 w-4" />
                {{ t('donations.title') }}
              </button>
              <button hlmBtn variant="outline" class="w-full justify-start" routerLink="/gmn/masav">
                <ng-icon name="lucideBuilding2" class="me-3 h-4 w-4" />
                {{ t('masav.title') }}
              </button>
              <button hlmBtn variant="outline" class="w-full justify-start" routerLink="/gmn/reports">
                <ng-icon name="lucideReceiptText" class="me-3 h-4 w-4" />
                {{ t('reports.title') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Third Row: Summary Tables -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Recent Loan Requests -->
        <div hlmCard>
          <div class="flex items-center justify-between border-b p-4">
            <h3 class="font-semibold">{{ t('loanRequests.title') }}</h3>
            <button hlmBtn variant="ghost" size="sm" routerLink="/gmn/loan-requests">
              {{ t('dashboard.recentActivity.viewAll') }}
              <ng-icon name="lucideArrowUpRight" class="ms-1 h-3 w-3" />
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b text-sm text-muted-foreground">
                  <th class="p-3 text-start font-medium">{{ t('loanRequests.fields.requestNumber') }}</th>
                  <th class="p-3 text-start font-medium">{{ t('common.name') }}</th>
                  <th class="p-3 text-start font-medium">{{ t('common.amount') }}</th>
                  <th class="p-3 text-start font-medium">{{ t('common.status') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (request of recentLoanRequests(); track request.id) {
                  <tr class="border-b hover:bg-muted/50">
                    <td class="p-3 font-mono text-sm">{{ request.requestNumber }}</td>
                    <td class="p-3">{{ getPersonName(request.personId) }}</td>
                    <td class="p-3 font-medium">{{ t('common.currency') }}{{ formatNumber(request.requestedAmount) }}</td>
                    <td class="p-3">
                      <span hlmBadge [variant]="getStatusBadgeVariant(request.status)">
                        {{ getStatusTranslation(request.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Donations -->
        <div hlmCard>
          <div class="flex items-center justify-between border-b p-4">
            <h3 class="font-semibold">{{ t('donations.title') }}</h3>
            <div class="flex items-center gap-2">
              <span class="font-bold text-green-600">{{ t('common.currency') }}{{ formatNumber(stats().totalDonationsThisYear) }}</span>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b text-sm text-muted-foreground">
                  <th class="p-3 text-start font-medium">{{ t('common.date') }}</th>
                  <th class="p-3 text-start font-medium">{{ t('common.name') }}</th>
                  <th class="p-3 text-start font-medium">{{ t('common.amount') }}</th>
                  <th class="p-3 text-start font-medium">{{ t('donations.fields.paymentMethod') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (donation of recentDonations(); track donation.id) {
                  <tr class="border-b hover:bg-muted/50">
                    <td class="p-3 text-sm">{{ formatDate(donation.donationDate) }}</td>
                    <td class="p-3">{{ getPersonName(donation.personId) }}</td>
                    <td class="p-3 font-medium text-green-600">{{ t('common.currency') }}{{ formatNumber(donation.amount) }}</td>
                    <td class="p-3 text-sm text-muted-foreground">{{ getPaymentMethodTranslation(donation.paymentMethod) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class GmnDashboard {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  // Stats from mock service
  readonly stats = this.mockService.dashboardStats;

  // Recent items
  readonly recentLoanRequests = computed(() =>
    this.mockService.loanRequests()
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
      .slice(0, 5)
  );

  readonly recentDonations = computed(() =>
    this.mockService.donations()
      .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime())
      .slice(0, 5)
  );

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || person?.firstName + ' ' + person?.lastName || '—';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
  }

  getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'APPROVED':
      case 'CONVERTED_TO_LOAN':
        return 'default';
      case 'REJECTED':
      case 'CANCELLED':
        return 'destructive';
      case 'PENDING_APPROVAL':
      case 'PENDING_INTERVIEW':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  getStatusTranslation(status: string): string {
    const statusMap: Record<string, string> = {
      'APPROVED': 'loanRequests.status.approved',
      'REJECTED': 'loanRequests.status.rejected',
      'PENDING_APPROVAL': 'loanRequests.status.pending',
      'PENDING_INTERVIEW': 'loanRequests.status.inReview',
      'CONVERTED_TO_LOAN': 'loanRequests.status.converted',
      'CANCELLED': 'loanRequests.status.cancelled',
    };
    return this.transloco.translate(`gmn.${statusMap[status] || 'common.pending'}`);
  }

  getPaymentMethodTranslation(method: string): string {
    const methodMap: Record<string, string> = {
      'CASH': 'donations.paymentMethods.cash',
      'CHECK': 'donations.paymentMethods.check',
      'CREDIT_CARD': 'donations.paymentMethods.creditCard',
      'BANK_TRANSFER': 'donations.paymentMethods.bankTransfer',
    };
    return this.transloco.translate(`gmn.${methodMap[method] || 'donations.paymentMethods.other'}`);
  }
}
