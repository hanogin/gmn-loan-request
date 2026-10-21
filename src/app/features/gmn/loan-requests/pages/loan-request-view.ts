import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucidePencil,
  lucideWallet,
  lucideUser,
  lucideCalendar,
  lucideLoader2,
  lucideShieldCheck,
  lucideFileText,
  lucideCheckCircle,
  lucideXCircle,
  lucideClock,
  lucideBuilding2,
  lucideArrowUpRight,
  lucideCheck,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';

import { GmnMockService } from '../../../../core/services/mock-data';
import { LoanRequest, LoanRequestStatus } from '../../../../core/models';

@Component({
  selector: 'gmn-loan-request-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTableImports,
    HlmSeparatorImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucidePencil,
      lucideWallet,
      lucideUser,
      lucideCalendar,
      lucideLoader2,
      lucideShieldCheck,
      lucideFileText,
      lucideCheckCircle,
      lucideXCircle,
      lucideClock,
      lucideBuilding2,
      lucideArrowUpRight,
      lucideCheck,
      lucideX,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      @if (isLoading()) {
        <div class="flex h-64 items-center justify-center">
          <ng-icon name="lucideLoader2" class="h-8 w-8 animate-spin text-primary" />
        </div>
      } @else if (request()) {
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/loan-requests">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold">{{ t('loanRequests.fields.requestNumber') }}: {{ request()?.requestNumber }}</h1>
                <span hlmBadge [variant]="getStatusVariant()">
                  {{ getStatusTranslation() }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ request()?.person?.fullName }} | {{ request()?.person?.identityNumber }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            @if (canApprove()) {
              <button hlmBtn variant="default" (click)="approveRequest()">
                <ng-icon name="lucideCheck" class="me-2 h-4 w-4" />
                {{ t('loanRequests.actions.approve') }}
              </button>
              <button hlmBtn variant="destructive" (click)="rejectRequest()">
                <ng-icon name="lucideX" class="me-2 h-4 w-4" />
                {{ t('loanRequests.actions.reject') }}
              </button>
            }
            @if (canConvert()) {
              <button hlmBtn variant="default" (click)="convertToLoan()">
                <ng-icon name="lucideArrowUpRight" class="me-2 h-4 w-4" />
                {{ t('loanRequests.actions.convertToLoan') }}
              </button>
            }
            <button hlmBtn variant="outline" [routerLink]="['/gmn/people', request()?.personId]">
              <ng-icon name="lucideUser" class="me-2 h-4 w-4" />
              {{ t('loanRequests.fields.applicant') }}
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <ng-icon name="lucideWallet" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ request()?.requestedAmount | number:'1.0-0' }} ₪</p>
                <p class="text-sm text-muted-foreground">{{ t('loanRequests.fields.requestedAmount') }}</p>
              </div>
            </div>
          </div>
          @if (request()?.approvedAmount) {
            <div hlmCard class="p-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                  <ng-icon name="lucideCheckCircle" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-2xl font-bold">{{ request()?.approvedAmount | number:'1.0-0' }} ₪</p>
                  <p class="text-sm text-muted-foreground">{{ t('loanRequests.fields.approvedAmount') }}</p>
                </div>
              </div>
            </div>
          }
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <ng-icon name="lucideCalendar" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ request()?.requestedTermMonths || '-' }}</p>
                <p class="text-sm text-muted-foreground">{{ t('loanRequests.fields.numberOfPayments') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ng-icon name="lucideShieldCheck" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ request()?.guarantors?.length || 0 }}</p>
                <p class="text-sm text-muted-foreground">{{ t('loanRequests.fields.guarantors') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Left Column: Details -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Request Info -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideWallet" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('common.details') }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loanRequests.fields.requestDate') }}</span>
                  <span class="font-medium">{{ request()?.requestDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{{ t('loanRequests.fields.purpose') }}</span>
                  <span class="font-medium">{{ request()?.purposeName || '-' }}</span>
                </div>
                @if (request()?.approvalDate) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('loanRequests.fields.decisionDate') }}</span>
                    <span class="font-medium">{{ request()?.approvalDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
                @if (request()?.rejectionDate) {
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('loanRequests.fields.decisionDate') }}</span>
                    <span class="font-medium">{{ request()?.rejectionDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Bank Account -->
            @if (request()?.bankAccount) {
              <div hlmCard class="p-6">
                <div class="mb-4 flex items-center gap-2">
                  <ng-icon name="lucideBuilding2" class="h-5 w-5 text-primary" />
                  <h2 class="text-lg font-semibold">{{ t('common.bankAccount') }}</h2>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('common.bank') }}</span>
                    <span class="font-medium">{{ request()?.bankAccount?.bankId }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('common.branch') }}</span>
                    <span class="font-medium font-mono">{{ request()?.bankAccount?.branchNumber }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('common.accountNumber') }}</span>
                    <span class="font-medium font-mono">{{ request()?.bankAccount?.accountNumber }}</span>
                  </div>
                </div>
              </div>
            }

            <!-- Notes -->
            @if (request()?.notes) {
              <div hlmCard class="p-6">
                <div class="mb-4 flex items-center gap-2">
                  <ng-icon name="lucideFileText" class="h-5 w-5 text-primary" />
                  <h2 class="text-lg font-semibold">{{ t('common.notes') }}</h2>
                </div>
                <p class="text-muted-foreground">{{ request()?.notes }}</p>
              </div>
            }

            <!-- Rejection Reason -->
            @if (request()?.rejectionReason) {
              <div hlmCard class="border-destructive p-6">
                <div class="mb-4 flex items-center gap-2">
                  <ng-icon name="lucideXCircle" class="h-5 w-5 text-destructive" />
                  <h2 class="text-lg font-semibold text-destructive">{{ t('loanRequests.fields.decisionNotes') }}</h2>
                </div>
                <p class="text-muted-foreground">{{ request()?.rejectionReason }}</p>
              </div>
            }
          </div>

          <!-- Right Column: Guarantors & Documents -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Guarantors -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideShieldCheck" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('loanRequests.fields.guarantors') }}</h2>
              </div>

              @if (request()?.guarantors && request()!.guarantors.length > 0) {
                <table hlmTable class="w-full">
                  <thead>
                    <tr hlmTrow>
                      <th hlmTh class="text-start">{{ t('people.fields.fullName') }}</th>
                      <th hlmTh class="text-start">{{ t('people.fields.idNumber') }}</th>
                      <th hlmTh class="text-start">{{ t('people.fields.phone') }}</th>
                      <th hlmTh class="text-start">{{ t('common.status') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (guarantor of request()?.guarantors; track $index) {
                      <tr hlmTrow>
                        <td hlmTd class="font-medium">{{ guarantor.firstName }} {{ guarantor.lastName }}</td>
                        <td hlmTd class="font-mono">{{ guarantor.identityNumber }}</td>
                        <td hlmTd dir="ltr">{{ guarantor.phone }}</td>
                        <td hlmTd>
                          @if (guarantor.isVerified) {
                            <span hlmBadge variant="default" class="bg-green-500">
                              <ng-icon name="lucideCheckCircle" class="me-1 h-3 w-3" />
                              {{ t('common.approved') }}
                            </span>
                          } @else {
                            <span hlmBadge variant="secondary">
                              <ng-icon name="lucideClock" class="me-1 h-3 w-3" />
                              {{ t('common.pending') }}
                            </span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div class="py-8 text-center text-muted-foreground">
                  {{ t('common.noData') }}
                </div>
              }
            </div>

            <!-- Documents -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideFileText" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('loanRequests.fields.documents') }}</h2>
              </div>

              <div class="py-8 text-center text-muted-foreground">
                {{ t('common.noData') }}
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex h-64 flex-col items-center justify-center text-center">
          <ng-icon name="lucideWallet" class="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 class="text-xl font-semibold">{{ t('common.noData') }}</h2>
          <button hlmBtn class="mt-4" routerLink="/gmn/loan-requests">
            {{ t('common.back') }}
          </button>
        </div>
      }
    </div>
  `,
})
export default class LoanRequestViewPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly request = signal<LoanRequest | null>(null);

  // Computed
  readonly canApprove = computed(() => {
    const status = this.request()?.status;
    return status && !['APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED_TO_LOAN'].includes(status);
  });

  readonly canConvert = computed(() => {
    return this.request()?.status === 'APPROVED';
  });

  ngOnInit(): void {
    const requestId = this.route.snapshot.params['id'];
    if (requestId) {
      this.loadLoanRequest(parseInt(requestId, 10));
    } else {
      this.isLoading.set(false);
    }
  }

  private async loadLoanRequest(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const request = await this.mockService.getLoanRequestById(id);
      this.request.set(request || null);
    } catch (error) {
      console.error('Error loading loan request:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusVariant(): 'default' | 'secondary' | 'destructive' | 'outline' {
    const status = this.request()?.status;
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
      case 'CANCELLED':
        return 'destructive';
      case 'CONVERTED_TO_LOAN':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  getStatusTranslation(): string {
    const status = this.request()?.status;
    if (!status) return '';

    const statusMap: Record<LoanRequestStatus, string> = {
      'DRAFT': 'loanRequests.status.pending',
      'PENDING_DOCUMENTS': 'loanRequests.status.pending',
      'PENDING_INTERVIEW': 'loanRequests.status.inReview',
      'PENDING_GUARANTORS': 'loanRequests.status.pending',
      'PENDING_APPROVAL': 'loanRequests.status.inReview',
      'APPROVED': 'loanRequests.status.approved',
      'REJECTED': 'loanRequests.status.rejected',
      'CANCELLED': 'loanRequests.status.cancelled',
      'CONVERTED_TO_LOAN': 'loanRequests.status.converted',
    };

    return this.transloco.translate(`gmn.${statusMap[status]}`);
  }

  async approveRequest(): Promise<void> {
    const req = this.request();
    if (!req) return;

    const result = await this.mockService.approveLoanRequest(
      req.id,
      req.requestedAmount,
      req.requestedTermMonths || 12
    );

    if (result.isSuccess && result.data) {
      this.request.set(result.data);
    }
  }

  async rejectRequest(): Promise<void> {
    const req = this.request();
    if (!req) return;

    const result = await this.mockService.updateLoanRequestStatus(req.id, 'REJECTED', 'Rejected by admin');

    if (result.isSuccess && result.data) {
      this.request.set(result.data);
    }
  }

  async convertToLoan(): Promise<void> {
    const req = this.request();
    if (!req) return;

    const result = await this.mockService.createLoanFromRequest(req.id);

    if (result.isSuccess && result.data) {
      this.router.navigate(['/gmn/loans', result.data.id]);
    }
  }
}
