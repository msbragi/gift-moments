import axios from 'axios';
import { PaymentStatus } from 'src/common/interfaces/models.interface';
import { PaymentGateway } from '../entities/payment-gateway.entity';
import { PaymentGatewayProvider, PaymentProviderProcessArgs, PaymentProviderResult, WebhookResult } from './payment-gateway.provider';

export class PaypalGatewayProvider extends PaymentGatewayProvider {
    constructor(config: PaymentGateway) {
        super(config);
    }

    /**
     * Get PayPal access token using client credentials
     */
    private async getAccessToken(): Promise<string> {
        const clientId = this.config.apiKeyPublic;
        const clientSecret = this.config.apiKeySecret;
        if (!clientId || !clientSecret) {
            throw new Error('PayPal credentials missing');
        }
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await axios.post(
            'https://api-m.sandbox.paypal.com/v1/oauth2/token',
            'grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    }

    /**
     * Process a one-time payment with PayPal
     */
    async processPayment(args: PaymentProviderProcessArgs): Promise<PaymentProviderResult> {
        const { transaction, plan } = args;
        const accessToken = await this.getAccessToken();

        // Create PayPal order
        const orderRes = await axios.post(
            'https://api-m.sandbox.paypal.com/v2/checkout/orders',
            {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: transaction.currencyCode || 'USD',
                            value: (transaction.amountCents / 100).toFixed(2)
                        },
                        description: plan?.displayName || 'Time Capsule Subscription'
                    }
                ],
                application_context: {
                    return_url: this.config.webhookUrl || 'https://yourapp.com/webhooks/paypal/success',
                    cancel_url: this.config.webhookUrl || 'https://yourapp.com/webhooks/paypal/cancel'
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const order = orderRes.data;
        const approveLink = order.links.find((l: any) => l.rel === 'approve')?.href;

        return {
            transactionId: transaction.id,
            gatewayTransactionId: order.id,
            status: PaymentStatus.PENDING,
            redirectUrl: approveLink
        };
    }

    /**
     * Handle PayPal webhook - Implementazione completa
     */
    async handleWebhook(payload: any): Promise<WebhookResult> {
        try {
            // 1. Valida struttura base del webhook
            if (!payload || !payload.event_type || !payload.resource) {
                return {
                    isValid: false,
                    failureReason: 'Invalid webhook payload structure'
                };
            }

            // 2. Valida signature PayPal (per ora semplificata)
            if (!this.validatePayPalWebhookSignature(payload)) {
                return {
                    isValid: false,
                    failureReason: 'Invalid PayPal webhook signature'
                };
            }

            // 3. Gestisci eventi PayPal specifici
            switch (payload.event_type) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    return {
                        isValid: true,
                        gatewayTransactionId: payload.resource.supplementary_data?.related_ids?.order_id || payload.resource.id,
                        status: PaymentStatus.COMPLETED,
                        gatewayResponse: payload
                    };

                case 'PAYMENT.CAPTURE.DENIED':
                case 'PAYMENT.CAPTURE.DECLINED':
                    return {
                        isValid: true,
                        gatewayTransactionId: payload.resource.supplementary_data?.related_ids?.order_id || payload.resource.id,
                        status: PaymentStatus.FAILED,
                        gatewayResponse: payload,
                        failureReason: `Payment ${payload.event_type.toLowerCase()}: ${payload.resource.status_details?.reason || 'Unknown reason'}`
                    };

                case 'PAYMENT.CAPTURE.PENDING':
                    return {
                        isValid: true,
                        gatewayTransactionId: payload.resource.supplementary_data?.related_ids?.order_id || payload.resource.id,
                        status: PaymentStatus.PENDING,
                        gatewayResponse: payload
                    };

                case 'CHECKOUT.ORDER.APPROVED':
                    // Order approvato ma non ancora captured - mantieni pending
                    return {
                        isValid: true,
                        gatewayTransactionId: payload.resource.id,
                        status: PaymentStatus.PENDING,
                        gatewayResponse: payload
                    };

                case 'CHECKOUT.ORDER.CANCELLED':
                    return {
                        isValid: true,
                        gatewayTransactionId: payload.resource.id,
                        status: PaymentStatus.FAILED,
                        gatewayResponse: payload,
                        failureReason: 'Payment cancelled by user'
                    };

                default:
                    // Evento PayPal valido ma non gestito - ignora senza errori
                    return {
                        isValid: true,
                        // Nessun gatewayTransactionId significa che verrà ignorato
                    };
            }

        } catch (error) {
            return {
                isValid: false,
                failureReason: `PayPal webhook processing error: ${error.message}`
            };
        }
    }

    /**
     * Validate PayPal webhook signature
     * TODO: Implementare validazione completa secondo documentazione PayPal
     */
    private validatePayPalWebhookSignature(payload: any): boolean {
        // Per ora return true per testing
        // In produzione dovrai implementare la validazione completa:
        // 1. Verificare PAYPAL-TRANSMISSION-ID header
        // 2. Verificare PAYPAL-CERT-ID header  
        // 3. Validare signature con certificato PayPal
        // 4. Verificare timestamp per evitare replay attacks
        
        // Documentazione: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
        
        return true;
    }

    /**
     * Validate PayPal config
     */
    validateConfig(gateway: any): void {
        if (!gateway.apiKeyPublic || !gateway.apiKeySecret) {
            throw new Error('PayPal credentials missing');
        }
    }
}