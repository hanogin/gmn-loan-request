import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideSave,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-donation-form',
  standalone: true,
  imports: [
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
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/donations">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ isEditMode() ? t('common.edit') : t('donations.newDonation') }}</h1>
            <p class="text-muted-foreground">
              {{ t('donations.subtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Donor & Amount -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('common.details') }}</h3>
            <div class="space-y-4">
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

              <div>
                <label hlmLabel>{{ t('common.amount') }} *</label>
                <input hlmInput type="number" formControlName="amount" class="w-full" />
              </div>

              <div>
                <label hlmLabel>{{ t('common.date') }} *</label>
                <input hlmInput type="date" formControlName="donationDate" class="w-full" />
              </div>

              <div>
                <label hlmLabel>{{ t('donations.fields.purpose') }}</label>
                <brn-select formControlName="purpose" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('donations.fields.purpose')" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="">{{ t('donations.types.oneTime') }}</hlm-select-item>
                    <hlm-select-item value="LOAN_FUND">{{ t('loans.title') }}</hlm-select-item>
                    <hlm-select-item value="OPERATIONS">{{ t('accounting.accountTypes.expense') }}</hlm-select-item>
                    <hlm-select-item value="INTEREST">{{ t('loans.payments.interest') }}</hlm-select-item>
                    <hlm-select-item value="DEDICATED">{{ t('donations.types.inKind') }}</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('donations.fields.paymentMethod') }}</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('donations.fields.paymentMethod') }} *</label>
                <brn-select formControlName="paymentMethod" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('donations.fields.paymentMethod')" />
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
                  <label hlmLabel>{{ t('admin.settings.organization') }}</label>
                  <input hlmInput type="text" formControlName="bankName" class="w-full" />
                </div>
              }

              <div>
                <label hlmLabel>{{ t('donations.fields.receiptNumber') }}</label>
                <input hlmInput type="text" formControlName="receiptNumber" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div hlmCard class="p-6 lg:col-span-2">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('common.notes') }}</h3>
            <textarea
              hlmInput
              formControlName="notes"
              class="w-full min-h-[100px]"
              [placeholder]="t('common.notes')"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <button hlmBtn type="button" variant="outline" routerLink="/gmn/donations">
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
export default class DonationFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly persons = this.mockService.persons;
  readonly isEditMode = signal(false);
  private donationId: number | null = null;

  form: FormGroup = this.fb.group({
    personId: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]],
    donationDate: ['', Validators.required],
    purpose: [''],
    paymentMethod: ['CASH', Validators.required],
    checkNumber: [''],
    bankName: [''],
    receiptNumber: [''],
    notes: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.donationId = Number(id);
      this.loadDonation();
    } else {
      // Set default date to today
      this.form.get('donationDate')?.setValue(this.formatDateForInput(new Date()));
    }
  }

  private loadDonation(): void {
    const donation = this.mockService.donations().find(d => d.id === this.donationId);
    if (donation) {
      this.form.patchValue({
        personId: donation.personId.toString(),
        amount: donation.amount,
        donationDate: this.formatDateForInput(donation.donationDate),
        purpose: donation.purpose || '',
        paymentMethod: donation.paymentMethod || 'CASH',
        receiptNumber: donation.receiptNumber || '',
        notes: donation.notes || '',
      });
    }
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Save donation:', this.form.value);
      // TODO: Call mock service to save
      this.router.navigate(['/gmn/donations']);
    }
  }
}
