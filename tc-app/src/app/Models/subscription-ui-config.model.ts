// Configurazione UI per un singolo limit
export interface ILimitUIConfig {
  icon: string;
  translationKey: string;
  unlimitedIcon?: string;
  unlimitedTranslationKey?: string;
  formatter?: (value: number) => string;
  showWhenZero?: boolean;
}

// Configurazione UI per una singola feature
export interface IFeatureUIConfig {
  icon: string;
  translationKey: string;
}

// Configurazione UI per un piano
export interface IPlanUIConfig {
  title: string;           // translation key
  description: string;     // translation key
  icon: string;           // Material icon name
  color?: string;         // Theme color
}

// Configurazioni globali
export interface ILimitsUIConfig {
  [limitKey: string]: ILimitUIConfig;
}

export interface IFeaturesUIConfig {
  [featureKey: string]: IFeatureUIConfig;
}

export interface IPlansUIConfig {
  [planName: string]: IPlanUIConfig;
}

// Struttura arricchita per un limit
export interface IEnrichedLimit {
  maxValue: number;           // Valore massimo dal backend
  currentValue?: number;      // Valore usato attualmente
  uiConfig: ILimitUIConfig;    // Configurazione UI
}

// Struttura arricchita per una feature
export interface IEnrichedFeature {
  available: boolean;         // Se la feature è disponibile
  uiConfig: IFeatureUIConfig;  // Configurazione UI
}

// Piano arricchito con tutte le configurazioni UI
export interface IEnrichedPlan {
  // Dati originali dal backend
  id: number;
  name: string;
  displayName: string;
  description: string;
  durationMonths: number | null;
  priceOnetime: number;
  
  // Configurazione UI del piano
  title: string;              // translation key
  planDescription: string;    // translation key  
  icon: string;
  color?: string;
  
  // Limits arricchiti
  enrichedLimits: { [limitKey: string]: IEnrichedLimit };
  
  // Features arricchite
  enrichedFeatures: { [featureKey: string]: IEnrichedFeature };
}

export interface ICapsuleUsageResponse {
  subscriptionId: number;
  paymentMethod: any,
  billingCycle: string,
  planId: number;
  status: string;
  capsuleId: number;
  capsuleName: string;
  currentPlan: IEnrichedPlan;
  currentUsage: { [limitKey: string]: IEnrichedLimit };
  totalUsedStorage: number;
  planStarted: Date;
  durationMonths: number | null;
  expiresAt: Date | null;
  isActive: boolean;
}

/**
 * Configurazione UI globale per tutti i limits
 * Riutilizzabile per tutti i piani
 */
export const SUBSCRIPTION_UI_LIMITS: ILimitsUIConfig = {
  'items_per_capsule': {
    icon: 'photo_library',
    translationKey: 'subscription.limits.items_per_capsule',
    unlimitedIcon: 'all_inclusive',
    unlimitedTranslationKey: 'subscription.limits.items_unlimited'
  },
  'recipients_per_capsule': {
    icon: 'people',
    translationKey: 'subscription.limits.recipients_per_capsule',
    unlimitedIcon: 'all_inclusive',
    unlimitedTranslationKey: 'subscription.limits.recipients_unlimited'
  },
  'storage_mb': {
    icon: 'cloud_upload',
    translationKey: 'subscription.limits.storage_mb',
    unlimitedIcon: 'all_inclusive',
    unlimitedTranslationKey: 'subscription.limits.storage_unlimited',
    formatter: (value: number) => {
      if (value >= 1024) {
        return `${Math.round(value / 1024 * 10) / 10}GB`;
      }
      return `${value}MB`;
    }
  },
  'monthly_emails_sent': {
    icon: 'email',
    translationKey: 'subscription.limits.monthly_emails',
    unlimitedIcon: 'all_inclusive',
    unlimitedTranslationKey: 'subscription.limits.monthly_emails_unlimited',
    showWhenZero: false
  },
  'monthly_api_calls': {
    icon: 'api',
    translationKey: 'subscription.limits.monthly_api_calls',
    unlimitedIcon: 'all_inclusive',
    unlimitedTranslationKey: 'subscription.limits.monthly_api_calls_unlimited',
    showWhenZero: false
  }
};

/**
 * Configurazione UI globale per tutte le features
 * Riutilizzabile per tutti i piani
 */
export const SUBSCRIPTION_UI_FEATURES: IFeaturesUIConfig = {
  'premium_templates': {
    icon: 'palette',
    translationKey: 'subscription.features.premium_templates'
  },
  'analytics': {
    icon: 'analytics',
    translationKey: 'subscription.features.analytics'
  },
  'auto_backup': {
    icon: 'backup',
    translationKey: 'subscription.features.auto_backup'
  },
  'priority_support': {
    icon: 'support_agent',
    translationKey: 'subscription.features.priority_support'
  }
};

/**
 * Configurazione UI specifica per ogni piano
 * Contiene solo le informazioni specifiche del piano
 */
export const SUBSCRIPTION_UI_PLANS: IPlansUIConfig = {
  'free': {
    title: 'subscription_plans.free.title',
    description: 'subscription_plans.free.description',
    icon: 'star',
    color: 'primary'
  },
  'pro': {
    title: 'subscription_plans.pro.title',
    description: 'subscription_plans.pro.description',
    icon: 'workspace_premium',
    color: 'accent'
  },
  'premium': {
    title: 'subscription_plans.premium.title',
    description: 'subscription_plans.premium.description',
    icon: 'diamond',
    color: 'accent'
  }
};
