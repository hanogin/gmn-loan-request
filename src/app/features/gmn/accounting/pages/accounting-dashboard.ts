import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBookOpen,
  lucideFileText,
  lucideScale,
  lucideCalculator,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'gmn-accounting-dashboard',
  standalone: true,
  imports: [
    TranslocoModule,
    NgIcon,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({
      lucideBookOpen,
      lucideFileText,
      lucideScale,
      lucideCalculator,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ t('accounting.title') }}</h1>
        <p class="text-muted-foreground">{{ t('accounting.subtitle') }}</p>
      </div>

      <!-- Navigation Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/accounting/accounts">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideBookOpen" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">{{ t('accounting.chartOfAccounts.title') }}</h3>
              <p class="text-sm text-muted-foreground">{{ t('accounting.subtitle') }}</p>
            </div>
          </div>
        </div>

        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/accounting/journal">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideFileText" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">{{ t('accounting.journalEntries.title') }}</h3>
              <p class="text-sm text-muted-foreground">{{ t('common.view') }}</p>
            </div>
          </div>
        </div>

        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/accounting/trial-balance">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucideScale" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">{{ t('accounting.trialBalance.title') }}</h3>
              <p class="text-sm text-muted-foreground">{{ t('accounting.trialBalance.asOf') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AccountingDashboardPage {}
