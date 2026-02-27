import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseGatewayComponent } from './base-gateway.component';
import { TranslocoModule } from '@jsverse/transloco';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'tc-paypal-gateway',
  standalone: true,
  imports: [CommonModule, TranslocoModule, MatProgressBarModule],
  template: `
    <div class="paypal-gateway">
      @if (isLoading) {
        <div class="loading-state">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>{{ 'payments.loading_paypal' | transloco }}</p>
        </div>
      } @else {
        <p class="payment-instruction">{{ 'payments.complete_paypal_instruction' | transloco }}</p>
      }
    </div>
  `,
  styles: [`
    .paypal-gateway {
      text-align: center;
      padding: 24px;
    }

    .loading-state {
      margin: 24px 0;
      
      p {
        margin-top: 16px;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .payment-instruction {
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 16px;
    }

    ::ng-deep .dynamic-paypal-container {
      margin: 24px auto;
      min-height: 50px;
      max-width: 300px;
    }
  `]
})
export class PaypalGatewayComponent extends BaseGatewayComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = true;
  private isSDKLoaded = false;
  private paypalContainer: HTMLElement | null = null;
  private containerId: string;

  private readonly PAYPAL_CLIENT_ID = 'AVF3kGOau2anrcCTK1NlKhBbi5gfKrV5slT4xoUCCStK8QRntnWyiJciXHHzb_SUV0VZmwH9MrsSZLX2';
  private readonly PAYPAL_SDK_URL = `https://www.paypal.com/sdk/js?client-id=${this.PAYPAL_CLIENT_ID}&currency=USD`;

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {
    super();
    this.containerId = `paypal-button-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit() {
    // Component initialized
  }

  async ngAfterViewInit() {
    await this.initializePayment();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  async initializePayment(): Promise<void> {
    try {
      await this.loadPayPalSDK();
      this.createPayPalContainer();
      await this.renderPayPalButton();
      
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.isLoading = false;
      this.cdr.detectChanges();
      this.paymentError('Failed to initialize PayPal payment');
    }
  }

  private createPayPalContainer(): void {
    const componentRoot = this.elementRef.nativeElement.querySelector('.paypal-gateway');
    
    if (!componentRoot) {
      throw new Error('Component root not found');
    }

    this.paypalContainer = document.createElement('div');
    this.paypalContainer.id = this.containerId;
    this.paypalContainer.className = 'dynamic-paypal-container';
    
    const instructionElement = componentRoot.querySelector('.payment-instruction');
    
    if (instructionElement) {
      componentRoot.insertBefore(this.paypalContainer, instructionElement);
    } else {
      componentRoot.appendChild(this.paypalContainer);
    }
  }

  private loadPayPalSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isSDKLoaded || (window as any).paypal) {
        this.isSDKLoaded = true;
        resolve();
        return;
      }

      const existingScript = document.getElementById('paypal-sdk');
      if (existingScript) {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkPayPal = () => {
          attempts++;
          if ((window as any).paypal) {
            this.isSDKLoaded = true;
            resolve();
          } else if (attempts >= maxAttempts) {
            reject(new Error('Timeout waiting for PayPal SDK'));
          } else {
            setTimeout(checkPayPal, 100);
          }
        };
        checkPayPal();
        return;
      }

      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = this.PAYPAL_SDK_URL;
      script.async = true;
      
      script.onload = () => {
        if ((window as any).paypal) {
          this.isSDKLoaded = true;
          resolve();
        } else {
          reject(new Error('PayPal object not available after script load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load PayPal SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  private renderPayPalButton(): Promise<void> {
    return new Promise((resolve, reject) => {
      const paypal = (window as any).paypal;
      
      if (!paypal) {
        reject(new Error('PayPal SDK not available'));
        return;
      }

      if (!this.paypalContainer) {
        reject(new Error('PayPal container not created'));
        return;
      }

      try {
        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'paypal',
            height: 40
          },
          
          createOrder: () => {
            return Promise.resolve(this.transaction.gatewayTransactionId);
          },
          
          onApprove: async (data: any) => {
            this.paymentSuccess({
              orderId: data.orderID,
              payerId: data.payerID,
              transactionId: this.transaction.id
            });
          },
          
          onCancel: (data: any) => {
            this.paymentCancelled();
          },
          
          onError: (err: any) => {
            this.paymentError('PayPal payment failed');
          }
          
        }).render(`#${this.containerId}`)
        .then(() => {
          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  cleanup(): void {
    if (this.paypalContainer) {
      this.paypalContainer.remove();
      this.paypalContainer = null;
    }
  }
}