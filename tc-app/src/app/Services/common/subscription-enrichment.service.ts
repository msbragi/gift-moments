import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  IEnrichedPlan,
  IEnrichedLimit,
  IEnrichedFeature,
  ICapsuleUsageResponse,
  SUBSCRIPTION_UI_PLANS,
  SUBSCRIPTION_UI_FEATURES,
  SUBSCRIPTION_UI_LIMITS
} from '../../Models/subscription-ui-config.model';

/**
 * Service to enrich subscription plan data with UI configuration
 * Provides methods to format limits, features, and plans for display 
 * Add translation keys icons and badge text
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionEnrichmentService {

  constructor(private transloco: TranslocoService) { }

  /**
   * Enriches plan data with UI configuration
   */
  enrichPlan(planData: any, currentUsage?: any): IEnrichedPlan {
    const planUIConfig = SUBSCRIPTION_UI_PLANS[planData.name];

    if (!planUIConfig) {
      console.warn(`No UI config found for plan: ${planData.name}`);
    }

    return {
      // Backend data
      id: planData.id,
      name: planData.name,
      displayName: planData.displayName,
      description: planData.description,
      durationMonths: planData.durationMonths,
      priceOnetime: planData.priceOnetime,

      // UI plan configuration
      title: planUIConfig?.title || `subscription_plans.${planData.name}.title`,
      planDescription: planUIConfig?.description || `subscription_plans.${planData.name}.description`,
      icon: planUIConfig?.icon || 'help',
      color: planUIConfig?.color || 'primary',

      // Enriched limits
      enrichedLimits: this.enrichLimits(planData.limits, currentUsage),

      // Enriched features
      enrichedFeatures: this.enrichFeatures(planData.features)
    };
  }

  /**
   * Enriches a list of plans (for subscription-plans component)
   * Set order from SUBSCRIPTION_UI_PLANS
   */
  enrichPlans(plansData: any[]): IEnrichedPlan[] {
    return plansData.map(plan => this.enrichPlan(plan));
  }

  /**
   * Enriches user usage data (for subscription-status component)
   */
  enrichUsageData(usageData: any[]): IEnrichedPlan[] {
    return usageData.map(capsule =>
      this.enrichPlan(capsule.currentPlan, capsule.currentUsage)
    );
  }

  /**
   * Enriches limits with UI configuration and current values
   */
  private enrichLimits(limits: any, currentUsage?: any): { [limitKey: string]: IEnrichedLimit } {
    const enrichedLimits: { [limitKey: string]: IEnrichedLimit } = {};

    Object.entries(limits).forEach(([key, maxValue]) => {
      const uiConfig = SUBSCRIPTION_UI_LIMITS[key];

      if (!uiConfig) {
        console.warn(`No UI config found for limit: ${key}`);
        return;
      }

      enrichedLimits[key] = {
        maxValue: maxValue as number,
        currentValue: currentUsage ? currentUsage[key] || 0 : undefined,
        uiConfig: uiConfig
      };
    });

    return enrichedLimits;
  }

  /**
   * Enriches features with UI configuration
   */
  private enrichFeatures(features: any): { [featureKey: string]: IEnrichedFeature } {
    const enrichedFeatures: { [featureKey: string]: IEnrichedFeature } = {};

    // Handles both objects and arrays (for backward compatibility)
    if (Array.isArray(features)) {
      // Array of strings (old format)
      features.forEach(featureKey => {
        const uiConfig = SUBSCRIPTION_UI_FEATURES[featureKey];
        if (uiConfig) {
          enrichedFeatures[featureKey] = {
            available: true,
            uiConfig: uiConfig
          };
        }
      });
    } else if (features && typeof features === 'object') {
      // Object with boolean (new format)
      Object.entries(features).forEach(([featureKey, available]) => {
        const uiConfig = SUBSCRIPTION_UI_FEATURES[featureKey];
        if (uiConfig) {
          enrichedFeatures[featureKey] = {
            available: available as boolean,
            uiConfig: uiConfig
          };
        }
      });
    }

    return enrichedFeatures;
  }

  /**
   * Formats a value using the UI config formatter
   */
  formatLimitValue(limitKey: string, value: number): string {
    const uiConfig = SUBSCRIPTION_UI_LIMITS[limitKey];

    if (uiConfig?.formatter) {
      return uiConfig.formatter(value);
    }

    return value.toString();
  }

  /**
   * Gets the UI configuration for a limit
   */
  getLimitUIConfig(limitKey: string) {
    return SUBSCRIPTION_UI_LIMITS[limitKey];
  }

  /**
   * Gets the UI configuration for a feature
   */
  getFeatureUIConfig(featureKey: string) {
    return SUBSCRIPTION_UI_FEATURES[featureKey];
  }

  /**
   * Gets the UI configuration for a plan
   */
  getPlanUIConfig(planName: string) {
    return SUBSCRIPTION_UI_PLANS[planName];
  }

  /**
   * Enriches usage metrics with current values and UI configuration
   */
  private enrichUsageMetrics(currentUsage: any, limits: any): { [limitKey: string]: IEnrichedLimit } {
    const enrichedUsage: { [limitKey: string]: IEnrichedLimit } = {};

    // For each limit, create an enriched structure with current and max value
    Object.keys(limits).forEach(limitKey => {
      const uiConfig = SUBSCRIPTION_UI_LIMITS[limitKey];

      if (uiConfig) {
        enrichedUsage[limitKey] = {
          maxValue: limits[limitKey],
          currentValue: currentUsage[limitKey] || 0,
          uiConfig: uiConfig
        };
      }
    });

    return enrichedUsage;
  }

  /**
   * Calculates the utilization percentage for a specific metric
   */
  calculateUtilizationPercentage(usage: ICapsuleUsageResponse, metricKey: string): number {
    const enrichedLimit = usage.currentUsage[metricKey];
    if (!enrichedLimit) return 0;

    const { currentValue = 0, maxValue } = enrichedLimit;

    if (maxValue === -1) return 0; // Unlimited
    if (maxValue === 0) return 0;  // No limit set

    return Math.min((currentValue / maxValue) * 100, 100);
  }

  /**
   * Checks if a specific limit has been reached
   */
  hasReachedLimit(usage: ICapsuleUsageResponse, metricKey: string): boolean {
    const enrichedLimit = usage.currentUsage[metricKey];
    if (!enrichedLimit) return false;

    const { currentValue = 0, maxValue } = enrichedLimit;

    if (maxValue === -1) return false; // Unlimited

    return currentValue >= maxValue;
  }

  /**
   * Gets the status color based on utilization percentage
   */
  getStatusColor(percentage: number): 'primary' | 'accent' | 'warn' {
    if (percentage >= 90) return 'warn';
    if (percentage >= 75) return 'accent';
    return 'primary';
  }

  /**
   * Formats a limit for display
   */
  formatLimit(limit: number): string {
    return limit === -1 ? 'Unlimited' : limit.toString();
  }

  /**
   * Formats the storage size
   */
  formatStorageSize(sizeInMb: number): string {
    if (sizeInMb >= 1024) {
      const sizeInGb = Math.round(sizeInMb / 1024 * 100) / 100;
      return `${sizeInGb} GB`;
    }
    return `${sizeInMb} MB`;
  }

  /**
   * Checks if a plan is premium (not free)
   */
  isPremiumPlan(plan: IEnrichedPlan): boolean {
    return plan.name !== 'free' && plan.id !== 1;
  }

  /**
   * Gets the display text for a limit
   */
  getLimitDisplayText(limitKey: string, maxValue: number): string {
    const limitConfig = SUBSCRIPTION_UI_LIMITS[limitKey];
    if (!limitConfig) {
      return `${limitKey}: ${maxValue}`;
    }

    if (maxValue === -1) {
      // Limite illimitato
      return limitConfig.unlimitedTranslationKey ?
        this.transloco.translate(limitConfig.unlimitedTranslationKey) :
        'Unlimited';
    }

    // Applica il formatter se disponibile
    if (limitConfig.formatter) {
      const formattedValue = limitConfig.formatter(maxValue);
      return this.transloco.translate(limitConfig.translationKey) + ': ' + formattedValue;
    }

    // Formato default
    return this.transloco.translate(limitConfig.translationKey) + ': ' + maxValue;
  }

  /**
   * Gets the display text for a feature
   */
  getFeatureDisplayText(featureKey: string): string {
    const featureConfig = SUBSCRIPTION_UI_FEATURES[featureKey];
    if (!featureConfig) {
      // Fallback: converte snake_case in Title Case
      return featureKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return this.transloco.translate(featureConfig.translationKey);
  }
  /**
   * Enriches the usage data of a single subscription
   * Aggiornato per accedere ai dati dalla nuova struttura
   */
  enrichSubscriptionUsage(rawSubscriptionData: any): ICapsuleUsageResponse {
    const subscription = rawSubscriptionData.subscription;
    const capsule = subscription.capsule;
    const plan = subscription.subscriptionPlan;

    // Arricchisce il piano con le configurazioni UI
    const enrichedPlan = this.enrichPlan(plan, rawSubscriptionData.currentUsage);

    return {
      // ✅ Dati subscription (nuovi campi)
      subscriptionId: subscription.id,
      status: subscription.status,
      paymentMethod: subscription.paymentMethod,
      billingCycle: subscription.billingCycle,
      planId: subscription.subscriptionPlan.id,

      // ✅ Dati capsule (da subscription.capsule)
      capsuleId: capsule.id,
      capsuleName: capsule.name,

      // ✅ Dati timing (da subscription e calcolati)
      totalUsedStorage: rawSubscriptionData.totalUsedStorage,
      durationMonths: plan.durationMonths,
      isActive: rawSubscriptionData.isActive,

      // ✅ Date parsing (da subscription)
      planStarted: new Date(subscription.startsAt),
      expiresAt: rawSubscriptionData.expiresAt ? new Date(rawSubscriptionData.expiresAt) : null,

      // ✅ Enriched plan (da subscription.subscriptionPlan)
      currentPlan: enrichedPlan,

      // ✅ Usage enriched con UI configuration
      currentUsage: this.enrichUsageMetrics(rawSubscriptionData.currentUsage, plan.limits)
    };
  }

  /**
   * Enriches an array of capsule usage data
   */
  enrichUsageArray(rawData: any[]): ICapsuleUsageResponse[] {
    return rawData.map(data => this.enrichSubscriptionUsage(data));
  }

}
