import { Component, computed, inject, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideUser, 
  lucideUpload, 
  lucideBuilding2, 
  lucideUsers, 
  lucideCreditCard, 
  lucideCheckCircle,
  lucideCheck
} from '@ng-icons/lucide';
import { LoanRequestStep } from '../../models/loan-request.model';

@Component({
  selector: 'app-loan-stepper',
  standalone: true,
  imports: [TranslocoModule, NgIcon],
  providers: [
    provideIcons({
      lucideUser,
      lucideUpload,
      lucideBuilding2,
      lucideUsers,
      lucideCreditCard,
      lucideCheckCircle,
      lucideCheck
    })
  ],
  template: `
    <div class="stepper-container w-full py-4" dir="rtl">
      <div class="flex items-center justify-between">
        @for (step of steps(); track step.id; let i = $index; let last = $last) {
          <div class="flex items-center flex-1" [class.flex-1]="!last">
            <!-- Step Circle -->
            <button
              type="button"
              class="step-circle relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200"
              [class.border-primary]="step.isActive || step.isCompleted"
              [class.bg-primary]="step.isActive || step.isCompleted"
              [class.text-primary-foreground]="step.isActive || step.isCompleted"
              [class.border-muted-foreground]="!step.isActive && !step.isCompleted"
              [class.text-muted-foreground]="!step.isActive && !step.isCompleted"
              [class.cursor-pointer]="step.id <= maxStep()"
              [class.cursor-not-allowed]="step.id > maxStep()"
              [disabled]="step.id > maxStep()"
              (click)="onStepClick(step.id)"
            >
              @if (step.isCompleted) {
                <ng-icon name="lucideCheck" class="h-5 w-5" />
              } @else {
                <span class="text-sm font-semibold">{{ step.id }}</span>
              }
            </button>
            
            <!-- Step Label (below circle on mobile, beside on desktop) -->
            <div class="hidden sm:block ms-3">
              <span 
                class="text-sm font-medium transition-colors"
                [class.text-foreground]="step.isActive"
                [class.text-muted-foreground]="!step.isActive"
              >
                {{ step.labelKey | transloco }}
              </span>
            </div>
            
            <!-- Connector Line -->
            @if (!last) {
              <div 
                class="mx-2 h-0.5 flex-1 transition-colors duration-200 sm:mx-4"
                [class.bg-primary]="step.isCompleted"
                [class.bg-muted]="!step.isCompleted"
              ></div>
            }
          </div>
        }
      </div>
      
      <!-- Mobile: Step labels below -->
      <div class="mt-4 flex justify-between sm:hidden">
        @for (step of steps(); track step.id) {
          <div class="flex-1 text-center">
            <span 
              class="text-xs font-medium transition-colors"
              [class.text-foreground]="step.isActive"
              [class.text-muted-foreground]="!step.isActive"
            >
              {{ step.labelKey | transloco }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stepper-container {
      direction: rtl;
    }
    
    .step-circle:hover:not(:disabled) {
      transform: scale(1.05);
    }
    
    .step-circle:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
  `]
})
export class LoanStepperComponent {
  // Inputs
  steps = input.required<LoanRequestStep[]>();
  currentStep = input.required<number>();
  maxStep = input<number>(1);
  
  // Outputs
  stepClicked = output<number>();
  
  // Methods
  onStepClick(stepId: number): void {
    if (stepId <= this.maxStep()) {
      this.stepClicked.emit(stepId);
    }
  }
  
  // Get icon name for step
  getStepIcon(iconName: string): string {
    const iconMap: Record<string, string> = {
      'user': 'lucideUser',
      'upload': 'lucideUpload',
      'building-2': 'lucideBuilding2',
      'users': 'lucideUsers',
      'credit-card': 'lucideCreditCard',
      'check-circle': 'lucideCheckCircle',
    };
    return iconMap[iconName] || 'lucideUser';
  }
}
