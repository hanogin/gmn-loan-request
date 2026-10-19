import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideFileText,
  lucideAlertCircle,
  lucideCalculator,
  lucideWallet,
  lucidePiggyBank,
  lucideHeart,
  lucideUsers,
  lucideTrendingUp,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'gmn-reports-dashboard',
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
      lucideFileText,
      lucideAlertCircle,
      lucideCalculator,
      lucideWallet,
      lucidePiggyBank,
      lucideHeart,
      lucideUsers,
      lucideTrendingUp,
    }),
  ],
  template: `
    <div class="space-y-6" >
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight">דוחות</h1>
        <p class="text-muted-foreground">הפקת דוחות וניתוח נתונים</p>
      </div>

      <!-- Report Categories -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Late Payments -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/reports/late-payments">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              <ng-icon name="lucideAlertCircle" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">דוח איחורים</h3>
              <p class="text-sm text-muted-foreground">הלוואות עם תשלומים באיחור</p>
            </div>
          </div>
        </div>

        <!-- CPA Report -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/reports/cpa">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideCalculator" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">דוח רו"ח</h3>
              <p class="text-sm text-muted-foreground">דוח להנהלת חשבונות ורואה חשבון</p>
            </div>
          </div>
        </div>

        <!-- Loans Summary -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/reports/loans-summary">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideWallet" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">סיכום הלוואות</h3>
              <p class="text-sm text-muted-foreground">סטטיסטיקה וסיכום הלוואות</p>
            </div>
          </div>
        </div>

        <!-- Savings Summary -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/reports/savings-summary">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucidePiggyBank" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">סיכום פיקדונות</h3>
              <p class="text-sm text-muted-foreground">סטטיסטיקה וסיכום פיקדונות</p>
            </div>
          </div>
        </div>

        <!-- Donations Summary -->
        <div hlmCard class="p-6 hover:shadow-lg transition-shadow cursor-pointer" routerLink="/gmn/reports/donations-summary">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30">
              <ng-icon name="lucideHeart" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">סיכום תרומות</h3>
              <p class="text-sm text-muted-foreground">סטטיסטיקה וסיכום תרומות</p>
            </div>
          </div>
        </div>

        <!-- Activity Report - Future -->
        <div hlmCard class="p-6 opacity-60">
          <div class="flex items-center gap-4 mb-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
              <ng-icon name="lucideTrendingUp" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold">דוח פעילות</h3>
              <p class="text-sm text-muted-foreground">בקרוב...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class ReportsDashboardPage {}
