import { ICapsule, ISubscriptionHistory, IUserSubscription, SubscriptionHistoryAction } from 'src/common/interfaces/models.interface';
import { Capsule } from 'src/modules/capsules/entities/capsule.entity';
import { CreatePaymentRequest } from 'src/modules/payments/services/payment.service';
import { PaymentTransaction } from '../../payments/entities/payment-transaction.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { UserSubscription } from '../entities/user-subscription.entity';
import { ISubscriptionMetrics, ISubscriptionUsageData } from '../interfaces/subscription-metrics.interface';

export class SubscriptionDataHelper {
    /**
     * Creates a free capsule for a user
     */

    static STORAGE_MARGIN = 0.05; // 5% overflow margin

    static createCapsuleData(userId: number, plan: SubscriptionPlan): ICapsule {
        // calc a date for the capsule to be opened in 1 year
        const startDate = new Date();
        const openDate = new Date(startDate);
        openDate.setFullYear(openDate.getFullYear() + 1); // Set to 1 year in the future

        const name = `New ${plan.displayName} capsule`;
        const description = `This is your just created ${plan.displayName} capsule. Enjoy!`;

        const capsuleData: ICapsule = {
            userId: userId,
            name: name,
            description: description,
            isPublic: false, // Not public
            isPhysical: false, // Not physical
            isOpen: false, // Set to true to allow immediate access
            openDate: openDate, // Set to now or a specific date if needed
        };
        return capsuleData;
    }

    static createUserSubscriptionData(capsule: Capsule, transaction: PaymentTransaction): IUserSubscription {
        // Usa solo i campi previsti da IUserSubscription
        const userSubscriptionData: IUserSubscription = {
            userId: transaction.userId,
            planId: transaction.subscriptionPlanId,
            capsuleId: capsule.id,
            status: 'active',
            startsAt: new Date(),
            expiresAt: null,
            cancelledAt: null,
            transactionId: transaction.id,
            paymentMethod: transaction.gatewayCode,
            // Must investigate on this field
            transactionCustomerId: transaction.gatewayResponse || capsule.userId.toString(),
            billingCycle: 'onetime',
            amountPaid: transaction.amountCents ? transaction.amountCents / 100 : 0,
            currency: transaction.currencyCode || 'USD',
        };
        return userSubscriptionData;
    }

    static createSubscriptionHistoryData(
        capsule: Capsule,
        transaction: PaymentTransaction,
        userSubscriptionId: number): ISubscriptionHistory {
        const subscriptionHistoryData: ISubscriptionHistory = {
            userId: capsule.userId,
            subscriptionId: userSubscriptionId,
            capsuleId: capsule.id,
            action: SubscriptionHistoryAction.PURCHASE,
            fromPlanId: null,
            toPlanId: transaction.subscriptionPlanId,
            reason: 'Capsule purchased',
            amount: transaction.amountCents ? transaction.amountCents / 100 : 0,
            created: new Date(),
        };
        return subscriptionHistoryData;
    }

    static createPaymentRequest(userId: number, planId: number, code: string = 'FREE', amount: number = 0, currency: string = 'USD') {
        return {
            userId: userId,
            gatewayCode: code,
            subscriptionPlanId: planId,
            amountCents: amount,
            currencyCode: currency
        } as CreatePaymentRequest;

    }

    /**
     * Get empty usage response structure
     */
    static createEmptyUsageResponse(): ISubscriptionMetrics {
        return {
            items_per_capsule: 0,
            recipients_per_capsule: 0,
            storage_mb: 0,
            monthly_emails_sent: 0,
            monthly_api_calls: 0,
        };
    }

