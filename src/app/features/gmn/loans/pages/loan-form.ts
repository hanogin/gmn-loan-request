import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideSave,
  lucideLoader2,
  lucideWallet,
  lucideUser,
  lucideCalendar,
  lucideAlertCircle,
  lucideSearch,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Person, Loan, PaymentMethodType } from '../../../../core/models';

@Component({
  selector: 'gmn-loan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    BrnSelectImports,
    HlmAlertImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideSave,
      lucideLoader2,
      lucideWallet,
      lucideUser,
      lucideCalendar,
      lucideAlertCircle,
      lucideSearch,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Page Header -->
      <div class="flex items-center gap-4">
        <button hlmBtn variant="outline" size="icon" routerLink="/gmn/loans">
          <ng-icon name="lucideArrowRight" class="h-4 w-4" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">
            {{ isEditMode() ? t('common.edit') : t('loans.newLoan') }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ t('loans.subtitle') }}</p>
        </div>
      </div>

      <!-- Error Alert -->
      @if (errorMessage()) {
        <div hlmAlert variant="destructive">
          <ng-icon name="lucideAlertCircle" hlmAlertIcon />
          <h4 hlmAlertTitle>{{ t('common.error') }}</h4>
          <p hlmAlertDesc>{{ errorMessage() }}</p>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Borrower Selection -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideUser" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('loans.fields.borrower') }}</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('loans.fields.borrower') }} *</label>
                <brn-select formControlName="personId" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('loans.fields.borrower')" />
                  </hlm-select-trigger>
                  <hlm-select-content class="max-h-60">
                    @for (person of persons(); track person.id) {
                      <hlm-select-item [value]="person.id.toString()">
                        {{ person.fullName }} ({{ person.identityNumber }})
                      </hlm-select-item>
                    }
                  </hlm-select-content>
                </brn-select>
              </div>

              @if (selectedPerson()) {
                <div class="rounded-lg bg-muted p-4">
                  <h3 class="font-medium">{{ selectedPerson()?.fullName }}</h3>
                  <p class="text-sm text-muted-foreground">{{ selectedPerson()?.identityNumber }}</p>
                  <p class="text-sm text-muted-foreground">{{ selectedPerson()?.contact?.mobilePhone }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Loan Details -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideWallet" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('loans.tabs.details') }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('loans.fields.loanAmount') }} *</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="loanAmount"
                    class="w-full"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label hlmLabel>{{ t('loans.fields.numberOfPayments') }} *</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="numberOfPayments"
                    class="w-full"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('loans.fields.interestRate') }} (%)</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="interestRate"
                    class="w-full"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label hlmLabel>{{ t('loans.fields.paymentDay') }} (1-28)</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="paymentDay"
                    class="w-full"
                    min="1"
                    max="28"
                  />
                </div>
              </div>

              <div>
                <label hlmLabel>{{ t('loans.fields.monthlyPayment') }}</label>
                <div class="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <span class="text-2xl font-bold">{{ calculatedMonthlyPayment() | number:'1.0-0' }}</span>
                  <span class="text-muted-foreground">₪ / {{ t('common.month') || 'month' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideCalendar" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.date') }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('loans.fields.startDate') }} *</label>
                  <input hlmInput type="date" formControlName="startDate" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>{{ t('loans.fields.endDate') }}</label>
                  <input
                    hlmInput
                    type="text"
                    [value]="calculatedEndDate()"
                    class="w-full bg-muted"
                    readonly
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Purpose & Notes -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideWallet" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('loans.fields.purpose') }}</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('loans.fields.purpose') }}</label>
                <brn-select formControlName="purpose" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('loans.fields.purpose')" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    @for (purpose of loanPurposes(); track purpose.id) {
                      <hlm-select-item [value]="purpose.id.toString()">{{ purpose.name }}</hlm-select-item>
                    }
                  </hlm-select-content>
                </brn-select>
              </div>

              <div>
                <label hlmLabel>{{ t('common.notes') }}</label>
                <textarea
                  hlmInput
                  formControlName="notes"
                  class="min-h-[80px] w-full"
                  [placeholder]="t('common.notes')"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex items-center justify-end gap-4">
          <button hlmBtn variant="outline" type="button" routerLink="/gmn/loans">
            {{ t('common.cancel') }}
          </button>
          <button hlmBtn type="submit" [disabled]="isSaving() || form.invalid">
            @if (isSaving()) {
              <ng-icon name="lucideLoader2" class="me-2 h-4 w-4 animate-spin" />
            } @else {
              <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
            }
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export default class LoanFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isEditMode = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly existingLoan = signal<Loan | null>(null);
  readonly persons = signal<Person[]>([]);

  // LOV Data
  readonly loanPurposes = this.mockService.loanPurposes;

  // Selected person
  readonly selectedPerson = computed(() => {
    const personId = this.form.get('personId')?.value;
    return this.persons().find(p => p.id === personId) || null;
  });

  // Calculated monthly payment
  readonly calculatedMonthlyPayment = computed(() => {
    const amount = this.form.get('loanAmount')?.value || 0;
    const payments = this.form.get('numberOfPayments')?.value || 1;
    const interest = this.form.get('interestRate')?.value || 0;

    if (interest === 0) {
      return amount / payments;
    }

    // Calculate with interest (simple interest for now)
    const totalWithInterest = amount * (1 + (interest / 100) * (payments / 12));
    return totalWithInterest / payments;
  });

  // Calculated end date
  readonly calculatedEndDate = computed(() => {
    const startDateStr = this.form.get('startDate')?.value;
    const payments = this.form.get('numberOfPayments')?.value || 0;

    if (!startDateStr || !payments) return '-';

    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + payments);

    return endDate.toLocaleDateString('he-IL');
  });

  // Form
  form: FormGroup = this.fb.group({
    personId: [null, Validators.required],
    loanAmount: [5000, [Validators.required, Validators.min(100)]],
    numberOfPayments: [12, [Validators.required, Validators.min(1), Validators.max(120)]],
    interestRate: [0, [Validators.min(0), Validators.max(100)]],
    paymentDay: [1, [Validators.min(1), Validators.max(28)]],
    startDate: [this.getDefaultStartDate(), Validators.required],
    purpose: [null],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadPersons();

    // Check if edit mode
    const loanId = this.route.snapshot.params['id'];
    if (loanId && loanId !== 'new') {
      this.isEditMode.set(true);
      this.loadLoan(parseInt(loanId, 10));
    }

    // Watch for form changes to trigger computed recalculation
    this.form.valueChanges.subscribe(() => {
      // Force signal update
    });
  }

  private getDefaultStartDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private async loadPersons(): Promise<void> {
    const result = await this.mockService.getPersons({ page: 1, pageSize: 1000 });
    this.persons.set(result.data);
  }

  private async loadLoan(id: number): Promise<void> {
    const loan = await this.mockService.getLoanById(id);
    if (loan) {
      this.existingLoan.set(loan);
      this.populateForm(loan);
    } else {
      this.errorMessage.set('Loan not found');
      this.router.navigate(['/gmn/loans']);
    }
  }

  private populateForm(loan: Loan): void {
    this.form.patchValue({
      personId: loan.personId,
      loanAmount: loan.loanAmount,
      numberOfPayments: loan.numberOfPayments,
      interestRate: loan.interestRate,
      paymentDay: loan.paymentDay,
      startDate: loan.startDate ? new Date(loan.startDate).toISOString().split('T')[0] : '',
      purpose: loan.purpose,
      notes: loan.notes,
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const formValue = this.form.value;
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + formValue.numberOfPayments);

      // For new loans, we would typically create via loan request
      // This is a simplified direct creation for admin purposes
      this.errorMessage.set('Direct loan creation is not supported. Please create a loan request first.');

      // In a real implementation:
      // const result = await this.mockService.createLoan(loanData);
      // if (result.isSuccess && result.data) {
      //   this.router.navigate(['/gmn/loans', result.data.id]);
      // }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred');
      console.error('Error saving loan:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
