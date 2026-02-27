/**
 * Interface for subscription plan limits
 * Values of -1 indicate unlimited
 */
export interface SubscriptionLimits {
  max_capsules: number;
  max_items_per_capsule: number;
  max_recipients_per_capsule: number;
  max_storage_mb: number;
  max_monthly_emails: number;
}

/**
 * Interface for subscription plan features
 */
export interface SubscriptionFeatures {
  premium_templates: boolean;
  analytics: boolean;
  auto_backup: boolean;
  priority_support: boolean;
  white_label: boolean;
  multiple_schedules: boolean;
}

/**
 * Complete subscription plan data structure
 */
export interface SubscriptionPlanData {
  id: number;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Predefined subscription plans based on todo_subscriptions.md
 */
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanData> = {
  FREE: {
    id: 1,
    name: 'free',
    displayName: 'Free Plan',
    description: 'Perfect for getting started with Time Capsules',
    monthlyPrice: 0.00,
    yearlyPrice: 0.00,
    limits: {
      max_capsules: 3,
      max_items_per_capsule: 10,
      max_recipients_per_capsule: 3,
      max_storage_mb: 50,
      max_monthly_emails: 10
    },
    features: {
      premium_templates: false,
      analytics: false,
      auto_backup: false,
      priority_support: false,
      white_label: false,
      multiple_schedules: false
    },
    isActive: true,
    sortOrder: 1
  },
  PREMIUM: {
    id: 2,
    name: 'premium',
    displayName: 'Premium Plan',
    description: 'Unlimited Time Capsules with advanced features',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    limits: {
      max_capsules: -1,           // -1 = unlimited
      max_items_per_capsule: -1,  // -1 = unlimited
      max_recipients_per_capsule: -1, // -1 = unlimited
      max_storage_mb: 5000,       // 5GB storage
      max_monthly_emails: -1      // -1 = unlimited
    },
    features: {
      premium_templates: true,
      analytics: true,
      auto_backup: true,
      priority_support: true,
      white_label: true,
      multiple_schedules: true
    },
    isActive: true,
    sortOrder: 2
  }
};

/**
 * Helper function to check if a limit is unlimited
 */
export function isUnlimited(value: number): boolean {
  return value === -1;
}

/**
 * Helper function to check if user has reached a specific limit
 */
export function hasReachedLimit(currentValue: number, limit: number): boolean {
  if (isUnlimited(limit)) {
    return false;
  }
  return currentValue >= limit;
}

/**
 * Helper function to calculate usage percentage
 */
export function calculateUsagePercentage(currentValue: number, limit: number): number {
  if (isUnlimited(limit)) {
    return 0; // Unlimited = 0% usage
  }
  if (limit === 0) {
    return 0; // Avoid division by zero
  }
  return Math.round((currentValue / limit) * 100);
}
