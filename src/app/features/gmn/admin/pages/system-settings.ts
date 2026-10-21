import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideSave,
  lucideBuilding2,
  lucideMail,
  lucideSettings,
  lucideDatabase,
  lucideShield,
  lucideGlobe,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';

@Component({
  selector: 'gmn-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmTabsImports,
    BrnTabsImports,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideSave,
      lucideBuilding2,
      lucideMail,
      lucideSettings,
      lucideDatabase,
      lucideShield,
      lucideGlobe,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button hlmBtn variant="outline" size="icon" routerLink="/gmn/admin">
            <ng-icon name="lucideArrowRight" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold">{{ t('admin.settings.title') }}</h1>
            <p class="text-muted-foreground">{{ t('admin.subtitle') }}</p>
          </div>
        </div>
        <button hlmBtn (click)="saveSettings()">
          <ng-icon name="lucideSave" class="me-2 h-4 w-4" />
          {{ t('common.save') }}
        </button>
      </div>

      <!-- Tabs -->
      <hlm-tabs tab="organization" class="w-full">
        <hlm-tabs-list class="w-full grid grid-cols-4">
          <button hlmTabsTrigger="organization">
            <ng-icon name="lucideBuilding2" class="me-2 h-4 w-4" />
            {{ t('admin.settings.organization') }}
          </button>
          <button hlmTabsTrigger="defaults">
            <ng-icon name="lucideSettings" class="me-2 h-4 w-4" />
            {{ t('admin.settings.general') }}
          </button>
          <button hlmTabsTrigger="email">
            <ng-icon name="lucideMail" class="me-2 h-4 w-4" />
            {{ t('admin.settings.email') }}
          </button>
          <button hlmTabsTrigger="backup">
            <ng-icon name="lucideDatabase" class="me-2 h-4 w-4" />
            {{ t('admin.settings.backup') }}
          </button>
        </hlm-tabs-list>

        <!-- Organization Tab -->
        <div hlmTabsContent="organization">
          <div hlmCard class="p-6 mt-4">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('admin.settings.organization') }}</h3>
            <form [formGroup]="orgForm" class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('admin.settings.organizationName') }} *</label>
                  <input hlmInput type="text" formControlName="name" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>{{ t('admin.settings.phone') }}</label>
                  <input hlmInput type="tel" formControlName="phone" class="w-full" />
                </div>
              </div>
              <div>
                <label hlmLabel>{{ t('admin.settings.address') }}</label>
                <input hlmInput type="text" formControlName="address" class="w-full" />
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('admin.settings.emailAddress') }}</label>
                  <input hlmInput type="email" formControlName="email" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>Website</label>
                  <input hlmInput type="url" formControlName="website" class="w-full" />
                </div>
              </div>
              <div>
                <label hlmLabel>Registration Number</label>
                <input hlmInput type="text" formControlName="registrationNumber" class="w-full" />
              </div>
            </form>
          </div>
        </div>

        <!-- Defaults Tab -->
        <div hlmTabsContent="defaults">
          <div hlmCard class="p-6 mt-4">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('admin.settings.general') }}</h3>
            <form [formGroup]="defaultsForm" class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>{{ t('admin.settings.defaultInterestRate') }} (%)</label>
                  <input hlmInput type="number" formControlName="defaultInterestRate" class="w-full" step="0.1" />
                </div>
                <div>
                  <label hlmLabel>{{ t('admin.settings.defaultPaymentDay') }}</label>
                  <input hlmInput type="number" formControlName="defaultPaymentDay" class="w-full" min="1" max="28" />
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>Default Loan Term (months)</label>
                  <input hlmInput type="number" formControlName="defaultLoanTerm" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>Max Loan Amount</label>
                  <input hlmInput type="number" formControlName="maxLoanAmount" class="w-full" />
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>Currency</label>
                  <brn-select formControlName="currency" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value placeholder="Currency" />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      <hlm-select-item value="ILS">₪ Israeli Shekel (ILS)</hlm-select-item>
                      <hlm-select-item value="USD">$ US Dollar (USD)</hlm-select-item>
                      <hlm-select-item value="EUR">€ Euro (EUR)</hlm-select-item>
                    </hlm-select-content>
                  </brn-select>
                </div>
                <div>
                  <label hlmLabel>Fiscal Year Start</label>
                  <brn-select formControlName="fiscalYearStart" class="w-full">
                    <hlm-select-trigger class="w-full">
                      <hlm-select-value placeholder="Month" />
                    </hlm-select-trigger>
                    <hlm-select-content>
                      <hlm-select-item value="1">January</hlm-select-item>
                      <hlm-select-item value="4">April</hlm-select-item>
                      <hlm-select-item value="7">July (Tishrei)</hlm-select-item>
                      <hlm-select-item value="10">October</hlm-select-item>
                    </hlm-select-content>
                  </brn-select>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Email Tab -->
        <div hlmTabsContent="email">
          <div hlmCard class="p-6 mt-4">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('admin.settings.email') }}</h3>
            <form [formGroup]="emailForm" class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>SMTP Server</label>
                  <input hlmInput type="text" formControlName="smtpServer" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>SMTP Port</label>
                  <input hlmInput type="number" formControlName="smtpPort" class="w-full" />
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label hlmLabel>SMTP Username</label>
                  <input hlmInput type="text" formControlName="smtpUsername" class="w-full" />
                </div>
                <div>
                  <label hlmLabel>SMTP Password</label>
                  <input hlmInput type="password" formControlName="smtpPassword" class="w-full" />
                </div>
              </div>
              <div>
                <label hlmLabel>From Email</label>
                <input hlmInput type="email" formControlName="fromEmail" class="w-full" />
              </div>
              <div>
                <label hlmLabel>From Name</label>
                <input hlmInput type="text" formControlName="fromName" class="w-full" />
              </div>
              <div class="pt-4">
                <button hlmBtn variant="outline" type="button" (click)="testEmail()">
                  <ng-icon name="lucideMail" class="me-2 h-4 w-4" />
                  Send Test Email
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Backup Tab -->
        <div hlmTabsContent="backup">
          <div hlmCard class="p-6 mt-4">
            <h3 class="mb-4 font-semibold border-b pb-2">{{ t('admin.settings.backup') }}</h3>
            <div class="space-y-6">
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p class="font-medium">Last Backup</p>
                  <p class="text-sm text-muted-foreground">{{ lastBackupDate }}</p>
                </div>
                <button hlmBtn variant="outline" (click)="createBackup()">
                  <ng-icon name="lucideDatabase" class="me-2 h-4 w-4" />
                  Create Backup Now
                </button>
              </div>

              <div class="space-y-4">
                <h4 class="font-medium">Automatic Backups</h4>
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label hlmLabel>Backup Frequency</label>
                    <brn-select [(ngModel)]="backupFrequency" class="w-full">
                      <hlm-select-trigger class="w-full">
                        <hlm-select-value placeholder="Frequency" />
                      </hlm-select-trigger>
                      <hlm-select-content>
                        <hlm-select-item value="daily">Daily</hlm-select-item>
                        <hlm-select-item value="weekly">Weekly</hlm-select-item>
                        <hlm-select-item value="monthly">Monthly</hlm-select-item>
                      </hlm-select-content>
                    </brn-select>
                  </div>
                  <div>
                    <label hlmLabel>Retention (days)</label>
                    <input hlmInput type="number" [(ngModel)]="backupRetention" class="w-full" />
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="font-medium">Recent Backups</h4>
                <div class="border rounded-lg divide-y">
                  @for (backup of recentBackups; track backup.id) {
                    <div class="flex items-center justify-between p-3">
                      <div>
                        <p class="text-sm font-medium">{{ backup.filename }}</p>
                        <p class="text-xs text-muted-foreground">{{ backup.date }} - {{ backup.size }}</p>
                      </div>
                      <button hlmBtn variant="ghost" size="sm">Download</button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </hlm-tabs>
    </div>
  `,
})
export default class SystemSettingsPage implements OnInit {
  private readonly fb = inject(FormBuilder);

  orgForm!: FormGroup;
  defaultsForm!: FormGroup;
  emailForm!: FormGroup;

  backupFrequency = 'daily';
  backupRetention = 30;
  lastBackupDate = '19/10/2026 02:00';

  recentBackups = [
    { id: 1, filename: 'backup_20261019_020000.sql', date: '19/10/2026 02:00', size: '45.2 MB' },
    { id: 2, filename: 'backup_20261018_020000.sql', date: '18/10/2026 02:00', size: '44.8 MB' },
    { id: 3, filename: 'backup_20261017_020000.sql', date: '17/10/2026 02:00', size: '44.5 MB' },
  ];

  ngOnInit(): void {
    this.orgForm = this.fb.group({
      name: ['גמ״ח חסד ואמת'],
      phone: ['02-1234567'],
      address: ['רחוב הרצל 1, ירושלים'],
      email: ['info@gemach.org'],
      website: ['https://gemach.org'],
      registrationNumber: ['58-0123456'],
    });

    this.defaultsForm = this.fb.group({
      defaultInterestRate: [0],
      defaultPaymentDay: [1],
      defaultLoanTerm: [24],
      maxLoanAmount: [50000],
      currency: ['ILS'],
      fiscalYearStart: ['7'],
    });

    this.emailForm = this.fb.group({
      smtpServer: ['smtp.gmail.com'],
      smtpPort: [587],
      smtpUsername: [''],
      smtpPassword: [''],
      fromEmail: ['noreply@gemach.org'],
      fromName: ['גמ״ח חסד ואמת'],
    });
  }

  saveSettings(): void {
    console.log('Save settings:', {
      org: this.orgForm.value,
      defaults: this.defaultsForm.value,
      email: this.emailForm.value,
    });
    // TODO: Implement save
  }

  testEmail(): void {
    console.log('Send test email');
    // TODO: Implement test email
  }

  createBackup(): void {
    console.log('Create backup');
    // TODO: Implement backup
  }
}
