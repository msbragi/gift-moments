-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Giu 21, 2025 alle 15:31
-- Versione del server: 10.1.37-MariaDB
-- Versione PHP: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

--
-- Database: `tc_data`
--
-- --------------------------------------------------------

USE `tc_data`;

--
-- Struttura della tabella `capsules`
--

CREATE TABLE `capsules` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `open_date` datetime NOT NULL,
  `is_public` tinyint(1) DEFAULT NULL,
  `is_open` tinyint(1) DEFAULT NULL,
  `is_physical` tinyint(1) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `lng` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `capsule_id` int(11) NOT NULL,
  `content_id` int(11) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `size` int(11) DEFAULT NULL,
  `content_type` varchar(255) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `library_items`
--

CREATE TABLE `library_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_id` int(11) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `content_type` varchar(255) NOT NULL,
  `size` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `payment_gateways`
--

CREATE TABLE `payment_gateways` (
  `id` int(11) NOT NULL,
  `gateway_code` varchar(20) NOT NULL,
  `gateway_name` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `api_key_public` varchar(255) DEFAULT NULL,
  `api_key_secret` varchar(500) DEFAULT NULL,
  `webhook_secret` varchar(255) DEFAULT NULL,
  `webhook_url` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subscription_plan_id` int(11) NOT NULL,
  `gateway_code` varchar(20) NOT NULL,
  `gateway_transaction_id` varchar(255) DEFAULT NULL,
  `amount_cents` int(11) NOT NULL,
  `currency_code` char(3) DEFAULT 'USD',
  `status` enum('pending','completed','failed','cancelled','refunded') DEFAULT 'pending',
  `failure_reason` text,
  `gateway_response` text,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `recipients`
--

CREATE TABLE `recipients` (
  `id` int(11) NOT NULL,
  `capsule_id` int(11) NOT NULL,
  `opened_at` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `subscription_history`
--

CREATE TABLE `subscription_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `capsule_id` int(11) DEFAULT NULL, --- Add this field
  `action` varchar(20) NOT NULL,
  `from_plan_id` int(11) DEFAULT NULL,
  `to_plan_id` int(11) DEFAULT NULL,
  `reason` text,
  `amount` decimal(10,2) DEFAULT '0.00',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text,
  `price_monthly` decimal(10,2) DEFAULT '0.00',
  `price_yearly` decimal(10,2) DEFAULT '0.00',
  `price_onetime` decimal(10,2) DEFAULT '0.00',
  `limits_config` text NOT NULL,
  `features_config` text,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int(11) DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Struttura della tabella `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role` enum('super_user','admin') DEFAULT NULL,
  `disabled` tinyint(1) NOT NULL DEFAULT '0',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_from_google` tinyint(1) NOT NULL DEFAULT '0',
  `full_name` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) DEFAULT NULL,
  `pwd_reset_token` varchar(255) DEFAULT NULL,
  `pwd_reset_expires` datetime DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `current_plan_id` int(11) DEFAULT '1',
  `subscription_status` varchar(20) DEFAULT 'active',
  `trial_ends_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `role`, `disabled`, `email`, `password`, `is_from_google`, `full_name`, `avatar`, `is_verified`, `verification_token`, `pwd_reset_token`, `pwd_reset_expires`, `created`, `deleted`, `updated`, `current_plan_id`, `subscription_status`, `trial_ends_at`) VALUES
(1, 'admin', 0, 'admin@example.com', '$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 0, 'John Doe', 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740', 1, NULL, NULL, NULL, '2025-01-01 10:00:00', NULL, '2025-06-17 18:31:06', 1, 'active', NULL),

--
-- Struttura della tabella `user_notifications`
--

CREATE TABLE `user_notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('application','user-centric','discovery') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user-centric',
  `is_global` tinyint(1) NOT NULL DEFAULT '0',
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `expires` datetime DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL,
  `action_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Struttura della tabella `user_notifications_view`
--

