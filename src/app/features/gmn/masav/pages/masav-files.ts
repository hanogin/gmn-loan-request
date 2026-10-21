import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideDownload,
  lucideUpload,
  lucideFileText,
  lucideFileUp,
  lucideFileDown,
  lucideCheckCircle,
  lucideAlertCircle,
  lucideClock,
  lucideSearch,
  lucideCalendar,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

interface MasavFile {
  id: number;
  fileName: string;
  fileType: 'COLLECTION' | 'PAYMENT';
  status: 'CREATED' | 'SENT' | 'PROCESSED' | 'ERROR';
  createdAt: Date;
  sentAt?: Date;
  processedAt?: Date;
  recordCount: number;
  totalAmount: number;
  successCount?: number;
  failureCount?: number;
  executionDate: Date;
  createdBy: string;
}

@Component({
  selector: 'gmn-masav-files',
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
      lucideDownload,
      lucideUpload,
      lucideFileText,
      lucideFileUp,
      lucideFileDown,
      lucideCheckCircle,
      lucideAlertCircle,
      lucideClock,
      lucideSearch,
      lucideCalendar,
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
            <h1 class="text-2xl font-bold">{{ t('masav.files.title') }}</h1>
            <p class="text-muted-foreground">{{ t('masav.subtitle') }}</p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideFileText" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalFiles() }}</p>
              <p class="text-sm text-muted-foreground">Total Files</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ processedFiles() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('masav.status.processed') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideClock" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ pendingFiles() }}</p>
              <p class="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideFileDown" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">₪{{ formatNumber(thisMonthAmount()) }}</p>
              <p class="text-sm text-muted-foreground">{{ t('masav.stats.thisMonth') }}</p>
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
              placeholder="Search files..."
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
            />
          </div>
          <brn-select [(ngModel)]="typeFilter" class="w-[160px]">
            <hlm-select-trigger>
              <hlm-select-value [placeholder]="t('masav.files.type')" />
            </hlm-select-trigger>
            <hlm-select-content>
              <hlm-select-item value="">{{ t('common.all') }}</hlm-select-item>
              <hlm-select-item value="COLLECTION">{{ t('masav.fileTypes.collection') }}</hlm-select-item>
              <hlm-select-item value="PAYMENT">{{ t('masav.fileTypes.payment') }}</hlm-select-item>
            </hlm-select-content>
          </brn-select>
          <brn-select [(ngModel)]="statusFilter" class="w-[160px]">
            <hlm-select-trigger>
              <hlm-select-value [placeholder]="t('common.status')" />
            </hlm-select-trigger>
            <hlm-select-content>
              <hlm-select-item value="">{{ t('common.all') }}</hlm-select-item>
              <hlm-select-item value="CREATED">{{ t('masav.status.created') }}</hlm-select-item>
              <hlm-select-item value="SENT">{{ t('masav.status.sent') }}</hlm-select-item>
              <hlm-select-item value="PROCESSED">{{ t('masav.status.processed') }}</hlm-select-item>
              <hlm-select-item value="ERROR">{{ t('masav.status.error') }}</hlm-select-item>
            </hlm-select-content>
          </brn-select>
        </div>
      </div>

      <!-- Files Table -->
      <div hlmCard>
        <table hlmTable class="w-full">
          <thead>
            <tr hlmTrow>
              <th hlmTh class="text-start">{{ t('masav.files.fileName') }}</th>
              <th hlmTh class="text-start">{{ t('masav.files.type') }}</th>
              <th hlmTh class="text-start">{{ t('masav.files.createdDate') }}</th>
              <th hlmTh class="text-start">{{ t('masav.collection.executionDate') }}</th>
              <th hlmTh class="text-end">{{ t('masav.files.recordCount') }}</th>
              <th hlmTh class="text-end">{{ t('masav.files.totalAmount') }}</th>
              <th hlmTh class="text-start">{{ t('common.status') }}</th>
              <th hlmTh class="text-center w-[120px]">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (file of filteredFiles(); track file.id) {
              <tr hlmTrow>
                <td hlmTd>
                  <div class="flex items-center gap-2">
                    <ng-icon [name]="file.fileType === 'COLLECTION' ? 'lucideFileDown' : 'lucideFileUp'" class="h-4 w-4 text-muted-foreground" />
                    <span class="font-mono text-sm">{{ file.fileName }}</span>
                  </div>
                </td>
                <td hlmTd>
                  <span hlmBadge [variant]="file.fileType === 'COLLECTION' ? 'default' : 'secondary'">
                    {{ t('masav.fileTypes.' + file.fileType.toLowerCase()) }}
                  </span>
                </td>
                <td hlmTd class="text-sm">{{ formatDate(file.createdAt) }}</td>
                <td hlmTd class="text-sm">{{ formatDate(file.executionDate) }}</td>
                <td hlmTd class="text-end">
                  <div>
                    <span class="font-medium">{{ file.recordCount }}</span>
                    @if (file.status === 'PROCESSED' && file.successCount !== undefined) {
                      <span class="text-xs text-muted-foreground ms-1">
                        ({{ file.successCount }}/{{ file.failureCount || 0 }})
                      </span>
                    }
                  </div>
                </td>
                <td hlmTd class="text-end font-medium">₪{{ formatNumber(file.totalAmount) }}</td>
                <td hlmTd>
                  <span hlmBadge [variant]="getStatusVariant(file.status)">
                    {{ t('masav.status.' + file.status.toLowerCase()) }}
                  </span>
                </td>
                <td hlmTd class="text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button hlmBtn variant="ghost" size="icon" (click)="downloadFile(file)" title="{{ t('masav.files.download') }}">
                      <ng-icon name="lucideDownload" class="h-4 w-4" />
                    </button>
                    @if (file.status === 'CREATED' || file.status === 'SENT') {
                      <button hlmBtn variant="ghost" size="icon" (click)="uploadResponse(file)" title="{{ t('masav.files.upload') }}">
                        <ng-icon name="lucideUpload" class="h-4 w-4" />
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr hlmTrow>
                <td hlmTd colspan="8" class="py-8 text-center text-muted-foreground">
                  {{ t('common.noData') }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export default class MasavFilesPage {
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  typeFilter = signal('');
  statusFilter = signal('');

  // Mock masav files
  private readonly files = signal<MasavFile[]>([
    { id: 1, fileName: 'COLL_20261001_001.dat', fileType: 'COLLECTION', status: 'PROCESSED', createdAt: new Date(2026, 9, 1), sentAt: new Date(2026, 9, 1), processedAt: new Date(2026, 9, 3), executionDate: new Date(2026, 9, 5), recordCount: 145, totalAmount: 87500, successCount: 142, failureCount: 3, createdBy: 'admin' },
    { id: 2, fileName: 'COLL_20261015_001.dat', fileType: 'COLLECTION', status: 'SENT', createdAt: new Date(2026, 9, 15), sentAt: new Date(2026, 9, 15), executionDate: new Date(2026, 9, 17), recordCount: 152, totalAmount: 91200, createdBy: 'admin' },
    { id: 3, fileName: 'PAY_20261001_001.dat', fileType: 'PAYMENT', status: 'PROCESSED', createdAt: new Date(2026, 9, 1), sentAt: new Date(2026, 9, 1), processedAt: new Date(2026, 9, 3), executionDate: new Date(2026, 9, 5), recordCount: 42, totalAmount: 12500, successCount: 42, failureCount: 0, createdBy: 'admin' },
    { id: 4, fileName: 'COLL_20260901_001.dat', fileType: 'COLLECTION', status: 'PROCESSED', createdAt: new Date(2026, 8, 1), sentAt: new Date(2026, 8, 1), processedAt: new Date(2026, 8, 3), executionDate: new Date(2026, 8, 5), recordCount: 138, totalAmount: 82800, successCount: 135, failureCount: 3, createdBy: 'manager1' },
    { id: 5, fileName: 'COLL_20260915_001.dat', fileType: 'COLLECTION', status: 'PROCESSED', createdAt: new Date(2026, 8, 15), sentAt: new Date(2026, 8, 15), processedAt: new Date(2026, 8, 17), executionDate: new Date(2026, 8, 19), recordCount: 141, totalAmount: 84600, successCount: 140, failureCount: 1, createdBy: 'admin' },
    { id: 6, fileName: 'PAY_20260901_001.dat', fileType: 'PAYMENT', status: 'PROCESSED', createdAt: new Date(2026, 8, 1), sentAt: new Date(2026, 8, 1), processedAt: new Date(2026, 8, 3), executionDate: new Date(2026, 8, 5), recordCount: 38, totalAmount: 11400, successCount: 38, failureCount: 0, createdBy: 'admin' },
    { id: 7, fileName: 'COLL_20261019_001.dat', fileType: 'COLLECTION', status: 'CREATED', createdAt: new Date(2026, 9, 19), executionDate: new Date(2026, 9, 22), recordCount: 148, totalAmount: 88800, createdBy: 'admin' },
  ]);

  readonly filteredFiles = computed(() => {
    let files = this.files();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      files = files.filter(f => f.fileName.toLowerCase().includes(query));
    }

    if (this.typeFilter()) {
      files = files.filter(f => f.fileType === this.typeFilter());
    }

    if (this.statusFilter()) {
      files = files.filter(f => f.status === this.statusFilter());
    }

    return files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  readonly totalFiles = computed(() => this.files().length);
  readonly processedFiles = computed(() => this.files().filter(f => f.status === 'PROCESSED').length);
  readonly pendingFiles = computed(() => this.files().filter(f => f.status === 'CREATED' || f.status === 'SENT').length);
  readonly thisMonthAmount = computed(() => {
    const now = new Date();
    return this.files()
      .filter(f => {
        const created = new Date(f.createdAt);
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
      })
      .reduce((sum, f) => sum + f.totalAmount, 0);
  });

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(num);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'PROCESSED': return 'default';
      case 'SENT': return 'secondary';
      case 'CREATED': return 'outline';
      case 'ERROR': return 'destructive';
      default: return 'outline';
    }
  }

  downloadFile(file: MasavFile): void {
    console.log('Download file:', file.fileName);
  }

  uploadResponse(file: MasavFile): void {
    console.log('Upload response for:', file.fileName);
  }
}
