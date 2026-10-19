import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUser,
  lucideArrowRight,
  lucideSave,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { toast } from '@spartan-ng/brain/sonner';

import { GmnMockService } from '../../../../core/services/mock-data';

@Component({
  selector: 'gmn-person-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmFieldImports,
    HlmCheckboxImports,
    BrnSelectImports,
  ],
  providers: [
    provideIcons({
      lucideUser,
      lucideArrowRight,
      lucideSave,
      lucideX,
    }),
  ],
  template: `
    <div class="space-y-6" >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <button hlmBtn variant="ghost" routerLink="/gmn/people">
            <ng-icon name="lucideArrowRight" class="me-2 h-4 w-4" />
            חזרה לרשימה
          </button>
          <h1 class="mt-2 text-2xl font-bold">{{ isEditMode() ? 'עריכת איש קשר' : 'איש קשר חדש' }}</h1>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Personal Info Card -->
          <div hlmCard class="p-6">
            <h2 class="mb-4 text-lg font-semibold">פרטים אישיים</h2>
            
            <div class="space-y-4">
              <!-- Identity Type & Number -->
              <div class="grid gap-4 sm:grid-cols-2">
                <hlm-field>
                  <label hlmLabel>סוג זיהוי *</label>
                  <brn-select formControlName="identityType" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value placeholder="בחר..." />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      @for (type of identityTypes(); track type.id) {
                        <hlm-select-item [value]="type.id">{{ type.name }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </hlm-field>
                <hlm-field>
                  <label hlmLabel>מספר זיהוי *</label>
                  <input hlmInput formControlName="identityNumber" placeholder="מספר ת.ז. / דרכון" class="w-full" />
                </hlm-field>
              </div>

              <!-- Title -->
              <hlm-field>
                <label hlmLabel>תואר *</label>
                <brn-select formControlName="title" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר..." />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    @for (title of titles(); track title.id) {
                      <hlm-select-item [value]="title.id">{{ title.name }}</hlm-select-item>
                    }
                  </hlm-select-content>
                </brn-select>
              </hlm-field>

              <!-- Names -->
              <div class="grid gap-4 sm:grid-cols-2">
                <hlm-field>
                  <label hlmLabel>שם פרטי *</label>
                  <input hlmInput formControlName="firstName" placeholder="שם פרטי" class="w-full" />
                </hlm-field>
                <hlm-field>
                  <label hlmLabel>שם משפחה *</label>
                  <input hlmInput formControlName="lastName" placeholder="שם משפחה" class="w-full" />
                </hlm-field>
              </div>

              <!-- Father Name -->
              <hlm-field>
                <label hlmLabel>שם האב</label>
                <input hlmInput formControlName="fatherName" placeholder="שם האב" class="w-full" />
              </hlm-field>

              <!-- Profession -->
              <hlm-field>
                <label hlmLabel>עיסוק</label>
                <input hlmInput formControlName="profession" placeholder="עיסוק / מקצוע" class="w-full" />
              </hlm-field>
            </div>
          </div>

          <!-- Contact Info Card -->
          <div hlmCard class="p-6">
            <h2 class="mb-4 text-lg font-semibold">פרטי קשר</h2>
            
            <div class="space-y-4">
              <!-- Phone -->
              <div class="grid gap-4 sm:grid-cols-2">
                <hlm-field>
                  <label hlmLabel>טלפון נייד *</label>
                  <input hlmInput formControlName="mobilePhone" placeholder="050-0000000" class="w-full" />
                </hlm-field>
                <hlm-field>
                  <label hlmLabel>טלפון נוסף</label>
                  <input hlmInput formControlName="phone" placeholder="02-0000000" class="w-full" />
                </hlm-field>
              </div>

              <!-- Email -->
              <hlm-field>
                <label hlmLabel>דוא"ל *</label>
                <input hlmInput type="email" formControlName="email" placeholder="email@example.com" class="w-full" />
              </hlm-field>
            </div>

            <h2 class="mb-4 mt-6 text-lg font-semibold">כתובת</h2>
            
            <div class="space-y-4">
              <!-- Street & Number -->
              <div class="grid gap-4 sm:grid-cols-3">
                <hlm-field class="sm:col-span-2">
                  <label hlmLabel>רחוב *</label>
                  <input hlmInput formControlName="street" placeholder="שם הרחוב" class="w-full" />
                </hlm-field>
                <hlm-field>
                  <label hlmLabel>מספר *</label>
                  <input hlmInput formControlName="houseNumber" placeholder="מס'" class="w-full" />
                </hlm-field>
              </div>

              <!-- Apartment & City -->
              <div class="grid gap-4 sm:grid-cols-2">
                <hlm-field>
                  <label hlmLabel>דירה</label>
                  <input hlmInput formControlName="apartment" placeholder="מס' דירה" class="w-full" />
                </hlm-field>
                <hlm-field>
                  <label hlmLabel>עיר *</label>
                  <brn-select formControlName="city" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value placeholder="בחר עיר..." />
                    </hlm-select-trigger>
                    <hlm-select-content class="max-h-60">
                      @for (city of cities(); track city.id) {
                        <hlm-select-item [value]="city.id">{{ city.name }}</hlm-select-item>
                      }
                    </hlm-select-content>
                  </brn-select>
                </hlm-field>
              </div>
            </div>
          </div>

          <!-- Bank Account Card -->
          <div hlmCard class="p-6">
            <h2 class="mb-4 text-lg font-semibold">פרטי חשבון בנק</h2>
            
            <div class="space-y-4">
              <hlm-field>
                <label hlmLabel>בנק</label>
                <brn-select formControlName="bankId" class="w-full">
                  <hlm-select-trigger class="w-full">
                    <hlm-select-value placeholder="בחר בנק..." />
                  </hlm-select-trigger>
                  <hlm-select-content>
                    @for (bank of banks(); track bank.id) {
                      <hlm-select-item [value]="bank.id">{{ bank.id }} - {{ bank.name }}</hlm-select-item>
                    }
                  </hlm-select-content>
                </brn-select>
              </hlm-field>

              <div class="grid gap-4 sm:grid-cols-2">
                <hlm-field>
                  <label hlmLabel>מספר סניף</label>
                  <input hlmInput formControlName="branchNumber" placeholder="מספר סניף" class="w-full" />
                </hlm-field>
                <hlm-field>
                  <label hlmLabel>מספר חשבון</label>
                  <input hlmInput formControlName="accountNumber" placeholder="מספר חשבון" class="w-full" />
                </hlm-field>
              </div>

              <hlm-field>
                <label hlmLabel>שם בעל החשבון</label>
                <input hlmInput formControlName="accountName" placeholder="שם בעל החשבון" class="w-full" />
              </hlm-field>
            </div>
          </div>

          <!-- Status & Flags Card -->
          <div hlmCard class="p-6">
            <h2 class="mb-4 text-lg font-semibold">הגדרות</h2>
            
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <hlm-checkbox formControlName="isContactActive" />
                <label hlmLabel class="cursor-pointer">איש קשר פעיל</label>
              </div>
              <div class="flex items-center gap-2">
                <hlm-checkbox formControlName="canBeGuarantor" />
                <label hlmLabel class="cursor-pointer">יכול להיות ערב</label>
              </div>
              <div class="flex items-center gap-2">
                <hlm-checkbox formControlName="canDeposit" />
                <label hlmLabel class="cursor-pointer">יכול להפקיד</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3">
          <button hlmBtn variant="outline" type="button" routerLink="/gmn/people">
            <ng-icon name="lucideX" class="me-2 h-4 w-4" />
            ביטול
          </button>
          <button hlmBtn type="submit" [disabled]="form.invalid || isSubmitting()">
            <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
            {{ isEditMode() ? 'שמור שינויים' : 'צור איש קשר' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export default class PersonForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly mockService = inject(GmnMockService);

  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  private personId: number | null = null;

  // LOVs
  readonly identityTypes = this.mockService.identityTypes;
  readonly titles = this.mockService.titles;
  readonly cities = this.mockService.cities;
  readonly banks = this.mockService.banks;

  form: FormGroup = this.fb.group({
    identityType: [58, Validators.required],
    identityNumber: ['', [Validators.required, Validators.minLength(5)]],
    title: ['', Validators.required],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    fatherName: [''],
    profession: [''],
    mobilePhone: ['', [Validators.required, Validators.pattern(/^05\d{8}$/)]],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    street: ['', Validators.required],
    houseNumber: ['', Validators.required],
    apartment: [''],
    city: ['', Validators.required],
    bankId: [''],
    branchNumber: [''],
    accountNumber: [''],
    accountName: [''],
    isContactActive: [true],
    canBeGuarantor: [true],
    canDeposit: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.personId = parseInt(id, 10);
      this.loadPerson(this.personId);
    }
  }

  private loadPerson(id: number): void {
    const person = this.mockService.persons().find(p => p.id === id);
    if (person) {
      this.form.patchValue({
        identityType: person.identityType,
        identityNumber: person.identityNumber,
        title: person.title,
        firstName: person.firstName,
        lastName: person.lastName,
        fatherName: person.fatherName || '',
        profession: person.profession || '',
        mobilePhone: person.contact.mobilePhone,
        phone: person.contact.phone || '',
        email: person.contact.email,
        street: person.address.street,
        houseNumber: person.address.houseNumber,
        apartment: person.address.apartment || '',
        city: person.address.city,
        bankId: person.bankAccounts?.[0]?.bankId || '',
        branchNumber: person.bankAccounts?.[0]?.branchNumber || '',
        accountNumber: person.bankAccounts?.[0]?.accountNumber || '',
        accountName: person.bankAccounts?.[0]?.accountName || '',
        isContactActive: person.isContactActive,
        canBeGuarantor: person.canBeGuarantor,
        canDeposit: person.canDeposit,
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('יש למלא את כל השדות הנדרשים');
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    const personData = {
      identityType: formValue.identityType,
      identityNumber: formValue.identityNumber,
      title: formValue.title,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      fatherName: formValue.fatherName,
      profession: formValue.profession,
      address: {
        street: formValue.street,
        houseNumber: formValue.houseNumber,
        apartment: formValue.apartment,
        city: formValue.city,
      },
      contact: {
        mobilePhone: formValue.mobilePhone,
        phone: formValue.phone,
        email: formValue.email,
      },
      bankAccounts: formValue.bankId ? [{
        bankId: formValue.bankId,
        branchNumber: formValue.branchNumber,
        accountNumber: formValue.accountNumber,
        accountName: formValue.accountName,
      }] : [],
      isContactActive: formValue.isContactActive,
      canBeGuarantor: formValue.canBeGuarantor,
      canDeposit: formValue.canDeposit,
      personType: ['CONTACT'] as any,
      institutionId: 1,
    };

    try {
      if (this.isEditMode() && this.personId) {
        const result = await this.mockService.updatePerson(this.personId, personData);
        if (result.isSuccess) {
          toast.success('איש הקשר עודכן בהצלחה');
          this.router.navigate(['/gmn/people', this.personId]);
        } else {
          toast.error(result.message || 'אירעה שגיאה');
        }
      } else {
        const result = await this.mockService.createPerson(personData as any);
        if (result.isSuccess && result.data) {
          toast.success('איש הקשר נוצר בהצלחה');
          this.router.navigate(['/gmn/people', result.data.id]);
        } else {
          toast.error(result.message || 'אירעה שגיאה');
        }
      }
    } catch (error) {
      toast.error('אירעה שגיאה בשמירה');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
