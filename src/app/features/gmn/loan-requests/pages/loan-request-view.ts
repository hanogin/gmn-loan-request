import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideFileText,
  lucideUser,
  lucideBuilding2,
  lucideUsers,
  lucideCreditCard,
  lucideCheck,
  lucideX,
  lucideArrowLeftRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { toast } from '@spartan-ng/brain/sonner';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-loan-request-view',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmSeparatorImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideFileText,
      lucideUser,
      lucideBuilding2,
      lucideUsers,
      lucideCreditCard,
      lucideCheck,
      lucideX,
      lucideArrowLeftRight,
    }),
  ],
  template: `
    <div class="space-y-6" >
      @if (loanRequest(); as request) {
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="ghost" routerLink="/gmn/loan-requests">
              <ng-icon name="lucideArrowRight" class="me-2 h-4 w-4" />
              חזרה
            </button>
            <div>
              <h1 class="text-2xl font-bold">בקשת הלוואה {{ request.requestNumber }}</h1>
              <p class="text-muted-foreground">{{ getPersonName(request.personId) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span hlmBadge [variant]="getStatusVariant(request.status)" class="text-base px-4 py-1">
              {{ request.statusName }}
            </span>
            @if (request.status === 'PENDING_APPROVAL') {
              <button hlmBtn variant="default" class="bg-green-600" (click)="approveRequest()">
                <ng-icon name="lucideCheck" class="me-2 h-4 w-4" />
                אשר בקשה
              </button>
              <button hlmBtn variant="destructive" (click)="rejectRequest()">
                <ng-icon name="lucideX" class="me-2 h-4 w-4" />
                דחה
              </button>
            }
            @if (request.status === 'APPROVED') {
              <button hlmBtn (click)="convertToLoan()">
                <ng-icon name="lucideArrowLeftRight" class="me-2 h-4 w-4" />
                המר להלוואה
              </button>
            }
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Request Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Loan Info -->
            <div hlmCard class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <ng-icon name="lucideFileText" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">פרטי הבקשה</h2>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <p class="text-sm text-muted-foreground">סכום מבוקש</p>
                  <p class="text-2xl font-bold">₪{{ formatNumber(request.requestedAmount) }}</p>
                </div>
                @if (request.approvedAmount) {
                  <div>
                    <p class="text-sm text-muted-foreground">סכום מאושר</p>
                    <p class="text-2xl font-bold text-green-600">₪{{ formatNumber(request.approvedAmount) }}</p>
                  </div>
                }
                <div>
                  <p class="text-sm text-muted-foreground">מטרת ההלוואה</p>
                  <p class="font-medium">{{ request.purposeName }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">תאריך הגשה</p>
                  <p class="font-medium">{{ formatDate(request.requestDate) }}</p>
                </div>
              </div>
            </div>

            <!-- Borrower Info -->
            <div hlmCard class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <ng-icon name="lucideUser" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">פרטי הלווה</h2>
              </div>
              @if (person(); as p) {
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p class="text-sm text-muted-foreground">שם מלא</p>
                    <p class="font-medium">{{ p.fullName }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">ת.ז.</p>
                    <p class="font-medium font-mono">{{ p.identityNumber }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">טלפון</p>
                    <p class="font-medium">{{ p.contact.mobilePhone }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">מייל</p>
                    <p class="font-medium">{{ p.contact.email }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Bank Account -->
            <div hlmCard class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <ng-icon name="lucideBuilding2" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">פרטי חשבון בנק</h2>
              </div>
              @if (request.bankAccount) {
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p class="text-sm text-muted-foreground">בנק</p>
                    <p class="font-medium">{{ request.bankAccount.bankId }} - {{ getBankName(request.bankAccount.bankId) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">סניף</p>
                    <p class="font-medium font-mono">{{ request.bankAccount.branchNumber }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">מספר חשבון</p>
                    <p class="font-medium font-mono">{{ request.bankAccount.accountNumber }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">שם בעל החשבון</p>
                    <p class="font-medium">{{ request.bankAccount.accountName }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Guarantors -->
            <div hlmCard class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <ng-icon name="lucideUsers" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">ערבים ({{ request.guarantors?.length || 0 }})</h2>
              </div>
              @if (request.guarantors && request.guarantors.length > 0) {
                <div class="divide-y">
                  @for (guarantor of request.guarantors; track $index) {
                    <div class="py-3 grid gap-2 sm:grid-cols-4">
                      <div>
                        <p class="text-sm text-muted-foreground">שם</p>
                        <p class="font-medium">{{ guarantor.firstName }} {{ guarantor.lastName }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-muted-foreground">ת.ז.</p>
                        <p class="font-mono">{{ guarantor.identityNumber }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-muted-foreground">טלפון</p>
                        <p>{{ guarantor.phone }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-muted-foreground">סטטוס</p>
                        @if (guarantor.isSaved) {
                          <span hlmBadge variant="default" class="text-xs">נשמר</span>
                        } @else {
                          <span hlmBadge variant="outline" class="text-xs">ממתין</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-muted-foreground">לא הוזנו ערבים</p>
              }
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Status Card -->
            <div hlmCard class="p-6">
              <h3 class="font-semibold mb-4">סטטוס הבקשה</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm">מסמכים</span>
                  @if (request.documentsComplete) {
                    <span hlmBadge variant="default" class="text-xs">הושלם</span>
                  } @else {
                    <span hlmBadge variant="outline" class="text-xs">חסר</span>
                  }
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm">דמי רישום</span>
                  @if (request.registrationFeePaid) {
                    <span hlmBadge variant="default" class="text-xs">שולם</span>
                  } @else {
                    <span hlmBadge variant="destructive" class="text-xs">לא שולם</span>
                  }
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm">ערבים</span>
                  <span hlmBadge variant="outline" class="text-xs">{{ request.guarantors?.length || 0 }} / 2</span>
                </div>
              </div>
            </div>

            <!-- Registration Fee -->
            <div hlmCard class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <ng-icon name="lucideCreditCard" class="h-5 w-5 text-primary" />
                <h3 class="font-semibold">דמי רישום</h3>
              </div>
              <p class="text-2xl font-bold">₪{{ request.registrationFeeAmount }}</p>
              @if (request.registrationFeePaid) {
                <p class="text-sm text-green-600 mt-2">
                  שולם בתאריך {{ formatDate(request.registrationFeePaymentDate!) }}
                </p>
              } @else {
                <p class="text-sm text-destructive mt-2">טרם שולם</p>
              }
            </div>

            <!-- Timeline / Notes -->
            @if (request.notes) {
              <div hlmCard class="p-6">
                <h3 class="font-semibold mb-2">הערות</h3>
                <p class="text-sm text-muted-foreground">{{ request.notes }}</p>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-center py-20">
          <p class="text-muted-foreground">טוען...</p>
        </div>
      }
    </div>
  `,
})
export default class LoanRequestView implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockService = inject(GmnMockService);

  readonly requestId = signal<number | null>(null);

  readonly loanRequest = computed(() => {
    const id = this.requestId();
    if (!id) return null;
    return this.mockService.loanRequests().find(r => r.id === id) || null;
  });

  readonly person = computed(() => {
    const request = this.loanRequest();
    if (!request) return null;
    return this.mockService.persons().find(p => p.id === request.personId) || null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requestId.set(parseInt(id, 10));
    }
  }

  async approveRequest(): Promise<void> {
    const request = this.loanRequest();
    if (!request) return;

    const result = await this.mockService.approveLoanRequest(request.id, request.requestedAmount, 24);
    if (result.isSuccess) {
      toast.success('הבקשה אושרה בהצלחה');
    }
  }

  async rejectRequest(): Promise<void> {
    const request = this.loanRequest();
    if (!request) return;

    const result = await this.mockService.updateLoanRequestStatus(request.id, 'REJECTED', 'נדחה');
    if (result.isSuccess) {
      toast.info('הבקשה נדחתה');
    }
  }

  async convertToLoan(): Promise<void> {
    const request = this.loanRequest();
    if (!request) return;

    const result = await this.mockService.createLoanFromRequest(request.id);
    if (result.isSuccess && result.data) {
      toast.success('הבקשה הומרה להלוואה');
      this.router.navigate(['/gmn/loans', result.data.id]);
    }
  }

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || 'לא ידוע';
  }

  getBankName(bankId: number): string {
    const bank = this.mockService.banks().find(b => b.id === bankId);
    return bank?.name || '';
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
      default:
        return 'secondary';
    }
  }
}
