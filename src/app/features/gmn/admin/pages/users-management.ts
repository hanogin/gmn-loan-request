import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideConstruction } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'gmn-users-management',
  standalone: true,
  imports: [TranslocoModule, NgIcon, RouterLink, HlmButtonImports, HlmCardImports],
  providers: [provideIcons({ lucideArrowRight, lucideConstruction })],
  template: `
    <div class="space-y-6" >
      <div class="flex items-center gap-4">
        <button hlmBtn variant="outline" size="icon" routerLink="/gmn/admin">
          <ng-icon name="lucideArrowRight" class="h-4 w-4" />
        </button>
        <h1 class="text-2xl font-bold">ניהול משתמשים</h1>
      </div>
      <div hlmCard class="p-8 text-center">
        <ng-icon name="lucideConstruction" class="mx-auto mb-4 h-16 w-16 text-amber-500" />
        <h2 class="text-xl font-semibold mb-2">בפיתוח</h2>
        <p class="text-muted-foreground">ניהול משתמשים יהיה זמין בקרוב</p>
      </div>
    </div>
  `,
})
export default class UsersManagementPage {}
