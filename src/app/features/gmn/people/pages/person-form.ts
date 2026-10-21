import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideArrowLeft,
  lucideSave,
  lucideLoader2,
  lucideUser,
  lucideMapPin,
  lucidePhone,
  lucideMail,
  lucideBriefcase,
  lucideBuilding2,
  lucideWallet,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Person, PersonType, BankAccount, Address, ContactInfo } from '../../../../core/models';

@Component({
  selector: 'gmn-person-form',
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
    HlmCheckboxImports,
    HlmAlertImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideArrowLeft,
      lucideSave,
      lucideLoader2,
      lucideUser,
      lucideMapPin,
      lucidePhone,
      lucideMail,
      lucideBriefcase,
      lucideBuilding2,
      lucideWallet,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Page Header -->
      <div class="flex items-center gap-4">
        <button hlmBtn variant="outline" size="icon" routerLink="/gmn/people">
          <ng-icon name="lucideArrowRight" class="h-4 w-4" />
        </button>
        <div>
          <h1 class="text-2xl font-bold">
            {{ isEditMode() ? t('common.edit') : t('people.newPerson') }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ isEditMode() ? existingPerson()?.fullName : t('people.subtitle') }}
          </p>
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
          <!-- Personal Information -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideUser" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('people.tabs.details') }}</h2>
            </div>

            <div class="space-y-4">
              <!-- Title & Names Row -->
              <div class="grid gap-4 sm:grid-cols-4">
                <div class="sm:col-span-1">
                  <label hlmLabel>{{ t('common.type') }}</label>
                  <brn-select formControlName="title" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('common.type')" />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      @for (title of titles(); track title.id) {
                        <hlm-select-item [value]="title.id.toString()">{{ title.name }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
                <div class="sm:col-span-1">
                  <label hlmLabel>{{ t('people.fields.firstName') }} *</label>
                  <input hlmInput type="text" formControlName="firstName" class="w-full" />
                </div>
                <div class="sm:col-span-1">
                  <label hlmLabel>{{ t('people.fields.lastName') }} *</label>
                  <input hlmInput type="text" formControlName="lastName" class="w-full" />
                </div>
                <div class="sm:col-span-1">
                  <label hlmLabel>{{ t('people.fields.profession') }}</label>
                  <input hlmInput type="text" formControlName="profession" class="w-full" />
                </div>
              </div>

              <!-- Identity Row -->
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('people.fields.idType') }} *</label>
                  <brn-select formControlName="identityType" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('people.fields.idType')" />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      @for (idType of identityTypes(); track idType.id) {
                        <hlm-select-item [value]="idType.id.toString()">{{ idType.name }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
                <div>
                  <label hlmLabel>{{ t('people.fields.idNumber') }} *</label>
                  <input hlmInput type="text" formControlName="identityNumber" class="w-full font-mono" />
                </div>
              </div>

              <!-- Date of Birth (optional) -->
              <div>
                <label hlmLabel>{{ t('people.fields.dateOfBirth') }}</label>
                <input hlmInput type="date" formControlName="dateOfBirth" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucidePhone" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.phone') }} & {{ t('common.email') }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('people.fields.mobile') }} *</label>
                  <input hlmInput type="tel" formControlName="mobilePhone" class="w-full" dir="ltr" />
                </div>
                <div>
                  <label hlmLabel>{{ t('people.fields.phone') }}</label>
                  <input hlmInput type="tel" formControlName="phone" class="w-full" dir="ltr" />
                </div>
              </div>
              <div>
                <label hlmLabel>{{ t('people.fields.email') }} *</label>
                <input hlmInput type="email" formControlName="email" class="w-full" dir="ltr" />
              </div>
            </div>
          </div>

          <!-- Address -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideMapPin" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('people.fields.address') }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-4">
                <div class="sm:col-span-2">
                  <label hlmLabel>{{ t('people.fields.street') }} *</label>
                  <input hlmInput type="text" formControlName="street" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>{{ t('people.fields.houseNumber') }} *</label>
                  <input hlmInput type="text" formControlName="houseNumber" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>{{ t('people.fields.apartment') }}</label>
                  <input hlmInput type="text" formControlName="apartment" class="w-full" />
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('people.fields.city') }} *</label>
                  <brn-select formControlName="city" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('people.fields.city')" />
                    </hlm-select-trigger>
                    <hlm-select-content class="max-h-60">
                      @for (city of cities(); track city.id) {
                        <hlm-select-item [value]="city.id.toString()">{{ city.name }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
                <div>
                  <label hlmLabel>{{ t('people.fields.zipCode') }}</label>
                  <input hlmInput type="text" formControlName="postalCode" class="w-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- Bank Account -->
          <div hlmCard class="p-6">
            <div class="mb-4 flex items-center gap-2">
              <ng-icon name="lucideBuilding2" class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold">{{ t('common.bankAccount') || 'Bank Account' }}</h2>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('common.bank') || 'Bank' }}</label>
                  <brn-select formControlName="bankId" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value [placeholder]="t('common.bank') || 'Bank'" />
                    </hlm-select-trigger>
                    <hlm-select-content class="max-h-60">
                      @for (bank of banks(); track bank.id) {
                        <hlm-select-item [value]="bank.id.toString()">{{ bank.id }} - {{ bank.name }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </div>
                <div>
                  <label hlmLabel>{{ t('common.branch') || 'Branch' }}</label>
                  <input hlmInput type="text" formControlName="branchNumber" class="w-full" />
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('common.accountNumber') || 'Account Number' }}</label>
                  <input hlmInput type="text" formControlName="accountNumber" class="w-full font-mono" />
                </div>
                <div>
                  <label hlmLabel>{{ t('common.accountName') || 'Account Name' }}</label>
                  <input hlmInput type="text" formControlName="accountName" class="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div hlmCard class="mt-6 p-6">
          <div class="mb-4 flex items-center gap-2">
            <ng-icon name="lucideBriefcase" class="h-5 w-5 text-primary" />
            <h2 class="text-lg font-semibold">{{ t('common.notes') }}</h2>
          </div>
          <textarea
            hlmInput
            formControlName="notes"
            class="min-h-[100px] w-full"
            [placeholder]="t('common.notes')"
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex items-center justify-end gap-4">
          <button hlmBtn variant="outline" type="button" routerLink="/gmn/people">
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
export default class PersonFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(GmnMockService);
  private readonly transloco = inject(TranslocoService);

  // State
  readonly isEditMode = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly existingPerson = signal<Person | null>(null);

  // LOV Data
  readonly titles = this.mockService.titles;
  readonly identityTypes = this.mockService.identityTypes;
  readonly cities = this.mockService.cities;
  readonly banks = this.mockService.banks;

  // Form
  form: FormGroup = this.fb.group({
    // Personal Info
    title: [null],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    identityType: [1, Validators.required], // Default: ID Card
    identityNumber: ['', [Validators.required, Validators.minLength(5)]],
    dateOfBirth: [null],
    profession: [''],

    // Contact
    mobilePhone: ['', [Validators.required, Validators.pattern(/^[\d\-\+\s]+$/)]],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],

    // Address
    street: ['', Validators.required],
    houseNumber: ['', Validators.required],
    apartment: [''],
    city: [null, Validators.required],
    postalCode: [''],

    // Bank Account
    bankId: [null],
    branchNumber: [''],
    accountNumber: [''],
    accountName: [''],

    // Notes
    notes: [''],
  });

  ngOnInit(): void {
    // Check if edit mode
    const personId = this.route.snapshot.params['id'];
    if (personId && personId !== 'new') {
      this.isEditMode.set(true);
      this.loadPerson(parseInt(personId, 10));
    }
  }

  private async loadPerson(id: number): Promise<void> {
    const person = await this.mockService.getPersonById(id);
    if (person) {
      this.existingPerson.set(person);
      this.populateForm(person);
    } else {
      this.errorMessage.set('Person not found');
      this.router.navigate(['/gmn/people']);
    }
  }

  private populateForm(person: Person): void {
    this.form.patchValue({
      title: person.title,
      firstName: person.firstName,
      lastName: person.lastName,
      identityType: person.identityType,
      identityNumber: person.identityNumber,
      profession: person.profession,

      mobilePhone: person.contact.mobilePhone,
      phone: person.contact.phone,
      email: person.contact.email,

      street: person.address.street,
      houseNumber: person.address.houseNumber,
      apartment: person.address.apartment,
      city: person.address.city,
      postalCode: person.address.postalCode,

      bankId: person.primaryBankAccount?.bankId,
      branchNumber: person.primaryBankAccount?.branchNumber,
      accountNumber: person.primaryBankAccount?.accountNumber,
      accountName: person.primaryBankAccount?.accountName,
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

      // Build person object
      const address: Address = {
        street: formValue.street,
        houseNumber: formValue.houseNumber,
        apartment: formValue.apartment,
        city: formValue.city,
        postalCode: formValue.postalCode,
        cityName: this.mockService.getCityName(formValue.city),
      };

      const contact: ContactInfo = {
        mobilePhone: formValue.mobilePhone,
        phone: formValue.phone,
        email: formValue.email,
      };

      const bankAccount: BankAccount | undefined = formValue.bankId
        ? {
            bankId: formValue.bankId,
            branchNumber: formValue.branchNumber,
            accountNumber: formValue.accountNumber,
            accountName: formValue.accountName || `${formValue.firstName} ${formValue.lastName}`,
          }
        : undefined;

      const personData: Omit<Person, 'id' | 'createdAt'> = {
        title: formValue.title,
        titleName: this.mockService.getTitleName(formValue.title),
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        fullName: `${formValue.firstName} ${formValue.lastName}`,
        identityType: formValue.identityType,
        identityTypeName: this.mockService.getIdentityTypeName(formValue.identityType),
        identityNumber: formValue.identityNumber,
        profession: formValue.profession,
        address,
        contact,
        bankAccounts: bankAccount ? [bankAccount] : [],
        primaryBankAccount: bankAccount,
        personType: ['CONTACT'] as PersonType[],
        canBeGuarantor: true,
        canDeposit: true,
        isContactActive: true,
        isActive: true,
        institutionId: 1, // Default institution
      };

      if (this.isEditMode() && this.existingPerson()) {
        // Update
        const result = await this.mockService.updatePerson(this.existingPerson()!.id, personData);
        if (result.isSuccess) {
          this.router.navigate(['/gmn/people', this.existingPerson()!.id]);
        } else {
          this.errorMessage.set(result.message || 'Failed to update person');
        }
      } else {
        // Create
        const result = await this.mockService.createPerson(personData);
        if (result.isSuccess && result.data) {
          this.router.navigate(['/gmn/people', result.data.id]);
        } else {
          this.errorMessage.set(result.message || 'Failed to create person');
        }
      }
    } catch (error) {
      this.errorMessage.set('An unexpected error occurred');
      console.error('Error saving person:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}
