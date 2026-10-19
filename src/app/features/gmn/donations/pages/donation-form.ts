import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
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
    <div class="space-y-6" >
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/donations">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ isEditMode() ? 'עריכת תרומה' : 'תרומה חדשה' }}</h1>
            <p class="text-muted-foreground">
              {{ isEditMode() ? 'עדכון פרטי התרומה' : 'רישום תרומה חדשה' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Donor & Amount -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי התרומה</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>תורם *</label>
                <brn-select formControlName="personId" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר תורם" />
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
                <label hlmLabel>סכום *</label>
                <input hlmInput type="number" formControlName="amount" class="w-full" />
              </div>

              <div>
                <label hlmLabel>תאריך תרומה *</label>
                <input hlmInput type="date" formControlName="donationDate" class="w-full" />
              </div>

              <div>
                <label hlmLabel>ייעוד</label>
                <brn-select formControlName="purpose" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר ייעוד" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="">כללי</hlm-select-item>
                    <hlm-select-item value="LOAN_FUND">קרן הלוואות</hlm-select-item>
                    <hlm-select-item value="OPERATIONS">תפעול</hlm-select-item>
                    <hlm-select-item value="INTEREST">כיסוי ריבית</hlm-select-item>
                    <hlm-select-item value="DEDICATED">ייעודי</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">אמצעי תשלום</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>אמצעי תשלום *</label>
                <brn-select formControlName="paymentMethod" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר אמצעי" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="CASH">מזומן</hlm-select-item>
                    <hlm-select-item value="CHECK">צ'ק</hlm-select-item>
                    <hlm-select-item value="TRANSFER">העברה בנקאית</hlm-select-item>
                    <hlm-select-item value="CREDIT">כרטיס אשראי</hlm-select-item>
                    <hlm-select-item value="MASAV">מס"ב</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>

              @if (form.get('paymentMethod')?.value === 'CHECK') {
                <div>
                  <label hlmLabel>מספר צ'ק</label>
                  <input hlmInput type="text" formControlName="checkNumber" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>בנק</label>
                  <input hlmInput type="text" formControlName="bankName" class="w-full" />
                </div>
              }

              <div>
                <label hlmLabel>מספר קבלה</label>
                <input hlmInput type="text" formControlName="receiptNumber" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div hlmCard class="p-6 lg:col-span-2">
            <h3 class="mb-4 font-semibold border-b pb-2">הערות</h3>
            <textarea 
              hlmInput 
              formControlName="notes" 
              class="w-full min-h-[100px]"
              placeholder="הערות נוספות..."
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <button hlmBtn type="button" variant="outline" routerLink="/gmn/donations">
            <ng-icon name="lucideX" class="me-2 h-4 w-4" />
            ביטול
          </button>
          <button hlmBtn type="submit" [disabled]="!form.valid">
            <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
            {{ isEditMode() ? 'שמור שינויים' : 'שמור תרומה' }}
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
