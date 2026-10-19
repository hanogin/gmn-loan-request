import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucideUserPlus,
  lucideChevronDown,
  lucideChevronUp,
  lucideCheck,
  lucideClock,
  lucideTrash2,
  lucideSave
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { toast } from '@spartan-ng/brain/sonner';

import { LoanRequestService } from '../../services/loan-request.service';
import { MockDataService } from '../../services/mock-data.service';
import { Guarantor, MIN_GUARANTORS, MAX_GUARANTORS } from '../../models/loan-request.model';
import { israeliIdValidator, passportValidator } from '../../validators/israeli-id.validator';
import { israeliPhoneValidator } from '../../validators/phone.validator';
import { nameValidator } from '../../validators/bank.validator';

@Component({
  selector: 'app-guarantors-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmFieldImports,
    HlmBadgeImports,
    BrnSelectImports,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucideUserPlus,
      lucideChevronDown,
      lucideChevronUp,
      lucideCheck,
      lucideClock,
      lucideTrash2,
      lucideSave,
    }),
  ],
  template: `
    <div class="step-container" dir="rtl">
      <!-- Step Header -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ng-icon name="lucideUsers" class="h-8 w-8 text-primary" />
        </div>
        <h2 class="text-2xl font-bold">{{ 'loanRequest.steps.guarantors' | transloco }}</h2>
        <p class="mt-2 text-muted-foreground">{{ 'loanRequest.guarantors.description' | transloco }}</p>
      </div>

      <!-- Progress Info -->
      <div class="mb-6 rounded-lg border bg-card p-4">
        <div class="flex items-center justify-between">
          <span class="font-medium">ערבים שנשמרו:</span>
          <span class="text-lg font-bold" [class.text-destructive]="loanService.savedGuarantorsCount() < MIN_GUARANTORS" [class.text-green-600]="loanService.savedGuarantorsCount() >= MIN_GUARANTORS">
            {{ loanService.savedGuarantorsCount() }} / {{ MIN_GUARANTORS }} (מינימום)
          </span>
        </div>
        @if (loanService.savedGuarantorsCount() < MIN_GUARANTORS) {
          <p class="mt-2 text-sm text-muted-foreground">
            יש להוסיף ולשמור לפחות {{ MIN_GUARANTORS }} ערבים
          </p>
        }
      </div>

      <!-- Guarantors List -->
      <div class="space-y-4">
        @for (guarantor of loanService.guarantors(); track $index; let i = $index) {
          <div class="rounded-lg border bg-card">
            <!-- Header -->
            <div
              class="flex cursor-pointer items-center justify-between p-4"
              (click)="toggleGuarantor(i)"
            >
              <div class="flex items-center gap-3">
                <ng-icon name="lucideUsers" class="h-5 w-5 text-muted-foreground" />
                <span class="font-medium">
                  {{ guarantor.firstName || 'ערב' }} {{ guarantor.lastName || (i + 1) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                @if (guarantor.isSaved) {
                  <span hlmBadge variant="default" class="bg-green-600">
                    <ng-icon name="lucideCheck" class="me-1 h-3 w-3" />
                    נשמר
                  </span>
                } @else {
                  <span hlmBadge variant="secondary">
                    <ng-icon name="lucideClock" class="me-1 h-3 w-3" />
                    ממתין
                  </span>
                }
                <ng-icon
                  [name]="expandedGuarantor() === i ? 'lucideChevronUp' : 'lucideChevronDown'"
                  class="h-4 w-4"
                />
              </div>
            </div>

            <!-- Body -->
            @if (expandedGuarantor() === i) {
              <div class="border-t p-4">
                <form [formGroup]="getGuarantorForm(i)" class="space-y-4">
                  <!-- Names Row -->
                  <div class="grid gap-4 sm:grid-cols-2">
                    <hlm-field>
                      <label hlmLabel>שם פרטי <span class="text-destructive">*</span></label>
                      <input
                        hlmInput
                        formControlName="firstName"
                        placeholder="שם פרטי"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                    <hlm-field>
                      <label hlmLabel>שם משפחה <span class="text-destructive">*</span></label>
                      <input
                        hlmInput
                        formControlName="lastName"
                        placeholder="שם משפחה"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                  </div>

                  <!-- Identity Row -->
                  <div class="grid gap-4 sm:grid-cols-2">
                    <hlm-field>
                      <label hlmLabel>סוג זהות <span class="text-destructive">*</span></label>
                      <brn-select formControlName="identityType" class="w-full">
                        <hlm-select-trigger class="w-full">
                          <hlm-select-value placeholder="בחר..." />
                        </hlm-select-trigger>
                        <hlm-select-content>
                          @for (type of mockData.identityTypes(); track type.id) {
                            <hlm-select-item [value]="type.id">{{ type.name }}</hlm-select-item>
                          }
                        </hlm-select-content>
                      </brn-select>
                    </hlm-field>
                    <hlm-field>
                      <label hlmLabel>מספר זיהוי <span class="text-destructive">*</span></label>
                      <input
                        hlmInput
                        formControlName="identityNumber"
                        placeholder="מספר זיהוי"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                  </div>

                  <!-- Address Row -->
                  <div class="grid gap-4 sm:grid-cols-3">
                    <hlm-field class="sm:col-span-2">
                      <label hlmLabel>רחוב <span class="text-destructive">*</span></label>
                      <input
                        hlmInput
                        formControlName="street"
                        placeholder="רחוב"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                    <hlm-field>
                      <label hlmLabel>מספר בית <span class="text-destructive">*</span></label>
                      <input
                        hlmInput
                        formControlName="houseNumber"
                        placeholder="מס'"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                  </div>

                  <!-- Address Row 2 -->
                  <div class="grid gap-4 sm:grid-cols-2">
                    <hlm-field>
                      <label hlmLabel>דירה</label>
                      <input
                        hlmInput
                        formControlName="apartment"
                        placeholder="מס'"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                    <hlm-field>
                      <label hlmLabel>עיר <span class="text-destructive">*</span></label>
                      <brn-select formControlName="city" class="w-full">
                        <hlm-select-trigger class="w-full">
                          <hlm-select-value placeholder="בחר עיר..." />
                        </hlm-select-trigger>
                        <hlm-select-content class="max-h-60">
                          @for (city of mockData.cities(); track city.id) {
                            <hlm-select-item [value]="city.id">{{ city.name }}</hlm-select-item>
                          }
                        </hlm-select-content>
                      </brn-select>
                    </hlm-field>
                  </div>

                  <!-- Contact Row -->
                  <div class="grid gap-4 sm:grid-cols-2">
                    <hlm-field>
                      <label hlmLabel>טלפון <span class="text-destructive">*</span></label>
                      <input
                        hlmInput
                        formControlName="phone"
                        placeholder="050-0000000"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                    <hlm-field>
                      <label hlmLabel>מייל <span class="text-destructive">*</span></label>
                      <input
                        hlmInput
                        type="email"
                        formControlName="email"
                        placeholder="email@example.com"
                        class="w-full"
                        [readonly]="guarantor.isSaved"
                      />
                    </hlm-field>
                  </div>

                  <!-- Profession -->
                  <hlm-field>
                    <label hlmLabel>עיסוק <span class="text-destructive">*</span></label>
                    <input
                      hlmInput
                      formControlName="profession"
                      placeholder="עיסוק"
                      class="w-full"
                      [readonly]="guarantor.isSaved"
                    />
                  </hlm-field>

                  <!-- Actions -->
                  <div class="flex items-center justify-between pt-4">
                    @if (!guarantor.isSaved) {
                      <button
                        hlmBtn
                        variant="destructive"
                        size="sm"
                        (click)="removeGuarantor(i)"
                      >
                        <ng-icon name="lucideTrash2" class="me-2 h-4 w-4" />
                        הסר ערב
                      </button>
                      <button
                        hlmBtn
                        (click)="saveGuarantor(i)"
                      >
                        <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
                        שמור ערב
                      </button>
                    } @else {
                      <span class="text-sm text-muted-foreground">הערב נשמר בהצלחה</span>
                    }
                  </div>
                </form>
              </div>
            }
          </div>
        }
      </div>

      <!-- Add Guarantor Button -->
      @if (loanService.canAddMoreGuarantors()) {
        <button
          hlmBtn
          variant="outline"
          class="mt-6 w-full"
          (click)="addGuarantor()"
        >
          <ng-icon name="lucideUserPlus" class="me-2 h-4 w-4" />
          הוסף ערב נוסף
        </button>
      } @else {
        <p class="mt-6 text-center text-sm text-muted-foreground">
          הגעת למקסימום {{ MAX_GUARANTORS }} ערבים
        </p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GuarantorsStepComponent {
  // Services
  protected readonly loanService = inject(LoanRequestService);
  protected readonly mockData = inject(MockDataService);
  private readonly fb = inject(FormBuilder);

  // Outputs
  valid = output<boolean>();

  // State
  expandedGuarantor = signal<number | null>(null);
  guarantorForms = new Map<number, FormGroup>();

  // Constants
  protected readonly MIN_GUARANTORS = MIN_GUARANTORS;
  protected readonly MAX_GUARANTORS = MAX_GUARANTORS;

  toggleGuarantor(index: number): void {
    if (this.expandedGuarantor() === index) {
      this.expandedGuarantor.set(null);
    } else {
      this.expandedGuarantor.set(index);
      this.ensureFormExists(index);
    }
  }

  getGuarantorForm(index: number): FormGroup {
    this.ensureFormExists(index);
    return this.guarantorForms.get(index)!;
  }

  private ensureFormExists(index: number): void {
    if (!this.guarantorForms.has(index)) {
      const guarantor = this.loanService.guarantors()[index];
      const form = this.createGuarantorForm(guarantor);
      this.guarantorForms.set(index, form);

      // Subscribe to form changes
      form.valueChanges.subscribe(value => {
        this.loanService.updateGuarantor(index, value);
      });
    }
  }

  private createGuarantorForm(guarantor: Guarantor): FormGroup {
    return this.fb.group({
      firstName: [guarantor.firstName || '', [Validators.required, nameValidator()]],
      lastName: [guarantor.lastName || '', [Validators.required, nameValidator()]],
      identityType: [guarantor.identityType || 58, Validators.required],
      identityNumber: [guarantor.identityNumber || '', [Validators.required, israeliIdValidator()]],
      street: [guarantor.street || '', [Validators.required, Validators.minLength(2)]],
      houseNumber: [guarantor.houseNumber || '', Validators.required],
      apartment: [guarantor.apartment || ''],
      city: [guarantor.city || '', Validators.required],
      countryCode: [guarantor.countryCode || '972'],
      phone: [guarantor.phone || '', [Validators.required, israeliPhoneValidator()]],
      email: [guarantor.email || '', [Validators.required, Validators.email]],
      profession: [guarantor.profession || '', [Validators.required, Validators.minLength(2)]],
    });
  }

  addGuarantor(): void {
    const newGuarantor = this.loanService.addGuarantor();
    if (newGuarantor) {
      const newIndex = this.loanService.guarantors().length - 1;
      this.expandedGuarantor.set(newIndex);
      toast.info('הוספת ערב חדש');
    }
  }

  saveGuarantor(index: number): void {
    const form = this.getGuarantorForm(index);

    if (form.invalid) {
      form.markAllAsTouched();
      toast.error('יש למלא את כל השדות הנדרשים');
      return;
    }

    // Update guarantor data from form
    this.loanService.updateGuarantor(index, form.value);

    // Try to save
    const success = this.loanService.saveGuarantor(index);

    if (success) {
      toast.success('פרטי הערב נשמרו בהצלחה');
      this.valid.emit(this.loanService.hasMinimumGuarantors());
    } else {
      // Check why it failed
      const guarantor = this.loanService.guarantors()[index];
      const formData = this.loanService.formData();

      if (guarantor.identityNumber === formData.identityNumber) {
        toast.error('אדם לא יכול להיות ערב לעצמו');
      } else {
        toast.error('לא ניתן להוסיף ערב פעמיים');
      }
    }
  }

  removeGuarantor(index: number): void {
    this.loanService.removeGuarantor(index);
    this.guarantorForms.delete(index);
    this.expandedGuarantor.set(null);
    toast.info('הערב הוסר');
    this.valid.emit(this.loanService.hasMinimumGuarantors());
  }
}
