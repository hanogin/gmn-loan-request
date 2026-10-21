import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideDownload,
  lucidePrinter,
  lucideCalendar,
  lucideScale,
  lucideCheckCircle,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';

interface TrialBalanceItem {
  accountNumber: string;
  accountName: string;
  accountNameHe: string;
  accountType: string;
  debit: number;
  credit: number;
}

@Component({
  selector: 'gmn-trial-balance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
    HlmTableImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideDownload,
      lucidePrinter,
      lucideCalendar,
      lucideScale,
      lucideCheckCircle,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/accounting">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('accounting.trialBalance.title') }}</h1>
            <p class="text-muted-foreground">{{ t('accounting.subtitle') }}</p>
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

      <!-- Date Selection -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideCalendar" class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('accounting.trialBalance.asOf') }}:</span>
          </div>
          <input hlmInput type="date" [(ngModel)]="asOfDate" class="w-[180px]" />
          <button hlmBtn size="sm" (click)="generateReport()">
            Generate
          </button>
        </div>
      </div>

      <!-- Balance Status -->
      <div hlmCard class="p-6" [class]="isBalanced() ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-full"
                 [class]="isBalanced() ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
              <ng-icon [name]="isBalanced() ? 'lucideCheckCircle' : 'lucideAlertCircle'" class="h-7 w-7" />
            </div>
            <div>
              <p class="text-lg font-semibold" [class]="isBalanced() ? 'text-green-700' : 'text-red-700'">
                {{ isBalanced() ? 'Balanced' : 'Not Balanced' }}
              </p>
              <p class="text-sm" [class]="isBalanced() ? 'text-green-600' : 'text-red-600'">
                {{ isBalanced() ? 'Total debits equal total credits' : 'Difference: ' + formatNumber(Math.abs(difference())) + ' ₪' }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-8 text-end">
            <div>
              <p class="text-sm text-muted-foreground">{{ t('accounting.trialBalance.totalDebit') }}</p>
              <p class="text-2xl font-bold text-green-600">{{ formatNumber(totalDebit()) }} ₪</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('accounting.trialBalance.totalCredit') }}</p>
              <p class="text-2xl font-bold text-red-600">{{ formatNumber(totalCredit()) }} ₪</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trial Balance Table -->
      <div hlmCard>
        <div class="p-4 border-b">
          <h3 class="font-semibold">Trial Balance as of {{ formatDisplayDate(asOfDate()) }}</h3>
        </div>
        <table hlmTable class="w-full">
          <thead>
            <tr hlmTrow>
              <th hlmTh class="text-start w-[100px]">{{ t('accounting.chartOfAccounts.accountNumber') }}</th>
              <th hlmTh class="text-start">{{ t('accounting.chartOfAccounts.accountName') }}</th>
              <th hlmTh class="text-start">{{ t('accounting.chartOfAccounts.accountType') }}</th>
              <th hlmTh class="text-end w-[150px]">{{ t('accounting.journalEntries.debit') }}</th>
              <th hlmTh class="text-end w-[150px]">{{ t('accounting.journalEntries.credit') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.accountNumber) {
              <tr hlmTrow>
                <td hlmTd class="font-mono">{{ item.accountNumber }}</td>
                <td hlmTd>
                  <div>
                    <p class="font-medium">{{ item.accountNameHe }}</p>
                    <p class="text-xs text-muted-foreground">{{ item.accountName }}</p>
                  </div>
                </td>
                <td hlmTd>
                  <span hlmBadge [variant]="getTypeBadge(item.accountType)">
                    {{ t('accounting.accountTypes.' + item.accountType.toLowerCase()) }}
                  </span>
                </td>
                <td hlmTd class="text-end font-medium text-green-600">
                  {{ item.debit > 0 ? formatNumber(item.debit) + ' ₪' : '' }}
                </td>
                <td hlmTd class="text-end font-medium text-red-600">
                  {{ item.credit > 0 ? formatNumber(item.credit) + ' ₪' : '' }}
                </td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr hlmTrow class="bg-muted/50 font-bold">
              <td hlmTd colspan="3">{{ t('common.total') }}</td>
              <td hlmTd class="text-end text-green-600">{{ formatNumber(totalDebit()) }} ₪</td>
              <td hlmTd class="text-end text-red-600">{{ formatNumber(totalCredit()) }} ₪</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
})
export default class TrialBalancePage {
  private readonly transloco = inject(TranslocoService);

  asOfDate = signal(new Date().toISOString().split('T')[0]);

  // Mock trial balance data
  readonly items = signal<TrialBalanceItem[]>([
    { accountNumber: '1110', accountName: 'Petty Cash', accountNameHe: 'קופה קטנה', accountType: 'ASSET', debit: 5000, credit: 0 },
    { accountNumber: '1120', accountName: 'Bank Account', accountNameHe: 'חשבון בנק', accountType: 'ASSET', debit: 145000, credit: 0 },
    { accountNumber: '1200', accountName: 'Loans Receivable', accountNameHe: 'הלוואות לגבייה', accountType: 'ASSET', debit: 700000, credit: 0 },
    { accountNumber: '2100', accountName: 'Deposits Payable', accountNameHe: 'פיקדונות לתשלום', accountType: 'LIABILITY', debit: 0, credit: 450000 },
    { accountNumber: '3100', accountName: 'Donations Fund', accountNameHe: 'קרן תרומות', accountType: 'EQUITY', debit: 0, credit: 350000 },
    { accountNumber: '3200', accountName: 'Retained Earnings', accountNameHe: 'עודפים', accountType: 'EQUITY', debit: 0, credit: 50000 },
    { accountNumber: '4100', accountName: 'Donations', accountNameHe: 'תרומות', accountType: 'INCOME', debit: 0, credit: 100000 },
    { accountNumber: '4200', accountName: 'Interest Income', accountNameHe: 'הכנסות ריבית', accountType: 'INCOME', debit: 0, credit: 25000 },
    { accountNumber: '5100', accountName: 'Administrative', accountNameHe: 'הנהלה וכלליות', accountType: 'EXPENSE', debit: 30000, credit: 0 },
    { accountNumber: '5200', accountName: 'Interest Expense', accountNameHe: 'הוצאות ריבית', accountType: 'EXPENSE', debit: 45000, credit: 0 },
    { accountNumber: '5300', accountName: 'Bad Debt', accountNameHe: 'חובות אבודים', accountType: 'EXPENSE', debit: 50000, credit: 0 },
  ]);

  readonly totalDebit = computed(() => this.items().reduce((sum, i) => sum + i.debit, 0));
  readonly totalCredit = computed(() => this.items().reduce((sum, i) => sum + i.credit, 0));
  readonly difference = computed(() => this.totalDebit() - this.totalCredit());
  readonly isBalanced = computed(() => Math.abs(this.difference()) < 0.01);

  Math = Math; // For template

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(num);
  }

  formatDisplayDate(dateStr: string): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(dateStr));
  }

  getTypeBadge(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (type) {
      case 'ASSET': return 'default';
      case 'LIABILITY': return 'destructive';
      case 'EQUITY': return 'secondary';
      case 'INCOME': return 'default';
      case 'EXPENSE': return 'destructive';
      default: return 'outline';
    }
  }

  generateReport(): void {
    console.log('Generate report for:', this.asOfDate());
  }

  exportReport(): void {
    const headers = ['Account #', 'Account Name', 'Type', 'Debit', 'Credit'];
    const rows = this.items().map(i => [
      i.accountNumber,
      i.accountName,
      i.accountType,
      i.debit.toString(),
      i.credit.toString(),
    ]);
    rows.push(['', 'TOTAL', '', this.totalDebit().toString(), this.totalCredit().toString()]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${this.asOfDate()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
