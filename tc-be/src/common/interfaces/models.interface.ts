export enum SubscriptionHistoryAction {
    PURCHASE = 'purchase',
    UPGRADE = 'upgrade',
    RENEW = 'renew',
    CANCEL = 'cancel'
}

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export interface IBase {
    id?: number | null;
    created?: Date;
    updated?: Date;
    deleted?: Date;
}

export interface IAuth {
    googleToken?: string;
    email?: string;
    password?: string;
}

export interface IUser extends IBase {
    email: string;
    password?: string;
    fullName?: string,
    isFromGoogle?: boolean,
    avatar?: string,
    isVerified?: boolean | number,
    verifyToken?: string,
    pwdResetToken?: string,
    pwdResetExpires?: Date,
    role?: 'super_user' | 'admin' | null;
    disabled?: boolean;
    capsules?: ICapsule[];
}

export interface ILibraryItem extends IBase {
    userId: number;
    contentId: number | null;
    url?: string | null;
    contentType?: string;
    size: number | null;
    name: string;
    user?: IUser;
}

export interface IItem extends IBase {
    capsuleId: number;
    contentType: string;
    contentId: number | null;
    data?: any;
    url?: string | null;
    size?: number | null;
    capsule?: ICapsule;
}

export interface ICapsule extends IBase {
    userId: number;
    name: string;
    description: string;
    openDate?: Date;
    isOpen?: boolean;
    isPublic?: boolean;
    isPhysical?: boolean;
    lat?: string;
    lng?: string;
    itemsCount?: number;
    recipientsCount?: number;
    user?: IUser
}

export interface IRecipient extends IBase {
    capsuleId: number;
    userId?: number;
    fullName?: string;
    openedAt?: Date;
    hasOpened?: boolean; // Virtual field computed from openedAt
    email: string;
    capsule?: ICapsule;
}

export interface IRecipientNotification extends IBase {
    recipientId: number;
    capsuleId: number;
    type: 'initial' | 'reminder' | 'custom';
    status: 'sent' | 'failed' | 'pending';
    sentAt: Date;
    scheduledFor?: Date | null;
    errorMessage?: string | null;
    recipient?: IRecipient; // <-- relation
    capsule?: ICapsule;     // <-- relation
}

export interface ISubscriptionPlan extends IBase {
    name: string;
    displayName: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    priceOnetime: number;
    durationMonths: number;
    limitsConfig: string; // JSON string
    featuresConfig?: string; // JSON string
    isActive: boolean;
    sortOrder: number;
}

export interface IPaymentGateway extends IBase {    
    gatewayCode: string; // e.g. 'stripe', 'paypal'
    gatewayName: string;
    isActive: boolean;
    apiKeyPublic?: string; // Public API key
    apiKeySecret?: string; // Secret API key (encrypted)
    webhookSecret?: string; // Webhook secret
    webhookUrl?: string; // Webhook URL 
}

export interface IPaymentTransaction {
    id?: number;
    userId: number;
    subscriptionPlanId: number;
    gatewayCode: string; // e.g. 'stripe', 'paypal'
    gatewayTransactionId?: string | null;
    amountCents: number; // Amount in cents to avoid floating point issues
    currencyCode?: string; // e.g. 'USD'
    status: PaymentStatus;
    failureReason?: string | null; // Reason for failure if status is 'failed'
    gatewayResponse?: string | null; // Raw response from the payment gateway
    processedAt?: Date | null; // Timestamp when the transaction was processed
    created: Date; // Timestamp when the transaction was created
    updated: Date; // Timestamp when the transaction was last updated
}

export interface ISubscriptionHistory {
    id?: number;
    userId: number;
    subscriptionId: number;
    capsuleId?: number | null; // <-- new field
    action: SubscriptionHistoryAction;
    fromPlanId?: number | null;
    toPlanId?: number | null;
    reason?: string;
    amount: number;
    created: Date;
}

export interface IUserSubscription extends IBase {
    userId: number;
    planId: number;
    capsuleId: number;
    status: 'active' | 'expired' | 'cancelled';
    startsAt: Date;
    expiresAt?: Date | null;
    cancelledAt?: Date | null;
    transactionId?: number | null;
    transactionCustomerId?: string | null;
    paymentMethod: string; // e.g. 'free', 'stripe', 'paypal'
    billingCycle: string;  // e.g. 'monthly', 'yearly', 'onetime'
    amountPaid: number;
    currency: string;      // e.g. 'USD'
}