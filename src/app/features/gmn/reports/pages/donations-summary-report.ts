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
  lucideHeart,
  lucideUsers,
  lucideTrendingUp,
  lucideCalendar,
  lucideRepeat,
  lucideStar,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Donation } from '../../../../core/models';

interface DonationSummaryItem {
  id: number;
  donationNumber: string;
  personId: number;
  personName: string;
  identityNumber: string;
  amount: number;
  donationDate: Date;
  donationType: string;
  paymentMethod: string;
  purpose?: number | string;
  campaign?: string;
  isRecurring: boolean;
  receiptNumber?: string;
}

interface TopDonor {
  personId: number;
  personName: string;
  totalAmount: number;
  donationCount: number;
}

@Component({
  selector: 'gmn-donations-summary-report',
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
      lucideHeart,
      lucideUsers,
      lucideTrendingUp,
      lucideCalendar,
      lucideRepeat,
      lucideStar,
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
            <h1 class="text-2xl font-bold">{{ t('reports.donationsSummary.title') }}</h1>
            <p class="text-muted-foreground">{{ t('donations.subtitle') }}</p>
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
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30">
              <ng-icon name="lucideHeart" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalDonations() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.donationsSummary.totalDonations') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideTrendingUp" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalAmount() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.donationsSummary.totalAmount') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideUsers" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ uniqueDonors() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('donations.fields.donor') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideRepeat" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ averageDonation() | number:'1.0-0' }} ₪</p>
              <p class="text-sm text-muted-foreground">{{ t('reports.donationsSummary.averageDonation') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Donors & Filters Row -->
      <div class="grid gap-4 lg:grid-cols-3">
        <!-- Top Donors Card -->
        <div hlmCard class="p-4">
          <div class="mb-4 flex items-center gap-2">
            <ng-icon name="lucideStar" class="h-5 w-5 text-amber-500" />
            <h3 class="font-semibold">{{ t('reports.donationsSummary.topDonors') }}</h3>
          </div>
          <div class="space-y-3">
            @for (donor of topDonors(); track donor.personId; let i = $index) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">{{ i + 1 }}</span>
                  <span class="text-sm">{{ donor.personName }}</span>
                </div>
                <span class="font-medium">{{ donor.totalAmount | number:'1.0-0' }} ₪</span>
              </div>
            } @empty {
              <p class="text-sm text-muted-foreground">{{ t('common.noData') }}</p>
            }
          </div>
        </div>

        <!-- Filters Card -->
        <div hlmCard class="p-4 lg:col-span-2">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <ng-icon name="lucideFilter" class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">{{ t('common.filter') }}:</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                hlmBtn
                size="sm"
                [variant]="yearFilter() === 0 ? 'default' : 'outline'"
                (click)="setYearFilter(0)"
              >
                {{ t('common.all') }}
              </button>
              <button
                hlmBtn
                size="sm"
                [variant]="yearFilter() === currentYear ? 'default' : 'outline'"
                (click)="setYearFilter(currentYear)"
              >
                {{ currentYear }}
              </button>
              <button
                hlmBtn
                size="sm"
                [variant]="yearFilter() === currentYear - 1 ? 'default' : 'outline'"
                (click)="setYearFilter(currentYear - 1)"
              >
                {{ currentYear - 1 }}
              </button>
              <button
                hlmBtn
                size="sm"
                [variant]="yearFilter() === currentYear - 2 ? 'default' : 'outline'"
                (click)="setYearFilter(currentYear - 2)"
              >
                {{ currentYear - 2 }}
              </button>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ t('donations.fields.type') }}:</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                hlmBtn
                size="sm"
                [variant]="typeFilter() === 'ALL' ? 'default' : 'outline'"
                (click)="setTypeFilter('ALL')"
              >
                {{ t('common.all') }}
              </button>
              <button
                hlmBtn
                size="sm"
                [variant]="typeFilter() === 'ONE_TIME' ? 'default' : 'outline'"
                (click)="setTypeFilter('ONE_TIME')"
              >
                {{ t('donations.types.oneTime') }}
              </button>
              <button
                hlmBtn
                size="sm"
                [variant]="typeFilter() === 'RECURRING' ? 'default' : 'outline'"
                (click)="setTypeFilter('RECURRING')"
              >
                {{ t('donations.types.recurring') }}
              </button>
            </div>
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
                <th hlmTh class="text-start">{{ t('donations.fields.donationNumber') }}</th>
                <th hlmTh class="text-start">{{ t('donations.fields.donor') }}</th>
                <th hlmTh class="text-start">{{ t('donations.fields.amount') }}</th>
                <th hlmTh class="text-start">{{ t('donations.fields.date') }}</th>
                <th hlmTh class="text-start">{{ t('donations.fields.paymentMethod') }}</th>
                <th hlmTh class="text-start">{{ t('donations.fields.type') }}</th>
                <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (donation of filteredDonations(); track donation.id) {
                <tr hlmTrow>
                  <td hlmTd class="font-mono">{{ donation.donationNumber }}</td>
                  <td hlmTd>
                    <div>
                      <p class="font-medium">{{ donation.personName }}</p>
                      <p class="text-xs text-muted-foreground">{{ donation.identityNumber }}</p>
                    </div>
                  </td>
                  <td hlmTd class="font-medium">{{ donation.amount | number:'1.0-0' }} ₪</td>
                  <td hlmTd>{{ donation.donationDate | date:'dd/MM/yyyy' }}</td>
                  <td hlmTd>{{ getPaymentMethodText(donation.paymentMethod, t) }}</td>
                  <td hlmTd>
                    <span hlmBadge [variant]="donation.isRecurring ? 'default' : 'secondary'">
                      {{ donation.isRecurring ? t('donations.types.recurring') : t('donations.types.oneTime') }}
                    </span>
                  </td>
                  <td hlmTd class="text-center">
                    <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/people', donation.personId]" title="{{ t('common.view') }}">
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
            {{ t('common.showing') }} {{ filteredDonations().length }} {{ t('common.of') }} {{ donations().length }}
          </div>
          <div class="flex gap-6 text-sm">
            <div>
              <span class="text-muted-foreground">{{ t('reports.donationsSummary.totalAmount') }}:</span>
              <span class="ms-2 font-bold">{{ filteredTotalAmount() | number:'1.0-0' }} ₪</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class DonationsSummaryReportPage implements OnInit {
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly donations = signal<DonationSummaryItem[]>([]);
  readonly yearFilter = signal(0); // 0 = all years
  readonly typeFilter = signal<'ALL' | 'ONE_TIME' | 'RECURRING'>('ALL');
  readonly currentYear = new Date().getFullYear();

  // Computed
  readonly filteredDonations = computed(() => {
    let items = this.donations();
    const year = this.yearFilter();
    const type = this.typeFilter();

    if (year > 0) {
      items = items.filter(d => d.donationDate.getFullYear() === year);
    }

    if (type !== 'ALL') {
      items = items.filter(d => type === 'RECURRING' ? d.isRecurring : !d.isRecurring);
    }

    return items;
  });

  readonly totalDonations = computed(() => this.donations().length);
  readonly totalAmount = computed(() => this.donations().reduce((sum, d) => sum + d.amount, 0));
  readonly uniqueDonors = computed(() => new Set(this.donations().map(d => d.personId)).size);
  readonly averageDonation = computed(() => {
    const count = this.donations().length;
    return count > 0 ? this.totalAmount() / count : 0;
  });

  readonly filteredTotalAmount = computed(() => this.filteredDonations().reduce((sum, d) => sum + d.amount, 0));

  readonly topDonors = computed(() => {
    const donorMap = new Map<number, TopDonor>();

    for (const donation of this.filteredDonations()) {
      const existing = donorMap.get(donation.personId);
      if (existing) {
        existing.totalAmount += donation.amount;
        existing.donationCount++;
      } else {
        donorMap.set(donation.personId, {
          personId: donation.personId,
          personName: donation.personName,
          totalAmount: donation.amount,
          donationCount: 1,
        });
      }
    }

    return Array.from(donorMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  });

  ngOnInit(): void {
    this.loadDonations();
  }

  private async loadDonations(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.mockService.getDonations({ page: 1, pageSize: 1000 });
      const items: DonationSummaryItem[] = result.data.map(donation => ({
        id: donation.id,
        donationNumber: donation.donationNumber,
        personId: donation.personId,
        personName: donation.person?.fullName || '',
        identityNumber: donation.person?.identityNumber || '',
        amount: donation.amount,
        donationDate: new Date(donation.donationDate),
        donationType: donation.donationType || 'ONE_TIME',
        paymentMethod: donation.paymentMethod || 'CASH',
        purpose: donation.purpose,
        campaign: donation.campaign,
        isRecurring: donation.isRecurring || false,
        receiptNumber: donation.receiptNumber,
      }));

      // Sort by date descending (newest first)
      items.sort((a, b) => b.donationDate.getTime() - a.donationDate.getTime());
      this.donations.set(items);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setYearFilter(year: number): void {
    this.yearFilter.set(year);
  }

  setTypeFilter(type: 'ALL' | 'ONE_TIME' | 'RECURRING'): void {
    this.typeFilter.set(type);
  }

  getPaymentMethodText(method: string, t: (key: string) => string): string {
    switch (method) {
      case 'CASH': return t('donations.paymentMethods.cash');
      case 'CHECK': return t('donations.paymentMethods.check');
      case 'CREDIT_CARD': return t('donations.paymentMethods.creditCard');
      case 'BANK_TRANSFER': return t('donations.paymentMethods.bankTransfer');
      default: return t('donations.paymentMethods.other');
    }
  }

  exportReport(): void {
    const headers = ['Donation #', 'Donor', 'ID', 'Amount', 'Date', 'Payment Method', 'Type'];
    const rows = this.filteredDonations().map(d => [
      d.donationNumber,
      d.personName,
      d.identityNumber,
      d.amount.toString(),
      new Date(d.donationDate).toLocaleDateString('he-IL'),
      d.paymentMethod,
      d.isRecurring ? 'Recurring' : 'One-Time',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-summary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }
}
