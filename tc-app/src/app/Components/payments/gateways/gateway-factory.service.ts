import { Injectable, Type } from '@angular/core';
import { BaseGatewayComponent } from '../gateways/base-gateway.component';
import { PaypalGatewayComponent } from '../gateways/paypal-gateway.component';
import { StripeGatewayComponent } from '../gateways/stripe-gateway.component';

@Injectable({
  providedIn: 'root'
})
export class GatewayFactoryService {
  
  getGatewayComponent(gatewayCode: string): Type<BaseGatewayComponent> | null {
    const gatewayMap: { [key: string]: Type<BaseGatewayComponent> } = {
      'paypal': PaypalGatewayComponent,
      'stripe': StripeGatewayComponent
    };
    
    return gatewayMap[gatewayCode] || null;
  }
}