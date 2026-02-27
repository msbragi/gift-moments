-- Insert sample payment gateways for testing
INSERT INTO payment_gateways (gateway_code, gateway_name, is_active, api_key_public, api_key_secret, webhook_secret, webhook_url) VALUES
('stripe', 'Stripe Payment Gateway', 1, 'pk_test_sample_key', 'sk_test_sample_secret', 'whsec_sample_webhook_secret', 'https://yourapp.com/webhooks/stripe'),
('paypal', 'PayPal Payment Gateway', 1, NULL, 'paypal_client_secret', 'paypal_webhook_secret', 'https://yourapp.com/webhooks/paypal'),
('square', 'Square Payment Gateway', 0, 'square_app_id', 'square_access_token', NULL, 'https://yourapp.com/webhooks/square');
