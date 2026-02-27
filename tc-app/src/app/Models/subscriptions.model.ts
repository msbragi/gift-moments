import { ICapsule } from "./models.interface";

export interface IUsageResponse {
    subscription: ISubscription;
    currentUsage: ICurrentUsage;
    expiresAt: Date;
    isActive: boolean;
    totalUsedStorage: number;
}

export interface ICurrentUsage {
    items_per_capsule:      number;
    recipients_per_capsule: number;
    storage_mb:             number;
    monthly_emails_sent:    number;
    monthly_api_calls:      number;
}

export interface ISubscription {
    id: number;
    created: Date;
    updated: Date;
    deleted: null;
    userId: number;
    planId: number;
    capsuleId: number;
    status: string;
    startsAt: Date;
    expiresAt: null;
    cancelledAt: null;
    transactionId: string;
    transactionCustomerId: string;
    paymentMethod: string;
    billingCycle: string;
    amountPaid: string;
    currency: string;
    subscriptionPlan: ISubscriptionPlan;
    capsule: ICapsule;
}

export interface ISubscriptionPlan {
    id: number;
    created: Date;
    updated: Date;
    deleted: null;
    name: string;
    displayName: string;
    description: string;
    priceMonthly: string;
    priceYearly: string;
    priceOnetime: string;
    durationMonths: number;
    isActive: boolean;
    sortOrder: number;
    limits: ILimits;
    features: IFeatures;
}

export interface IFeatures {
    analytics:        boolean;
    auto_backup:      boolean;
    priority_support: boolean;
}

export interface ILimits {
    capsules:                number;
    items_per_capsule:       number;
    recipients_per_capsule:  number;
    storage_mb:              number;
    capsule_expiration_days: number;
}
