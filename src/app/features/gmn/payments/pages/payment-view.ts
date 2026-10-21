import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideEdit,
  lucideCreditCard,
  lucideUser,
  lucideCalendar,
  lucideAlertCircle,
  lucideCheckCircle,
  lucideClock,
  lucidePrinter,
  lucideReceipt,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-payment-view',
  standalone: true,
  imports: [
    CommonModule,
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
      lucideCreditCard,
      lucideUser,
      lucideCalendar,
      lucideAlertCircle,
      lucideCheckCircle,
      lucideClock,
      lucidePrinter,
      lucideReceipt,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      @if (payment()) {
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/payments">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <h1 class="text-2xl font-bold">{{ t('payments.title') }} - {{ t('common.details') }}</h1>
              <p class="text-muted-foreground">{{ getPersonName(payment()!.personId) }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button hlmBtn variant="outline" (click)="printReceipt()">
              <ng-icon name="lucidePrinter" class="me-2 h-4 w-4" />
              {{ t('common.print') }}
            </button>
            @if (payment()!.status === 'PENDING') {
              <button hlmBtn (click)="markAsPaid()">
                <ng-icon name="lucideCheckCircle" class="me-2 h-4 w-4" />
                {{ t('loans.payments.paid') }}
              </button>
            }
          </div>
        </div>

        <!-- Status Card -->
        <div hlmCard class="p-6" [class]="getStatusCardClass(payment()!.status)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <ng-icon [name]="getStatusIcon(payment()!.status)" class="h-7 w-7" />
              </div>
              <div>
                <p class="text-lg font-bold">₪{{ formatNumber(payment()!.amount) }}</p>
                <p class="text-sm opacity-80">{{ t('payments.fields.dueDate') }}: {{ formatDate(payment()!.dueDate) }}</p>
              </div>
            </div>
            <span hlmBadge [variant]="getStatusVariant(payment()!.status)" class="text-sm">
              {{ getStatusName(payment()!.status) }}
            </span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Payment Details -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('common.details') }}</h3>
            <div class="grid gap-3">
              <div class="flex justify-between">
                <span class="text-muted-foreground">{{ t('payments.fields.dueDate') }}:</span>
                <span>{{ formatDate(payment()!.dueDate) }}</span>
              </div>
              @if (payment()!.paidDate) {
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('payments.fields.paidDate') }}:</span>
                  <span>{{ formatDate(payment()!.paidDate!) }}</span>
                </div>
              }
              <div class="flex justify-between">
                <span class="text-muted-foreground">{{ t('common.amount') }}:</span>
                <span class="font-semibold">₪{{ formatNumber(payment()!.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">{{ t('payments.fields.type') }}:</span>
                <span>{{ getEntityTypeName(payment()!.entityType) }}</span>
              </div>
              @if (payment()!.entityType === 'LOAN' && relatedLoan()) {
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loans.fields.loanNumber') }}:</span>
                  <a [routerLink]="['/gmn/loans', relatedLoan()!.id]" class="text-primary hover:underline">
                    {{ relatedLoan()!.loanNumber }}
                  </a>
                </div>
              }
              <div class="flex justify-between">
                <span class="text-muted-foreground">{{ t('common.status') }}:</span>
                <span hlmBadge [variant]="getStatusVariant(payment()!.status)">
                  {{ getStatusName(payment()!.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Person Info -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('payments.fields.payer') }}</h3>
            <div class="flex items-center gap-4 mb-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ng-icon name="lucideUser" class="h-6 w-6" />
              </div>
              <div>
                <a [routerLink]="['/gmn/people', payment()!.personId]" class="font-medium text-primary hover:underline">
                  {{ getPersonName(payment()!.personId) }}
                </a>
                <p class="text-sm text-muted-foreground">{{ getPersonPhone(payment()!.personId) }}</p>
              </div>
            </div>
            @if (relatedLoan()) {
              <div class="mt-4 pt-4 border-t">
                <h4 class="text-sm font-medium mb-2">{{ t('loans.title') }} {{ t('common.details') }}</h4>
                <div class="grid gap-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('loans.fields.monthlyPayment') }}:</span>
                    <span>₪{{ formatNumber(relatedLoan()!.monthlyPayment) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('loans.fields.currentBalance') }}:</span>
                    <span>₪{{ formatNumber(relatedLoan()!.currentBalance || 0) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('loans.fields.paidPayments') }}:</span>
                    <span>{{ relatedLoan()!.paidPaymentsCount || 0 }}/{{ relatedLoan()!.numberOfPayments }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Payment History for this entity -->
          @if (entityPayments().length > 0) {
            <div hlmCard class="p-6 lg:col-span-2">
              <h3 class="mb-4 font-semibold border-b pb-2">{{ t('loans.tabs.payments') }} ({{ entityPayments().length }})</h3>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="p-2 text-start text-sm font-medium">{{ t('payments.fields.dueDate') }}</th>
                      <th class="p-2 text-start text-sm font-medium">{{ t('common.amount') }}</th>
                      <th class="p-2 text-start text-sm font-medium">{{ t('payments.fields.paidDate') }}</th>
                      <th class="p-2 text-start text-sm font-medium">{{ t('common.status') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of entityPayments().slice(0, 6); track p.id) {
                      <tr class="border-b" [class.bg-primary/5]="p.id === payment()!.id">
                        <td class="p-2 text-sm">{{ formatDate(p.dueDate) }}</td>
                        <td class="p-2 text-sm font-medium">₪{{ formatNumber(p.amount) }}</td>
                        <td class="p-2 text-sm">{{ p.paidDate ? formatDate(p.paidDate) : '-' }}</td>
                        <td class="p-2">
                          <span hlmBadge [variant]="getStatusVariant(p.status)" class="text-xs">
                            {{ getStatusName(p.status) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      } @else {
        <div hlmCard class="p-8 text-center">
          <ng-icon name="lucideAlertCircle" class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p class="text-lg font-medium">{{ t('common.noData') }}</p>
          <button hlmBtn class="mt-4" routerLink="/gmn/payments">{{ t('common.back') }}</button>
        </div>
      }
    </div>
  `,
})
export default class PaymentViewPage {
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);
  private readonly transloco = inject(TranslocoService);

  readonly payment = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.mockService.payLines().find(p => p.id === id);
  });

  readonly relatedLoan = computed(() => {
    const p = this.payment();
    if (!p || p.entityType !== 'LOAN') return null;
    return this.mockService.loans().find(l => l.id === p.entityId);
  });

  readonly entityPayments = computed(() => {
    const p = this.payment();
    if (!p) return [];
    return this.mockService.payLines()
      .filter(pl => pl.entityType === p.entityType && pl.entityId === p.entityId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    if (!person) return this.transloco.translate('gmn.common.noData');
    return person.fullName || `${person.firstName} ${person.lastName}`;
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

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'PAID': return 'default';
      case 'PENDING': return 'secondary';
      case 'OVERDUE': return 'destructive';
      case 'PARTIAL': return 'outline';
      default: return 'outline';
    }
  }

  getStatusName(status: string): string {
    const keyMap: Record<string, string> = {
      'PAID': 'gmn.loans.payments.paid',
      'PENDING': 'gmn.payments.status.pending',
      'OVERDUE': 'gmn.loans.payments.late',
      'PARTIAL': 'gmn.loans.payments.partial',
    };
    return this.transloco.translate(keyMap[status] || status);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PAID': return 'lucideCheckCircle';
      case 'PENDING': return 'lucideClock';
      case 'OVERDUE': return 'lucideAlertCircle';
      default: return 'lucideCreditCard';
    }
  }

  getStatusCardClass(status: string): string {
    switch (status) {
      case 'PAID': return 'bg-green-500 text-white';
      case 'PENDING': return 'bg-amber-500 text-white';
      case 'OVERDUE': return 'bg-red-500 text-white';
      default: return 'bg-muted';
    }
  }

  getEntityTypeName(type: string): string {
    const keyMap: Record<string, string> = {
      'LOAN': 'gmn.payments.types.loanPayment',
      'SAVING': 'gmn.payments.types.savingDeposit',
      'DONATION': 'gmn.payments.types.donation',
    };
    return this.transloco.translate(keyMap[type] || type);
  }

  markAsPaid(): void {
    console.log('Mark as paid:', this.payment()?.id);
    // TODO: Implement mark as paid
  }

  printReceipt(): void {
    window.print();
  }
}
