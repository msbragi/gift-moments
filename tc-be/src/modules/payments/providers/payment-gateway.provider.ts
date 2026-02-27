import { PaymentStatus } from "src/common/interfaces/models.interface";
import { PaymentGateway } from "../entities/payment-gateway.entity";

export interface PaymentProviderProcessArgs {
    transaction: any; // Sostituisci con PaymentTransaction se già definito
    gateway: any;     // Sostituisci con PaymentGateway se già definito
    plan?: any;       // Sostituisci con SubscriptionPlan se già definito
    [key: string]: any;
}

export interface PaymentProviderResult {
    status: PaymentStatus;
    gatewayTransactionId?: string;
    redirectUrl?: string;
    clientSecret?: string;
    [key: string]: any;
}

export interface WebhookResult {
    isValid: boolean;
    gatewayTransactionId?: string;
    status?: PaymentStatus;
    gatewayResponse?: any;
    failureReason?: string;
}

export abstract class PaymentGatewayProvider {
    protected config: PaymentGateway;

    constructor(config: PaymentGateway) {
        this.config = config;
    }

    /**
     * Process a payment for a transaction.
     * Deve essere implementato da ogni provider.
     */
    abstract processPayment(args: PaymentProviderProcessArgs): Promise<PaymentProviderResult>;

    /**
     * Handle a webhook/callback from the gateway.
     * Deve essere implementato da ogni provider.
     */
    abstract handleWebhook(payload: any): Promise<WebhookResult>;

    /**
     * (Opzionale) Validazione di configurazione o setup del provider.
     */
    validateConfig?(gateway: any): void;

}