import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideSave,
  lucideLoader2,
  lucidePiggyBank,
  lucideUser,
  lucideCalendar,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Person, Saving, SavingStatus } from '../../../../core/models';

@Component({
  selector: 'gmn-saving-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    BrnSelectImports,
    HlmAlertImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideSave,
      lucideLoader2,
      lucidePiggyBank,
      lucideUser,
      lucideCalendar,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Page Header -->
      <div class="flex items-center gap-4">
        <button hlmBtn variant="outline" size="icon" routerLink="/gmn/savings">
          <ng-icon name="lucideArrowRight" class="h-4 w-4" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">
            {{ isEditMode() ? t('common.edit') : t('savings.newSaving') }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ t('savings.subtitle') }}</p>
        </div>
      </div>

      <!-- Error Alert -->
      @if (errorMessage()) {
        <div hlmAlert variant="destructive">
          <ng-icon name="lucideAlertCircle" hlmAlertIcon />
          <h4 hlmAlertTitle>{{ t('common.error') }}</h4>
          <p hlmAlertDesc>{{ errorMessage() }}</p>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Depositor Selection -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideUser" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('savings.fields.depositor') }}</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('savings.fields.depositor') }} *</label>
                <brn-select formControlName="personId" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('savings.fields.depositor')" />
                  </hlm-select-trigger>
                  <hlm-select-content class="max-h-60">
                    @for (person of persons(); track person.id) {
                      <hlm-select-item [value]="person.id.toString()">
                        {{ person.fullName }} ({{ person.identityNumber }})
                      </hlm-select-item>
                    }
                  </hlm-select-content>
                </brn-select>
              </div>

              @if (selectedPerson()) {
                <div class="rounded-lg bg-muted p-4">
                  <h3 class="font-medium">{{ selectedPerson()?.fullName }}</h3>
                  <p class="text-sm text-muted-foreground">{{ selectedPerson()?.identityNumber }}</p>
                  <p class="text-sm text-muted-foreground">{{ selectedPerson()?.contact?.mobilePhone }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Saving Details -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucidePiggyBank" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('savings.tabs.details') || t('common.details') }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('savings.fields.amount') }} *</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="initialAmount"
                    class="w-full"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label hlmLabel>{{ t('savings.fields.interestRate') }} (%)</label>
                  <input
                    hlmInput
                    type="number"
                    formControlName="interestRate"
                    class="w-full"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label hlmLabel>{{ t('savings.fields.savingType') }}</label>
                <brn-select formControlName="savingType" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value [placeholder]="t('savings.fields.savingType')" />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    <hlm-select-item value="REGULAR">{{ t('savings.types.regular') }}</hlm-select-item>
                    <hlm-select-item value="FIXED">{{ t('savings.types.fixed') }}</hlm-select-item>
                    <hlm-select-item value="FLEXIBLE">{{ t('savings.types.flexible') }}</hlm-select-item>
                  </hlm-select-content>
                </brn-select>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideCalendar" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.date') }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('savings.fields.openDate') }} *</label>
                  <input hlmInput type="date" formControlName="openDate" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>{{ t('savings.fields.maturityDate') }}</label>
                  <input hlmInput type="date" formControlName="maturityDate" class="w-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucidePiggyBank" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.notes') }}</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label hlmLabel>{{ t('savings.fields.notes') }}</label>
                <textarea
                  hlmInput
                  formControlName="notes"
                  class="min-h-[100px] w-full"
                  [placeholder]="t('common.notes')"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex items-center justify-end gap-4">
          <button hlmBtn variant="outline" type="button" routerLink="/gmn/savings">
            {{ t('common.cancel') }}
          </button>
          <button hlmBtn type="submit" [disabled]="isSaving() || form.invalid">
            @if (isSaving()) {
              <ng-icon name="lucideLoader2" class="me-2 h-4 w-4 animate-spin" />
            } @else {
              <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
            }
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export default class SavingFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isEditMode = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly existingSaving = signal<Saving | null>(null);
  readonly persons = signal<Person[]>([]);

  // Selected person
  readonly selectedPerson = computed(() => {
    const personId = this.form.get('personId')?.value;
    return this.persons().find(p => p.id === personId) || null;
  });

  // Form
  form: FormGroup = this.fb.group({
    personId: [null, Validators.required],
    initialAmount: [1000, [Validators.required, Validators.min(100)]],
    interestRate: [0, [Validators.min(0), Validators.max(100)]],
    savingType: ['REGULAR'],
    openDate: [this.getDefaultDate(), Validators.required],
    maturityDate: [null],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadPersons();

    // Check if edit mode
    const savingId = this.route.snapshot.params['id'];
    if (savingId && savingId !== 'new') {
      this.isEditMode.set(true);
      this.loadSaving(parseInt(savingId, 10));
    }
  }

  private getDefaultDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private async loadPersons(): Promise<void> {
    const result = await this.mockService.getPersons({ page: 1, pageSize: 1000 });
    this.persons.set(result.data);
  }

  private async loadSaving(id: number): Promise<void> {
    const saving = await this.mockService.getSavingById(id);
    if (saving) {
      this.existingSaving.set(saving);
      this.populateForm(saving);
    } else {
      this.errorMessage.set('Saving not found');
      this.router.navigate(['/gmn/savings']);
    }
  }

  private populateForm(saving: Saving): void {
    this.form.patchValue({
      personId: saving.personId,
      initialAmount: saving.initialAmount,
      interestRate: saving.interestRate,
      savingType: saving.savingType,
      openDate: saving.openDate ? new Date(saving.openDate).toISOString().split('T')[0] : '',
      maturityDate: saving.maturityDate ? new Date(saving.maturityDate).toISOString().split('T')[0] : null,
      notes: saving.notes,
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const formValue = this.form.value;

      const savingData: Omit<Saving, 'id' | 'savingNumber' | 'createdAt'> = {
        personId: formValue.personId,
        initialAmount: formValue.initialAmount,
        currentBalance: formValue.initialAmount,
        totalDeposited: formValue.initialAmount,
        totalWithdrawn: 0,
        interestRate: formValue.interestRate || 0,
        accruedInterest: 0,
        savingType: formValue.savingType,
        savingTypeName: this.getSavingTypeName(formValue.savingType),
        status: 'ACTIVE' as SavingStatus,
        statusName: 'פעיל',
        openDate: new Date(formValue.openDate),
        maturityDate: formValue.maturityDate ? new Date(formValue.maturityDate) : undefined,
        canWithdraw: formValue.savingType !== 'FIXED',
        masavActive: false,
        notes: formValue.notes,
        isActive: true,
      };

      const result = await this.mockService.createSaving(savingData);
      if (result.isSuccess && result.data) {
        this.router.navigate(['/gmn/savings', result.data.id]);
      } else {
        this.errorMessage.set(result.message || 'Failed to create saving');
      }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred');
      console.error('Error saving:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  private getSavingTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      'REGULAR': 'רגיל',
      'FIXED': 'קבוע',
      'FLEXIBLE': 'גמיש',
    };
    return typeMap[type] || type;
  }
}
