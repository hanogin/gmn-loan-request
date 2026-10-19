import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucidePlus,
  lucideEye,
  lucideEdit,
  lucideHeart,
  lucideChevronLeft,
  lucideChevronRight,
  lucideX,
  lucideTrendingUp,
  lucideCalendar,
  lucideReceipt,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-donations-list',
  standalone: true,
  imports: [
    TranslocoModule,
    FormsModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucidePlus,
      lucideEye,
      lucideEdit,
      lucideHeart,
      lucideChevronLeft,
      lucideChevronRight,
      lucideX,
      lucideTrendingUp,
      lucideCalendar,
      lucideReceipt,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('donations.title') }}</h1>
          <p class="text-muted-foreground">{{ t('donations.subtitle') }}</p>
        </div>
        <button hlmBtn routerLink="/gmn/donations/new">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('donations.newDonation') }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideTrendingUp" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('reports.donationsSummary.totalAmount') }}</p>
              <p class="text-xl font-bold text-green-600">₪{{ formatNumber(thisYearTotal()) }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideCalendar" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('donations.stats.thisMonth') }}</p>
              <p class="text-xl font-bold">₪{{ formatNumber(thisMonthTotal()) }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideHeart" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('donations.stats.totalDonations') }}</p>
              <p class="text-xl font-bold">{{ totalDonations() }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideReceipt" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">{{ t('donations.stats.averageDonation') }}</p>
              <p class="text-xl font-bold">₪{{ formatNumber(averageDonation()) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="relative flex-1 min-w-[200px]">
            <ng-icon name="lucideSearch" class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              hlmInput
              type="text"
              [placeholder]="t('donations.searchPlaceholder')"
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
            />
          </div>

          <brn-select [(ngModel)]="paymentMethodFilter" class="w-[180px]">
            <hlm-select-trigger>
              <hlm-select-value [placeholder]="t('donations.fields.paymentMethod')" />
            </hlm-select-trigger>
            <hlm-select-content>
              <hlm-select-item value="">{{ t('common.all') }}</hlm-select-item>
              <hlm-select-item value="CASH">{{ t('donations.paymentMethods.cash') }}</hlm-select-item>
              <hlm-select-item value="CHECK">{{ t('donations.paymentMethods.check') }}</hlm-select-item>
              <hlm-select-item value="TRANSFER">{{ t('donations.paymentMethods.bankTransfer') }}</hlm-select-item>
              <hlm-select-item value="CREDIT">{{ t('donations.paymentMethods.creditCard') }}</hlm-select-item>
            </hlm-select-content>
          </brn-select>

          <brn-select [(ngModel)]="yearFilter" class="w-[140px]">
            <hlm-select-trigger>
              <hlm-select-value placeholder="Year" />
            </hlm-select-trigger>
            <hlm-select-content>
              <hlm-select-item value="">{{ t('common.all') }}</hlm-select-item>
              <hlm-select-item value="2026">2026</hlm-select-item>
              <hlm-select-item value="2025">2025</hlm-select-item>
              <hlm-select-item value="2024">2024</hlm-select-item>
            </hlm-select-content>
          </brn-select>

          @if (searchQuery() || paymentMethodFilter() || yearFilter()) {
            <button hlmBtn variant="ghost" size="sm" (click)="clearFilters()">
              <ng-icon name="lucideX" class="me-1 h-4 w-4" />
              {{ t('common.filter') }}
            </button>
          }
        </div>
      </div>

      <!-- Donations Table -->
      <div hlmCard>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b bg-muted/50">
                <th class="p-3 text-start font-medium">{{ t('common.date') }}</th>
                <th class="p-3 text-start font-medium">{{ t('donations.fields.donor') }}</th>
                <th class="p-3 text-start font-medium">{{ t('common.amount') }}</th>
                <th class="p-3 text-start font-medium">{{ t('donations.fields.paymentMethod') }}</th>
                <th class="p-3 text-start font-medium">{{ t('donations.fields.purpose') }}</th>
                <th class="p-3 text-start font-medium">{{ t('donations.fields.receiptNumber') }}</th>
                <th class="p-3 text-center font-medium">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (donation of paginatedDonations(); track donation.id) {
                <tr class="border-b hover:bg-muted/50 transition-colors">
                  <td class="p-3 text-sm">{{ formatDate(donation.donationDate) }}</td>
                  <td class="p-3">
                    <a [routerLink]="['/gmn/people', donation.personId]" class="text-primary hover:underline">
                      {{ getPersonName(donation.personId) }}
                    </a>
                  </td>
                  <td class="p-3 font-semibold text-green-600">₪{{ formatNumber(donation.amount) }}</td>
                  <td class="p-3 text-sm">{{ donation.paymentMethodName || getPaymentMethodName(donation.paymentMethod) }}</td>
                  <td class="p-3 text-sm text-muted-foreground">{{ donation.purposeName || donation.purpose || t('donations.types.oneTime') }}</td>
                  <td class="p-3">
                    @if (donation.receiptNumber) {
                      <span class="font-mono text-sm">{{ donation.receiptNumber }}</span>
                    } @else {
                      <span class="text-muted-foreground">-</span>
                    }
                  </td>
                  <td class="p-3">
                    <div class="flex items-center justify-center gap-1">
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/donations', donation.id]">
                        <ng-icon name="lucideEye" class="h-4 w-4" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" [routerLink]="['/gmn/donations', donation.id, 'edit']">
                        <ng-icon name="lucideEdit" class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="p-8 text-center text-muted-foreground">
                    <ng-icon name="lucideHeart" class="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>{{ t('common.noData') }}</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between border-t p-4">
            <p class="text-sm text-muted-foreground">
              {{ startIndex() + 1 }}-{{ endIndex() }} / {{ filteredDonations().length }}
            </p>
            <div class="flex items-center gap-2">
              <button hlmBtn variant="outline" size="icon" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
                <ng-icon name="lucideChevronRight" class="h-4 w-4" />
              </button>
              <span class="px-3 text-sm">{{ currentPage() }} / {{ totalPages() }}</span>
              <button hlmBtn variant="outline" size="icon" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
                <ng-icon name="lucideChevronLeft" class="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class DonationsListPage {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  paymentMethodFilter = signal('');
  yearFilter = signal('');
  currentPage = signal(1);
  pageSize = 15;

  // Stats
  readonly thisYearTotal = computed(() => {
    const thisYear = new Date().getFullYear();
    return this.mockService.donations()
      .filter(d => new Date(d.donationDate).getFullYear() === thisYear)
      .reduce((sum, d) => sum + d.amount, 0);
  });
  readonly thisMonthTotal = computed(() => {
    const now = new Date();
    return this.mockService.donations()
      .filter(d => {
        const date = new Date(d.donationDate);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      })
      .reduce((sum, d) => sum + d.amount, 0);
  });
  readonly totalDonations = computed(() => this.mockService.donations().length);
  readonly averageDonation = computed(() => {
    const donations = this.mockService.donations();
    if (donations.length === 0) return 0;
    return donations.reduce((sum, d) => sum + d.amount, 0) / donations.length;
  });

  readonly filteredDonations = computed(() => {
    let donations = this.mockService.donations();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      donations = donations.filter(donation => {
        const person = this.mockService.persons().find(p => p.id === donation.personId);
        const personName = person?.fullName?.toLowerCase() || '';
        return personName.includes(query);
      });
    }

    if (this.paymentMethodFilter()) {
      donations = donations.filter(d => d.paymentMethod === this.paymentMethodFilter());
    }

    if (this.yearFilter()) {
      const year = parseInt(this.yearFilter());
      donations = donations.filter(d => new Date(d.donationDate).getFullYear() === year);
    }

    return donations.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredDonations().length / this.pageSize));
  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredDonations().length));

  readonly paginatedDonations = computed(() =>
    this.filteredDonations().slice(this.startIndex(), this.endIndex())
  );

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    if (!person) return this.transloco.translate('gmn.common.noData');
    return person.fullName || `${person.firstName} ${person.lastName}`;
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  getPaymentMethodName(method: string): string {
    const keyMap: Record<string, string> = {
      'CASH': 'gmn.donations.paymentMethods.cash',
      'CHECK': 'gmn.donations.paymentMethods.check',
      'TRANSFER': 'gmn.donations.paymentMethods.bankTransfer',
      'CREDIT': 'gmn.donations.paymentMethods.creditCard',
      'MASAV': 'gmn.masav.title',
    };
    return this.transloco.translate(keyMap[method] || method);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.paymentMethodFilter.set('');
    this.yearFilter.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }
}
