import { Component, inject, output, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser, lucideAlertCircle } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { BrnSelectImports } from '@spartan-ng/brain/select';

import { LoanRequestService } from '../../services/loan-request.service';
import { MockDataService } from '../../services/mock-data.service';
import { israeliIdValidator, passportValidator } from '../../validators/israeli-id.validator';
import { israeliPhoneValidator } from '../../validators/phone.validator';
import { loanAmountValidator, nameValidator } from '../../validators/bank.validator';

@Component({
  selector: 'app-personal-info-step',
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
    BrnSelectImports,
  ],
  providers: [
    provideIcons({
      lucideUser,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="step-container" dir="rtl">
      <!-- Step Header -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ng-icon name="lucideUser" class="h-8 w-8 text-primary" />
        </div>
        <h2 class="text-2xl font-bold">{{ 'loanRequest.steps.personalInfo' | transloco }}</h2>
        <p class="mt-2 text-muted-foreground">{{ 'loanRequest.personalInfo.description' | transloco }}</p>
      </div>

      <!-- Form -->
      <form [formGroup]="form" class="space-y-6">
        <!-- Names Row -->
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- First Name -->
          <hlm-field>
            <label hlmLabel for="firstName">
              {{ 'loanRequest.fields.firstName' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="firstName"
              formControlName="firstName"
              [placeholder]="'loanRequest.placeholders.firstName' | transloco"
              class="w-full"
            />
            @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('firstName') }}</p>
            }
          </hlm-field>

          <!-- Last Name -->
          <hlm-field>
            <label hlmLabel for="lastName">
              {{ 'loanRequest.fields.lastName' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="lastName"
              formControlName="lastName"
              [placeholder]="'loanRequest.placeholders.lastName' | transloco"
              class="w-full"
            />
            @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('lastName') }}</p>
            }
          </hlm-field>
        </div>

        <!-- Identity Row -->
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Identity Type -->
          <hlm-field>
            <label hlmLabel>
              {{ 'loanRequest.fields.identityType' | transloco }} <span class="text-destructive">*</span>
            </label>
            <brn-select formControlName="identityType" class="w-full">
              <hlm-select-trigger class="w-full">
                <hlm-select-value [placeholder]="'loanRequest.placeholders.select' | transloco" />
              </hlm-select-trigger>
              <hlm-select-content>
                @for (type of mockData.identityTypes(); track type.id) {
                  <hlm-select-item [value]="type.id">{{ type.name }}</hlm-select-item>
                }
              </hlm-select-content>
            </brn-select>
          </hlm-field>

          <!-- Identity Number -->
          <hlm-field>
            <label hlmLabel for="identityNumber">
              {{ 'loanRequest.fields.identityNumber' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="identityNumber"
              formControlName="identityNumber"
              [placeholder]="'loanRequest.placeholders.identityNumber' | transloco"
              class="w-full"
            />
            @if (form.get('identityNumber')?.invalid && form.get('identityNumber')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('identityNumber') }}</p>
            }
          </hlm-field>
        </div>

        <!-- Title -->
        <hlm-field>
          <label hlmLabel>
            {{ 'loanRequest.fields.title' | transloco }} <span class="text-destructive">*</span>
          </label>
          <brn-select formControlName="title" class="w-full">
            <hlm-select-trigger class="w-full">
              <hlm-select-value [placeholder]="'loanRequest.placeholders.select' | transloco" />
            </hlm-select-trigger>
            <hlm-select-content>
              @for (title of mockData.titles(); track title.id) {
                <hlm-select-item [value]="title.id">{{ title.name }}</hlm-select-item>
              }
            </hlm-select-content>
          </brn-select>
        </hlm-field>

        <!-- Address Row -->
        <div class="grid gap-4 sm:grid-cols-3">
          <!-- Street -->
          <hlm-field class="sm:col-span-2">
            <label hlmLabel for="street">
              {{ 'loanRequest.fields.street' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="street"
              formControlName="street"
              [placeholder]="'loanRequest.placeholders.street' | transloco"
              class="w-full"
            />
          </hlm-field>

          <!-- House Number -->
          <hlm-field>
            <label hlmLabel for="houseNumber">
              {{ 'loanRequest.fields.houseNumber' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="houseNumber"
              formControlName="houseNumber"
              [placeholder]="'loanRequest.placeholders.houseNumber' | transloco"
              class="w-full"
            />
          </hlm-field>
        </div>

        <!-- Address Row 2 -->
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Apartment -->
          <hlm-field>
            <label hlmLabel for="apartment">
              {{ 'loanRequest.fields.apartment' | transloco }}
            </label>
            <input
              hlmInput
              id="apartment"
              formControlName="apartment"
              [placeholder]="'loanRequest.placeholders.apartment' | transloco"
              class="w-full"
            />
          </hlm-field>

          <!-- City -->
          <hlm-field>
            <label hlmLabel>
              {{ 'loanRequest.fields.city' | transloco }} <span class="text-destructive">*</span>
            </label>
            <brn-select formControlName="city" class="w-full">
              <hlm-select-trigger class="w-full">
                <hlm-select-value [placeholder]="'loanRequest.placeholders.searchCity' | transloco" />
              </hlm-select-trigger>
              <hlm-select-content class="max-h-60">
                @for (city of mockData.cities(); track city.id) {
                  <hlm-select-item [value]="city.id">{{ city.name }}</hlm-select-item>
                }
              </hlm-select-content>
            </brn-select>
          </hlm-field>
        </div>

        <!-- Phone Row -->
        <div class="grid gap-4 sm:grid-cols-3">
          <!-- Country Code -->
          <hlm-field>
            <label hlmLabel for="countryCode">
              {{ 'loanRequest.fields.countryCode' | transloco }}
            </label>
            <input
              hlmInput
              id="countryCode"
              formControlName="countryCode"
              class="w-full"
            />
          </hlm-field>

          <!-- Mobile Phone -->
          <hlm-field>
            <label hlmLabel for="mobilePhone">
              {{ 'loanRequest.fields.mobilePhone' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="mobilePhone"
              formControlName="mobilePhone"
              [placeholder]="'loanRequest.placeholders.phone' | transloco"
              class="w-full"
            />
            @if (form.get('mobilePhone')?.invalid && form.get('mobilePhone')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('mobilePhone') }}</p>
            }
          </hlm-field>

          <!-- Phone 2 -->
          <hlm-field>
            <label hlmLabel for="phone">
              {{ 'loanRequest.fields.phone2' | transloco }}
            </label>
            <input
              hlmInput
              id="phone"
              formControlName="phone"
              [placeholder]="'loanRequest.placeholders.phone' | transloco"
              class="w-full"
            />
          </hlm-field>
        </div>

        <!-- Email & Profession Row -->
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Email -->
          <hlm-field>
            <label hlmLabel for="email">
              {{ 'loanRequest.fields.email' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              type="email"
              id="email"
              formControlName="email"
              [placeholder]="'loanRequest.placeholders.email' | transloco"
              class="w-full"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('email') }}</p>
            }
          </hlm-field>

          <!-- Profession -->
          <hlm-field>
            <label hlmLabel for="profession">
              {{ 'loanRequest.fields.profession' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="profession"
              formControlName="profession"
              [placeholder]="'loanRequest.placeholders.profession' | transloco"
              class="w-full"
            />
          </hlm-field>
        </div>

        <!-- Loan Details Row -->
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Loan Amount -->
          <hlm-field>
            <label hlmLabel for="loanAmount">
              {{ 'loanRequest.fields.loanAmount' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              type="number"
              id="loanAmount"
              formControlName="loanAmount"
              [placeholder]="'loanRequest.placeholders.loanAmount' | transloco"
              class="w-full"
              min="1"
            />
            @if (form.get('loanAmount')?.invalid && form.get('loanAmount')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('loanAmount') }}</p>
            }
          </hlm-field>

          <!-- Purpose -->
          <hlm-field>
            <label hlmLabel>
              {{ 'loanRequest.fields.purpose' | transloco }}
            </label>
            <brn-select formControlName="purpose" class="w-full">
              <hlm-select-trigger class="w-full">
                <hlm-select-value [placeholder]="'loanRequest.placeholders.select' | transloco" />
              </hlm-select-trigger>
              <hlm-select-content>
                @for (purpose of mockData.purposes(); track purpose.id) {
                  <hlm-select-item [value]="purpose.id">{{ purpose.name }}</hlm-select-item>
                }
              </hlm-select-content>
            </brn-select>
          </hlm-field>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PersonalInfoStepComponent implements OnInit {
  // Services
  protected readonly loanService = inject(LoanRequestService);
  protected readonly mockData = inject(MockDataService);
  private readonly fb = inject(FormBuilder);

  // Outputs
  valid = output<boolean>();

  // Form
  form!: FormGroup;

  constructor() {
    // Effect to update service when form changes
    effect(() => {
      if (this.form?.valid) {
        this.loanService.updateFormData(this.form.value);
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupFormSubscription();
  }

  private initForm(): void {
    const data = this.loanService.formData();

    this.form = this.fb.group({
      firstName: [data.firstName || '', [Validators.required, nameValidator()]],
      lastName: [data.lastName || '', [Validators.required, nameValidator()]],
      identityType: [data.identityType || 58, Validators.required],
      identityNumber: [data.identityNumber || '', [Validators.required]],
      title: [data.title || '', Validators.required],
      street: [data.street || '', [Validators.required, Validators.minLength(2)]],
      houseNumber: [data.houseNumber || '', Validators.required],
      apartment: [data.apartment || ''],
      city: [data.city || '', Validators.required],
      countryCode: [data.countryCode || '972'],
      mobilePhone: [data.mobilePhone || '', [Validators.required, israeliPhoneValidator()]],
      phone: [data.phone || ''],
      email: [data.email || '', [Validators.required, Validators.email]],
      profession: [data.profession || '', [Validators.required, Validators.minLength(2)]],
      loanAmount: [data.loanAmount || '', [Validators.required, loanAmountValidator()]],
      purpose: [data.purpose || ''],
    });

    // Update identity validator based on identity type
    this.form.get('identityType')?.valueChanges.subscribe(type => {
      const identityControl = this.form.get('identityNumber');
      if (type === 58) {
        identityControl?.setValidators([Validators.required, israeliIdValidator()]);
      } else {
        identityControl?.setValidators([Validators.required, passportValidator()]);
      }
      identityControl?.updateValueAndValidity();
    });
  }

  private setupFormSubscription(): void {
    this.form.valueChanges.subscribe(value => {
      this.loanService.updateFormData(value);
      this.valid.emit(this.form.valid);
    });

    // Emit initial validity
    this.valid.emit(this.form.valid);
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control?.errors) return '';

    if (control.errors['required']) return 'שדה חובה';
    if (control.errors['email']) return 'כתובת מייל לא תקינה';
    if (control.errors['israeliId']) return control.errors['israeliId'].message || 'מספר זהות לא תקין';
    if (control.errors['passport']) return control.errors['passport'].message || 'מספר דרכון לא תקין';
    if (control.errors['phone']) return control.errors['phone'].message || 'מספר טלפון לא תקין';
    if (control.errors['loanAmount']) return control.errors['loanAmount'].message || 'סכום לא תקין';
    if (control.errors['name']) return control.errors['name'].message || 'שם לא תקין';

    return 'ערך לא תקין';
  }
}
