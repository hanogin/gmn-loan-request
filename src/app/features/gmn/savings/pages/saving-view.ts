import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucidePencil,
  lucidePiggyBank,
  lucideUser,
  lucideCalendar,
  lucideLoader2,
  lucidePlus,
  lucideMinus,
  lucideActivity,
  lucideTrendingUp,
  lucideCreditCard,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Saving, SavingTransaction } from '../../../../core/models';

@Component({
  selector: 'gmn-saving-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTableImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucidePencil,
      lucidePiggyBank,
      lucideUser,
      lucideCalendar,
      lucideLoader2,
      lucidePlus,
      lucideMinus,
      lucideActivity,
      lucideTrendingUp,
      lucideCreditCard,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      @if (isLoading()) {
        <div class="flex h-64 items-center justify-center">
          <ng-icon name="lucideLoader2" class="h-8 w-8 animate-spin text-primary" />
        </div>
      } @else if (saving()) {
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/savings">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold">{{ t('savings.fields.savingNumber') }}: {{ saving()?.savingNumber }}</h1>
                <span hlmBadge [variant]="getStatusVariant()">
                  {{ t('savings.status.' + saving()?.status?.toLowerCase()) }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ saving()?.person?.fullName }} | {{ saving()?.person?.identityNumber }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button hlmBtn variant="outline" [routerLink]="['/gmn/people', saving()?.personId]">
              <ng-icon name="lucideUser" class="me-2 h-4 w-4" />
              {{ t('savings.fields.depositor') }}
            </button>
            <button hlmBtn [routerLink]="['/gmn/savings', saving()?.id, 'edit']">
              <ng-icon name="lucidePencil" class="me-2 h-4 w-4" />
              {{ t('common.edit') }}
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <ng-icon name="lucidePiggyBank" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ saving()?.currentBalance | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('savings.fields.currentBalance') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <ng-icon name="lucidePlus" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ saving()?.totalDeposited | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('common.totalDeposited') || 'Total Deposited' }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ng-icon name="lucideMinus" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ saving()?.totalWithdrawn | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('common.totalWithdrawn') || 'Total Withdrawn' }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <ng-icon name="lucideTrendingUp" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ saving()?.interestRate }}%</p>
                <p class="text-sm text-muted-foreground">{{ t('savings.fields.interestRate') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Left Column: Details -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Saving Info -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucidePiggyBank" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('common.details') }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('savings.fields.savingType') }}</span>
                  <span class="font-medium">{{ saving()?.savingTypeName || t('savings.types.' + (saving()?.savingType?.toLowerCase() || 'regular')) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('savings.fields.openDate') }}</span>
                  <span class="font-medium">{{ saving()?.openDate | date:'dd/MM/yyyy' }}</span>
                </div>
                @if (saving()?.maturityDate) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('savings.fields.maturityDate') }}</span>
                    <span class="font-medium">{{ saving()?.maturityDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
                @if (saving()?.lastTransactionDate) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('common.lastTransaction') || 'Last Transaction' }}</span>
                    <span class="font-medium">{{ saving()?.lastTransactionDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('common.canWithdraw') || 'Can Withdraw' }}</span>
                  <span class="font-medium">{{ saving()?.canWithdraw ? t('common.yes') : t('common.no') }}</span>
                </div>
              </div>
            </div>

            <!-- Interest Info -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideTrendingUp" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('common.interest') || 'Interest' }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('savings.fields.interestRate') }}</span>
                  <span class="font-medium">{{ saving()?.interestRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('common.accruedInterest') || 'Accrued Interest' }}</span>
                  <span class="font-medium text-green-600">{{ saving()?.accruedInterest | number:'1.0-0' }} ₪</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (saving()?.notes) {
              <div hlmCard class="p-6">
                <div class="mb-4 flex items-center gap-2">
                  <ng-icon name="lucideActivity" class="h-5 w-5 text-primary" />
                  <h2 class="text-lg font-semibold">{{ t('common.notes') }}</h2>
                </div>
                <p class="text-muted-foreground">{{ saving()?.notes }}</p>
              </div>
            }
          </div>

          <!-- Right Column: Actions & Transactions -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Quick Actions -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideCreditCard" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('dashboard.quickActions.title') }}</h2>
              </div>
              <div class="flex flex-wrap gap-4">
                <button hlmBtn [disabled]="!saving()?.canWithdraw">
                  <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
                  {{ t('payments.types.savingDeposit') }}
                </button>
                <button hlmBtn variant="outline" [disabled]="!saving()?.canWithdraw">
                  <ng-icon name="lucideMinus" class="me-2 h-4 w-4" />
                  {{ t('payments.types.savingWithdrawal') }}
                </button>
              </div>
            </div>

            <!-- Transaction History -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <ng-icon name="lucideActivity" class="h-5 w-5 text-primary" />
                  <h2 class="text-lg font-semibold">{{ t('common.transactionHistory') || 'Transaction History' }}</h2>
                </div>
              </div>

              @if (transactions().length > 0) {
                <table hlmTable class="w-full">
                  <thead>
                    <tr hlmTrow>
                      <th hlmTh class="text-start">{{ t('common.date') }}</th>
                      <th hlmTh class="text-start">{{ t('common.type') }}</th>
                      <th hlmTh class="text-start">{{ t('common.amount') }}</th>
                      <th hlmTh class="text-start">{{ t('common.balance') || 'Balance' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tx of transactions(); track tx.id) {
                      <tr hlmTrow>
                        <td hlmTd>{{ tx.date | date:'dd/MM/yyyy' }}</td>
                        <td hlmTd>
                          <span hlmBadge [variant]="tx.type === 'DEPOSIT' ? 'default' : 'secondary'">
                            {{ tx.type === 'DEPOSIT' ? t('payments.types.savingDeposit') : t('payments.types.savingWithdrawal') }}
                          </span>
                        </td>
                        <td hlmTd [class.text-green-600]="tx.type === 'DEPOSIT'" [class.text-red-600]="tx.type === 'WITHDRAWAL'">
                          {{ tx.type === 'DEPOSIT' ? '+' : '-' }}{{ tx.amount | number:'1.0-0' }} ₪
                        </td>
                        <td hlmTd>{{ tx.balance | number:'1.0-0' }} ₪</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div class="py-8 text-center text-muted-foreground">
                  {{ t('common.noData') }}
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="flex h-64 flex-col items-center justify-center text-center">
          <ng-icon name="lucidePiggyBank" class="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 class="text-xl font-semibold">{{ t('common.noData') }}</h2>
          <button hlmBtn class="mt-4" routerLink="/gmn/savings">
            {{ t('common.back') }}
          </button>
        </div>
      }
    </div>
  `,
})
export default class SavingViewPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly saving = signal<Saving | null>(null);
  readonly transactions = signal<Array<{
    id: number;
    date: Date;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    balance: number;
  }>>([]);

  ngOnInit(): void {
    const savingId = this.route.snapshot.params['id'];
    if (savingId) {
      this.loadSaving(parseInt(savingId, 10));
    } else {
      this.isLoading.set(false);
    }
  }

  private async loadSaving(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const saving = await this.mockService.getSavingById(id);
      this.saving.set(saving || null);

      // Generate mock transactions for display
      if (saving) {
        this.generateMockTransactions(saving);
      }
    } catch (error) {
      console.error('Error loading saving:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private generateMockTransactions(saving: Saving): void {
    // Generate some mock transactions for demo purposes
    const transactions: Array<{
      id: number;
      date: Date;
      type: 'DEPOSIT' | 'WITHDRAWAL';
      amount: number;
      balance: number;
    }> = [];

    let balance = 0;

    // Initial deposit
    transactions.push({
      id: 1,
      date: saving.openDate,
      type: 'DEPOSIT',
      amount: saving.initialAmount,
      balance: saving.initialAmount,
    });
    balance = saving.initialAmount;

    // Add some more deposits if total deposited > initial
    if (saving.totalDeposited > saving.initialAmount) {
      const additionalDeposit = saving.totalDeposited - saving.initialAmount;
      const depositDate = new Date(saving.openDate);
      depositDate.setMonth(depositDate.getMonth() + 1);
      balance += additionalDeposit;
      transactions.push({
        id: 2,
        date: depositDate,
        type: 'DEPOSIT',
        amount: additionalDeposit,
        balance,
      });
    }

    // Add withdrawals if any
    if (saving.totalWithdrawn > 0) {
      const withdrawDate = new Date(saving.openDate);
      withdrawDate.setMonth(withdrawDate.getMonth() + 2);
      balance -= saving.totalWithdrawn;
      transactions.push({
        id: 3,
        date: withdrawDate,
        type: 'WITHDRAWAL',
        amount: saving.totalWithdrawn,
        balance,
      });
    }

    this.transactions.set(transactions.reverse()); // Show newest first
  }

  getStatusVariant(): 'default' | 'secondary' | 'destructive' | 'outline' {
    const status = this.saving()?.status;
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'MATURED':
        return 'secondary';
      case 'CLOSED':
        return 'outline';
      case 'FROZEN':
        return 'destructive';
      default:
        return 'outline';
    }
  }
}