    static bytesToMegabytes(bytes: number): number {
        return Math.round((bytes / (1024 * 1024)) * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Calculate usage metrics from already loaded capsule data (no queries needed)
     */
    static calcUsageData(subscription: UserSubscription): ISubscriptionMetrics {
        try {
            // Use loaded relations to calculate usage
            const capsule = subscription.capsule;
            const totalItems = capsule.itemsCount || capsule.items?.length || 0;
            const totalRecipients = capsule.recipientsCount || capsule.recipients?.length || 0;

            // Calculate storage from items if available
            let storageUsedMB = 0;
            if (capsule.items && Array.isArray(capsule.items)) {
                const totalBytes = capsule.items.reduce((sum: number, item: any) => {
                    return sum + (item.size || 0);
                }, 0);
                storageUsedMB = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
            }

            return {
                items_per_capsule: totalItems,
                recipients_per_capsule: totalRecipients,
                storage_mb: storageUsedMB,
                monthly_emails_sent: 0, // TODO: implement from usage tracking
                monthly_api_calls: 0,   // TODO: implement from usage tracking
            };
        } catch (error) {
            console.error('Error calculating usage from loaded data:', error);
            return this.createEmptyUsageResponse();
        }
    }

    /**
     * Calculate subscription expiration date
     */
    static calculateSubscriptionExpiration(subscription: UserSubscription): Date | null {
        if (!subscription.subscriptionPlan?.durationMonths) {
            return null;
        }

        const expiresAt = new Date(subscription.startsAt);
        expiresAt.setMonth(expiresAt.getMonth() + subscription.subscriptionPlan.durationMonths);
        return expiresAt;
    }

    static isExpired(subscription: UserSubscription): boolean {
        if(subscription.status !== 'active') {
            return true; 
        }
        const expiresAt = this.calculateSubscriptionExpiration(subscription);
        if (!expiresAt) {
            return false; // No expiration date means it's not expired
        }
        return new Date() > expiresAt;
    }

    /**
     * Parse limits configuration from plan
     */
    static parseLimitsConfig(subscription: UserSubscription): any {
        const limits = subscription.subscriptionPlan.getLimits();
        return limits;
    }

    /**
     * Parse features configuration from plan
     */
    static parseFeaturesConfig(subscription: UserSubscription): any {
        const features = subscription.subscriptionPlan.getFeatures();
        return features;
    }

    static calculateUsage(userSubscriptions: UserSubscription[], totalStorageBytes: number) {
        // 3. Build usage data for each subscription
        const subscriptionUsageData: ISubscriptionUsageData[] = [];
        // Convert bytes to MB with 2 decimal precision
        const totalStorageUsed = Math.round((totalStorageBytes / (1024 * 1024)) * 100) / 100;

        for (const subscription of userSubscriptions) {
            if (!subscription.subscriptionPlan || !subscription.capsule) {
                console.warn(`Incomplete subscription data for subscription ID: ${subscription.id}`);
                continue;
            }

            const currentUsage = this.calcUsageData(subscription);

            const expiresAt = this.calculateSubscriptionExpiration(subscription);
            const limits = this.parseLimitsConfig(subscription);
            const features = this.parseFeaturesConfig(subscription);

            // Pulisci i dati non necessari dalla subscription
            const { items, recipients, user, ...cleanCapsule } = subscription.capsule;
            const { limitsConfig, featuresConfig, ...cleanPlan } = subscription.subscriptionPlan;

            const cleanSubscription = {
                ...subscription,
                capsule: cleanCapsule,
                subscriptionPlan: {
                    ...cleanPlan,
                    limits: this.parseLimitsConfig(subscription),
                    features: this.parseFeaturesConfig(subscription)
                }
            };

            const usageData: ISubscriptionUsageData = {
                subscription: cleanSubscription, // ✅ Solo questo campo
                currentUsage: this.calcUsageData(subscription),
                expiresAt: this.calculateSubscriptionExpiration(subscription),
                isActive: subscription.status === 'active' && (!this.calculateSubscriptionExpiration(subscription) || new Date() < this.calculateSubscriptionExpiration(subscription)),
                totalUsedStorage: totalStorageUsed
            };

            subscriptionUsageData.push(usageData);
        }
        return subscriptionUsageData;
    }

    // ----------------------------------------------------
    // Validate functions
    // ----------------------------------------------------

    /**
     * Sum all subscription usage data
     * This function is used to calculate the total usage across all user subscriptions.
     * You must pass the correct user subscriptions loaded with plan relations and capsule if needed.
     * @param userSubscriptions
     * @returns 
     */
    static sumAllSubscriptionUsage(userSubscriptions: UserSubscription[]): ISubscriptionMetrics {
        const usage: ISubscriptionMetrics = this.createEmptyUsageResponse();        
        for (const subscription of userSubscriptions) {
            // Always calculate usage from loaded data
            const currentUsage = this.calcUsageData(subscription);
            usage.items_per_capsule += currentUsage.items_per_capsule;
            usage.storage_mb += currentUsage.storage_mb;
            usage.recipients_per_capsule += currentUsage.recipients_per_capsule;
        }
        return usage;
    }        

    /**
     * Sum all limits purchased 
     * This function is used to calculate the total limits across all user subscriptions.
     * You must pass the correct user subscriptions loaded with plan relations and capsule if needed.
     * @param userSubscriptions
     * @returns 
     */
    static sumAllSubscriptionLimits(userSubscriptions: UserSubscription[]): ISubscriptionMetrics {
        const limit: ISubscriptionMetrics = this.createEmptyUsageResponse();
        for (const subscription of userSubscriptions) {
            // Add credit only if the subscription is active and not expired
            if(this.isExpired(subscription)) {
                continue; // Skip expired subscriptions
            }
            const planLimits = subscription.subscriptionPlan.getLimits();
            limit.items_per_capsule += planLimits.items_per_capsule || 0;
            limit.storage_mb += planLimits.storage_mb || 0;
            limit.recipients_per_capsule += planLimits.recipients_per_capsule;
        }
        return limit;
    }

    /**
     * Validate if adding a new item is allowed based on user subscriptions
     * @param userSubscriptions 
     * @param itemSize 
     * @returns 
     */
    static validateAddItem(
        userSubscriptions: UserSubscription[],
        itemSize: number
    ): boolean {
        const usage = this.sumAllSubscriptionUsage(userSubscriptions);
        const limit = this.sumAllSubscriptionLimits(userSubscriptions);

        usage.items_per_capsule += 1; // Include the new item
        usage.storage_mb += this.bytesToMegabytes(itemSize);
        return (
            usage.items_per_capsule <= limit.items_per_capsule &&
            usage.storage_mb <= limit.storage_mb * (1 + this.STORAGE_MARGIN)
        );
    }

    static validateAddRecipient(userSubscriptions: UserSubscription[]): boolean {
        const usage = this.sumAllSubscriptionUsage(userSubscriptions);
        const limit = this.sumAllSubscriptionLimits(userSubscriptions);
        return (usage.recipients_per_capsule + 1) <= limit.recipients_per_capsule;
    }

    static validateStorageLimit(userSubscriptions: UserSubscription[], totalStorageUsedBytes: number, size: number): boolean | PromiseLike<boolean> {
        const limit = this.sumAllSubscriptionLimits(userSubscriptions);
        const totalStorageUsedMB = this.bytesToMegabytes(totalStorageUsedBytes);
        const sizeMB = this.bytesToMegabytes(size);
        return (totalStorageUsedMB + sizeMB) <= limit.storage_mb * (1 + this.STORAGE_MARGIN);
    }

}