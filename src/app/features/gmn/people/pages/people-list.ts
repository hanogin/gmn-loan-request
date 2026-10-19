import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucidePlus,
  lucideSearch,
  lucideFilter,
  lucideX,
  lucideEye,
  lucidePencil,
  lucidePhone,
  lucideMail,
  lucideMoreVertical,
  lucideWallet,
  lucidePiggyBank,
  lucideHeart,
  lucideShieldCheck,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { GmnMockService } from '../../../../core/services/mock-data';
import { Person, PersonType } from '../../../../core/models';

@Component({
  selector: 'gmn-people-list',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    RouterLink,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
    HlmTableImports,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucidePlus,
      lucideSearch,
      lucideFilter,
      lucideX,
      lucideEye,
      lucidePencil,
      lucidePhone,
      lucideMail,
      lucideMoreVertical,
      lucideWallet,
      lucidePiggyBank,
      lucideHeart,
      lucideShieldCheck,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  template: `
    <div class="space-y-6" *transloco="let t; prefix: 'gmn'">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ng-icon name="lucideUsers" class="h-6 w-6" />
            {{ t('people.title') }}
          </h1>
          <p class="text-muted-foreground">{{ t('people.subtitle') }}</p>
        </div>
        <button hlmBtn routerLink="/gmn/people/new">
          <ng-icon name="lucidePlus" class="me-2 h-4 w-4" />
          {{ t('people.newPerson') }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ng-icon name="lucideUsers" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ totalPersons() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('people.stats.totalPeople') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <ng-icon name="lucideWallet" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ borrowersCount() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('people.personTypes.borrower') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <ng-icon name="lucidePiggyBank" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ depositorsCount() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('people.personTypes.depositor') }}</p>
            </div>
          </div>
        </div>
        <div hlmCard class="p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30">
              <ng-icon name="lucideHeart" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ donorsCount() }}</p>
              <p class="text-sm text-muted-foreground">{{ t('people.personTypes.donor') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div hlmCard class="p-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <!-- Search -->
          <div class="relative flex-1 sm:max-w-sm">
            <ng-icon name="lucideSearch" class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              hlmInput
              type="text"
              [placeholder]="t('people.searchPlaceholder')"
              class="w-full ps-10"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch()"
            />
          </div>

          <!-- Filter Buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              hlmBtn
              [variant]="activeFilter() === 'ALL' ? 'default' : 'outline'"
              size="sm"
              (click)="setFilter('ALL')"
            >
              {{ t('common.all') }}
            </button>
            <button
              hlmBtn
              [variant]="activeFilter() === 'BORROWER' ? 'default' : 'outline'"
              size="sm"
              (click)="setFilter('BORROWER')"
            >
              <ng-icon name="lucideWallet" class="me-1 h-3 w-3" />
              {{ t('people.personTypes.borrower') }}
            </button>
            <button
              hlmBtn
              [variant]="activeFilter() === 'DEPOSITOR' ? 'default' : 'outline'"
              size="sm"
              (click)="setFilter('DEPOSITOR')"
            >
              <ng-icon name="lucidePiggyBank" class="me-1 h-3 w-3" />
              {{ t('people.personTypes.depositor') }}
            </button>
            <button
              hlmBtn
              [variant]="activeFilter() === 'GUARANTOR' ? 'default' : 'outline'"
              size="sm"
              (click)="setFilter('GUARANTOR')"
            >
              <ng-icon name="lucideShieldCheck" class="me-1 h-3 w-3" />
              {{ t('people.personTypes.guarantor') }}
            </button>
            <button
              hlmBtn
              [variant]="activeFilter() === 'DONOR' ? 'default' : 'outline'"
              size="sm"
              (click)="setFilter('DONOR')"
            >
              <ng-icon name="lucideHeart" class="me-1 h-3 w-3" />
              {{ t('people.personTypes.donor') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div hlmCard>
        <div class="overflow-x-auto">
          <table hlmTable class="w-full">
            <thead>
              <tr hlmTrow>
                <th hlmTh class="text-start">{{ t('people.fields.fullName') }}</th>
                <th hlmTh class="text-start">{{ t('people.fields.idNumber') }}</th>
                <th hlmTh class="text-start">{{ t('people.fields.phone') }}</th>
                <th hlmTh class="text-start">{{ t('people.fields.city') }}</th>
                <th hlmTh class="text-start">{{ t('common.type') }}</th>
                <th hlmTh class="text-start">{{ t('common.status') }}</th>
                <th hlmTh class="text-center w-[80px]">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (person of paginatedPersons(); track person.id) {
                <tr hlmTrow class="cursor-pointer hover:bg-muted/50" (click)="viewPerson(person.id)">
                  <td hlmTd>
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {{ getInitials(person) }}
                      </div>
                      <div>
                        <p class="font-medium">{{ person.fullName || (person.firstName + ' ' + person.lastName) }}</p>
                        <p class="text-xs text-muted-foreground">{{ person.titleName }}</p>
                      </div>
                    </div>
                  </td>
                  <td hlmTd class="font-mono text-sm">{{ person.identityNumber }}</td>
                  <td hlmTd>
                    <div class="flex items-center gap-1 text-sm">
                      <ng-icon name="lucidePhone" class="h-3 w-3 text-muted-foreground" />
                      {{ person.contact.mobilePhone }}
                    </div>
                  </td>
                  <td hlmTd class="text-sm">{{ person.address.cityName || getCityName(person.address.city) }}</td>
                  <td hlmTd>
                    <div class="flex flex-wrap gap-1">
                      @for (type of person.personType; track type) {
                        <span hlmBadge variant="outline" class="text-xs">
                          {{ getPersonTypeTranslation(type) }}
                        </span>
                      }
                    </div>
                  </td>
                  <td hlmTd>
                    @if (person.isContactActive) {
                      <span hlmBadge variant="default" class="bg-green-500">{{ t('common.active') }}</span>
                    } @else {
                      <span hlmBadge variant="secondary">{{ t('common.inactive') }}</span>
                    }
                  </td>
                  <td hlmTd class="text-center" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-center gap-1">
                      <button hlmBtn variant="ghost" size="icon" (click)="viewPerson(person.id)">
                        <ng-icon name="lucideEye" class="h-4 w-4" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" (click)="editPerson(person.id)">
                        <ng-icon name="lucidePencil" class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr hlmTrow>
                  <td hlmTd colspan="7" class="py-8 text-center text-muted-foreground">
                    {{ t('common.noData') }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t p-4">
          <div class="text-sm text-muted-foreground">
            {{ startIndex() + 1 }}-{{ endIndex() }} / {{ filteredPersons().length }}
          </div>
          <div class="flex items-center gap-2">
            <button
              hlmBtn
              variant="outline"
              size="sm"
              [disabled]="currentPage() === 1"
              (click)="previousPage()"
            >
              <ng-icon name="lucideChevronLeft" class="h-4 w-4" />
            </button>
            <span class="px-2 text-sm">
              {{ currentPage() }} / {{ totalPages() }}
            </span>
            <button
              hlmBtn
              variant="outline"
              size="sm"
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
            >
              <ng-icon name="lucideChevronRight" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class PeopleList {
  private readonly mockService = inject(GmnMockService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  // State
  searchQuery = '';
  readonly activeFilter = signal<'ALL' | PersonType>('ALL');
  readonly currentPage = signal(1);
  readonly pageSize = 15;

  // Computed
  readonly totalPersons = computed(() => this.mockService.persons().length);
  readonly borrowersCount = computed(() =>
    this.mockService.persons().filter(p => p.personType.includes('BORROWER')).length
  );
  readonly depositorsCount = computed(() =>
    this.mockService.persons().filter(p => p.personType.includes('DEPOSITOR')).length
  );
  readonly donorsCount = computed(() =>
    this.mockService.persons().filter(p => p.personType.includes('DONOR')).length
  );

  readonly filteredPersons = computed(() => {
    let persons = this.mockService.persons();

    // Apply type filter
    if (this.activeFilter() !== 'ALL') {
      persons = persons.filter(p => p.personType.includes(this.activeFilter() as PersonType));
    }

    // Apply search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      persons = persons.filter(p =>
        p.firstName?.toLowerCase().includes(q) ||
        p.lastName?.toLowerCase().includes(q) ||
        p.fullName?.toLowerCase().includes(q) ||
        p.identityNumber?.includes(q) ||
        p.contact.mobilePhone?.includes(q) ||
        p.contact.email?.toLowerCase().includes(q)
      );
    }

    return persons;
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredPersons().length / this.pageSize) || 1);
  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  readonly endIndex = computed(() => Math.min(this.startIndex() + this.pageSize, this.filteredPersons().length));

  readonly paginatedPersons = computed(() =>
    this.filteredPersons().slice(this.startIndex(), this.endIndex())
  );

  // Methods
  setFilter(filter: 'ALL' | PersonType): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearch(): void {
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  viewPerson(id: number): void {
    this.router.navigate(['/gmn/people', id]);
  }

  editPerson(id: number): void {
    this.router.navigate(['/gmn/people', id, 'edit']);
  }

  callPerson(person: Person): void {
    window.location.href = `tel:${person.contact.mobilePhone}`;
  }

  emailPerson(person: Person): void {
    window.location.href = `mailto:${person.contact.email}`;
  }

  getInitials(person: Person): string {
    return (person.firstName?.charAt(0) || '') + (person.lastName?.charAt(0) || '');
  }

  getCityName(cityId: number): string {
    return this.mockService.getCityName(cityId);
  }

  getPersonTypeTranslation(type: PersonType): string {
    const typeMap: Record<PersonType, string> = {
      'BORROWER': 'people.personTypes.borrower',
      'DEPOSITOR': 'people.personTypes.depositor',
      'GUARANTOR': 'people.personTypes.guarantor',
      'DONOR': 'people.personTypes.donor',
      'CONTACT': 'people.title',
    };
    return this.transloco.translate(`gmn.${typeMap[type]}`);
  }
}
