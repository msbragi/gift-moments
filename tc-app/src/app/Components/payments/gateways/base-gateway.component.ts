import { Component, Input } from '@angular/core';
import { PaymentTransaction } from '../payment-dialog.component';

@Component({
  template: '' // Empty template since this is abstract
})
export abstract class BaseGatewayComponent {
  @Input() transaction!: PaymentTransaction;
  @Input() planName!: string;
  @Input() paymentSuccess!: (result: any) => void;
  @Input() paymentCancelled!: () => void;
  @Input() paymentError!: (error: string) => void;

  abstract initializePayment(): Promise<void>;
  abstract cleanup(): void;
}