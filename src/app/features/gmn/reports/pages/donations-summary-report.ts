import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideHeart, lucideDownload } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-donations-summary-report',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({ lucideArrowRight, lucideHeart, lucideDownload }),
  ],
  template: `
    <div class="space-y-6" >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/reports">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">סיכום תרומות</h1>
            <p class="text-muted-foreground">סטטיסטיקה וניתוח תרומות</p>
          </div>
        </div>
        <button hlmBtn variant="outline">
          <ng-icon name="lucideDownload" class="me-2 h-4 w-4" />
          ייצוא
        </button>
      </div>

      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">סה"כ תרומות</p>
          <p class="text-3xl font-bold">{{ totalDonations() }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">השנה</p>
          <p class="text-3xl font-bold text-green-600">₪{{ formatNumber(thisYearTotal()) }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">החודש</p>
          <p class="text-3xl font-bold text-blue-600">₪{{ formatNumber(thisMonthTotal()) }}</p>
        </div>
        <div hlmCard class="p-4 text-center">
          <p class="text-sm text-muted-foreground">ממוצע תרומה</p>
          <p class="text-3xl font-bold text-purple-600">₪{{ formatNumber(averageDonation()) }}</p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- By Payment Method -->
        <div hlmCard class="p-6">
          <h3 class="font-semibold mb-4 border-b pb-2">לפי אמצעי תשלום</h3>
          <div class="space-y-3">
            @for (method of byPaymentMethod(); track method.method) {
              <div class="flex items-center justify-between">
                <span>{{ method.label }}</span>
                <div class="text-start">
                  <span class="font-semibold">₪{{ formatNumber(method.amount) }}</span>
                  <span class="text-sm text-muted-foreground ms-2">({{ method.count }})</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Top Donors -->
        <div hlmCard class="p-6">
          <h3 class="font-semibold mb-4 border-b pb-2">תורמים מובילים (השנה)</h3>
          <div class="space-y-3">
            @for (donor of topDonors(); track donor.personId; let i = $index) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">{{ i + 1 }}.</span>
                  <a [routerLink]="['/gmn/people', donor.personId]" class="text-primary hover:underline">
                    {{ donor.name }}
                  </a>
                </div>
                <span class="font-semibold text-green-600">₪{{ formatNumber(donor.total) }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Monthly Trend -->
        <div hlmCard class="p-6 lg:col-span-2">
          <h3 class="font-semibold mb-4 border-b pb-2">מגמה חודשית (12 חודשים אחרונים)</h3>
          <div class="grid grid-cols-6 sm:grid-cols-12 gap-2">
            @for (month of monthlyTrend(); track month.month) {
              <div class="text-center">
                <div class="text-xs text-muted-foreground mb-1">{{ month.month }}</div>
                <div class="bg-green-100 dark:bg-green-900/30 rounded h-20 flex items-end justify-center">
                  <div 
                    class="bg-green-500 rounded-t w-full"
                    [style.height.%]="month.percentage"
                  ></div>
                </div>
                <div class="text-xs font-mono mt-1">{{ formatShort(month.amount) }}</div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class DonationsSummaryReportPage {
  private readonly mockService = inject(GmnMockService);

  readonly totalDonations = computed(() => this.mockService.donations().length);
  
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

  readonly averageDonation = computed(() => {
    const donations = this.mockService.donations();
    return donations.length > 0 ? 
      donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0;
  });

  readonly byPaymentMethod = computed(() => {
    const methods: Record<string, { amount: number; count: number }> = {};
    for (const d of this.mockService.donations()) {
      const method = d.paymentMethod || 'OTHER';
      if (!methods[method]) {
        methods[method] = { amount: 0, count: 0 };
      }
      methods[method].amount += d.amount;
      methods[method].count++;
    }

    const labels: Record<string, string> = {
      'CASH': 'מזומן',
      'CHECK': 'צ\'ק',
      'TRANSFER': 'העברה',
      'CREDIT': 'אשראי',
      'MASAV': 'מס"ב',
      'OTHER': 'אחר',
    };

    return Object.entries(methods)
      .map(([method, data]) => ({
        method,
        label: labels[method] || method,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  readonly topDonors = computed(() => {
    const thisYear = new Date().getFullYear();
    const donorTotals: Record<number, number> = {};
    
    for (const d of this.mockService.donations()) {
      if (new Date(d.donationDate).getFullYear() === thisYear) {
        donorTotals[d.personId] = (donorTotals[d.personId] || 0) + d.amount;
      }
    }

    return Object.entries(donorTotals)
      .map(([personId, total]) => {
        const person = this.mockService.persons().find(p => p.id === Number(personId));
        return {
          personId: Number(personId),
          name: person?.fullName || `${person?.firstName} ${person?.lastName}` || 'לא ידוע',
          total,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  });

  readonly monthlyTrend = computed(() => {
    const months: Array<{ month: string; amount: number; percentage: number }> = [];
    const now = new Date();
    
    let maxAmount = 0;
    const monthlyAmounts: number[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const amount = this.mockService.donations()
        .filter(d => {
          const dDate = new Date(d.donationDate);
          return dDate.getFullYear() === date.getFullYear() && dDate.getMonth() === date.getMonth();
        })
        .reduce((sum, d) => sum + d.amount, 0);
      
      monthlyAmounts.push(amount);
      if (amount > maxAmount) maxAmount = amount;
    }

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const amount = monthlyAmounts[11 - i];
      months.push({
        month: date.toLocaleDateString('he-IL', { month: 'short' }),
        amount,
        percentage: maxAmount > 0 ? (amount / maxAmount) * 100 : 0,
      });
    }

    return months;
  });

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  formatShort(num: number): string {
    if (num >= 1000) {
      return Math.round(num / 1000) + 'k';
    }
    return num.toString();
  }
}
