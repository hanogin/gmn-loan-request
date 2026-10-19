import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideSave,
  lucideX,
  lucideUser,
  lucideWallet,
  lucideCalendar,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-loan-form',
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
      lucideUser,
      lucideWallet,
      lucideCalendar,
    }),
  ],
  template: `
    <div class="space-y-6" >
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/loans">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ isEditMode() ? 'עריכת הלוואה' : 'הלוואה חדשה' }}</h1>
            <p class="text-muted-foreground">
              {{ isEditMode() ? 'עדכון פרטי ההלוואה' : 'יצירת הלוואה חדשה' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Basic Info -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי הלוואה בסיסיים</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>לווה *</label>
                <brn-select formControlName="personId" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר לווה" />
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
                <label hlmLabel>סכום הלוואה *</label>
                <input hlmInput type="number" formControlName="loanAmount" class="w-full" />
              </div>

              <div>
                <label hlmLabel>מספר תשלומים *</label>
                <input hlmInput type="number" formControlName="numberOfPayments" class="w-full" />
              </div>

              <div>
                <label hlmLabel>תשלום חודשי</label>
                <input hlmInput type="number" formControlName="monthlyPayment" class="w-full" [readonly]="true" />
                <p class="text-xs text-muted-foreground mt-1">מחושב אוטומטית</p>
              </div>

              <div>
                <label hlmLabel>ריבית (%)</label>
                <input hlmInput type="number" formControlName="interestRate" class="w-full" step="0.1" />
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי תשלום</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>תאריך התחלה *</label>
                <input hlmInput type="date" formControlName="startDate" class="w-full" />
              </div>

              <div>
                <label hlmLabel>יום גבייה בחודש *</label>
                <brn-select formControlName="paymentDay" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר יום" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    @for (day of paymentDays; track day) {
                      <hlm-select-item [value]="day.toString()">{{ day }}</hlm-select-item>
                    }
                  </hlm-select-content>
                </brn-select>
              </div>

              <div>
                <label hlmLabel>אמצעי תשלום</label>
                <brn-select formControlName="paymentMethod" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר אמצעי" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="MASAV">מס"ב</hlm-select-item>
                    <hlm-select-item value="CHECK">צ'ק</hlm-select-item>
                    <hlm-select-item value="CASH">מזומן</hlm-select-item>
                    <hlm-select-item value="TRANSFER">העברה בנקאית</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>

              <div>
                <label hlmLabel>מטרת ההלוואה</label>
                <brn-select formControlName="purpose" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר מטרה" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="WEDDING">חתונה</hlm-select-item>
                    <hlm-select-item value="MEDICAL">רפואי</hlm-select-item>
                    <hlm-select-item value="HOUSING">דיור</hlm-select-item>
                    <hlm-select-item value="BUSINESS">עסק</hlm-select-item>
                    <hlm-select-item value="EDUCATION">חינוך</hlm-select-item>
                    <hlm-select-item value="OTHER">אחר</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
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
          <button hlmBtn type="button" variant="outline" routerLink="/gmn/loans">
            <ng-icon name="lucideX" class="me-2 h-4 w-4" />
            ביטול
          </button>
          <button hlmBtn type="submit" [disabled]="!form.valid">
            <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
            {{ isEditMode() ? 'שמור שינויים' : 'צור הלוואה' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export default class LoanFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly persons = this.mockService.persons;
  readonly paymentDays = Array.from({ length: 28 }, (_, i) => i + 1);

  readonly isEditMode = signal(false);
  private loanId: number | null = null;

  form: FormGroup = this.fb.group({
    personId: ['', Validators.required],
    loanAmount: ['', [Validators.required, Validators.min(1)]],
    numberOfPayments: ['', [Validators.required, Validators.min(1)]],
    monthlyPayment: [{ value: '', disabled: false }],
    interestRate: [0],
    startDate: ['', Validators.required],
    paymentDay: ['1', Validators.required],
    paymentMethod: ['MASAV'],
    purpose: [''],
    notes: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.loanId = Number(id);
      this.loadLoan();
    }

    // Auto-calculate monthly payment
    this.form.get('loanAmount')?.valueChanges.subscribe(() => this.calculateMonthlyPayment());
    this.form.get('numberOfPayments')?.valueChanges.subscribe(() => this.calculateMonthlyPayment());
    this.form.get('interestRate')?.valueChanges.subscribe(() => this.calculateMonthlyPayment());
  }

  private loadLoan(): void {
    const loan = this.mockService.loans().find(l => l.id === this.loanId);
    if (loan) {
      this.form.patchValue({
        personId: loan.personId.toString(),
        loanAmount: loan.loanAmount,
        numberOfPayments: loan.numberOfPayments,
        monthlyPayment: loan.monthlyPayment,
        interestRate: loan.interestRate || 0,
        startDate: this.formatDateForInput(loan.startDate),
        paymentDay: loan.paymentDay.toString(),
        paymentMethod: loan.paymentMethod || 'MASAV',
        purpose: loan.purpose || '',
        notes: loan.notes || '',
      });
    }
  }

  private calculateMonthlyPayment(): void {
    const amount = this.form.get('loanAmount')?.value || 0;
    const payments = this.form.get('numberOfPayments')?.value || 1;
    const interest = this.form.get('interestRate')?.value || 0;

    if (amount && payments) {
      let monthly: number;
      if (interest > 0) {
        const monthlyRate = interest / 100 / 12;
        monthly = (amount * monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
                  (Math.pow(1 + monthlyRate, payments) - 1);
      } else {
        monthly = amount / payments;
      }
      this.form.get('monthlyPayment')?.setValue(Math.round(monthly));
    }
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      console.log('Save loan:', formValue);
      // TODO: Call mock service to save
      this.router.navigate(['/gmn/loans']);
    }
  }
}
