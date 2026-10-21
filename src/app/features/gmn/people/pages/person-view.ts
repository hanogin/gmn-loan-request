import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucidePencil,
  lucideUser,
  lucideMapPin,
  lucidePhone,
  lucideMail,
  lucideBuilding2,
  lucideWallet,
  lucidePiggyBank,
  lucideHeart,
  lucideShieldCheck,
  lucideLoader2,
  lucideBadgeCheck,
  lucideBadgeX,
  lucideCalendar,
  lucideBriefcase,
  lucideFileText,
  lucideCreditCard,
  lucideActivity,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Person, PersonType, Loan, Saving, Donation, PayLine } from '../../../../core/models';

@Component({
  selector: 'gmn-person-view',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTabsImports,
    HlmTableImports,
    HlmSeparatorImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucidePencil,
      lucideUser,
      lucideMapPin,
      lucidePhone,
      lucideMail,
      lucideBuilding2,
      lucideWallet,
      lucidePiggyBank,
      lucideHeart,
      lucideShieldCheck,
      lucideLoader2,
      lucideBadgeCheck,
      lucideBadgeX,
      lucideCalendar,
      lucideBriefcase,
      lucideFileText,
      lucideCreditCard,
      lucideActivity,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      @if (isLoading()) {
        <div class="flex h-64 items-center justify-center">
          <ng-icon name="lucideLoader2" class="h-8 w-8 animate-spin text-primary" />
        </div>
      } @else if (person()) {
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button hlmBtn variant="outline" size="icon" routerLink="/gmn/people">
              <ng-icon name="lucideArrowRight" class="h-4 w-4" />
            </button>
            <div class="flex items-center gap-4">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {{ getInitials() }}
              </div>
              <div>
                <h1 class="text-2xl font-bold">{{ person()?.fullName }}</h1>
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{{ person()?.identityTypeName || 'ID' }}: {{ person()?.identityNumber }}</span>
                  @if (person()?.isContactActive) {
                    <span hlmBadge variant="default" class="bg-green-500">{{ t('common.active') }}</span>
                  } @else {
                    <span hlmBadge variant="secondary">{{ t('common.inactive') }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
          <button hlmBtn [routerLink]="['/gmn/people', person()?.id, 'edit']">
            <ng-icon name="lucidePencil" class="me-2 h-4 w-4" />
            {{ t('common.edit') }}
          </button>
        </div>

        <!-- Person Type Badges -->
        <div class="flex flex-wrap gap-2">
          @for (type of person()?.personType; track type) {
            <span hlmBadge [variant]="getTypeBadgeVariant(type)" class="flex items-center gap-1">
              <ng-icon [name]="getTypeIcon(type)" class="h-3 w-3" />
              {{ getPersonTypeTranslation(type) }}
            </span>
          }
        </div>

        <!-- Summary Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <ng-icon name="lucideWallet" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ personLoans().length }}</p>
                <p class="text-sm text-muted-foreground">{{ t('people.tabs.loans') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <ng-icon name="lucidePiggyBank" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ personSavings().length }}</p>
                <p class="text-sm text-muted-foreground">{{ t('people.tabs.savings') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30">
                <ng-icon name="lucideHeart" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ personDonations().length }}</p>
                <p class="text-sm text-muted-foreground">{{ t('people.tabs.donations') }}</p>
              </div>
            </div>
          </div>
          <div hlmCard class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <ng-icon name="lucideCreditCard" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ totalBalance() | number:'1.0-0' }}</p>
                <p class="text-sm text-muted-foreground">{{ t('common.total') }} ₪</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Left Column: Personal Details -->
          <div class="space-y-6 lg:col-span-1">
            <!-- Contact Info -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucidePhone" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('common.contactInfo') }}</h2>
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <ng-icon name="lucidePhone" class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="text-sm text-muted-foreground">{{ t('people.fields.mobile') }}</p>
                    <p class="font-medium" dir="ltr">{{ person()?.contact?.mobilePhone || '-' }}</p>
                  </div>
                </div>
                @if (person()?.contact?.phone) {
                  <div class="flex items-center gap-3">
                    <ng-icon name="lucidePhone" class="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p class="text-sm text-muted-foreground">{{ t('people.fields.phone') }}</p>
                      <p class="font-medium" dir="ltr">{{ person()?.contact?.phone }}</p>
                    </div>
                  </div>
                }
                <div class="flex items-center gap-3">
                  <ng-icon name="lucideMail" class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="text-sm text-muted-foreground">{{ t('people.fields.email') }}</p>
                    <p class="font-medium" dir="ltr">{{ person()?.contact?.email || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div hlmCard class="p-6">
              <div class="mb-4 flex items-center gap-2">
                <ng-icon name="lucideMapPin" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('people.fields.address') }}</h2>
              </div>
              <div class="space-y-2">
                <p class="font-medium">
                  {{ person()?.address?.street }} {{ person()?.address?.houseNumber }}
                  @if (person()?.address?.apartment) {
                    , {{ t('people.fields.apartment') }} {{ person()?.address?.apartment }}
                  }
                </p>
                <p class="text-muted-foreground">{{ person()?.address?.cityName || getCityName() }}</p>
                @if (person()?.address?.postalCode) {
                  <p class="text-sm text-muted-foreground">{{ t('people.fields.zipCode') }}: {{ person()?.address?.postalCode }}</p>
                }
              </div>
            </div>

            <!-- Bank Account -->
            @if (person()?.primaryBankAccount) {
              <div hlmCard class="p-6">
                <div class="mb-4 flex items-center gap-2">
                  <ng-icon name="lucideBuilding2" class="h-5 w-5 text-primary" />
                  <h2 class="text-lg font-semibold">{{ t('common.bankAccount') }}</h2>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('common.bank') }}</span>
                    <span class="font-medium">{{ person()?.primaryBankAccount?.bankId }} - {{ person()?.primaryBankAccount?.bankName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('common.branch') }}</span>
                    <span class="font-medium font-mono">{{ person()?.primaryBankAccount?.branchNumber }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">{{ t('common.accountNumber') }}</span>
                    <span class="font-medium font-mono">{{ person()?.primaryBankAccount?.accountNumber }}</span>
                  </div>
                </div>
              </div>
            }

            <!-- Additional Info -->
            @if (person()?.profession) {
              <div hlmCard class="p-6">
                <div class="mb-4 flex items-center gap-2">
                  <ng-icon name="lucideBriefcase" class="h-5 w-5 text-primary" />
                  <h2 class="text-lg font-semibold">{{ t('common.personalInfo') }}</h2>
                </div>
                <div class="space-y-2">
                  @if (person()?.profession) {
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">{{ t('people.fields.profession') }}</span>
                      <span class="font-medium">{{ person()?.profession }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Tabs with Data -->
          <div class="lg:col-span-2">
            <hlm-tabs tab="loans" class="w-full">
              <hlm-tabs-list class="w-full grid grid-cols-4">
                <button hlmTabsTrigger="loans">
                  <ng-icon name="lucideWallet" class="me-2 h-4 w-4" />
                  {{ t('people.tabs.loans') }}
                </button>
                <button hlmTabsTrigger="savings">
                  <ng-icon name="lucidePiggyBank" class="me-2 h-4 w-4" />
                  {{ t('people.tabs.savings') }}
                </button>
                <button hlmTabsTrigger="donations">
                  <ng-icon name="lucideHeart" class="me-2 h-4 w-4" />
                  {{ t('people.tabs.donations') }}
                </button>
                <button hlmTabsTrigger="payments">
                  <ng-icon name="lucideCreditCard" class="me-2 h-4 w-4" />
                  {{ t('people.tabs.payments') }}
                </button>
              </hlm-tabs-list>

              <!-- Loans Tab -->
              <div hlmTabsContent="loans">
                <div hlmCard class="mt-4">
                  @if (personLoans().length > 0) {
                    <table hlmTable class="w-full">
                      <thead>
                        <tr hlmTrow>
                          <th hlmTh class="text-start">{{ t('loans.fields.loanNumber') }}</th>
                          <th hlmTh class="text-start">{{ t('loans.fields.loanAmount') }}</th>
                          <th hlmTh class="text-start">{{ t('loans.fields.currentBalance') }}</th>
                          <th hlmTh class="text-start">{{ t('common.status') }}</th>
                          <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (loan of personLoans(); track loan.id) {
                          <tr hlmTrow>
                            <td hlmTd class="font-mono">{{ loan.loanNumber }}</td>
                            <td hlmTd>{{ loan.loanAmount | number:'1.0-0' }} ₪</td>
                            <td hlmTd>{{ loan.currentBalance | number:'1.0-0' }} ₪</td>
                            <td hlmTd>
                              <span hlmBadge [variant]="loan.status === 'ACTIVE' ? 'default' : 'secondary'">
                                {{ t('loans.status.' + loan.status.toLowerCase()) }}
                              </span>
                            </td>
                            <td hlmTd class="text-center">
                              <button hlmBtn variant="ghost" size="sm" [routerLink]="['/gmn/loans', loan.id]">
                                {{ t('common.view') }}
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  } @else {
                    <div class="p-8 text-center text-muted-foreground">
                      {{ t('common.noData') }}
                    </div>
                  }
                </div>
              </div>

              <!-- Savings Tab -->
              <div hlmTabsContent="savings">
                <div hlmCard class="mt-4">
                  @if (personSavings().length > 0) {
                    <table hlmTable class="w-full">
                      <thead>
                        <tr hlmTrow>
                          <th hlmTh class="text-start">{{ t('savings.fields.savingNumber') }}</th>
                          <th hlmTh class="text-start">{{ t('savings.fields.currentBalance') }}</th>
                          <th hlmTh class="text-start">{{ t('savings.fields.openDate') }}</th>
                          <th hlmTh class="text-start">{{ t('common.status') }}</th>
                          <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (saving of personSavings(); track saving.id) {
                          <tr hlmTrow>
                            <td hlmTd class="font-mono">{{ saving.savingNumber }}</td>
                            <td hlmTd>{{ saving.currentBalance | number:'1.0-0' }} ₪</td>
                            <td hlmTd>{{ saving.openDate | date:'dd/MM/yyyy' }}</td>
                            <td hlmTd>
                              <span hlmBadge [variant]="saving.status === 'ACTIVE' ? 'default' : 'secondary'">
                                {{ t('savings.status.' + saving.status.toLowerCase()) }}
                              </span>
                            </td>
                            <td hlmTd class="text-center">
                              <button hlmBtn variant="ghost" size="sm" [routerLink]="['/gmn/savings', saving.id]">
                                {{ t('common.view') }}
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  } @else {
                    <div class="p-8 text-center text-muted-foreground">
                      {{ t('common.noData') }}
                    </div>
                  }
                </div>
              </div>

              <!-- Donations Tab -->
              <div hlmTabsContent="donations">
                <div hlmCard class="mt-4">
                  @if (personDonations().length > 0) {
                    <table hlmTable class="w-full">
                      <thead>
                        <tr hlmTrow>
                          <th hlmTh class="text-start">{{ t('donations.fields.donationNumber') }}</th>
                          <th hlmTh class="text-start">{{ t('donations.fields.amount') }}</th>
                          <th hlmTh class="text-start">{{ t('donations.fields.date') }}</th>
                          <th hlmTh class="text-start">{{ t('donations.fields.type') }}</th>
                          <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (donation of personDonations(); track donation.id) {
                          <tr hlmTrow>
                            <td hlmTd class="font-mono">{{ donation.donationNumber }}</td>
                            <td hlmTd>{{ donation.amount | number:'1.0-0' }} ₪</td>
                            <td hlmTd>{{ donation.donationDate | date:'dd/MM/yyyy' }}</td>
                            <td hlmTd>
                              <span hlmBadge variant="outline">
                                {{ t('donations.types.' + (donation.donationType || 'oneTime')) }}
                              </span>
                            </td>
                            <td hlmTd class="text-center">
                              <button hlmBtn variant="ghost" size="sm" [routerLink]="['/gmn/donations', donation.id]">
                                {{ t('common.view') }}
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  } @else {
                    <div class="p-8 text-center text-muted-foreground">
                      {{ t('common.noData') }}
                    </div>
                  }
                </div>
              </div>

              <!-- Payments Tab -->
              <div hlmTabsContent="payments">
                <div hlmCard class="mt-4">
                  @if (personPayments().length > 0) {
                    <table hlmTable class="w-full">
                      <thead>
                        <tr hlmTrow>
                          <th hlmTh class="text-start">{{ t('payments.fields.date') }}</th>
                          <th hlmTh class="text-start">{{ t('payments.fields.type') }}</th>
                          <th hlmTh class="text-start">{{ t('payments.fields.amount') }}</th>
                          <th hlmTh class="text-start">{{ t('common.status') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (payment of personPayments(); track payment.id) {
                          <tr hlmTrow>
                            <td hlmTd>{{ payment.dueDate | date:'dd/MM/yyyy' }}</td>
                            <td hlmTd>{{ payment.payTypeName || payment.payType }}</td>
                            <td hlmTd>{{ payment.amount | number:'1.0-0' }} ₪</td>
                            <td hlmTd>
                              <span hlmBadge [variant]="payment.status === 'PAID' ? 'default' : payment.status === 'OVERDUE' ? 'destructive' : 'secondary'">
                                {{ payment.status }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  } @else {
                    <div class="p-8 text-center text-muted-foreground">
                      {{ t('common.noData') }}
                    </div>
                  }
                </div>
              </div>
            </hlm-tabs>
          </div>
        </div>
      } @else {
        <div class="flex h-64 flex-col items-center justify-center text-center">
          <ng-icon name="lucideUser" class="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 class="text-xl font-semibold">{{ t('common.noData') }}</h2>
          <button hlmBtn class="mt-4" routerLink="/gmn/people">
            {{ t('common.back') }}
          </button>
        </div>
      }
    </div>
  `,
})
export default class PersonViewPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isLoading = signal(true);
  readonly person = signal<Person | null>(null);
  readonly personLoans = signal<Loan[]>([]);
  readonly personSavings = signal<Saving[]>([]);
  readonly personDonations = signal<Donation[]>([]);
  readonly personPayments = signal<PayLine[]>([]);

  // Computed
  readonly totalBalance = computed(() => {
    const loansBalance = this.personLoans().reduce((sum, l) => sum + (l.currentBalance || 0), 0);
    const savingsBalance = this.personSavings().reduce((sum, s) => sum + s.currentBalance, 0);
    return savingsBalance - loansBalance;
  });

  ngOnInit(): void {
    const personId = this.route.snapshot.params['id'];
    if (personId) {
      this.loadPerson(parseInt(personId, 10));
    } else {
      this.isLoading.set(false);
    }
  }

  private async loadPerson(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const person = await this.mockService.getPersonById(id);
      this.person.set(person || null);

      if (person) {
        // Load related data
        const [loansResult, savingsResult, donationsResult, paymentsResult] = await Promise.all([
          this.mockService.getLoans({ page: 1, pageSize: 100 }, { personId: id }),
          this.mockService.getSavings({ page: 1, pageSize: 100 }, { personId: id }),
          this.mockService.getDonations({ page: 1, pageSize: 100 }, { personId: id }),
          this.mockService.getPayLines({ page: 1, pageSize: 100 }, { entityId: id }),
        ]);

        this.personLoans.set(loansResult.data);
        this.personSavings.set(savingsResult.data);
        this.personDonations.set(donationsResult.data);
        this.personPayments.set(paymentsResult.data);
      }
    } catch (error) {
      console.error('Error loading person:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getInitials(): string {
    const p = this.person();
    if (!p) return '';
    return (p.firstName?.charAt(0) || '') + (p.lastName?.charAt(0) || '');
  }

  getCityName(): string {
    const city = this.person()?.address?.city;
    return city ? this.mockService.getCityName(city) : '';
  }

  getPersonTypeTranslation(type: PersonType): string {
    const typeMap: Record<PersonType, string> = {
      'BORROWER': 'people.personTypes.borrower',
      'DEPOSITOR': 'people.personTypes.depositor',
      'GUARANTOR': 'people.personTypes.guarantor',
      'DONOR': 'people.personTypes.donor',
      'CONTACT': 'people.title',
    };
    return this.transloco.translate(`gmn.${typeMap[type]}`);
  }

  getTypeBadgeVariant(type: PersonType): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variantMap: Record<PersonType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'BORROWER': 'default',
      'DEPOSITOR': 'secondary',
      'GUARANTOR': 'outline',
      'DONOR': 'default',
      'CONTACT': 'outline',
    };
    return variantMap[type] || 'outline';
  }

  getTypeIcon(type: PersonType): string {
    const iconMap: Record<PersonType, string> = {
      'BORROWER': 'lucideWallet',
      'DEPOSITOR': 'lucidePiggyBank',
      'GUARANTOR': 'lucideShieldCheck',
      'DONOR': 'lucideHeart',
      'CONTACT': 'lucideUser',
    };
    return iconMap[type] || 'lucideUser';
  }
}
