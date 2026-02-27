-- Quick fix for the notification tables in the main seed file
-- Run this AFTER running the main seed-test-data.sql to fix the notification data

-- Fix user_notification_preferences table
DELETE FROM user_notification_preferences;

INSERT INTO `user_notification_preferences` (`id`, `user_id`, `type`, `enabled`, `email_enabled`, `push_enabled`, `created`, `updated`, `deleted`) VALUES
(1, 1, 'application', 1, 1, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00', NULL),
(2, 1, 'user-centric', 1, 1, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00', NULL),
(3, 1, 'discovery', 1, 0, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00', NULL),
(4, 2, 'application', 1, 1, 1, '2025-01-15 09:30:00', '2025-01-15 09:30:00', NULL),
(5, 2, 'user-centric', 1, 1, 1, '2025-01-15 09:30:00', '2025-01-15 09:30:00', NULL),
(6, 2, 'discovery', 0, 0, 1, '2025-01-15 09:30:00', '2025-01-15 09:30:00', NULL),
(7, 3, 'application', 1, 1, 1, '2025-02-01 14:20:00', '2025-02-01 14:20:00', NULL),
(8, 3, 'user-centric', 1, 1, 1, '2025-02-01 14:20:00', '2025-02-01 14:20:00', NULL),
(9, 3, 'discovery', 1, 1, 1, '2025-02-01 14:20:00', '2025-02-01 14:20:00', NULL);

-- Fix user_notifications table
DELETE FROM user_notifications;

INSERT INTO `user_notifications` (`id`, `user_id`, `category`, `type`, `title`, `message`, `is_read`, `read_at`, `priority`, `action_url`, `related_id`, `metadata`, `expires_at`, `created`, `updated`, `deleted`) VALUES
(1, 1, 'user-centric', 'capsule-countdown', 'Capsule Opening Soon!', 'Your capsule "High School Reunion" will open in 6 days', 0, NULL, 'medium', '/capsules/6', 6, '{"capsuleId": 6, "daysLeft": 6}', '2025-06-10 18:00:00', '2025-06-04 09:00:00', '2025-06-04 09:00:00', NULL),
(2, 1, 'user-centric', 'recipient-opened', 'Capsule Opened!', 'John Smith opened your capsule "University Memories"', 0, NULL, 'medium', '/capsules/9', 9, '{"capsuleId": 9, "recipientName": "John Smith"}', NULL, '2025-05-25 10:25:00', '2025-05-25 10:25:00', NULL),
(3, 1, 'application', 'feature-update', 'New Feature Available', 'Physical capsule tracking is now available!', 1, '2025-05-22 14:30:00', 'low', '/features/physical-tracking', NULL, '{"feature": "physical-tracking"}', NULL, '2025-05-20 10:00:00', '2025-05-22 14:30:00', NULL),
(4, 1, 'discovery', 'trending-capsule', 'Trending Capsule', 'Check out this popular capsule by Future Historian', 0, NULL, 'low', '/capsules/public/trending', NULL, '{"capsuleId": "trending-1"}', '2025-06-11 00:00:00', '2025-06-03 16:00:00', '2025-06-03 16:00:00', NULL),
(5, 2, 'user-centric', 'capsule-invitation', 'Capsule Invitation', 'John Doe invited you to their capsule "My Wedding Memories"', 0, NULL, 'high', '/capsules/1/accept', 1, '{"capsuleId": 1, "inviterName": "John Doe"}', '2025-07-01 14:30:00', '2025-06-01 14:30:00', '2025-06-01 14:30:00', NULL),
(6, 2, 'user-centric', 'capsule-countdown', 'Capsule Opening Soon!', 'Your capsule will open in 11 days', 0, NULL, 'medium', '/capsules/7', 7, '{"capsuleId": 7, "daysLeft": 11}', '2025-06-15 12:00:00', '2025-06-04 10:00:00', '2025-06-04 10:00:00', NULL),
(7, 3, 'user-centric', 'capsule-reminder', 'Don\'t Forget!', 'Your capsule is scheduled to open in December 2027', 1, '2025-06-01 12:45:00', 'low', '/capsules/4/edit', 4, '{"capsuleId": 4}', '2025-12-31 00:00:00', '2025-06-01 08:00:00', '2025-06-01 12:45:00', NULL),
(8, 3, 'application', 'maintenance', 'Scheduled Maintenance', 'System maintenance scheduled for June 8th', 0, NULL, 'medium', '/status', NULL, '{"maintenanceDate": "2025-06-08T02:00:00Z"}', '2025-06-08 04:00:00', '2025-06-02 10:00:00', '2025-06-02 10:00:00', NULL);
