import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFileText,
  lucidePlus,
  lucideSearch,
  lucideFilter,
  lucideEye,
  lucideCheck,
  lucideX,
  lucideChevronLeft,
  lucideChevronRight,
  lucideClock,
  lucideCheckCircle,
  lucideXCircle,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { GmnMockService } from '../../../../core/services/mock-data';
import { LoanRequest, LoanRequestStatus } from '../../../../core/models';

@Component({
  selector: 'gmn-loan-requests-list',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
    HlmTableImports,
  ],
  providers: [
    provideIcons({
      lucideFileText,
      lucidePlus,
      lucideSearch,
      lucideFilter,
      lucideEye,
      lucideCheck,
      lucideX,
      lucideChevronLeft,
      lucideChevronRight,
      lucideClock,
      lucideCheckCircle,
      lucideXCircle,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ng-icon name="lucideFileText" class="h-6 w-6" />
            {{ t('loanRequests.title') }}
          </h1>
          <p class="text-muted-foreground">{{ t('loanRequests.subtitle') }}</p>
        </div>
        <button hlmBtn routerLink="/gmn/loan-requests/new">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('loanRequests.newRequest') }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <ng-icon name="lucideClock" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ pendingCount() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('loanRequests.status.pending') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <ng-icon name="lucideAlertCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ pendingApprovalCount() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('loanRequests.status.inReview') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ approvedCount() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('loanRequests.status.approved') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <ng-icon name="lucideFileText" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalRequests() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('loanRequests.stats.thisMonth') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div hlmCard class="p-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative flex-1 sm:max-w-sm">
            <ng-icon name="lucideSearch" class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              hlmInput
              type="text"
              [placeholder]="t('loanRequests.searchPlaceholder')"
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <button hlmBtn [variant]="activeFilter() === 'ALL' ? 'default' : 'outline'" size="sm" (click)="setFilter('ALL')">
              {{ t('common.all') }}
            </button>
            <button hlmBtn [variant]="activeFilter() === 'PENDING' ? 'default' : 'outline'" size="sm" (click)="setFilter('PENDING')">
              {{ t('loanRequests.status.pending') }}
            </button>
            <button hlmBtn [variant]="activeFilter() === 'APPROVED' ? 'default' : 'outline'" size="sm" (click)="setFilter('APPROVED')">
              {{ t('loanRequests.status.approved') }}
            </button>
            <button hlmBtn [variant]="activeFilter() === 'REJECTED' ? 'default' : 'outline'" size="sm" (click)="setFilter('REJECTED')">
              {{ t('loanRequests.status.rejected') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div hlmCard>
        <div class="overflow-x-auto">
          <table hlmTable class="w-full">
            <thead>
              <tr hlmTrow>
                <th hlmTh class="text-start">{{ t('loanRequests.fields.requestNumber') }}</th>
                <th hlmTh class="text-start">{{ t('loanRequests.fields.applicant') }}</th>
                <th hlmTh class="text-start">{{ t('common.amount') }}</th>
                <th hlmTh class="text-start">{{ t('loanRequests.fields.purpose') }}</th>
                <th hlmTh class="text-start">{{ t('common.date') }}</th>
                <th hlmTh class="text-start">{{ t('common.status') }}</th>
                <th hlmTh class="text-center w-[100px]">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (request of paginatedRequests(); track request.id) {
                <tr hlmTrow class="cursor-pointer hover:bg-muted/50" (click)="viewRequest(request.id)">
                  <td hlmTd class="font-mono">{{ request.requestNumber }}</td>
                  <td hlmTd>{{ getPersonName(request.personId) }}</td>
                  <td hlmTd class="font-medium">{{ t('common.currency') }}{{ formatNumber(request.requestedAmount) }}</td>
                  <td hlmTd>{{ request.purposeName }}</td>
                  <td hlmTd class="text-sm">{{ formatDate(request.requestDate) }}</td>
                  <td hlmTd>
                    <span hlmBadge [variant]="getStatusVariant(request.status)">
                      {{ getStatusTranslation(request.status) }}
                    </span>
                  </td>
                  <td hlmTd class="text-center" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-center gap-1">
                      <button hlmBtn variant="ghost" size="icon" (click)="viewRequest(request.id)">
                        <ng-icon name="lucideEye" class="h-4 w-4" />
                      </button>
                      @if (canApprove(request)) {
                        <button hlmBtn variant="ghost" size="icon" class="text-green-600" (click)="approveRequest(request)">
                          <ng-icon name="lucideCheck" class="h-4 w-4" />
                        </button>
                        <button hlmBtn variant="ghost" size="icon" class="text-red-600" (click)="rejectRequest(request)">
                          <ng-icon name="lucideX" class="h-4 w-4" />
                        </button>
                      }
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
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t p-4">
          <div class="text-sm text-muted-foreground">
            {{ startIndex() + 1 }}-{{ endIndex() }} / {{ filteredRequests().length }}
          </div>
          <div class="flex items-center gap-2">
            <button hlmBtn variant="outline" size="sm" [disabled]="currentPage() === 1" (click)="previousPage()">
              <ng-icon name="lucideChevronLeft" class="h-4 w-4" />
            </button>
            <span class="px-2 text-sm">{{ currentPage() }} / {{ totalPages() }}</span>
            <button hlmBtn variant="outline" size="sm" [disabled]="currentPage() === totalPages()" (click)="nextPage()">
              <ng-icon name="lucideChevronRight" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class LoanRequestsList {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  searchQuery = '';
  readonly activeFilter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  readonly currentPage = signal(1);
  readonly pageSize = 15;

  readonly totalRequests = computed(() => this.mockService.loanRequests().length);

  readonly pendingCount = computed(() =>
    this.mockService.loanRequests().filter(r =>
      ['DRAFT', 'PENDING_DOCUMENTS', 'PENDING_INTERVIEW', 'PENDING_GUARANTORS'].includes(r.status)
    ).length
  );

  readonly pendingApprovalCount = computed(() =>
    this.mockService.loanRequests().filter(r => r.status === 'PENDING_APPROVAL').length
  );

  readonly approvedCount = computed(() =>
    this.mockService.loanRequests().filter(r => r.status === 'APPROVED' || r.status === 'CONVERTED_TO_LOAN').length
  );

  readonly filteredRequests = computed(() => {
    let requests = this.mockService.loanRequests();

    if (this.activeFilter() === 'PENDING') {
      requests = requests.filter(r =>
        ['DRAFT', 'PENDING_DOCUMENTS', 'PENDING_INTERVIEW', 'PENDING_GUARANTORS', 'PENDING_APPROVAL'].includes(r.status)
      );
    } else if (this.activeFilter() === 'APPROVED') {
      requests = requests.filter(r => r.status === 'APPROVED' || r.status === 'CONVERTED_TO_LOAN');
    } else if (this.activeFilter() === 'REJECTED') {
      requests = requests.filter(r => r.status === 'REJECTED' || r.status === 'CANCELLED');
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      requests = requests.filter(r =>
        r.requestNumber.toLowerCase().includes(q) ||
        this.getPersonName(r.personId).toLowerCase().includes(q)
      );
    }

    return requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredRequests().length / this.pageSize) || 1);
  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredRequests().length));
  readonly paginatedRequests = computed(() => this.filteredRequests().slice(this.startIndex(), this.endIndex()));

  setFilter(filter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  viewRequest(id: number): void {
    this.router.navigate(['/gmn/loan-requests', id]);
  }

  canApprove(request: LoanRequest): boolean {
    return request.status === 'PENDING_APPROVAL';
  }

  async approveRequest(request: LoanRequest): Promise<void> {
    await this.mockService.approveLoanRequest(request.id, request.requestedAmount, 24);
  }

  async rejectRequest(request: LoanRequest): Promise<void> {
    await this.mockService.updateLoanRequestStatus(request.id, 'REJECTED', 'Rejected');
  }

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || person?.firstName + ' ' + person?.lastName || '—';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(num);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('he-IL').format(new Date(date));
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'APPROVED':
      case 'CONVERTED_TO_LOAN':
        return 'default';
      case 'REJECTED':
      case 'CANCELLED':
        return 'destructive';
      case 'PENDING_APPROVAL':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  getStatusTranslation(status: string): string {
    const statusMap: Record<string, string> = {
      'APPROVED': 'loanRequests.status.approved',
      'REJECTED': 'loanRequests.status.rejected',
      'PENDING_APPROVAL': 'loanRequests.status.inReview',
      'PENDING_DOCUMENTS': 'loanRequests.status.pending',
      'PENDING_INTERVIEW': 'loanRequests.status.inReview',
      'PENDING_GUARANTORS': 'loanRequests.status.pending',
      'CONVERTED_TO_LOAN': 'loanRequests.status.converted',
      'CANCELLED': 'loanRequests.status.cancelled',
      'DRAFT': 'loanRequests.status.pending',
    };
    return this.transloco.translate(`gmn.${statusMap[status] || 'loanRequests.status.pending'}`);
  }
}
