import { IUserSubscription } from '../../../common/interfaces/models.interface';
import { ICapsule } from '../../../common/interfaces/models.interface';

export interface ISubscriptionMetrics {
    items_per_capsule: number;
    recipients_per_capsule: number;
    storage_mb: number;
    monthly_emails_sent: number;
    monthly_api_calls: number;
}

export interface ISubscriptionPlan {
    id: number;
    name: string;
    displayName: string;
    description: string;
    durationMonths: number | null;
    limits: ISubscriptionMetrics;
    features: { [key: string]: boolean };
}

export interface ISubscriptionUsageData {
    // ✅ Usa l'intera entity subscription invece dei singoli campi
    subscription: IUserSubscription;
    currentUsage: ISubscriptionMetrics;
    expiresAt: Date | null;    // calculated: startsAt + durationMonths
    isActive: boolean;         // subscription.status === 'active' && (!expiresAt || now() < expiresAt)
    totalUsedStorage: number;  // Total storage used by the user (all capsules)
}