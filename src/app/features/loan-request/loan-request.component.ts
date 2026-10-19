import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideArrowLeft,
  lucideSend,
  lucideLoader2,
  lucideSparkles
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { toast } from '@spartan-ng/brain/sonner';

import { LoanStepperComponent } from './components/stepper/stepper';
import { LoanRequestService } from './services/loan-request.service';
import { PersonalInfoStepComponent } from './steps/personal-info/personal-info.component';
import { FileUploadStepComponent } from './steps/file-upload/file-upload.component';
import { BankAccountStepComponent } from './steps/bank-account/bank-account.component';
import { GuarantorsStepComponent } from './steps/guarantors/guarantors.component';
import { PaymentStepComponent } from './steps/payment/payment.component';
import { CompletionStepComponent } from './steps/completion/completion.component';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmSpinnerImports,
    LoanStepperComponent,
    PersonalInfoStepComponent,
    FileUploadStepComponent,
    BankAccountStepComponent,
    GuarantorsStepComponent,
    PaymentStepComponent,
    CompletionStepComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideArrowLeft,
      lucideSend,
      lucideLoader2,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="loan-request-container min-h-screen bg-background" dir="rtl">
      <!-- Header -->
      <header class="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div class="container mx-auto flex h-16 items-center justify-between px-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ng-icon name="lucideSparkles" class="h-5 w-5" />
            </div>
            <div>
              <h1 class="text-lg font-bold">{{ 'loanRequest.title' | transloco }}</h1>
              <p class="text-xs text-muted-foreground">{{ 'loanRequest.organizationName' | transloco }}</p>
            </div>
          </div>

          <!-- Demo Button (for testing) -->
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="fillDemoData()"
            class="hidden sm:flex"
          >
            <ng-icon name="lucideSparkles" class="me-2 h-4 w-4" />
            {{ 'loanRequest.demoData' | transloco }}
          </button>
        </div>
      </header>

      <!-- Stepper -->
      <div class="container mx-auto px-4 py-6">
        <app-loan-stepper
          [steps]="loanService.steps()"
          [currentStep]="loanService.currentStep()"
          [maxStep]="loanService.maxReachedStep()"
          (stepClicked)="goToStep($event)"
        />
      </div>

      <!-- Main Content -->
      <main class="container mx-auto px-4 pb-32">
        <div class="mx-auto max-w-3xl">
          @switch (loanService.currentStep()) {
            @case (1) {
              <app-personal-info-step
                (valid)="onStepValid($event)"
              />
            }
            @case (2) {
              <app-file-upload-step
                (valid)="onStepValid($event)"
              />
            }
            @case (3) {
              <app-bank-account-step
                (valid)="onStepValid($event)"
              />
            }
            @case (4) {
              <app-guarantors-step
                (valid)="onStepValid($event)"
              />
            }
            @case (5) {
              <app-payment-step
                (valid)="onStepValid($event)"
              />
            }
            @case (6) {
              <app-completion-step />
            }
          }
        </div>
      </main>

      <!-- Navigation Buttons (Fixed Bottom) -->
      @if (loanService.currentStep() < 6) {
        <div class="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
            <!-- Previous Button -->
            <button
              hlmBtn
              variant="outline"
              [disabled]="loanService.currentStep() === 1"
              (click)="previousStep()"
            >
              <ng-icon name="lucideArrowRight" class="me-2 h-4 w-4" />
              {{ 'loanRequest.buttons.previous' | transloco }}
            </button>

            <!-- Next / Submit Button -->
            @if (loanService.currentStep() < 5) {
              <button
                hlmBtn
                [disabled]="!isCurrentStepValid()"
                (click)="nextStep()"
              >
                {{ 'loanRequest.buttons.next' | transloco }}
                <ng-icon name="lucideArrowLeft" class="ms-2 h-4 w-4" />
              </button>
            } @else {
              <button
                hlmBtn
                variant="default"
                [disabled]="!isCurrentStepValid() || loanService.isLoading()"
                (click)="submitRequest()"
              >
                @if (loanService.isLoading()) {
                  <ng-icon name="lucideLoader2" class="me-2 h-4 w-4 animate-spin" />
                  {{ 'loanRequest.buttons.submitting' | transloco }}
                } @else {
                  <ng-icon name="lucideSend" class="me-2 h-4 w-4" />
                  {{ 'loanRequest.buttons.submit' | transloco }}
                }
              </button>
            }
          </div>
        </div>
      }

      <!-- Loading Overlay -->
      @if (loanService.isLoading()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div class="flex flex-col items-center gap-4">
            <hlm-spinner size="lg" />
            <p class="text-lg font-medium">{{ 'loanRequest.loading' | transloco }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .loan-request-container {
      direction: rtl;
    }
  `]
})
export class LoanRequestComponent implements OnInit {
  // Services
  protected readonly loanService = inject(LoanRequestService);
  private readonly route = inject(ActivatedRoute);

  // State
  protected readonly stepValid = signal<boolean>(false);

  ngOnInit(): void {
    // Get token from URL if present
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.validateToken(token);
    }
  }

  private async validateToken(token: string): Promise<void> {
    const result = await this.loanService.validateToken(token);
    if (!result.isValid) {
      toast.error(result.message);
    }
  }

  protected onStepValid(valid: boolean): void {
    this.stepValid.set(valid);
  }

  protected isCurrentStepValid(): boolean {
    return this.loanService.isStepValid();
  }

  protected goToStep(step: number): void {
    this.loanService.goToStep(step);
  }

  protected nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.loanService.nextStep();
    } else {
      toast.error('יש למלא את כל השדות הנדרשים');
    }
  }

  protected previousStep(): void {
    this.loanService.previousStep();
  }

  protected async submitRequest(): Promise<void> {
    try {
      const result = await this.loanService.submitRequest();
      if (result.success) {
        toast.success('הבקשה נשלחה בהצלחה!');
      }
    } catch (error) {
      toast.error('אירעה שגיאה בשליחת הבקשה');
    }
  }

  protected fillDemoData(): void {
    this.loanService.updateFormData({
      firstName: 'ישראל',
      lastName: 'ישראלי',
      identityType: 58,
      identityNumber: '123456782',
      title: 3,
      street: 'הרצל',
      houseNumber: '10',
      apartment: '5',
      city: 1,
      countryCode: '972',
      mobilePhone: '0501234567',
      phone: '025551234',
      email: 'israel@example.com',
      profession: 'מהנדס תוכנה',
      loanAmount: 50000,
      purpose: 1,
      bankId: 12,
      branchNumber: '123',
      accountName: 'ישראל ישראלי',
      accountNumber: '123456',
    });
    toast.success('נתוני הדמו נטענו בהצלחה');
  }
}
