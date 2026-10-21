import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideDownload,
  lucidePrinter,
  lucideFilter,
  lucideLoader2,
  lucidePiggyBank,
  lucideCheckCircle,
  lucideClock,
  lucideUsers,
  lucideTrendingUp,
  lucidePercent,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Saving } from '../../../../core/models';

interface SavingSummaryItem {
  id: number;
  savingNumber: string;
  personId: number;
  personName: string;
  identityNumber: string;
  initialAmount: number;
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  accruedInterest: number;
  interestRate: number;
  openDate: Date;
  maturityDate?: Date;
  status: string;
  savingType: string;
}

@Component({
  selector: 'gmn-savings-summary-report',
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
      lucideDownload,
      lucidePrinter,
      lucideFilter,
      lucideLoader2,
      lucidePiggyBank,
      lucideCheckCircle,
      lucideClock,
      lucideUsers,
      lucideTrendingUp,
      lucidePercent,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/reports">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('reports.savingsSummary.title') }}</h1>
            <p class="text-muted-foreground">{{ t('savings.subtitle') }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button hlmBtn variant="outline" (click)="exportReport()">
            <ng-icon name="lucideDownload" class="me-2 h-4 w-4" />
            {{ t('common.export') }}
          </button>
          <button hlmBtn variant="outline" (click)="printReport()">
            <ng-icon name="lucidePrinter" class="me-2 h-4 w-4" />
            {{ t('common.print') }}
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucidePiggyBank" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalSavings() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.savingsSummary.totalSavings') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ activeSavings() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.savingsSummary.activeSavings') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideTrendingUp" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalDeposited() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.savingsSummary.totalDeposited') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucidePercent" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalInterest() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.savingsSummary.totalInterest') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideFilter" class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('common.filter') }}:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              hlmBtn
              size="sm"
              [variant]="statusFilter() === 'ALL' ? 'default' : 'outline'"
              (click)="setStatusFilter('ALL')"
            >
              {{ t('common.all') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="statusFilter() === 'ACTIVE' ? 'default' : 'outline'"
              (click)="setStatusFilter('ACTIVE')"
            >
              {{ t('savings.status.active') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="statusFilter() === 'MATURED' ? 'default' : 'outline'"
              (click)="setStatusFilter('MATURED')"
            >
              {{ t('savings.status.matured') }}
            </button>
            <button
              hlmBtn
              size="sm"
              [variant]="statusFilter() === 'CLOSED' ? 'default' : 'outline'"
              (click)="setStatusFilter('CLOSED')"
            >
              {{ t('savings.status.closed') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Report Table -->
      <div hlmCard>
        @if (isLoading()) {
          <div class="flex h-40 items-center justify-center">
            <ng-icon name="lucideLoader2" class="h-8 w-8 animate-spin text-primary" />
          </div>
        } @else {
          <table hlmTable class="w-full">
            <thead>
              <tr hlmTrow>
                <th hlmTh class="text-start">{{ t('savings.fields.savingNumber') }}</th>
                <th hlmTh class="text-start">{{ t('savings.fields.depositor') }}</th>
                <th hlmTh class="text-start">{{ t('savings.fields.currentBalance') }}</th>
                <th hlmTh class="text-start">{{ t('savings.fields.interestRate') }}</th>
                <th hlmTh class="text-start">{{ t('savings.fields.openDate') }}</th>
                <th hlmTh class="text-start">{{ t('common.status') }}</th>
                <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (saving of filteredSavings(); track saving.id) {
                <tr hlmTrow>
                  <td hlmTd class="font-mono">{{ saving.savingNumber }}</td>
                  <td hlmTd>
                    <div>
                      <p class="font-medium">{{ saving.personName }}</p>
                      <p class="text-xs text-muted-foreground">{{ saving.identityNumber }}</p>
                    </div>
                  </td>
                  <td hlmTd class="font-medium">{{ saving.currentBalance | number:'1.0-0' }} ₪</td>
                  <td hlmTd>{{ saving.interestRate }}%</td>
                  <td hlmTd>{{ saving.openDate | date:'dd/MM/yyyy' }}</td>
                  <td hlmTd>
                    <span hlmBadge [variant]="getStatusBadge(saving.status)">
                      {{ getStatusText(saving.status, t) }}
                    </span>
                  </td>
                  <td hlmTd class="text-center">
                    <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/savings', saving.id]" title="{{ t('common.view') }}">
                      <ng-icon name="lucideUsers" class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr hlmTrow>
                  <td hlmTd colspan="7" class="py-8 text-center text-muted-foreground">
                    {{ t('common.noData') }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        <!-- Summary Footer -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-t p-4">
          <div class="text-sm text-muted-foreground">
            {{ t('common.showing') }} {{ filteredSavings().length }} {{ t('common.of') }} {{ savings().length }}
          </div>
          <div class="flex gap-6 text-sm">
            <div>
              <span class="text-muted-foreground">{{ t('common.total') }} {{ t('savings.fields.currentBalance') }}:</span>
              <span class="ms-2 font-bold">{{ filteredTotalBalance() | number:'1.0-0' }} ₪</span>
            </div>
            <div>
              <span class="text-muted-foreground">{{ t('reports.savingsSummary.totalInterest') }}:</span>
              <span class="ms-2 font-bold">{{ filteredTotalInterest() | number:'1.0-0' }} ₪</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class SavingsSummaryReportPage implements OnInit {
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly savings = signal<SavingSummaryItem[]>([]);
  readonly statusFilter = signal<'ALL' | 'ACTIVE' | 'MATURED' | 'CLOSED'>('ALL');

  // Computed
  readonly filteredSavings = computed(() => {
    const filter = this.statusFilter();
    const items = this.savings();

    if (filter === 'ALL') return items;
    return items.filter(s => s.status === filter);
  });

  readonly totalSavings = computed(() => this.savings().length);
  readonly activeSavings = computed(() => this.savings().filter(s => s.status === 'ACTIVE').length);
  readonly totalDeposited = computed(() => this.savings().reduce((sum, s) => sum + s.totalDeposited, 0));
  readonly totalInterest = computed(() => this.savings().reduce((sum, s) => sum + s.accruedInterest, 0));

  readonly filteredTotalBalance = computed(() => this.filteredSavings().reduce((sum, s) => sum + s.currentBalance, 0));
  readonly filteredTotalInterest = computed(() => this.filteredSavings().reduce((sum, s) => sum + s.accruedInterest, 0));

  ngOnInit(): void {
    this.loadSavings();
  }

  private async loadSavings(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.mockService.getSavings({ page: 1, pageSize: 1000 });
      const items: SavingSummaryItem[] = result.data.map(saving => ({
        id: saving.id,
        savingNumber: saving.savingNumber,
        personId: saving.personId,
        personName: saving.person?.fullName || '',
        identityNumber: saving.person?.identityNumber || '',
        initialAmount: saving.initialAmount,
        currentBalance: saving.currentBalance,
        totalDeposited: saving.totalDeposited,
        totalWithdrawn: saving.totalWithdrawn,
        accruedInterest: saving.accruedInterest || 0,
        interestRate: saving.interestRate || 0,
        openDate: new Date(saving.openDate),
        maturityDate: saving.maturityDate ? new Date(saving.maturityDate) : undefined,
        status: saving.status,
        savingType: saving.savingType || 'REGULAR',
      }));

      // Sort by saving number descending (newest first)
      items.sort((a, b) => b.savingNumber.localeCompare(a.savingNumber));
      this.savings.set(items);
    } catch (error) {
      console.error('Error loading savings:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setStatusFilter(status: 'ALL' | 'ACTIVE' | 'MATURED' | 'CLOSED'): void {
    this.statusFilter.set(status);
  }

  getStatusBadge(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'MATURED': return 'secondary';
      case 'CLOSED': return 'outline';
      default: return 'outline';
    }
  }

  getStatusText(status: string, t: (key: string) => string): string {
    switch (status) {
      case 'ACTIVE': return t('savings.status.active');
      case 'MATURED': return t('savings.status.matured');
      case 'CLOSED': return t('savings.status.closed');
      case 'FROZEN': return t('savings.status.frozen');
      default: return status;
    }
  }

  exportReport(): void {
    const headers = ['Saving #', 'Depositor', 'ID', 'Balance', 'Interest Rate', 'Accrued Interest', 'Open Date', 'Status'];
    const rows = this.filteredSavings().map(s => [
      s.savingNumber,
      s.personName,
      s.identityNumber,
      s.currentBalance.toString(),
      s.interestRate.toString(),
      s.accruedInterest.toString(),
      new Date(s.openDate).toLocaleDateString('he-IL'),
      s.status,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savings-summary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
