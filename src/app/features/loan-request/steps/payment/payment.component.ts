import { Component, inject, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideCreditCard, 
  lucideBuilding, 
  lucideInfo,
  lucideCheck
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { BrnRadioGroupImports } from '@spartan-ng/brain/radio-group';

import { LoanRequestService } from '../../services/loan-request.service';
import { MockDataService } from '../../services/mock-data.service';
import { PaymentMethod } from '../../models/loan-request.model';

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmRadioGroupImports,
    BrnRadioGroupImports,
  ],
  providers: [
    provideIcons({
      lucideCreditCard,
      lucideBuilding,
      lucideInfo,
      lucideCheck,
    }),
  ],
  template: `
    <div class="step-container" dir="rtl">
      <!-- Step Header -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ng-icon name="lucideCreditCard" class="h-8 w-8 text-primary" />
        </div>
        <h2 class="text-2xl font-bold">{{ 'loanRequest.steps.payment' | transloco }}</h2>
        <p class="mt-2 text-muted-foreground">{{ 'loanRequest.payment.description' | transloco }}</p>
      </div>

      <!-- Payment Amount -->
      <div class="mb-6 rounded-lg bg-primary/5 p-6 text-center">
        <p class="text-sm text-muted-foreground">{{ 'loanRequest.payment.totalAmount' | transloco }}</p>
        <p class="mt-2 text-4xl font-bold text-primary">₪{{ loanService.formData().registrationFeeAmount }}</p>
      </div>

      <!-- Info Notice -->
      <div class="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <ng-icon name="lucideInfo" class="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
        <p class="text-sm text-amber-800 dark:text-amber-200">
          {{ 'loanRequest.payment.notice' | transloco }}
        </p>
      </div>

      <!-- Payment Methods -->
      <div class="space-y-4">
        <h3 class="font-medium">{{ 'loanRequest.payment.selectMethod' | transloco }}</h3>
        
        <!-- Credit Card Option -->
        <div 
          class="cursor-pointer rounded-lg border p-4 transition-all"
          [class.border-primary]="selectedMethod === 'credit'"
          [class.bg-primary/5]="selectedMethod === 'credit'"
          (click)="selectMethod('credit')"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <ng-icon name="lucideCreditCard" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="font-medium">{{ 'loanRequest.payment.creditCard' | transloco }}</p>
                <p class="text-sm text-muted-foreground">{{ 'loanRequest.payment.creditCardDesc' | transloco }}</p>
              </div>
            </div>
            @if (selectedMethod === 'credit') {
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <ng-icon name="lucideCheck" class="h-4 w-4 text-primary-foreground" />
              </div>
            }
          </div>
        </div>

        <!-- Bank Transfer Option -->
        <div 
          class="cursor-pointer rounded-lg border p-4 transition-all"
          [class.border-primary]="selectedMethod === 'bank_transfer'"
          [class.bg-primary/5]="selectedMethod === 'bank_transfer'"
          (click)="selectMethod('bank_transfer')"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <ng-icon name="lucideBuilding" class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="font-medium">{{ 'loanRequest.payment.bankTransfer' | transloco }}</p>
                <p class="text-sm text-muted-foreground">{{ 'loanRequest.payment.bankTransferDesc' | transloco }}</p>
              </div>
            </div>
            @if (selectedMethod === 'bank_transfer') {
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <ng-icon name="lucideCheck" class="h-4 w-4 text-primary-foreground" />
              </div>
            }
          </div>
        </div>

        <!-- Bank Details (shown when bank transfer is selected) -->
        @if (selectedMethod === 'bank_transfer') {
          <div class="mt-4 rounded-lg border bg-muted/50 p-4">
            <h4 class="mb-3 font-medium">{{ 'loanRequest.payment.bankDetails' | transloco }}</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">בנק:</span>
                <span class="font-medium">{{ mockData.organization.bankName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">סניף:</span>
                <span class="font-medium">{{ mockData.organization.branch }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">מספר חשבון:</span>
                <span class="font-medium">{{ mockData.organization.accountNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">על שם:</span>
                <span class="font-medium">{{ mockData.organization.accountHolder }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PaymentStepComponent {
  // Services
  protected readonly loanService = inject(LoanRequestService);
  protected readonly mockData = inject(MockDataService);

  // Outputs
  valid = output<boolean>();

  // State
  selectedMethod: PaymentMethod = 'credit';

  constructor() {
    // Initialize from service
    this.selectedMethod = this.loanService.formData().paymentMethod || 'credit';
    // Always valid since a method is always selected
    setTimeout(() => this.valid.emit(true), 0);
  }

  selectMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
    this.loanService.setPaymentMethod(method);
    this.valid.emit(true);
  }
}
