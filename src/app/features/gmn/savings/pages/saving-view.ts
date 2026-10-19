import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideEdit,
  lucidePiggyBank,
  lucideUser,
  lucideCalendar,
  lucidePercent,
  lucideCreditCard,
  lucideAlertCircle,
  lucideBanknote,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-saving-view',
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
      lucidePiggyBank,
      lucideUser,
      lucideCalendar,
      lucidePercent,
      lucideCreditCard,
      lucideAlertCircle,
      lucideBanknote,
    }),
  ],
  template: `
    <div class="space-y-6" >
      @if (saving()) {
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/savings">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold">פיקדון {{ saving()!.savingNumber }}</h1>
                <span hlmBadge [variant]="getStatusVariant(saving()!.status)">
                  {{ saving()!.statusName || getStatusName(saving()!.status) }}
                </span>
              </div>
              <p class="text-muted-foreground">{{ getPersonName(saving()!.personId) }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            @if (saving()!.status === 'ACTIVE') {
              <button hlmBtn variant="outline" (click)="closeSaving()">
                <ng-icon name="lucideBanknote" class="me-2 h-4 w-4" />
                החזרת פיקדון
              </button>
            }
            <button hlmBtn variant="outline" [routerLink]="['/gmn/savings', saving()!.id, 'edit']">
              <ng-icon name="lucideEdit" class="me-2 h-4 w-4" />
              עריכה
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
                <p class="text-sm text-muted-foreground">יתרה נוכחית</p>
                <p class="text-xl font-bold">₪{{ formatNumber(saving()!.currentBalance) }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <ng-icon name="lucidePercent" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">ריבית שנתית</p>
                <p class="text-xl font-bold">{{ saving()!.interestRate || 0 }}%</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <ng-icon name="lucideBanknote" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">ריבית שנצברה</p>
                <p class="text-xl font-bold text-green-600">₪{{ formatNumber(saving()!.accruedInterest) }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ng-icon name="lucideCalendar" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">ימים לפדיון</p>
                <p class="text-xl font-bold">{{ daysToMaturity() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="grid gap-6 lg:grid-cols-2">
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי הפיקדון</h3>
            <div class="grid gap-3">
              <div class="flex justify-between">
                <span class="text-muted-foreground">מספר פיקדון:</span>
                <span class="font-mono">{{ saving()!.savingNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">סכום התחלתי:</span>
                <span class="font-semibold">₪{{ formatNumber(saving()!.initialAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">יתרה נוכחית:</span>
                <span class="font-semibold">₪{{ formatNumber(saving()!.currentBalance) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">ריבית שנתית:</span>
                <span>{{ saving()!.interestRate || 0 }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">סוג פיקדון:</span>
                <span>{{ saving()!.savingTypeName || getSavingTypeName(saving()!.savingType) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">אמצעי תשלום:</span>
                <span>{{ getPaymentMethodName(saving()!.paymentMethod) }}</span>
              </div>
            </div>
          </div>

          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">תאריכים</h3>
            <div class="grid gap-3">
              <div class="flex justify-between">
                <span class="text-muted-foreground">תאריך פתיחה:</span>
                <span>{{ formatDate(saving()!.openDate) }}</span>
              </div>
              @if (saving()!.maturityDate) {
                <div class="flex justify-between">
                  <span class="text-muted-foreground">תאריך פדיון:</span>
                  <span [class.text-amber-600]="isNearMaturity()">{{ formatDate(saving()!.maturityDate!) }}</span>
                </div>
              }
              @if (saving()!.status === 'CLOSED') {
                <div class="flex justify-between">
                  <span class="text-muted-foreground">סטטוס:</span>
                  <span>נסגר</span>
                </div>
              }
              <div class="flex justify-between">
                <span class="text-muted-foreground">תקופה:</span>
                <span>{{ saving()!.termMonths || '-' }} חודשים</span>
              </div>
            </div>
          </div>

          <!-- Person Info -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי המפקיד</h3>
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ng-icon name="lucideUser" class="h-6 w-6" />
              </div>
              <div>
                <a [routerLink]="['/gmn/people', saving()!.personId]" class="font-medium text-primary hover:underline">
                  {{ getPersonName(saving()!.personId) }}
                </a>
                <p class="text-sm text-muted-foreground">{{ getPersonPhone(saving()!.personId) }}</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          @if (saving()!.notes) {
            <div hlmCard class="p-6">
              <h3 class="mb-4 font-semibold border-b pb-2">הערות</h3>
              <p class="text-muted-foreground whitespace-pre-wrap">{{ saving()!.notes }}</p>
            </div>
          }
        </div>
      } @else {
        <div hlmCard class="p-8 text-center">
          <ng-icon name="lucideAlertCircle" class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p class="text-lg font-medium">פיקדון לא נמצא</p>
          <button hlmBtn class="mt-4" routerLink="/gmn/savings">חזרה לרשימה</button>
        </div>
      }
    </div>
  `,
})
export default class SavingViewPage {
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);

  readonly saving = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.mockService.savings().find(s => s.id === id);
  });

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || `${person?.firstName} ${person?.lastName}` || 'לא ידוע';
  }

  getPersonPhone(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.contact?.mobilePhone || person?.contact?.phone || '-';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  isNearMaturity(): boolean {
    if (!this.saving() || !this.saving()!.maturityDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(this.saving()!.maturityDate!) <= thirtyDaysFromNow;
  }

  daysToMaturity(): number {
    if (!this.saving() || !this.saving()!.maturityDate) return 0;
    const today = new Date();
    const maturity = new Date(this.saving()!.maturityDate!);
    const diff = maturity.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getSavingTypeName(type: string): string {
    const names: Record<string, string> = {
      'REGULAR': 'רגיל',
      'LOAN_COLLATERAL': 'בטוחה להלוואה',
      'RECURRING': 'חוזר',
      'FIXED_TERM': 'תקופה קצובה',
    };
    return names[type] || type;
  }

  getPaymentMethodName(method?: string): string {
    if (!method) return '-';
    const names: Record<string, string> = {
      'CASH': 'מזומן',
      'CHECK': 'צ\'ק',
      'BANK_TRANSFER': 'העברה בנקאית',
      'CREDIT_CARD': 'כרטיס אשראי',
      'MASAV': 'מס"ב',
      'STANDING_ORDER': 'הוראת קבע',
    };
    return names[method] || method;
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'MATURED': return 'secondary';
      case 'CLOSED': return 'outline';
      default: return 'outline';
    }
  }

  getStatusName(status: string): string {
    const names: Record<string, string> = {
      'ACTIVE': 'פעיל',
      'MATURED': 'הבשיל',
      'CLOSED': 'נסגר',
      'FROZEN': 'מוקפא',
      'PENDING_WITHDRAWAL': 'ממתין למשיכה',
    };
    return names[status] || status;
  }

  closeSaving(): void {
    console.log('Close saving:', this.saving()?.id);
    // TODO: Implement close saving dialog
  }
}
