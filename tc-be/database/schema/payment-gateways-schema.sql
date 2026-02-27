-- Multi-Gateway Payment System Schema
-- This schema supports multiple payment providers with country/region availability

-- Payment Gateways Master Table
CREATE TABLE payment_gateways (
    id SERIAL PRIMARY KEY,
    gateway_code VARCHAR(50) UNIQUE NOT NULL, -- 'stripe', 'paypal', 'razorpay', 'mercadopago', etc.
    gateway_name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    website_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    supports_subscriptions BOOLEAN DEFAULT true,
    supports_one_time BOOLEAN DEFAULT true,
    supports_refunds BOOLEAN DEFAULT true,
    min_amount_cents INTEGER DEFAULT 50, -- Minimum transaction amount in cents
    max_amount_cents INTEGER DEFAULT NULL, -- Maximum transaction amount (NULL = no limit)
    processing_fee_percentage DECIMAL(5,4) DEFAULT 0.0290, -- e.g., 2.9%
    processing_fee_fixed_cents INTEGER DEFAULT 30, -- e.g., $0.30
    settlement_time_days INTEGER DEFAULT 2, -- How long to receive funds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Gateway Configuration (API keys, endpoints, etc.)
CREATE TABLE payment_gateway_configs (
    id SERIAL PRIMARY KEY,
    gateway_id INTEGER NOT NULL REFERENCES payment_gateways(id) ON DELETE CASCADE,
    environment ENUM('sandbox', 'production') NOT NULL DEFAULT 'sandbox',
    api_key_public VARCHAR(255), -- Publishable key for frontend
    api_key_secret VARCHAR(500), -- Secret key (encrypted)
    webhook_secret VARCHAR(255), -- Webhook signing secret
    api_endpoint VARCHAR(255), -- Custom API endpoint if needed
    additional_config TEXT, -- Any gateway-specific configuration
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_gateway_env (gateway_id, environment)
);

-- Countries and Regions
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) UNIQUE NOT NULL, -- ISO 3166-1 alpha-2 (US, GB, IN, etc.)
    country_name VARCHAR(100) NOT NULL,
    region VARCHAR(50), -- 'North America', 'Europe', 'Asia', etc.
    currency_code CHAR(3) NOT NULL, -- ISO 4217 (USD, EUR, INR, etc.)
    is_active BOOLEAN DEFAULT true
);

-- Gateway Country Availability
CREATE TABLE payment_gateway_countries (
    id SERIAL PRIMARY KEY,
    gateway_id INTEGER NOT NULL REFERENCES payment_gateways(id) ON DELETE CASCADE,
    country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Lower number = higher priority for that country
    local_name VARCHAR(100), -- Localized gateway name
    local_processing_fee_percentage DECIMAL(5,4), -- Country-specific fees if different
    local_processing_fee_fixed_cents INTEGER,
    additional_info TEXT, -- Country-specific information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_gateway_country (gateway_id, country_id)
);

-- User Payment Preferences
CREATE TABLE user_payment_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_gateway_id INTEGER REFERENCES payment_gateways(id) ON DELETE SET NULL,
    country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    currency_preference CHAR(3), -- Preferred currency if different from country default
    auto_detect_location BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_preference (user_id)
);

-- Payment Transactions Log
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gateway_id INTEGER NOT NULL REFERENCES payment_gateways(id),
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    transaction_type ENUM('subscription', 'one_time', 'refund') NOT NULL,
    gateway_transaction_id VARCHAR(255), -- External transaction ID
    amount_cents INTEGER NOT NULL,
    currency_code CHAR(3) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    gateway_fee_cents INTEGER DEFAULT 0,
    net_amount_cents INTEGER, -- Amount after gateway fees
    failure_reason TEXT,
    gateway_response TEXT, -- Full gateway response for debugging
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_transactions (user_id, created_at),
    INDEX idx_gateway_transactions (gateway_id, status),
    INDEX idx_subscription_transactions (subscription_id)
);

-- Insert default payment gateways
INSERT INTO payment_gateways (gateway_code, gateway_name, description, logo_url, website_url, supports_subscriptions, supports_one_time, processing_fee_percentage, processing_fee_fixed_cents) VALUES
('stripe', 'Stripe', 'Global payment platform with excellent developer experience', '/assets/img/gateways/stripe.png', 'https://stripe.com', true, true, 0.0290, 30),
('paypal', 'PayPal', 'Widely recognized payment service available globally', '/assets/img/gateways/paypal.png', 'https://paypal.com', true, true, 0.0349, 0),
('razorpay', 'Razorpay', 'Leading payment gateway for India and Southeast Asia', '/assets/img/gateways/razorpay.png', 'https://razorpay.com', true, true, 0.0200, 0),
('mercadopago', 'Mercado Pago', 'Popular payment solution for Latin America', '/assets/img/gateways/mercadopago.png', 'https://mercadopago.com', true, true, 0.0399, 0),
('square', 'Square', 'Payment processing for US and Canada', '/assets/img/gateways/square.png', 'https://squareup.com', false, true, 0.0290, 30),
('adyen', 'Adyen', 'Global payment platform for enterprises', '/assets/img/gateways/adyen.png', 'https://adyen.com', true, true, 0.0280, 0);

-- Insert sample countries (you would populate this with all countries)
INSERT INTO countries (country_code, country_name, region, currency_code) VALUES
('US', 'United States', 'North America', 'USD'),
('CA', 'Canada', 'North America', 'CAD'),
('GB', 'United Kingdom', 'Europe', 'GBP'),
('DE', 'Germany', 'Europe', 'EUR'),
('FR', 'France', 'Europe', 'EUR'),
('IN', 'India', 'Asia', 'INR'),
('BR', 'Brazil', 'South America', 'BRL'),
('MX', 'Mexico', 'North America', 'MXN'),
('AU', 'Australia', 'Oceania', 'AUD'),
('JP', 'Japan', 'Asia', 'JPY');

-- Insert gateway availability by country (sample data)
INSERT INTO payment_gateway_countries (gateway_id, country_id, priority) VALUES
-- Stripe availability (most countries)
(1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 5, 1), (1, 9, 1), (1, 10, 1),
-- PayPal availability (global)
(2, 1, 2), (2, 2, 2), (2, 3, 2), (2, 4, 2), (2, 5, 2), (2, 6, 1), (2, 7, 1), (2, 8, 1), (2, 9, 2), (2, 10, 2),
-- Razorpay (India focused)
(3, 6, 1),
-- Mercado Pago (Latin America)
(4, 7, 1), (4, 8, 1),
-- Square (US/Canada)
(5, 1, 3), (5, 2, 3),
-- Adyen (Global enterprise)
(6, 1, 4), (6, 2, 4), (6, 3, 4), (6, 4, 4), (6, 5, 4), (6, 6, 2), (6, 9, 3), (6, 10, 3);
