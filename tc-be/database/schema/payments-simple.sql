-- Simple Payment System Schema (Way #1)
-- Minimal architecture: 2 tables + 1 service

-- Payment Gateway Configuration
CREATE TABLE payment_gateways (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gateway_code VARCHAR(20) UNIQUE NOT NULL, -- 'stripe', 'paypal'
    gateway_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    api_key_public VARCHAR(255),
    api_key_secret VARCHAR(500), -- Encrypted
    webhook_secret VARCHAR(255),
    webhook_url VARCHAR(255),
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payment Transactions
CREATE TABLE payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subscription_plan_id INT NOT NULL,
    gateway_code VARCHAR(20) NOT NULL, -- Direct reference to avoid joins
    gateway_transaction_id VARCHAR(255), -- External transaction ID
    amount_cents INT NOT NULL,
    currency_code CHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    failure_reason TEXT NULL,
    gateway_response TEXT NULL, -- JSON response for debugging
    processed_at TIMESTAMP NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_transactions (user_id, created),
    INDEX idx_gateway_status (gateway_code, status),
    INDEX idx_subscription_plan (subscription_plan_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);

-- Insert default gateways (start with just Stripe)
INSERT INTO payment_gateways (gateway_code, gateway_name, is_active, webhook_url) VALUES
('stripe', 'Stripe', true, '/api/payments/webhooks/stripe'),
('paypal', 'PayPal', false, '/api/payments/webhooks/paypal'); -- Disabled by default
