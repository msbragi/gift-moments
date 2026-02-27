import { Routes } from '@angular/router';
import { StaticContentComponent } from './Pages/static-content.component';
import { authGuard } from './Core/guards/auth.guard';
import { adminGuard } from './Core/guards/admin.guard';
import { redirectLangGuard } from './Core/guards/redirect-lang.guard';

export const routes: Routes = [
/*
  {
    path: '',
    redirectTo: '/pages/home/',
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: '/pages/home/',
    pathMatch: 'full'
  },
*/
  // Static pages route for footer links and other static content
  {
    path: 'pages/:pageId',
    canActivate: [redirectLangGuard],
    component: StaticContentComponent,
    data: {} // pageId will be extracted from route params
  },
  {
    path: 'pages/:lang/:pageId',
    component: StaticContentComponent,
    data: {}
  },
  {
    path: 'login',
    loadComponent: () => import('./Components/login/login.component')
      .then(c => c.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./Components/dashboard/dashboard.component')
      .then(c => c.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./Components/user-profile/user-profile.component')
      .then(c => c.UserProfileComponent)
  },
  {
    path: 'capsules',
    canActivate: [authGuard],
    loadComponent: () => import('./Components/capsules/capsules.component')
      .then(c => c.CapsulesComponent)
  },
  {
    path: 'capsule-explorer',
    canActivate: [authGuard],
    loadComponent: () => import('./Components/capsule-explorer/capsule-explorer.component')
      .then(c => c.CapsuleExplorerComponent)
  },
  {
    path: 'library',
    canActivate: [authGuard],
    loadComponent: () => import('./Components/library/library.component')
      .then(c => c.LibraryComponent)
  },
  // Admin routes
  {
    path: 'admin/stats',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./Components/admin/stats/admin-stats.component')
      .then(c => c.AdminStatsComponent)
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./Components/admin/users/users-admin.component')
      .then(c => c.UsersAdminComponent)
  },
  {
    path: 'admin/payment-gateways',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./Components/admin/payment-gateways/payment-gateways-admin.component')
      .then(c => c.PaymentGatewaysAdminComponent)
  },
  // Nuove route per registrazione e verifica email
  {
    path: 'register',
    loadComponent: () => import('./Components/register/register.component')
      .then(c => c.RegisterComponent)
  },
  {
    path: 'email-verification-notice',
    loadComponent: () => import('./Components/email-verification/email-verification-notice.component')
      .then(c => c.EmailVerificationNoticeComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./Components/email-verification/verify-email.component')
      .then(c => c.VerifyEmailComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./Components/forgot-password/forgot-password.component')
      .then(c => c.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./Components/reset-password/reset-password.component')
      .then(c => c.ResetPasswordComponent)
  },
  // Subscription plans - public route
  {
    path: 'subscription-plans',
    loadComponent: () => import('./Components/subscriptions/subscription-plans.component')
      .then(c => c.SubscriptionPlansComponent)
  },
  // Subscription status - private route (authenticated users only)
  {
    path: 'subscription',
    canActivate: [authGuard],
    loadComponent: () => import('./Components/subscription/subscription-status.component')
      .then(c => c.SubscriptionStatusComponent)
  },
  // Fallback route for 404 Not Found
  { path: '**', redirectTo: '/pages/home' }
];