CREATE TABLE `user_notifications_view` (
  `id` int(11) NOT NULL,
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read` datetime DEFAULT NULL,
  `archived` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Struttura della tabella `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'active',
  `starts_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT 'free',
  `billing_cycle` varchar(20) DEFAULT 'monthly',
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `currency` varchar(3) DEFAULT 'USD',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struttura della tabella `user_usage`
--

CREATE TABLE `user_usage` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `monthly_emails_sent` int(11) DEFAULT '0',
  `monthly_api_calls` int(11) DEFAULT '0',
  `usage_month` date NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `capsules`
--
ALTER TABLE `capsules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_09cad7822e6c78baa7994a64f1e` (`user_id`);

--
-- Indici per le tabelle `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_d2bb666cb315150435e38ee0462` (`capsule_id`);

--
-- Indici per le tabelle `library_items`
--
ALTER TABLE `library_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_9083de8f6111ec6da25916f9929` (`user_id`);

--
-- Indici per le tabelle `payment_gateways`
--
ALTER TABLE `payment_gateways`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gateway_code` (`gateway_code`);

--
-- Indici per le tabelle `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_transactions` (`user_id`,`created`),
  ADD KEY `idx_gateway_status` (`gateway_code`,`status`),
  ADD KEY `idx_subscription_plan` (`subscription_plan_id`);

--
-- Indici per le tabelle `recipients`
--
ALTER TABLE `recipients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_dd01703292dd2c63782ff0d628b` (`capsule_id`);

--
-- Indici per le tabelle `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `from_plan_id` (`from_plan_id`),
  ADD KEY `to_plan_id` (`to_plan_id`),
  ADD KEY `idx_user_action` (`user_id`,`action`),
  ADD KEY `idx_created` (`created`);
  ADD KEY `idx_capsule` (`capsule_id`);
--
-- Indici per le tabelle `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_sort` (`sort_order`);

--
-- Indici per le tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
  ADD KEY `idx_plan_status` (`current_plan_id`,`subscription_status`);

--
-- Indici per le tabelle `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `user_notifications_view`
--
ALTER TABLE `user_notifications_view`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_308a8878b8b505890dd09169cf8` (`notification_id`),
  ADD KEY `FK_a78a9a8d376104579c5c4c8c92b` (`user_id`);

--
-- Indici per le tabelle `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `idx_user_status` (`user_id`,`status`),
  ADD KEY `idx_expires` (`expires_at`),
  ADD KEY `idx_stripe_subscription` (`stripe_subscription_id`);

--
-- Indici per le tabelle `user_usage`
--
ALTER TABLE `user_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_month` (`user_id`,`usage_month`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `capsules`
--
ALTER TABLE `capsules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT per la tabella `library_items`
--
ALTER TABLE `library_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT per la tabella `payment_gateways`
--
ALTER TABLE `payment_gateways`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT per la tabella `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `recipients`
--
ALTER TABLE `recipients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la tabella `subscription_history`
--
ALTER TABLE `subscription_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT per la tabella `user_notifications`
--
ALTER TABLE `user_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT per la tabella `user_notifications_view`
--
ALTER TABLE `user_notifications_view`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `user_usage`
--
ALTER TABLE `user_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `capsules`
--
ALTER TABLE `capsules`
  ADD CONSTRAINT `FK_999e0336a47ab545da76d231ee5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Limiti per la tabella `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `FK_d2bb666cb315150435e38ee0462` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Limiti per la tabella `library_items`
--
ALTER TABLE `library_items`
  ADD CONSTRAINT `FK_9083de8f6111ec6da25916f9929` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Limiti per la tabella `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `recipients`
--
ALTER TABLE `recipients`
  ADD CONSTRAINT `FK_f129dff3cd1f95a518140aef090` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Limiti per la tabella `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD CONSTRAINT `subscription_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscription_history_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscription_history_ibfk_3` FOREIGN KEY (`from_plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `subscription_history_ibfk_4` FOREIGN KEY (`to_plan_id`) REFERENCES `subscription_plans` (`id`);

--
-- Limiti per la tabella `user_notifications_view`
--
ALTER TABLE `user_notifications_view`
  ADD CONSTRAINT `FK_308a8878b8b505890dd09169cf8` FOREIGN KEY (`notification_id`) REFERENCES `user_notifications` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_a78a9a8d376104579c5c4c8c92b` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Limiti per la tabella `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`);

--
-- Limiti per la tabella `user_usage`
--
ALTER TABLE `user_usage`
  ADD CONSTRAINT `user_usage_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;
