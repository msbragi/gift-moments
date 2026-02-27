-- Simplified Payment System Schema (Way #1)
-- Minimal architecture with only essential tables

-- Payment Gateway Configuration
CREATE TABLE payment_gateways (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'stripe', 'paypal'
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    supports_subscriptions BOOLEAN DEFAULT true,
    
    -- Configuration (encrypted in production)
    api_key_public VARCHAR(255),
    api_key_secret VARCHAR(500),
    webhook_secret VARCHAR(255),
    environment ENUM('sandbox', 'production') DEFAULT 'sandbox',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payment Transactions (All transaction history)
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    
    -- Gateway info
    gateway_name VARCHAR(50) NOT NULL, -- 'stripe', 'paypal'
    gateway_transaction_id VARCHAR(255), -- External transaction ID
    
    -- Transaction details
    amount_cents INTEGER NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    
    -- Additional info
    failure_reason TEXT,
    gateway_response TEXT, -- JSON response for debugging
    processed_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_user_transactions (user_id, created_at),
    INDEX idx_gateway_transactions (gateway_name, status),
    INDEX idx_subscription_transactions (subscription_plan_id)
);

-- Insert default gateway configurations
INSERT INTO payment_gateways (name, display_name, supports_subscriptions) VALUES
('stripe', 'Stripe', true),
('paypal', 'PayPal', true);
