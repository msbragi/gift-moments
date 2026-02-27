import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Type } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { IEnrichedPlan } from '../../Models/subscription-ui-config.model';
import { ISusbscriptionGateway, SubscriptionsService } from '../../Services/api/subscriptions.service';
import { SnackbarService } from '../../Services/common/snackbar.service';
import { BaseGatewayComponent } from './gateways/base-gateway.component';
import { GatewayFactoryService } from './gateways/gateway-factory.service';

interface PaymentDialogData {
    plan: IEnrichedPlan;
}

export interface PaymentTransaction {
    id: number;
    gatewayTransactionId: string;
    status: string;
    amountCents: number;
    currencyCode: string;
}

@Component({
    selector: 'tc-payment-dialog',
    standalone: true,
    imports: [
        CommonModule,
        NgComponentOutlet,
        TranslocoModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatStepperModule,
        MatProgressBarModule
    ],
    templateUrl: './payment-dialog.component.html',
    styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Dialog steps
    currentStep = 0;
    readonly STEPS = {
        SUMMARY: 0,
        PAYMENT_METHOD: 1,
        CONFIRM: 2,
        PROCESSING: 3
    };

    // Data
    availableGateways: ISusbscriptionGateway[] = [];
    selectedGateway: ISusbscriptionGateway | null = null;
    paymentTransaction: PaymentTransaction | null = null;

    // Dynamic component
    gatewayComponentType: Type<BaseGatewayComponent> | null = null;
    gatewayInputs: any = {};

    // State
    isProcessing = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData,
        private dialogRef: MatDialogRef<PaymentDialogComponent>,
        private subscriptionsService: SubscriptionsService,
        private snackbarService: SnackbarService,
        private gatewayFactory: GatewayFactoryService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            this.loadGateways();
        }, 0);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    nextStep(): void {
        if (this.currentStep < 3) {
            this.currentStep++;
        }
    }

    previousStep(): void {
        if (this.currentStep > 0) {
            this.currentStep--;
        }
    }

    onGatewaySelected(gateway: ISusbscriptionGateway): void {
        this.selectedGateway = gateway;
        this.nextStep();
    }

    onConfirmPayment(): void {
        if (!this.selectedGateway) return;

        this.isProcessing = true;
        this.currentStep = this.STEPS.PROCESSING;

        this.subscriptionsService.createSubscription(this.data.plan.name, this.selectedGateway.code)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.paymentTransaction = data.transaction;
                    this.initializeGatewayComponent();
                }
            });
    }

    private initializeGatewayComponent(): void {
        if (!this.selectedGateway || !this.paymentTransaction) return;

        // Get gateway component type
        const componentType = this.gatewayFactory.getGatewayComponent(this.selectedGateway.code);

        if (!componentType) {
            this.snackbarService.error('Gateway not supported');
            this.previousStep();
            return;
        }

        // Set component and inputs for NgComponentOutlet
        this.gatewayComponentType = componentType;
        this.gatewayInputs = {
            transaction: this.paymentTransaction,
            planName: this.data.plan.name,
            // Bind event handlers
            paymentSuccess: (result: any) => this.onPaymentSuccess(result),
            paymentCancelled: () => this.onPaymentCancelled(),
            paymentError: (error: string) => this.onPaymentError(error)
        };
    }

    private onPaymentSuccess(result: any): void {
        console.log('Payment completed successfully:', result);
        this.snackbarService.success('Payment completed successfully!');
        
        this.dialogRef.close({
            success: true,
            transaction: this.paymentTransaction,
            result
        });
    }

    private onPaymentCancelled(): void {
        this.snackbarService.info('Payment cancelled');
        this.isProcessing = false;
        this.previousStep();
    }

    private onPaymentError(error: string): void {
        console.error('Payment error:', error);
        this.snackbarService.error(`Payment failed: ${error}`);
        this.isProcessing = false;
        this.previousStep();
    }

    close(): void {
        this.dialogRef.close();
    }

    get plan(): IEnrichedPlan {
        return this.data.plan;
    }

    private loadGateways(): void {
        this.subscriptionsService.getPaymentGateways()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (gateways: ISusbscriptionGateway[]) => {
                    this.availableGateways = gateways.map(gateway => ({
                        ...gateway,
                        logo: gateway.logo || this.getGatewayLogo(gateway.code)
                    }));
                }
            });
    }

    private getGatewayLogo(code: string): string {
        const logos: { [key: string]: string } = {
            'paypal': 'assets/img/gateways/paypal.svg',
            'stripe': 'assets/img/gateways/stripe.svg'
        };
        return logos[code] || 'assets/images/default.svg';
    }
}