import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideArrowRight,
  lucidePencil,
  lucidePhone,
  lucideMail,
  lucideMapPin,
  lucideBuilding2,
  lucideWallet,
  lucidePiggyBank,
  lucideHeart,
  lucideShieldCheck,
  lucideCalendar,
  lucidePlus,
  lucideFileText,
  lucideCreditCard,
  lucideHistory,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Person, Loan, Saving, Donation, LoanRequest } from '../../../../core/models';

@Component({
  selector: 'gmn-person-view',
  standalone: true,
  imports: [
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTabsImports,
    BrnTabsImports,
    HlmSeparatorImports,
  ],
  providers: [
    provideIcons({
      lucideUser,
      lucideArrowRight,
      lucidePencil,
      lucidePhone,
      lucideMail,
      lucideMapPin,
      lucideBuilding2,
      lucideWallet,
      lucidePiggyBank,
      lucideHeart,
      lucideShieldCheck,
      lucideCalendar,
      lucidePlus,
      lucideFileText,
      lucideCreditCard,
      lucideHistory,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6" >
      @if (person(); as p) {
        <!-- Back Button & Actions -->
        <div class="flex items-center justify-between">
          <button hlmBtn variant="ghost" routerLink="/gmn/people">
            <ng-icon name="lucideArrowRight" class="me-2 h-4 w-4" />
            חזרה לרשימה
          </button>
          <div class="flex gap-2">
            <button hlmBtn variant="outline" (click)="editPerson()">
              <ng-icon name="lucidePencil" class="me-2 h-4 w-4" />
              עריכה
            </button>
            <button hlmBtn variant="outline" (click)="newLoanRequest()">
              <ng-icon name="lucideFileText" class="me-2 h-4 w-4" />
              בקשת הלוואה
            </button>
            <button hlmBtn variant="outline" (click)="newDeposit()">
              <ng-icon name="lucidePiggyBank" class="me-2 h-4 w-4" />
              פיקדון
            </button>
            <button hlmBtn variant="outline" (click)="newDonation()">
              <ng-icon name="lucideHeart" class="me-2 h-4 w-4" />
              תרומה
            </button>
          </div>
        </div>

        <!-- Profile Card -->
        <div hlmCard class="p-6">
          <div class="flex flex-col gap-6 sm:flex-row">
            <!-- Avatar & Basic Info -->
            <div class="flex items-start gap-4">
              <div class="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold">
                {{ getInitials(p) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold">{{ p.fullName || (p.firstName + ' ' + p.lastName) }}</h1>
                  @if (p.isContactActive) {
                    <span hlmBadge variant="default" class="bg-green-500">פעיל</span>
                  } @else {
                    <span hlmBadge variant="secondary">לא פעיל</span>
                  }
                </div>
                <p class="text-muted-foreground">{{ p.titleName }} · {{ p.identityTypeName }} {{ p.identityNumber }}</p>
                <div class="mt-2 flex flex-wrap gap-1">
                  @for (type of p.personType; track type) {
                    <span hlmBadge variant="outline">{{ getPersonTypeName(type) }}</span>
                  }
                </div>
              </div>
            </div>

            <!-- Contact & Address -->
            <div class="flex-1 grid gap-4 sm:grid-cols-2">
              <div class="space-y-3">
                <h3 class="font-medium text-muted-foreground">פרטי קשר</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <ng-icon name="lucidePhone" class="h-4 w-4 text-muted-foreground" />
                    <a href="tel:{{ p.contact.mobilePhone }}" class="text-primary hover:underline">
                      {{ p.contact.mobilePhone }}
                    </a>
                  </div>
                  @if (p.contact.phone) {
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <ng-icon name="lucidePhone" class="h-4 w-4" />
                      {{ p.contact.phone }}
                    </div>
                  }
                  <div class="flex items-center gap-2">
                    <ng-icon name="lucideMail" class="h-4 w-4 text-muted-foreground" />
                    <a href="mailto:{{ p.contact.email }}" class="text-primary hover:underline">
                      {{ p.contact.email }}
                    </a>
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <h3 class="font-medium text-muted-foreground">כתובת</h3>
                <div class="flex items-start gap-2">
                  <ng-icon name="lucideMapPin" class="mt-1 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p>{{ p.address.street }} {{ p.address.houseNumber }}@if (p.address.apartment) { / {{ p.address.apartment }}}</p>
                    <p>{{ p.address.cityName || getCityName(p.address.city) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <ng-icon name="lucideWallet" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ personLoans().length }}</p>
                <p class="text-sm text-muted-foreground">הלוואות</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <ng-icon name="lucidePiggyBank" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">₪{{ formatNumber(totalDeposits()) }}</p>
                <p class="text-sm text-muted-foreground">יתרת פיקדונות</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30">
                <ng-icon name="lucideHeart" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">₪{{ formatNumber(totalDonations()) }}</p>
                <p class="text-sm text-muted-foreground">סה"כ תרומות</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <ng-icon name="lucideCreditCard" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">₪{{ formatNumber(totalLoanBalance()) }}</p>
                <p class="text-sm text-muted-foreground">יתרה לפירעון</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <hlm-tabs tab="loans" class="w-full">
          <hlm-tabs-list class="w-full justify-start">
            <button hlmTabsTrigger="loans">
              <ng-icon name="lucideWallet" class="me-2 h-4 w-4" />
              הלוואות ({{ personLoans().length }})
            </button>
            <button hlmTabsTrigger="deposits">
              <ng-icon name="lucidePiggyBank" class="me-2 h-4 w-4" />
              פיקדונות ({{ personSavings().length }})
            </button>
            <button hlmTabsTrigger="donations">
              <ng-icon name="lucideHeart" class="me-2 h-4 w-4" />
              תרומות ({{ personDonations().length }})
            </button>
            <button hlmTabsTrigger="requests">
              <ng-icon name="lucideFileText" class="me-2 h-4 w-4" />
              בקשות ({{ personLoanRequests().length }})
            </button>
          </hlm-tabs-list>

          <!-- Loans Tab -->
          <div hlmTabsContent="loans">
            <div hlmCard>
              @if (personLoans().length > 0) {
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b text-sm text-muted-foreground">
                        <th class="p-3 text-start font-medium">מספר הלוואה</th>
                        <th class="p-3 text-start font-medium">סכום מקורי</th>
                        <th class="p-3 text-start font-medium">יתרה</th>
                        <th class="p-3 text-start font-medium">תשלום חודשי</th>
                        <th class="p-3 text-start font-medium">סטטוס</th>
                        <th class="p-3 text-start font-medium">תאריך התחלה</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (loan of personLoans(); track loan.id) {
                        <tr class="border-b hover:bg-muted/50 cursor-pointer" [routerLink]="['/gmn/loans', loan.id]">
                          <td class="p-3 font-mono">{{ loan.loanNumber }}</td>
                          <td class="p-3">₪{{ formatNumber(loan.loanAmount) }}</td>
                          <td class="p-3 font-medium">₪{{ formatNumber(loan.currentBalance) }}</td>
                          <td class="p-3">₪{{ formatNumber(loan.monthlyPayment) }}</td>
                          <td class="p-3">
                            <span hlmBadge [variant]="loan.status === 'ACTIVE' ? 'default' : 'secondary'">
                              {{ loan.statusName || loan.status }}
                            </span>
                          </td>
                          <td class="p-3 text-sm">{{ formatDate(loan.startDate) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ng-icon name="lucideWallet" class="mb-2 h-12 w-12" />
                  <p>אין הלוואות פעילות</p>
                </div>
              }
            </div>
          </div>

          <!-- Deposits Tab -->
          <div hlmTabsContent="deposits">
            <div hlmCard>
              @if (personSavings().length > 0) {
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b text-sm text-muted-foreground">
                        <th class="p-3 text-start font-medium">מספר פיקדון</th>
                        <th class="p-3 text-start font-medium">סוג</th>
                        <th class="p-3 text-start font-medium">יתרה נוכחית</th>
                        <th class="p-3 text-start font-medium">סטטוס</th>
                        <th class="p-3 text-start font-medium">תאריך פתיחה</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (saving of personSavings(); track saving.id) {
                        <tr class="border-b hover:bg-muted/50 cursor-pointer" [routerLink]="['/gmn/savings', saving.id]">
                          <td class="p-3 font-mono">{{ saving.savingNumber }}</td>
                          <td class="p-3">{{ saving.savingTypeName || saving.savingType }}</td>
                          <td class="p-3 font-medium text-green-600">₪{{ formatNumber(saving.currentBalance) }}</td>
                          <td class="p-3">
                            <span hlmBadge variant="default">{{ saving.statusName || saving.status }}</span>
                          </td>
                          <td class="p-3 text-sm">{{ formatDate(saving.openDate) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ng-icon name="lucidePiggyBank" class="mb-2 h-12 w-12" />
                  <p>אין פיקדונות</p>
                </div>
              }
            </div>
          </div>

          <!-- Donations Tab -->
          <div hlmTabsContent="donations">
            <div hlmCard>
              @if (personDonations().length > 0) {
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b text-sm text-muted-foreground">
                        <th class="p-3 text-start font-medium">מספר</th>
                        <th class="p-3 text-start font-medium">תאריך</th>
                        <th class="p-3 text-start font-medium">סכום</th>
                        <th class="p-3 text-start font-medium">אמצעי תשלום</th>
                        <th class="p-3 text-start font-medium">קבלה</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (donation of personDonations(); track donation.id) {
                        <tr class="border-b hover:bg-muted/50">
                          <td class="p-3 font-mono">{{ donation.donationNumber }}</td>
                          <td class="p-3 text-sm">{{ formatDate(donation.donationDate) }}</td>
                          <td class="p-3 font-medium text-pink-600">₪{{ formatNumber(donation.amount) }}</td>
                          <td class="p-3 text-sm">{{ donation.paymentMethodName || donation.paymentMethod }}</td>
                          <td class="p-3">
                            @if (donation.receiptSent) {
                              <span hlmBadge variant="default" class="text-xs">נשלחה</span>
                            } @else if (donation.receiptNumber) {
                              <span hlmBadge variant="outline" class="text-xs">{{ donation.receiptNumber }}</span>
                            } @else {
                              <span class="text-sm text-muted-foreground">-</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ng-icon name="lucideHeart" class="mb-2 h-12 w-12" />
                  <p>אין תרומות</p>
                </div>
              }
            </div>
          </div>

          <!-- Loan Requests Tab -->
          <div hlmTabsContent="requests">
            <div hlmCard>
              @if (personLoanRequests().length > 0) {
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b text-sm text-muted-foreground">
                        <th class="p-3 text-start font-medium">מספר בקשה</th>
                        <th class="p-3 text-start font-medium">תאריך</th>
                        <th class="p-3 text-start font-medium">סכום</th>
                        <th class="p-3 text-start font-medium">מטרה</th>
                        <th class="p-3 text-start font-medium">סטטוס</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (request of personLoanRequests(); track request.id) {
                        <tr class="border-b hover:bg-muted/50 cursor-pointer" [routerLink]="['/gmn/loan-requests', request.id]">
                          <td class="p-3 font-mono">{{ request.requestNumber }}</td>
                          <td class="p-3 text-sm">{{ formatDate(request.requestDate) }}</td>
                          <td class="p-3 font-medium">₪{{ formatNumber(request.requestedAmount) }}</td>
                          <td class="p-3">{{ request.purposeName }}</td>
                          <td class="p-3">
                            <span hlmBadge [variant]="getStatusVariant(request.status)">
                              {{ request.statusName }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ng-icon name="lucideFileText" class="mb-2 h-12 w-12" />
                  <p>אין בקשות הלוואה</p>
                </div>
              }
            </div>
          </div>
        </hlm-tabs>
      } @else {
        <div class="flex items-center justify-center py-20">
          <p class="text-muted-foreground">טוען...</p>
        </div>
      }
    </div>
  `,
})
export default class PersonView implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockService = inject(GmnMockService);

  readonly personId = signal<number | null>(null);

  readonly person = computed(() => {
    const id = this.personId();
    if (!id) return null;
    return this.mockService.persons().find(p => p.id === id) || null;
  });

  readonly personLoans = computed(() => {
    const id = this.personId();
    if (!id) return [];
    return this.mockService.loans().filter(l => l.personId === id);
  });

  readonly personSavings = computed(() => {
    const id = this.personId();
    if (!id) return [];
    return this.mockService.savings().filter(s => s.personId === id);
  });

  readonly personDonations = computed(() => {
    const id = this.personId();
    if (!id) return [];
    return this.mockService.donations().filter(d => d.personId === id);
  });

  readonly personLoanRequests = computed(() => {
    const id = this.personId();
    if (!id) return [];
    return this.mockService.loanRequests().filter(lr => lr.personId === id);
  });

  readonly totalDeposits = computed(() =>
    this.personSavings().reduce((sum, s) => sum + s.currentBalance, 0)
  );

  readonly totalDonations = computed(() =>
    this.personDonations().reduce((sum, d) => sum + d.amount, 0)
  );

  readonly totalLoanBalance = computed(() =>
    this.personLoans().reduce((sum, l) => sum + (l.currentBalance || 0), 0)
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.personId.set(parseInt(id, 10));
    }
  }

  editPerson(): void {
    const id = this.personId();
    if (id) {
      this.router.navigate(['/gmn/people', id, 'edit']);
    }
  }

  newLoanRequest(): void {
    this.router.navigate(['/gmn/loan-requests/new'], { queryParams: { personId: this.personId() } });
  }

  newDeposit(): void {
    this.router.navigate(['/gmn/savings/new'], { queryParams: { personId: this.personId() } });
  }

  newDonation(): void {
    this.router.navigate(['/gmn/donations/new'], { queryParams: { personId: this.personId() } });
  }

  getInitials(person: Person): string {
    return (person.firstName?.charAt(0) || '') + (person.lastName?.charAt(0) || '');
  }

  getCityName(cityId: number): string {
    return this.mockService.getCityName(cityId);
  }

  getPersonTypeName(type: string): string {
    const names: Record<string, string> = {
      'BORROWER': 'לווה',
      'DEPOSITOR': 'מפקיד',
      'GUARANTOR': 'ערב',
      'DONOR': 'תורם',
      'CONTACT': 'איש קשר',
    };
    return names[type] || type;
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('he-IL').format(Math.round(num));
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
