import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideDownload,
  lucideMail,
  lucideFileText,
  lucidePartyPopper
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { toast } from '@spartan-ng/brain/sonner';

import { LoanRequestService } from '../../services/loan-request.service';

@Component({
  selector: 'app-completion-step',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({
      lucideCheckCircle,
      lucideDownload,
      lucideMail,
      lucideFileText,
      lucidePartyPopper,
    }),
  ],
  template: `
    <div class="step-container text-center" dir="rtl">
      <!-- Success Animation -->
      <div class="mb-8">
        <div class="relative mx-auto h-24 w-24">
          <!-- Animated circles -->
          <div class="absolute inset-0 animate-ping rounded-full bg-green-400/30"></div>
          <div class="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <ng-icon name="lucideCheckCircle" class="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div class="mb-8">
        <h2 class="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">
          {{ 'loanRequest.completion.success' | transloco }}
        </h2>
        <p class="text-lg text-muted-foreground">
          {{ 'loanRequest.completion.message' | transloco }}
        </p>
      </div>

      <!-- Request Details Card -->
      @if (loanService.submissionResult()) {
        <div class="mx-auto mb-8 max-w-sm rounded-lg border bg-card p-6">
          <div class="mb-4 flex items-center justify-center gap-2">
            <ng-icon name="lucideFileText" class="h-5 w-5 text-primary" />
            <span class="font-medium">{{ 'loanRequest.completion.requestDetails' | transloco }}</span>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span class="text-sm text-muted-foreground">{{ 'loanRequest.completion.requestNumber' | transloco }}</span>
              <span class="font-mono font-bold text-primary">{{ loanService.submissionResult()?.requestId }}</span>
            </div>
            <div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span class="text-sm text-muted-foreground">{{ 'loanRequest.completion.serialNumber' | transloco }}</span>
              <span class="font-mono font-medium">{{ loanService.submissionResult()?.serialNumber }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Email Notification -->
      <div class="mb-8 flex items-center justify-center gap-2 text-muted-foreground">
        <ng-icon name="lucideMail" class="h-5 w-5" />
        <span>{{ 'loanRequest.completion.emailSent' | transloco }}</span>
      </div>

      <!-- Actions -->
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          hlmBtn
          variant="outline"
          (click)="downloadReceipt()"
        >
          <ng-icon name="lucideDownload" class="me-2 h-4 w-4" />
          {{ 'loanRequest.completion.downloadReceipt' | transloco }}
        </button>

        <button
          hlmBtn
          (click)="startNewRequest()"
        >
          <ng-icon name="lucidePartyPopper" class="me-2 h-4 w-4" />
          {{ 'loanRequest.completion.newRequest' | transloco }}
        </button>
      </div>

      <!-- Contact Info -->
      <div class="mt-12 rounded-lg border bg-muted/30 p-6">
        <h3 class="mb-2 font-medium">{{ 'loanRequest.completion.questions' | transloco }}</h3>
        <p class="text-sm text-muted-foreground">
          {{ 'loanRequest.completion.contactInfo' | transloco }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
  `]
})
export class CompletionStepComponent {
  // Services
  protected readonly loanService = inject(LoanRequestService);

  downloadReceipt(): void {
    // Simulate download
    toast.info('מוריד קבלה...');

    setTimeout(() => {
      toast.success('הקבלה הורדה בהצלחה');
    }, 1500);
  }

  startNewRequest(): void {
    this.loanService.reset();
    // Optionally navigate to start
    window.location.reload();
  }
}
