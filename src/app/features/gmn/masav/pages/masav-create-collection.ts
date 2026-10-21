import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideFileDown,
  lucideCalendar,
  lucideCheck,
  lucideLoader2,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';

import { GmnMockService } from '../../../../core/services/mock-data';

interface CollectionItem {
  id: number;
  loanId: number;
  loanNumber: string;
  personId: number;
  personName: string;
  identityNumber: string;
  bankCode: string;
  branchCode: string;
  accountNumber: string;
  amount: number;
  dueDate: Date;
  selected: boolean;
}

@Component({
  selector: 'gmn-masav-create-collection',
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
    HlmCheckboxImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideFileDown,
      lucideCalendar,
      lucideCheck,
      lucideLoader2,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/masav">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('masav.collection.title') }}</h1>
            <p class="text-muted-foreground">{{ t('masav.dashboard.createCollection') }}</p>
          </div>
        </div>
      </div>

      <!-- Execution Date -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideCalendar" class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('masav.collection.executionDate') }}:</span>
          </div>
          <input hlmInput type="date" [(ngModel)]="executionDate" class="w-[180px]" [min]="minDate" />
          <p class="text-sm text-muted-foreground">
            (Must be at least 2 business days from today)
          </p>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div hlmCard class="p-4">
          <p class="text-sm text-muted-foreground">{{ t('masav.collection.selectPayments') }}</p>
          <p class="text-2xl font-bold">{{ selectedItems().length }}</p>
        </div>
        <div hlmCard class="p-4">
          <p class="text-sm text-muted-foreground">{{ t('masav.files.totalAmount') }}</p>
          <p class="text-2xl font-bold text-green-600">₪{{ formatNumber(totalSelectedAmount()) }}</p>
        </div>
        <div hlmCard class="p-4">
          <p class="text-sm text-muted-foreground">Available for Collection</p>
          <p class="text-2xl font-bold">{{ items().length }}</p>
        </div>
      </div>

      <!-- Items Table -->
      <div hlmCard>
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              [checked]="allSelected()"
              (change)="toggleSelectAll()"
              class="h-4 w-4 rounded border-gray-300"
            />
            <span class="text-sm font-medium">Select All</span>
          </div>
          <p class="text-sm text-muted-foreground">
            {{ selectedItems().length }} of {{ items().length }} selected
          </p>
        </div>

        <table hlmTable class="w-full">
          <thead>
            <tr hlmTrow>
              <th hlmTh class="w-[50px]"></th>
              <th hlmTh class="text-start">{{ t('loans.fields.loanNumber') }}</th>
              <th hlmTh class="text-start">{{ t('common.name') }}</th>
              <th hlmTh class="text-start">{{ t('common.bankAccount') }}</th>
              <th hlmTh class="text-start">{{ t('payments.fields.dueDate') }}</th>
              <th hlmTh class="text-end">{{ t('common.amount') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr hlmTrow [class.bg-primary/5]="item.selected">
                <td hlmTd>
                  <input
                    type="checkbox"
                    [checked]="item.selected"
                    (change)="toggleItem(item)"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                </td>
                <td hlmTd>
                  <a [routerLink]="['/gmn/loans', item.loanId]" class="font-mono text-primary hover:underline">
                    {{ item.loanNumber }}
                  </a>
                </td>
                <td hlmTd>
                  <div>
                    <p class="font-medium">{{ item.personName }}</p>
                    <p class="text-xs text-muted-foreground">{{ item.identityNumber }}</p>
                  </div>
                </td>
                <td hlmTd class="font-mono text-sm">
                  {{ item.bankCode }}-{{ item.branchCode }}-{{ item.accountNumber }}
                </td>
                <td hlmTd class="text-sm">{{ formatDate(item.dueDate) }}</td>
                <td hlmTd class="text-end font-medium">₪{{ formatNumber(item.amount) }}</td>
              </tr>
            } @empty {
              <tr hlmTrow>
                <td hlmTd colspan="6" class="py-8 text-center text-muted-foreground">
                  <ng-icon name="lucideAlertCircle" class="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>No pending payments for collection</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button hlmBtn variant="outline" routerLink="/gmn/masav">
          {{ t('common.cancel') }}
        </button>
        <button hlmBtn [disabled]="selectedItems().length === 0 || isGenerating()" (click)="generateFile()">
          @if (isGenerating()) {
            <ng-icon name="lucideLoader2" class="me-2 h-4 w-4 animate-spin" />
          } @else {
            <ng-icon name="lucideFileDown" class="me-2 h-4 w-4" />
          }
          {{ t('masav.collection.generate') }} ({{ selectedItems().length }})
        </button>
      </div>
    </div>
  `,
})
export default class MasavCreateCollectionPage {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  executionDate = signal(this.getDefaultExecutionDate());
  isGenerating = signal(false);

  get minDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  }

  private getDefaultExecutionDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split('T')[0];
  }

  // Generate mock collection items from loans
  readonly items = signal<CollectionItem[]>(this.generateItems());

  private generateItems(): CollectionItem[] {
    const loans = this.mockService.loans().filter(l => l.status === 'ACTIVE' && l.masavActive);
    const persons = this.mockService.persons();
    const items: CollectionItem[] = [];

    let id = 1;
    for (const loan of loans) {
      const person = persons.find(p => p.id === loan.personId);
      if (person && loan.bankAccount) {
        items.push({
          id: id++,
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          personId: loan.personId,
          personName: person.fullName || `${person.firstName} ${person.lastName}`,
          identityNumber: person.identityNumber,
          bankCode: loan.bankAccount.bankId?.toString() || '10',
          branchCode: loan.bankAccount.branchNumber?.toString() || '800',
          accountNumber: loan.bankAccount.accountNumber || '123456',
          amount: loan.monthlyPayment,
          dueDate: new Date(Date.now() + (id % 30) * 24 * 60 * 60 * 1000),
          selected: true,
        });
      }
    }

    return items;
  }

  readonly selectedItems = computed(() => this.items().filter(i => i.selected));
  readonly totalSelectedAmount = computed(() => this.selectedItems().reduce((sum, i) => sum + i.amount, 0));
  readonly allSelected = computed(() => this.items().length > 0 && this.items().every(i => i.selected));

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(num);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  toggleItem(item: CollectionItem): void {
    const items = this.items();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = { ...items[index], selected: !items[index].selected };
      this.items.set([...items]);
    }
  }

  toggleSelectAll(): void {
    const allSelected = this.allSelected();
    const items = this.items().map(i => ({ ...i, selected: !allSelected }));
    this.items.set(items);
  }

  async generateFile(): Promise<void> {
    if (this.selectedItems().length === 0) return;

    this.isGenerating.set(true);

    // Simulate file generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Generated collection file:', {
      executionDate: this.executionDate(),
      items: this.selectedItems(),
      totalAmount: this.totalSelectedAmount(),
    });

    this.isGenerating.set(false);
    this.router.navigate(['/gmn/masav/files']);
  }
}
