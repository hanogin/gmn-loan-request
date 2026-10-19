import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideConstruction } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'gmn-loan-request-form',
  standalone: true,
  imports: [RouterLink, NgIcon, HlmButtonImports, HlmCardImports],
  providers: [provideIcons({ lucideArrowRight, lucideConstruction })],
  template: `
    <div class="space-y-6" >
      <button hlmBtn variant="ghost" routerLink="/gmn/loan-requests">
        <ng-icon name="lucideArrowRight" class="me-2 h-4 w-4" />
        חזרה לרשימה
      </button>
      
      <div hlmCard class="flex flex-col items-center justify-center py-20">
        <ng-icon name="lucideConstruction" class="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 class="text-xl font-semibold">בקשת הלוואה חדשה</h2>
        <p class="text-muted-foreground">מסך זה בפיתוח...</p>
        <p class="mt-4 text-sm text-muted-foreground">בינתיים, השתמש ב<a routerLink="/loan-request" class="text-primary underline">טופס הבקשה המקוונת</a></p>
      </div>
    </div>
  `,
})
export default class LoanRequestForm {}
