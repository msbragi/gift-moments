// toolbar.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/api/auth.service';
import { LangPickerComponent } from "../lang-picker/lang-picker.component";
import { ThemePickerComponent } from '../theme-picker/theme-picker.component';
import { TokenStatusComponent } from "../token-status/token-status.component";
import { ToolbarNavigationComponent } from './toolbar-navigation.component';
import { ToolbarUserSectionComponent } from './toolbar-user-section.component';
import { ToolbarSubscriptionComponent } from './toolbar-subscription.component';

/**
 * Toolbar component that displays navigation controls, app logo, and user authentication options
 */
@Component({
  selector: 'tc-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    LangPickerComponent,
    ThemePickerComponent,
    RouterModule,
    TokenStatusComponent,
    ToolbarNavigationComponent,
    ToolbarUserSectionComponent,
    ToolbarSubscriptionComponent
],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  /** Event emitter for toggling the sidenav */
  @Output() toggleSidenav = new EventEmitter<void>();

  /** User data from authentication service */
  user: any = null;

  /** Fallback avatar if Google image fails */
  fallbackAvatar = 'assets/img/avatars/default-avatar.png';

  /**
     * Creates an instance of the ToolbarComponent
     * @param authService - Service for handling user authentication
     * @param router - Angular router for navigation
     */
  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Initializes the component and subscribes to user authentication state
   */
  ngOnInit(): void {
    // Subscribe to user data from authentication service
    this.authService.currentUser$.subscribe((userData) => {
      this.user = userData;
    });
  }

  /**
   * Handles user logout by clearing authentication data and navigating to login page
   */
  logout(): void {
    this.authService.logout(); // Clear user data in AuthService
    this.router.navigate(['/login']); // Redirect to login page
  }

  /**
 * Handle image load error by replacing with fallback
 */
  onAvatarError(event: any): void {
    event.target.src = this.fallbackAvatar;
  }

  // Subscription badge methods

  /**
   * Get the appropriate CSS class for the subscription badge
   */
  getSubscriptionBadgeClass(): string {
    if (!this.user) {
      return 'subscription-badge-guest';
    }

    // Check if user has currentPlanId = 1 (Free plan), regardless of subscription status
    if (this.user.currentPlanId === 1) {
      return 'subscription-badge-free';
    }

    switch (this.user.subscriptionStatus) {
      case 'active':
        return 'subscription-badge-premium';
      case 'trial':
        return 'subscription-badge-trial';
      case 'expired':
      case 'cancelled':
        return 'subscription-badge-expired';
      case 'free':
      default:
        return 'subscription-badge-free';
    }
  }

  /**
   * Get the appropriate icon for the subscription badge
   */
  getSubscriptionIcon(): string {
    if (!this.user) {
      return 'local_offer'; // Pricing icon for guests
    }

    // Check if user has currentPlanId = 1 (Free plan), regardless of subscription status
    if (this.user.currentPlanId === 1) {
      return 'person';
    }

    switch (this.user.subscriptionStatus) {
      case 'active':
        return 'workspace_premium';
      case 'trial':
        return 'schedule';
      case 'expired':
      case 'cancelled':
        return 'warning';
      case 'free':
      default:
        return 'person';
    }
  }

  /**
   * Get the display text for the subscription badge
   */
  getSubscriptionDisplayText(): string {
    if (!this.user) {
      return 'Pricing';
    }

    // Check if user has currentPlanId = 1 (Free plan), regardless of subscription status
    if (this.user.currentPlanId === 1) {
      return 'Free';
    }

    switch (this.user.subscriptionStatus) {
      case 'active':
        return 'Premium';
      case 'trial':
        return 'Trial';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      case 'free':
      default:
        return 'Free';
    }
  }

  /**
   * Get the tooltip text for the subscription badge
   */
  getSubscriptionTooltip(): string {
    if (!this.user) {
      return 'View our pricing plans and features';
    }

    // Check if user has currentPlanId = 1 (Free plan), regardless of subscription status
    if (this.user.currentPlanId === 1) {
      return 'Free Plan - Upgrade to unlock premium features';
    }

    switch (this.user.subscriptionStatus) {
      case 'active':
        return 'Premium Plan - All features unlocked';
      case 'trial':
        const trialEnd = this.user.trialEndsAt ? new Date(this.user.trialEndsAt).toLocaleDateString() : 'soon';
        return `Premium Trial - Expires ${trialEnd}`;
      case 'expired':
        return 'Premium Plan Expired - Upgrade to continue';
      case 'cancelled':
        return 'Premium Plan Cancelled - Reactivate anytime';
      case 'free':
      default:
        return 'Free Plan - Upgrade to unlock premium features';
    }
  }

}