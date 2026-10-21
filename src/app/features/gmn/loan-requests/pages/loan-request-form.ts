import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
  lucideShieldCheck,
  lucidePlus,
  lucideTrash2,
  lucideBuilding2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Person, LoanRequest, LoanGuarantor, BankAccount } from '../../../../core/models';

@Component({
  selector: 'gmn-loan-request-form',
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
      lucideShieldCheck,
      lucidePlus,
      lucideTrash2,
      lucideBuilding2,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Page Header -->
      <div class="flex items-center gap-4">
        <button hlmBtn variant="outline" size="icon" routerLink="/gmn/loan-requests">
          <ng-icon name="lucideArrowRight" class="h-4 w-4" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">
            {{ isEditMode() ? t('common.edit') : t('loanRequests.newRequest') }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ t('loanRequests.subtitle') }}</p>
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
          <!-- Applicant Selection -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideUser" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('loanRequests.fields.applicant') }}</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('loanRequests.fields.applicant') }} *</label>
                <brn-select formControlName="personId" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('loanRequests.fields.applicant')" />
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

          <!-- Loan Request Details -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideWallet" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.details') }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('loanRequests.fields.requestedAmount') }} *</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="requestedAmount"
                    class="w-full"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label hlmLabel>{{ t('loanRequests.fields.numberOfPayments') }} *</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="requestedTermMonths"
                    class="w-full"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div>
                <label hlmLabel>{{ t('loanRequests.fields.purpose') }} *</label>
                <brn-select formControlName="purpose" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('loanRequests.fields.purpose')" />
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

          <!-- Bank Account -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideBuilding2" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.bankAccount') }}</h2>
            </div>

            <div formGroupName="bankAccount" class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('common.bank') }} *</label>
                  <brn-select formControlName="bankId" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('common.bank')" />
                    </hlm-select-trigger>
                    <hlm-select-content class="max-h-60">
                      @for (bank of banks(); track bank.id) {
                        <hlm-select-item [value]="bank.id.toString()">{{ bank.id }} - {{ bank.name }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
                <div>
                  <label hlmLabel>{{ t('common.branch') }} *</label>
                  <input hlmInput type="text" formControlName="branchNumber" class="w-full" />
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('common.accountNumber') }} *</label>
                  <input hlmInput type="text" formControlName="accountNumber" class="w-full font-mono" />
                </div>
                <div>
                  <label hlmLabel>{{ t('common.accountName') }} *</label>
                  <input hlmInput type="text" formControlName="accountName" class="w-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- Guarantors -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <ng-icon name="lucideShieldCheck" class="h-5 w-5 text-primary" />
                <h2 class="text-lg font-semibold">{{ t('loanRequests.fields.guarantors') }}</h2>
              </div>
              <button hlmBtn variant="outline" size="sm" type="button" (click)="addGuarantor()">
                <ng-icon name="lucidePlus" class="me-1 h-4 w-4" />
                {{ t('loanRequests.actions.addGuarantor') }}
              </button>
            </div>

            <div formArrayName="guarantors" class="space-y-4">
              @for (guarantor of guarantorsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="rounded-lg border p-4">
                  <div class="mb-3 flex items-center justify-between">
                    <span class="font-medium">{{ t('loanRequests.fields.guarantors') }} {{ i + 1 }}</span>
                    <button hlmBtn variant="ghost" size="icon" type="button" (click)="removeGuarantor(i)">
                      <ng-icon name="lucideTrash2" class="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label hlmLabel>{{ t('people.fields.firstName') }} *</label>
                      <input hlmInput type="text" formControlName="firstName" class="w-full" />
                    </div>
                    <div>
                      <label hlmLabel>{{ t('people.fields.lastName') }} *</label>
                      <input hlmInput type="text" formControlName="lastName" class="w-full" />
                    </div>
                    <div>
                      <label hlmLabel>{{ t('people.fields.idNumber') }} *</label>
                      <input hlmInput type="text" formControlName="identityNumber" class="w-full font-mono" />
                    </div>
                    <div>
                      <label hlmLabel>{{ t('people.fields.phone') }} *</label>
                      <input hlmInput type="tel" formControlName="phone" class="w-full" dir="ltr" />
                    </div>
                  </div>
                </div>
              }

              @if (guarantorsArray.length === 0) {
                <div class="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  {{ t('common.noData') }}
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex items-center justify-end gap-4">
          <button hlmBtn variant="outline" type="button" routerLink="/gmn/loan-requests">
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
export default class LoanRequestFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isEditMode = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly existingRequest = signal<LoanRequest | null>(null);
  readonly persons = signal<Person[]>([]);

  // LOV Data
  readonly loanPurposes = this.mockService.loanPurposes;
  readonly banks = this.mockService.banks;

  // Selected person
  readonly selectedPerson = computed(() => {
    const personId = this.form.get('personId')?.value;
    return this.persons().find(p => p.id === personId) || null;
  });

  // Form
  form: FormGroup = this.fb.group({
    personId: [null, Validators.required],
    requestedAmount: [5000, [Validators.required, Validators.min(100)]],
    requestedTermMonths: [12, [Validators.required, Validators.min(1), Validators.max(120)]],
    purpose: [null, Validators.required],
    notes: [''],
    bankAccount: this.fb.group({
      bankId: [null, Validators.required],
      branchNumber: ['', Validators.required],
      accountNumber: ['', Validators.required],
      accountName: ['', Validators.required],
    }),
    guarantors: this.fb.array([]),
  });

  get guarantorsArray(): FormArray {
    return this.form.get('guarantors') as FormArray;
  }

  ngOnInit(): void {
    this.loadPersons();

    // Check if edit mode
    const requestId = this.route.snapshot.params['id'];
    if (requestId && requestId !== 'new') {
      this.isEditMode.set(true);
      this.loadLoanRequest(parseInt(requestId, 10));
    }
  }

  private async loadPersons(): Promise<void> {
    const result = await this.mockService.getPersons({ page: 1, pageSize: 1000 });
    this.persons.set(result.data);
  }

  private async loadLoanRequest(id: number): Promise<void> {
    const request = await this.mockService.getLoanRequestById(id);
    if (request) {
      this.existingRequest.set(request);
      this.populateForm(request);
    } else {
      this.errorMessage.set('Loan request not found');
      this.router.navigate(['/gmn/loan-requests']);
    }
  }

  private populateForm(request: LoanRequest): void {
    this.form.patchValue({
      personId: request.personId,
      requestedAmount: request.requestedAmount,
      requestedTermMonths: request.requestedTermMonths,
      purpose: request.purpose,
      notes: request.notes,
      bankAccount: request.bankAccount,
    });

    // Clear and repopulate guarantors
    this.guarantorsArray.clear();
    request.guarantors.forEach(g => {
      this.guarantorsArray.push(this.createGuarantorGroup(g));
    });
  }

  private createGuarantorGroup(guarantor?: Partial<LoanGuarantor>): FormGroup {
    return this.fb.group({
      firstName: [guarantor?.firstName || '', Validators.required],
      lastName: [guarantor?.lastName || '', Validators.required],
      identityNumber: [guarantor?.identityNumber || '', Validators.required],
      phone: [guarantor?.phone || '', Validators.required],
      email: [guarantor?.email || ''],
      identityType: [guarantor?.identityType || 1],
      isSaved: [false],
      isVerified: [false],
    });
  }

  addGuarantor(): void {
    this.guarantorsArray.push(this.createGuarantorGroup());
  }

  removeGuarantor(index: number): void {
    this.guarantorsArray.removeAt(index);
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

      const requestData: Omit<LoanRequest, 'id' | 'requestNumber' | 'serialNumber' | 'createdAt'> = {
        personId: formValue.personId,
        requestedAmount: formValue.requestedAmount,
        requestedTermMonths: formValue.requestedTermMonths,
        purpose: formValue.purpose,
        purposeName: this.loanPurposes().find(p => p.id === formValue.purpose)?.name,
        bankAccount: formValue.bankAccount as BankAccount,
        guarantors: formValue.guarantors as LoanGuarantor[],
        status: 'DRAFT',
        statusName: 'טיוטה',
        requestDate: new Date(),
        registrationFeeAmount: 0,
        registrationFeePaid: false,
        documentsComplete: false,
        isOnlineRequest: false,
        notes: formValue.notes,
        isActive: true,
      };

      const result = await this.mockService.createLoanRequest(requestData);
      if (result.isSuccess && result.data) {
        this.router.navigate(['/gmn/loan-requests', result.data.id]);
      } else {
        this.errorMessage.set(result.message || 'Failed to create loan request');
      }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred');
      console.error('Error saving loan request:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
