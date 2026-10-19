import { Component, inject, output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { BrnSelectImports } from '@spartan-ng/brain/select';

import { LoanRequestService } from '../../services/loan-request.service';
import { MockDataService } from '../../services/mock-data.service';
import { bankAccountValidator, bankBranchValidator, nameValidator } from '../../validators/bank.validator';

@Component({
  selector: 'app-bank-account-step',
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
      lucideBuilding2,
    }),
  ],
  template: `
    <div class="step-container" dir="rtl">
      <!-- Step Header -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ng-icon name="lucideBuilding2" class="h-8 w-8 text-primary" />
        </div>
        <h2 class="text-2xl font-bold">{{ 'loanRequest.steps.bankAccount' | transloco }}</h2>
        <p class="mt-2 text-muted-foreground">{{ 'loanRequest.bankAccount.description' | transloco }}</p>
      </div>

      <!-- Info Alert -->
      <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          {{ 'loanRequest.bankAccount.info' | transloco }}
        </p>
      </div>

      <!-- Form -->
      <form [formGroup]="form" class="space-y-6">
        <!-- Bank Selection -->
        <hlm-field>
          <label hlmLabel>
            {{ 'loanRequest.fields.bank' | transloco }} <span class="text-destructive">*</span>
          </label>
          <brn-select formControlName="bankId" class="w-full">
            <hlm-select-trigger class="w-full">
              <hlm-select-value [placeholder]="'loanRequest.placeholders.select' | transloco" />
            </hlm-select-trigger>
            <hlm-select-content class="max-h-60">
              @for (bank of mockData.banks(); track bank.id) {
                <hlm-select-item [value]="bank.id">{{ mockData.getBankDisplayName(bank) }}</hlm-select-item>
              }
            </hlm-select-content>
          </brn-select>
        </hlm-field>

        <!-- Branch & Account Number -->
        <div class="grid gap-4 sm:grid-cols-2">
          <!-- Branch Number -->
          <hlm-field>
            <label hlmLabel for="branchNumber">
              {{ 'loanRequest.fields.branch' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="branchNumber"
              formControlName="branchNumber"
              [placeholder]="'loanRequest.placeholders.branch' | transloco"
              class="w-full"
            />
            @if (form.get('branchNumber')?.invalid && form.get('branchNumber')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('branchNumber') }}</p>
            }
          </hlm-field>

          <!-- Account Number -->
          <hlm-field>
            <label hlmLabel for="accountNumber">
              {{ 'loanRequest.fields.accountNumber' | transloco }} <span class="text-destructive">*</span>
            </label>
            <input
              hlmInput
              id="accountNumber"
              formControlName="accountNumber"
              [placeholder]="'loanRequest.placeholders.accountNumber' | transloco"
              class="w-full"
            />
            @if (form.get('accountNumber')?.invalid && form.get('accountNumber')?.touched) {
              <p class="text-sm text-destructive">{{ getErrorMessage('accountNumber') }}</p>
            }
          </hlm-field>
        </div>

        <!-- Account Name -->
        <hlm-field>
          <label hlmLabel for="accountName">
            {{ 'loanRequest.fields.accountName' | transloco }} <span class="text-destructive">*</span>
          </label>
          <input
            hlmInput
            id="accountName"
            formControlName="accountName"
            [placeholder]="'loanRequest.placeholders.accountName' | transloco"
            class="w-full"
          />
          @if (form.get('accountName')?.invalid && form.get('accountName')?.touched) {
            <p class="text-sm text-destructive">{{ getErrorMessage('accountName') }}</p>
          }
        </hlm-field>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BankAccountStepComponent implements OnInit {
  // Services
  protected readonly loanService = inject(LoanRequestService);
  protected readonly mockData = inject(MockDataService);
  private readonly fb = inject(FormBuilder);

  // Outputs
  valid = output<boolean>();

  // Form
  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.setupFormSubscription();
  }

  private initForm(): void {
    const data = this.loanService.formData();

    this.form = this.fb.group({
      bankId: [data.bankId || '', Validators.required],
      branchNumber: [data.branchNumber || '', [Validators.required, bankBranchValidator()]],
      accountNumber: [data.accountNumber || '', [Validators.required, bankAccountValidator()]],
      accountName: [data.accountName || '', [Validators.required, nameValidator()]],
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
    if (control.errors['bankAccount']) return control.errors['bankAccount'].message || 'מספר חשבון לא תקין';
    if (control.errors['bankBranch']) return control.errors['bankBranch'].message || 'מספר סניף לא תקין';
    if (control.errors['name']) return control.errors['name'].message || 'שם לא תקין';

    return 'ערך לא תקין';
  }
}
