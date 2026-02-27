import { PaymentStatus } from "src/common/interfaces/models.interface";
import { PaymentGateway } from "../entities/payment-gateway.entity";
import { PaymentGatewayProvider, PaymentProviderProcessArgs, PaymentProviderResult, WebhookResult } from "./payment-gateway.provider";

export class FreeGatewayProvider extends PaymentGatewayProvider {
    constructor(config: PaymentGateway) {
        super(config);
    }

    /**
      * Simula il completamento immediato di un pagamento free.
      */
    async processPayment(args: PaymentProviderProcessArgs): Promise<PaymentProviderResult> {
        // Nessuna chiamata esterna, nessuna validazione necessaria
        return {
            status: PaymentStatus.COMPLETED,
            gatewayTransactionId: 'FREE-' + (args.transaction?.id ?? Date.now()),
        };
    }

    /**
     * Il provider FREE non gestisce webhook, ma il metodo è richiesto dall'abstract.
     */
    async handleWebhook(payload: any): Promise<WebhookResult> {
        // Nessuna azione necessaria per il gateway FREE
        return {
            isValid: true,
            status: PaymentStatus.COMPLETED,
        };
    }

    /**
     * (Opzionale) Validazione di configurazione per il gateway FREE.
     */
    validateConfig(gateway: any): void {
        // Nessuna configurazione richiesta per il gateway FREE
    }

}