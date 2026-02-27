// Simple interfaces matching our clean entities

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface IPaymentGateway {
  id: number;
  gatewayCode: string;
  gatewayName: string;
  isActive?: boolean;
  apiKeyPublic?: string;
  apiKeySecret?: string;
  webhookSecret?: string;
  webhookUrl?: string;
  logo?: string;
  created: Date;
  updated: Date;
}

export interface IPaymentTransaction {
  id: number;
  userId: number;
  subscriptionPlanId: number;
  gatewayCode: string;
  gatewayTransactionId?: string;
  amountCents: number;
  currencyCode: string;
  status: PaymentStatus;
  failureReason?: string;
  gatewayResponse?: string;
  processedAt?: Date;
  created: Date;
  updated: Date;
}

export interface CreateGatewayDto {
  gatewayCode: string;
  gatewayName: string;
  isActive?: boolean;
  apiKeyPublic?: string;
  apiKeySecret?: string;
  webhookSecret?: string;
  webhookUrl?: string;
}

export interface UpdateGatewayDto {
  gatewayCode?: string;
  gatewayName?: string;
  isActive?: boolean;
  apiKeyPublic?: string;
  apiKeySecret?: string;
  webhookSecret?: string;
  webhookUrl?: string;
}

export interface PaymentGatewayStats {
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  totalRevenueCents: number;
}