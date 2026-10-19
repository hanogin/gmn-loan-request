import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth-service';
import { DirectionalityService } from '@core/config/directionality-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideBarChart3,
  lucideBot,
  lucideCalendarDays,
  lucideChevronRight,
  lucideFileText,
  lucideFolderOpen,
  lucideGauge,
  lucideKanbanSquare,
  lucideLayoutDashboard,
  lucideLock,
  lucideSettings,
  lucideUsers,
  lucideWallet,
  lucidePiggyBank,
  lucideHeart,
  lucideCreditCard,
  lucideBuilding,
  lucideClipboardList,
  lucideUserPlus,
  lucideCalculator,
  lucideShield,
} from '@ng-icons/lucide';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NavGroup } from '../../model/navigation';
import { NavSecondary } from '../secondary/nav-secondary';
import { NavUser } from '../user/user';

@Component({
  selector: 'adm-navigation',
  imports: [
    HlmSidebarImports,
    HlmCollapsibleImports,
    HlmTooltipImports,
    HlmDropdownMenuImports,
    NgIcon,
    NavUser,
    NavSecondary,
    RouterLink,
    RouterModule,
    NgOptimizedImage,
    TranslocoModule,
  ],
  templateUrl: './navigation.html',
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideChevronRight,
      lucideGauge,
      lucideBarChart3,
      lucideFileText,
      lucideFolderOpen,
      lucideUsers,
      lucideCalendarDays,
      lucideKanbanSquare,
      lucideLock,
      lucideAlertTriangle,
      lucideSettings,
      lucideBot,
      lucideWallet,
      lucidePiggyBank,
      lucideHeart,
      lucideCreditCard,
      lucideBuilding,
      lucideClipboardList,
      lucideUserPlus,
      lucideCalculator,
      lucideShield,
    }),
  ],
})
export class Navigation {
  // ==========================================
  // Services
  // ==========================================

  private readonly _dir = inject(DirectionalityService);
  private readonly _authService = inject(AuthService);
  private readonly _sidebarService = inject(HlmSidebarService);

  // ==========================================
  // State
  // ==========================================

  protected readonly side = computed<'left' | 'right'>(() => (this._dir.isRtl() ? 'right' : 'left'));
  protected readonly sideBarCollapsed = computed(
    () => this._sidebarService.state() === 'collapsed' && !this._sidebarService.isMobile()
  );

  protected readonly _navigationGroups: NavGroup[] = [
    {
      label: 'gmn',
      items: [
        { title: 'Dashboard', key: 'gmnDashboard', url: '/gmn', icon: 'lucideLayoutDashboard' },
        { title: 'People', key: 'gmnPeople', url: '/gmn/people', icon: 'lucideUsers' },
        { title: 'Loan Requests', key: 'gmnLoanRequests', url: '/gmn/loan-requests', icon: 'lucideClipboardList' },
        { title: 'Loans', key: 'gmnLoans', url: '/gmn/loans', icon: 'lucideWallet' },
        { title: 'Savings', key: 'gmnSavings', url: '/gmn/savings', icon: 'lucidePiggyBank' },
        { title: 'Donations', key: 'gmnDonations', url: '/gmn/donations', icon: 'lucideHeart' },
        { title: 'Payments', key: 'gmnPayments', url: '/gmn/payments', icon: 'lucideCreditCard' },
        { title: 'Masav', key: 'gmnMasav', url: '/gmn/masav', icon: 'lucideBuilding' },
      ],
    },
    {
      label: 'management',
      items: [
        { title: 'Accounting', key: 'gmnAccounting', url: '/gmn/accounting', icon: 'lucideCalculator' },
        { title: 'Reports', key: 'gmnReports', url: '/gmn/reports', icon: 'lucideBarChart3' },
        { title: 'Admin', key: 'gmnAdmin', url: '/gmn/admin', icon: 'lucideShield' },
        { title: 'Settings', key: 'settings', url: '/settings', icon: 'lucideSettings' },
      ],
    },
  ];

  protected readonly user = this._authService.currentUser;
}
