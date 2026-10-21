import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideSave,
  lucideX,
  lucideCreditCard,
  lucideSearch,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    ReactiveFormsModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideSave,
      lucideX,
      lucideCreditCard,
      lucideSearch,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/payments">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('payments.newPayment') }}</h1>
            <p class="text-muted-foreground">{{ t('payments.subtitle') }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Payment Source -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('common.details') }}</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('payments.fields.type') }} *</label>
                <brn-select formControlName="entityType" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('payments.fields.type')" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="LOAN">{{ t('payments.types.loanPayment') }}</hlm-select-item>
                    <hlm-select-item value="SAVING">{{ t('payments.types.savingDeposit') }}</hlm-select-item>
                    <hlm-select-item value="DONATION">{{ t('payments.types.donation') }}</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>

              @if (form.get('entityType')?.value === 'LOAN') {
                <div>
                  <label hlmLabel>{{ t('loans.title') }} *</label>
                  <brn-select formControlName="entityId" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('loans.fields.loanNumber')" />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      @for (loan of activeLoans(); track loan.id) {
                        <hlm-select-item [value]="loan.id.toString()">
                          {{ loan.loanNumber }} - {{ getPersonName(loan.personId) }}
                        </hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
              }

              @if (form.get('entityType')?.value === 'SAVING') {
                <div>
                  <label hlmLabel>{{ t('savings.title') }} *</label>
                  <brn-select formControlName="entityId" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('savings.fields.savingNumber')" />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      @for (saving of activeSavings(); track saving.id) {
                        <hlm-select-item [value]="saving.id.toString()">
                          {{ saving.savingNumber }} - {{ getPersonName(saving.personId) }}
                        </hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
              }

              @if (form.get('entityType')?.value === 'DONATION') {
                <div>
                  <label hlmLabel>{{ t('donations.fields.donor') }} *</label>
                  <brn-select formControlName="personId" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('donations.fields.donor')" />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      @for (person of persons(); track person.id) {
                        <hlm-select-item [value]="person.id.toString()">
                          {{ person.fullName || person.firstName + ' ' + person.lastName }}
                        </hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
              }

              <div>
                <label hlmLabel>{{ t('common.amount') }} *</label>
                <input hlmInput type="number" formControlName="amount" class="w-full" />
              </div>

              <div>
                <label hlmLabel>{{ t('common.date') }} *</label>
                <input hlmInput type="date" formControlName="paymentDate" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('payments.fields.method') }}</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('payments.fields.method') }} *</label>
                <brn-select formControlName="paymentMethod" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('payments.fields.method')" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="CASH">{{ t('donations.paymentMethods.cash') }}</hlm-select-item>
                    <hlm-select-item value="CHECK">{{ t('donations.paymentMethods.check') }}</hlm-select-item>
                    <hlm-select-item value="TRANSFER">{{ t('donations.paymentMethods.bankTransfer') }}</hlm-select-item>
                    <hlm-select-item value="CREDIT">{{ t('donations.paymentMethods.creditCard') }}</hlm-select-item>
                    <hlm-select-item value="MASAV">{{ t('masav.title') }}</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>

              @if (form.get('paymentMethod')?.value === 'CHECK') {
                <div>
                  <label hlmLabel>{{ t('donations.paymentMethods.check') }} #</label>
                  <input hlmInput type="text" formControlName="checkNumber" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>{{ t('common.bank') }}</label>
                  <input hlmInput type="text" formControlName="bankName" class="w-full" />
                </div>
              }

              @if (form.get('paymentMethod')?.value === 'TRANSFER') {
                <div>
                  <label hlmLabel>{{ t('payments.fields.reference') }}</label>
                  <input hlmInput type="text" formControlName="referenceNumber" class="w-full" />
                </div>
              }

              <div>
                <label hlmLabel>{{ t('common.notes') }}</label>
                <textarea
                  hlmInput
                  formControlName="notes"
                  class="w-full min-h-[80px]"
                  [placeholder]="t('common.notes')"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <button hlmBtn type="button" variant="outline" routerLink="/gmn/payments">
            <ng-icon name="lucideX" class="me-2 h-4 w-4" />
            {{ t('common.cancel') }}
          </button>
          <button hlmBtn type="submit" [disabled]="!form.valid">
            <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export default class PaymentFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly persons = this.mockService.persons;
  readonly activeLoans = computed(() => this.mockService.loans().filter(l => l.status === 'ACTIVE'));
  readonly activeSavings = computed(() => this.mockService.savings().filter(s => s.status === 'ACTIVE'));

  form: FormGroup = this.fb.group({
    entityType: ['LOAN', Validators.required],
    entityId: [''],
    personId: [''],
    amount: ['', [Validators.required, Validators.min(1)]],
    paymentDate: ['', Validators.required],
    paymentMethod: ['CASH', Validators.required],
    checkNumber: [''],
    bankName: [''],
    referenceNumber: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.form.get('paymentDate')?.setValue(this.formatDateForInput(new Date()));

    // Watch entity type changes to update validation
    this.form.get('entityType')?.valueChanges.subscribe(type => {
      const entityIdControl = this.form.get('entityId');
      const personIdControl = this.form.get('personId');

      if (type === 'DONATION') {
        entityIdControl?.clearValidators();
        personIdControl?.setValidators(Validators.required);
      } else {
        entityIdControl?.setValidators(Validators.required);
        personIdControl?.clearValidators();
      }

      entityIdControl?.updateValueAndValidity();
      personIdControl?.updateValueAndValidity();
    });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getPersonName(personId: number): string {
    const person = this.mockService.persons().find(p => p.id === personId);
    return person?.fullName || `${person?.firstName} ${person?.lastName}` || '-';
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Save payment:', this.form.value);
      // TODO: Call mock service to save
      this.router.navigate(['/gmn/payments']);
    }
  }
}
