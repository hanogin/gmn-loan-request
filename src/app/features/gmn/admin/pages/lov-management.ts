import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucidePlus,
  lucideSearch,
  lucideEdit,
  lucideTrash2,
  lucideList,
  lucideChevronDown,
  lucideChevronUp,
  lucideCheck,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

interface LovCategory {
  code: string;
  name: string;
  nameHe: string;
  count: number;
  isExpanded: boolean;
}

interface LovItem {
  id: number;
  category: string;
  code: string;
  name: string;
  nameHe: string;
  displayOrder: number;
  isActive: boolean;
}

@Component({
  selector: 'gmn-lov-management',
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
    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucidePlus,
      lucideSearch,
      lucideEdit,
      lucideTrash2,
      lucideList,
      lucideChevronDown,
      lucideChevronUp,
      lucideCheck,
      lucideX,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/admin">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('admin.lov.title') }}</h1>
            <p class="text-muted-foreground">{{ t('admin.subtitle') }}</p>
          </div>
        </div>
        <button hlmBtn (click)="openAddValueDialog()">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('admin.lov.newValue') }}
        </button>
      </div>

      <!-- Category Filter -->
      <div hlmCard class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideList" class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ t('admin.lov.category') }}:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              hlmBtn
              size="sm"
              [variant]="selectedCategory() === '' ? 'default' : 'outline'"
              (click)="selectCategory('')"
            >
              {{ t('common.all') }}
            </button>
            @for (cat of categories(); track cat.code) {
              <button
                hlmBtn
                size="sm"
                [variant]="selectedCategory() === cat.code ? 'default' : 'outline'"
                (click)="selectCategory(cat.code)"
              >
                {{ cat.nameHe }} ({{ cat.count }})
              </button>
            }
          </div>
        </div>
      </div>

      <!-- LOV Table -->
      <div hlmCard>
        <table hlmTable class="w-full">
          <thead>
            <tr hlmTrow>
              <th hlmTh class="text-start w-[50px]">{{ t('admin.lov.displayOrder') }}</th>
              <th hlmTh class="text-start">{{ t('admin.lov.code') }}</th>
              <th hlmTh class="text-start">{{ t('admin.lov.value') }} (EN)</th>
              <th hlmTh class="text-start">{{ t('admin.lov.value') }} (HE)</th>
              <th hlmTh class="text-start">{{ t('admin.lov.category') }}</th>
              <th hlmTh class="text-start">{{ t('common.status') }}</th>
              <th hlmTh class="text-center w-[100px]">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (item of filteredItems(); track item.id) {
              <tr hlmTrow>
                <td hlmTd class="text-center">{{ item.displayOrder }}</td>
                <td hlmTd class="font-mono text-sm">{{ item.code }}</td>
                <td hlmTd>{{ item.name }}</td>
                <td hlmTd>{{ item.nameHe }}</td>
                <td hlmTd>
                  <span hlmBadge variant="secondary">{{ getCategoryName(item.category) }}</span>
                </td>
                <td hlmTd>
                  <span hlmBadge [variant]="item.isActive ? 'default' : 'outline'">
                    {{ item.isActive ? t('common.active') : t('common.inactive') }}
                  </span>
                </td>
                <td hlmTd class="text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button hlmBtn variant="ghost" size="icon" (click)="editItem(item)">
                      <ng-icon name="lucideEdit" class="h-4 w-4" />
                    </button>
                    <button hlmBtn variant="ghost" size="icon" (click)="moveUp(item)" [disabled]="item.displayOrder <= 1">
                      <ng-icon name="lucideChevronUp" class="h-4 w-4" />
                    </button>
                    <button hlmBtn variant="ghost" size="icon" (click)="moveDown(item)">
                      <ng-icon name="lucideChevronDown" class="h-4 w-4" />
                    </button>
                  </div>
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

        <div class="flex items-center justify-between border-t p-4">
          <p class="text-sm text-muted-foreground">
            {{ t('common.showing') }} {{ filteredItems().length }} {{ t('common.of') }} {{ allItems().length }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export default class LovManagementPage {
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  selectedCategory = signal('');

  // Mock LOV categories and items
  readonly categories = signal<LovCategory[]>([
    { code: 'IDENTITY_TYPE', name: 'Identity Type', nameHe: 'סוג זיהוי', count: 3, isExpanded: false },
    { code: 'TITLE', name: 'Title', nameHe: 'תואר', count: 4, isExpanded: false },
    { code: 'BANK', name: 'Bank', nameHe: 'בנק', count: 12, isExpanded: false },
    { code: 'CITY', name: 'City', nameHe: 'עיר', count: 25, isExpanded: false },
    { code: 'LOAN_PURPOSE', name: 'Loan Purpose', nameHe: 'מטרת הלוואה', count: 8, isExpanded: false },
    { code: 'PAYMENT_METHOD', name: 'Payment Method', nameHe: 'אמצעי תשלום', count: 5, isExpanded: false },
  ]);

  readonly allItems = signal<LovItem[]>([
    { id: 1, category: 'IDENTITY_TYPE', code: 'ID', name: 'ID Card', nameHe: 'תעודת זהות', displayOrder: 1, isActive: true },
    { id: 2, category: 'IDENTITY_TYPE', code: 'PASSPORT', name: 'Passport', nameHe: 'דרכון', displayOrder: 2, isActive: true },
    { id: 3, category: 'IDENTITY_TYPE', code: 'MILITARY', name: 'Military ID', nameHe: 'תעודה צבאית', displayOrder: 3, isActive: true },
    { id: 4, category: 'TITLE', code: 'MR', name: 'Mr.', nameHe: 'מר', displayOrder: 1, isActive: true },
    { id: 5, category: 'TITLE', code: 'MRS', name: 'Mrs.', nameHe: 'גב׳', displayOrder: 2, isActive: true },
    { id: 6, category: 'TITLE', code: 'MISS', name: 'Miss', nameHe: 'גב׳', displayOrder: 3, isActive: true },
    { id: 7, category: 'TITLE', code: 'RABBI', name: 'Rabbi', nameHe: 'הרב', displayOrder: 4, isActive: true },
    { id: 8, category: 'BANK', code: '10', name: 'Leumi', nameHe: 'לאומי', displayOrder: 1, isActive: true },
    { id: 9, category: 'BANK', code: '11', name: 'Discount', nameHe: 'דיסקונט', displayOrder: 2, isActive: true },
    { id: 10, category: 'BANK', code: '12', name: 'Hapoalim', nameHe: 'הפועלים', displayOrder: 3, isActive: true },
    { id: 11, category: 'BANK', code: '20', name: 'Mizrahi', nameHe: 'מזרחי', displayOrder: 4, isActive: true },
    { id: 12, category: 'LOAN_PURPOSE', code: 'WEDDING', name: 'Wedding', nameHe: 'חתונה', displayOrder: 1, isActive: true },
    { id: 13, category: 'LOAN_PURPOSE', code: 'MEDICAL', name: 'Medical', nameHe: 'רפואי', displayOrder: 2, isActive: true },
    { id: 14, category: 'LOAN_PURPOSE', code: 'HOUSING', name: 'Housing', nameHe: 'דיור', displayOrder: 3, isActive: true },
    { id: 15, category: 'LOAN_PURPOSE', code: 'EDUCATION', name: 'Education', nameHe: 'חינוך', displayOrder: 4, isActive: true },
    { id: 16, category: 'PAYMENT_METHOD', code: 'CASH', name: 'Cash', nameHe: 'מזומן', displayOrder: 1, isActive: true },
    { id: 17, category: 'PAYMENT_METHOD', code: 'CHECK', name: 'Check', nameHe: 'צ׳ק', displayOrder: 2, isActive: true },
    { id: 18, category: 'PAYMENT_METHOD', code: 'TRANSFER', name: 'Bank Transfer', nameHe: 'העברה בנקאית', displayOrder: 3, isActive: true },
    { id: 19, category: 'PAYMENT_METHOD', code: 'MASAV', name: 'Masav', nameHe: 'מס״ב', displayOrder: 4, isActive: true },
    { id: 20, category: 'PAYMENT_METHOD', code: 'CREDIT', name: 'Credit Card', nameHe: 'כרטיס אשראי', displayOrder: 5, isActive: true },
  ]);

  readonly filteredItems = computed(() => {
    const cat = this.selectedCategory();
    if (!cat) return this.allItems();
    return this.allItems()
      .filter(item => item.category === cat)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });

  selectCategory(code: string): void {
    this.selectedCategory.set(code);
  }

  getCategoryName(code: string): string {
    const cat = this.categories().find(c => c.code === code);
    return cat?.nameHe || code;
  }

  openAddValueDialog(): void {
    console.log('Open add value dialog');
    // TODO: Implement dialog
  }

  editItem(item: LovItem): void {
    console.log('Edit item:', item);
    // TODO: Implement edit
  }

  moveUp(item: LovItem): void {
    console.log('Move up:', item);
    // TODO: Implement reorder
  }

  moveDown(item: LovItem): void {
    console.log('Move down:', item);
    // TODO: Implement reorder
  }
}
