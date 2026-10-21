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
  lucideEye,
  lucideEdit,
  lucideFileText,
  lucideCalendar,
  lucideLoader2,
  lucideDownload,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

interface JournalEntry {
  id: number;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  createdBy: string;
}

interface JournalLine {
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
}

@Component({
  selector: 'gmn-journal-entries',
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
      lucideEye,
      lucideEdit,
      lucideFileText,
      lucideCalendar,
      lucideLoader2,
      lucideDownload,
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
            <h1 class="text-2xl font-bold">{{ t('accounting.journalEntries.title') }}</h1>
            <p class="text-muted-foreground">{{ t('accounting.subtitle') }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button hlmBtn variant="outline" (click)="exportEntries()">
            <ng-icon name="lucideDownload" class="me-2 h-4 w-4" />
            {{ t('common.export') }}
          </button>
          <button hlmBtn (click)="addEntry()">
            <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
            {{ t('accounting.journalEntries.newEntry') }}
          </button>
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
              placeholder="Search entries..."
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
            />
          </div>
          <div class="flex items-center gap-2">
            <ng-icon name="lucideCalendar" class="h-4 w-4 text-muted-foreground" />
            <input hlmInput type="date" [(ngModel)]="dateFrom" class="w-[140px]" />
            <span class="text-muted-foreground">-</span>
            <input hlmInput type="date" [(ngModel)]="dateTo" class="w-[140px]" />
          </div>
        </div>
      </div>

      <!-- Entries List -->
      <div class="space-y-4">
        @for (entry of filteredEntries(); track entry.id) {
          <div hlmCard class="overflow-hidden">
            <!-- Entry Header -->
            <div class="flex items-center justify-between p-4 bg-muted/30 border-b cursor-pointer" (click)="toggleEntry(entry.id)">
              <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ng-icon name="lucideFileText" class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-medium">{{ entry.entryNumber }}</span>
                    <span hlmBadge [variant]="entry.isPosted ? 'default' : 'secondary'">
                      {{ entry.isPosted ? 'Posted' : 'Draft' }}
                    </span>
                  </div>
                  <p class="text-sm text-muted-foreground">{{ entry.description }}</p>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-end">
                  <p class="text-sm text-muted-foreground">{{ formatDate(entry.date) }}</p>
                  <p class="font-medium">₪{{ formatNumber(entry.totalDebit) }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <button hlmBtn variant="ghost" size="icon" (click)="viewEntry(entry); $event.stopPropagation()">
                    <ng-icon name="lucideEye" class="h-4 w-4" />
                  </button>
                  @if (!entry.isPosted) {
                    <button hlmBtn variant="ghost" size="icon" (click)="editEntry(entry); $event.stopPropagation()">
                      <ng-icon name="lucideEdit" class="h-4 w-4" />
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Entry Lines (Expanded) -->
            @if (expandedEntries().has(entry.id)) {
              <div class="p-4">
                <table class="w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="p-2 text-start text-sm font-medium">{{ t('accounting.journalEntries.account') }}</th>
                      <th class="p-2 text-end text-sm font-medium w-[120px]">{{ t('accounting.journalEntries.debit') }}</th>
                      <th class="p-2 text-end text-sm font-medium w-[120px]">{{ t('accounting.journalEntries.credit') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (line of entry.lines; track line.accountNumber) {
                      <tr class="border-b">
                        <td class="p-2">
                          <span class="font-mono text-sm">{{ line.accountNumber }}</span>
                          <span class="ms-2">{{ line.accountName }}</span>
                        </td>
                        <td class="p-2 text-end font-medium" [class.text-green-600]="line.debit > 0">
                          {{ line.debit > 0 ? formatNumber(line.debit) + ' ₪' : '' }}
                        </td>
                        <td class="p-2 text-end font-medium" [class.text-red-600]="line.credit > 0">
                          {{ line.credit > 0 ? formatNumber(line.credit) + ' ₪' : '' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr class="bg-muted/50 font-bold">
                      <td class="p-2">{{ t('common.total') }}</td>
                      <td class="p-2 text-end text-green-600">{{ formatNumber(entry.totalDebit) }} ₪</td>
                      <td class="p-2 text-end text-red-600">{{ formatNumber(entry.totalCredit) }} ₪</td>
                    </tr>
                  </tfoot>
                </table>
                @if (entry.reference) {
                  <p class="mt-3 text-sm text-muted-foreground">
                    {{ t('accounting.journalEntries.reference') }}: {{ entry.reference }}
                  </p>
                }
              </div>
            }
          </div>
        } @empty {
          <div hlmCard class="p-8 text-center">
            <ng-icon name="lucideFileText" class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p class="text-lg font-medium">{{ t('common.noData') }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export default class JournalEntriesPage {
  private readonly transloco = inject(TranslocoService);

  searchQuery = signal('');
  dateFrom = signal('');
  dateTo = signal('');
  expandedEntries = signal<Set<number>>(new Set([1]));

  // Mock journal entries
  private readonly entries = signal<JournalEntry[]>([
    {
      id: 1,
      entryNumber: 'JE-2026-001',
      date: new Date(2026, 9, 15),
      description: 'הלוואה חדשה - יוסי כהן',
      reference: 'L-2026-015',
      lines: [
        { accountNumber: '1200', accountName: 'הלוואות לגבייה', debit: 25000, credit: 0 },
        { accountNumber: '1120', accountName: 'חשבון בנק', debit: 0, credit: 25000 },
      ],
      totalDebit: 25000,
      totalCredit: 25000,
      isPosted: true,
      createdBy: 'admin',
    },
    {
      id: 2,
      entryNumber: 'JE-2026-002',
      date: new Date(2026, 9, 16),
      description: 'תקבול תרומה - דוד לוי',
      reference: 'D-2026-042',
      lines: [
        { accountNumber: '1120', accountName: 'חשבון בנק', debit: 5000, credit: 0 },
        { accountNumber: '4100', accountName: 'תרומות', debit: 0, credit: 5000 },
      ],
      totalDebit: 5000,
      totalCredit: 5000,
      isPosted: true,
      createdBy: 'admin',
    },
    {
      id: 3,
      entryNumber: 'JE-2026-003',
      date: new Date(2026, 9, 17),
      description: 'תשלום החזר הלוואה',
      reference: 'L-2026-010',
      lines: [
        { accountNumber: '1120', accountName: 'חשבון בנק', debit: 1500, credit: 0 },
        { accountNumber: '1200', accountName: 'הלוואות לגבייה', debit: 0, credit: 1500 },
      ],
      totalDebit: 1500,
      totalCredit: 1500,
      isPosted: true,
      createdBy: 'manager1',
    },
    {
      id: 4,
      entryNumber: 'JE-2026-004',
      date: new Date(2026, 9, 18),
      description: 'תשלום ריבית לפיקדונות',
      lines: [
        { accountNumber: '5200', accountName: 'הוצאות ריבית', debit: 3500, credit: 0 },
        { accountNumber: '2100', accountName: 'פיקדונות לתשלום', debit: 0, credit: 3500 },
      ],
      totalDebit: 3500,
      totalCredit: 3500,
      isPosted: false,
      createdBy: 'admin',
    },
    {
      id: 5,
      entryNumber: 'JE-2026-005',
      date: new Date(2026, 9, 19),
      description: 'הוצאות משרד',
      lines: [
        { accountNumber: '5100', accountName: 'הנהלה וכלליות', debit: 850, credit: 0 },
        { accountNumber: '1110', accountName: 'קופה קטנה', debit: 0, credit: 850 },
      ],
      totalDebit: 850,
      totalCredit: 850,
      isPosted: true,
      createdBy: 'user1',
    },
  ]);

  readonly filteredEntries = computed(() => {
    let entries = this.entries();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      entries = entries.filter(e =>
        e.entryNumber.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.reference?.toLowerCase().includes(query)
      );
    }

    if (this.dateFrom()) {
      const from = new Date(this.dateFrom());
      entries = entries.filter(e => new Date(e.date) >= from);
    }

    if (this.dateTo()) {
      const to = new Date(this.dateTo());
      entries = entries.filter(e => new Date(e.date) <= to);
    }

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(num);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  toggleEntry(id: number): void {
    const expanded = new Set(this.expandedEntries());
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    this.expandedEntries.set(expanded);
  }

  addEntry(): void {
    console.log('Add entry');
  }

  viewEntry(entry: JournalEntry): void {
    console.log('View entry:', entry);
  }

  editEntry(entry: JournalEntry): void {
    console.log('Edit entry:', entry);
  }

  exportEntries(): void {
    console.log('Export entries');
  }
}
