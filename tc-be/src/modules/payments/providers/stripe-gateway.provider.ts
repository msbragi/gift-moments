import { PaymentGatewayProvider, PaymentProviderProcessArgs, PaymentProviderResult, WebhookResult } from './payment-gateway.provider';
import { PaymentGateway } from '../entities/payment-gateway.entity';
import { PaymentStatus } from 'src/common/interfaces/models.interface';

export class StripeGatewayProvider extends PaymentGatewayProvider {
    /**
     * Process Stripe payment
     */
    constructor(config: PaymentGateway) {
        super(config);
    }

    async processPayment(args: PaymentProviderProcessArgs): Promise<PaymentProviderResult> {
        const { transaction } = args;
        // Qui andrà l'integrazione reale con Stripe (API call, ecc.)
        // Per ora mock:
        return {
            transactionId: transaction.id,
            gatewayTransactionId: `stripe_${Date.now()}`,
            status: PaymentStatus.COMPLETED,
            clientSecret: 'pi_mock_client_secret'
        };
    }

    async handleWebhook(payload: any): Promise<WebhookResult> {
        return {
            isValid: true,
        }
    }

    validateConfig(gateway: any): void {
        // Eventuale validazione config Stripe
    }
}