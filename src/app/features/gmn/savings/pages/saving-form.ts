import { Component, computed, inject, signal, OnInit } from '@angular/core';
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
  selector: 'gmn-saving-form',
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
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/savings">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ isEditMode() ? 'עריכת פיקדון' : 'פיקדון חדש' }}</h1>
            <p class="text-muted-foreground">
              {{ isEditMode() ? 'עדכון פרטי הפיקדון' : 'יצירת פיקדון חדש' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Basic Info -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">פרטי פיקדון</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>מפקיד *</label>
                <brn-select formControlName="personId" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר מפקיד" />
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
                <label hlmLabel>סכום הפיקדון *</label>
                <input hlmInput type="number" formControlName="amount" class="w-full" />
              </div>

              <div>
                <label hlmLabel>ריבית שנתית (%)</label>
                <input hlmInput type="number" formControlName="interestRate" class="w-full" step="0.1" />
              </div>

              <div>
                <label hlmLabel>סוג פיקדון</label>
                <brn-select formControlName="type" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר סוג" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="REGULAR">רגיל</hlm-select-item>
                    <hlm-select-item value="LINKED">צמוד מדד</hlm-select-item>
                    <hlm-select-item value="DOLLAR">דולרי</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div hlmCard class="p-6">
            <h3 class="mb-4 font-semibold border-b pb-2">תאריכים</h3>
            <div class="space-y-4">
              <div>
                <label hlmLabel>תאריך פתיחה *</label>
                <input hlmInput type="date" formControlName="startDate" class="w-full" />
              </div>

              <div>
                <label hlmLabel>תקופה (חודשים)</label>
                <input hlmInput type="number" formControlName="termMonths" class="w-full" />
              </div>

              <div>
                <label hlmLabel>תאריך פדיון</label>
                <input hlmInput type="date" formControlName="maturityDate" class="w-full" [readonly]="true" />
                <p class="text-xs text-muted-foreground mt-1">מחושב אוטומטית</p>
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
          <button hlmBtn type="button" variant="outline" routerLink="/gmn/savings">
            <ng-icon name="lucideX" class="me-2 h-4 w-4" />
            ביטול
          </button>
          <button hlmBtn type="submit" [disabled]="!form.valid">
            <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
            {{ isEditMode() ? 'שמור שינויים' : 'צור פיקדון' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export default class SavingFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mockService = inject(GmnMockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly persons = this.mockService.persons;
  readonly isEditMode = signal(false);
  private savingId: number | null = null;

  form: FormGroup = this.fb.group({
    personId: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]],
    interestRate: [0],
    type: ['REGULAR'],
    startDate: ['', Validators.required],
    termMonths: [12],
    maturityDate: [''],
    paymentMethod: ['MASAV'],
    notes: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.savingId = Number(id);
      this.loadSaving();
    }

    // Auto-calculate maturity date
    this.form.get('startDate')?.valueChanges.subscribe(() => this.calculateMaturityDate());
    this.form.get('termMonths')?.valueChanges.subscribe(() => this.calculateMaturityDate());
  }

  private loadSaving(): void {
    const saving = this.mockService.savings().find(s => s.id === this.savingId);
    if (saving) {
      this.form.patchValue({
        personId: saving.personId.toString(),
        amount: saving.initialAmount,
        interestRate: saving.interestRate || 0,
        type: saving.savingType || 'REGULAR',
        startDate: this.formatDateForInput(saving.openDate),
        termMonths: saving.termMonths || 12,
        maturityDate: saving.maturityDate ? this.formatDateForInput(saving.maturityDate) : '',
        paymentMethod: saving.paymentMethod || 'MASAV',
        notes: saving.notes || '',
      });
    }
  }

  private calculateMaturityDate(): void {
    const startDate = this.form.get('startDate')?.value;
    const termMonths = this.form.get('termMonths')?.value || 12;

    if (startDate) {
      const maturity = new Date(startDate);
      maturity.setMonth(maturity.getMonth() + termMonths);
      this.form.get('maturityDate')?.setValue(this.formatDateForInput(maturity));
    }
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Save saving:', this.form.value);
      // TODO: Call mock service to save
      this.router.navigate(['/gmn/savings']);
    }
  }
}
