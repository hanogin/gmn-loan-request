import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideEdit,
  lucideHeart,
  lucideUser,
  lucideCalendar,
  lucideCreditCard,
  lucideAlertCircle,
  lucideReceipt,
  lucidePrinter,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-donation-view',
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
      lucideArrowRight,
      lucideEdit,
      lucideHeart,
      lucideUser,
      lucideCalendar,
      lucideCreditCard,
      lucideAlertCircle,
      lucideReceipt,
      lucidePrinter,
    }),
  ],
  template: `
    <div class="space-y-6" >
      @if (donation()) {
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/donations">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <h1 class="text-2xl font-bold">פרטי תרומה</h1>
              <p class="text-muted-foreground">{{ getPersonName(donation()!.personId) }} - {{ formatDate(donation()!.donationDate) }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button hlmBtn variant="outline" (click)="printReceipt()">
              <ng-icon name="lucidePrinter" class="me-2 h-4 w-4" />
              הדפס קבלה
            </button>
            <button hlmBtn variant="outline" [routerLink]="['/gmn/donations', donation()!.id, 'edit']">
              <ng-icon name="lucideEdit" class="me-2 h-4 w-4" />
              עריכה
            </button>
          </div>
        </div>

        <!-- Amount Card -->
        <div hlmCard class="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <ng-icon name="lucideHeart" class="mx-auto mb-4 h-12 w-12 text-green-600" />
          <p class="text-sm text-muted-foreground">סכום התרומה</p>
          <p class="text-4xl font-bold text-green-600">₪{{ formatNumber(donation()!.amount) }}</p>
        </div>

        <!-- Details -->
        <div class="grid gap-6 lg:grid-cols-2">
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי התרומה</h3>
            <div class="grid gap-3">
              <div class="flex justify-between">
                <span class="text-muted-foreground">תאריך:</span>
                <span>{{ formatDate(donation()!.donationDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">סכום:</span>
                <span class="font-semibold text-green-600">₪{{ formatNumber(donation()!.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">אמצעי תשלום:</span>
                <span>{{ donation()!.paymentMethodName || getPaymentMethodName(donation()!.paymentMethod) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">ייעוד:</span>
                <span>{{ donation()!.purposeName || donation()!.purpose || 'כללי' }}</span>
              </div>
              @if (donation()!.receiptNumber) {
                <div class="flex justify-between">
                  <span class="text-muted-foreground">מספר קבלה:</span>
                  <span class="font-mono">{{ donation()!.receiptNumber }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Donor Info -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי התורם</h3>
            <div class="flex items-center gap-4 mb-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ng-icon name="lucideUser" class="h-6 w-6" />
              </div>
              <div>
                <a [routerLink]="['/gmn/people', donation()!.personId]" class="font-medium text-primary hover:underline">
                  {{ getPersonName(donation()!.personId) }}
                </a>
                <p class="text-sm text-muted-foreground">{{ getPersonPhone(donation()!.personId) }}</p>
              </div>
            </div>
            @if (getPersonEmail(donation()!.personId)) {
              <div class="text-sm text-muted-foreground">
                {{ getPersonEmail(donation()!.personId) }}
              </div>
            }
          </div>

          <!-- Notes -->
          @if (donation()!.notes) {
            <div hlmCard class="p-6 lg:col-span-2">
              <h3 class="mb-4 font-semibold border-b pb-2">הערות</h3>
              <p class="text-muted-foreground whitespace-pre-wrap">{{ donation()!.notes }}</p>
            </div>
          }
        </div>
      } @else {
        <div hlmCard class="p-8 text-center">
          <ng-icon name="lucideAlertCircle" class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p class="text-lg font-medium">תרומה לא נמצאה</p>
          <button hlmBtn class="mt-4" routerLink="/gmn/donations">חזרה לרשימה</button>
        </div>
      }
    </div>
  `,
})
export default class DonationViewPage {
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);

  readonly donation = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.mockService.donations().find(d => d.id === id);
  });

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || `${person?.firstName} ${person?.lastName}` || 'לא ידוע';
  }

  getPersonPhone(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.contact?.mobilePhone || person?.contact?.phone || '-';
  }

  getPersonEmail(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.contact?.email || '';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  getPaymentMethodName(method: string): string {
    const names: Record<string, string> = {
      'CASH': 'מזומן',
      'CHECK': 'צ\'ק',
      'TRANSFER': 'העברה',
      'CREDIT': 'אשראי',
      'MASAV': 'מס"ב',
    };
    return names[method] || method;
  }

  printReceipt(): void {
    console.log('Print receipt for donation:', this.donation()?.id);
    // TODO: Implement print receipt
  }
}
