-- User Notification and Preferences Seed Data
-- This file contains corrected seed data matching the actual entity structures

-- Clear existing notification data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `user_notifications`;
TRUNCATE TABLE `user_notification_preferences`;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert user notification preferences  
-- Structure: id, user_id, type, enabled, email_enabled, push_enabled, created, updated, deleted
INSERT INTO `user_notification_preferences` (`id`, `user_id`, `type`, `enabled`, `email_enabled`, `push_enabled`, `created`, `updated`, `deleted`) VALUES
-- User 1 preferences
(1, 1, 'capsule-countdown', 1, 1, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00', NULL),
(2, 1, 'recipient-opened', 1, 1, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00', NULL),
(3, 1, 'feature-update', 1, 0, 1, '2025-01-01 10:00:00', '2025-01-01 10:00:00', NULL),

-- User 2 preferences
(4, 2, 'capsule-invitation', 1, 1, 1, '2025-01-15 09:30:00', '2025-01-15 09:30:00', NULL),
(5, 2, 'capsule-countdown', 1, 1, 1, '2025-01-15 09:30:00', '2025-01-15 09:30:00', NULL),
(6, 2, 'maintenance', 0, 0, 1, '2025-01-15 09:30:00', '2025-01-15 09:30:00', NULL),

-- User 3 preferences  
(7, 3, 'capsule-reminder', 1, 1, 1, '2025-02-01 14:20:00', '2025-02-01 14:20:00', NULL),
(8, 3, 'maintenance', 1, 1, 1, '2025-02-01 14:20:00', '2025-02-01 14:20:00', NULL),
(9, 3, 'trending-capsule', 1, 1, 1, '2025-02-01 14:20:00', '2025-02-01 14:20:00', NULL),

-- User 4 preferences
(10, 4, 'capsule-created', 1, 0, 1, '2025-02-10 11:45:00', '2025-02-10 11:45:00', NULL),
(11, 4, 'global-stats', 1, 1, 1, '2025-02-10 11:45:00', '2025-02-10 11:45:00', NULL),
(12, 4, 'version-update', 0, 0, 1, '2025-02-10 11:45:00', '2025-02-10 11:45:00', NULL),

-- User 5 preferences
(13, 5, 'capsule-countdown', 1, 1, 1, '2025-02-20 16:10:00', '2025-02-20 16:10:00', NULL),
(14, 5, 'version-update', 1, 1, 1, '2025-02-20 16:10:00', '2025-02-20 16:10:00', NULL),
(15, 5, 'community-milestone', 1, 0, 1, '2025-02-20 16:10:00', '2025-02-20 16:10:00', NULL);

-- Insert user notifications
-- Structure: id, user_id, category, type, title, message, is_read, read_at, priority, action_url, related_id, metadata, expires_at, created, updated, deleted
INSERT INTO `user_notifications` (`id`, `user_id`, `category`, `type`, `title`, `message`, `is_read`, `read_at`, `priority`, `action_url`, `related_id`, `metadata`, `expires_at`, `created`, `updated`, `deleted`) VALUES

-- Recent notifications for user 1 (john.doe@example.com)
(1, 1, 'user-centric', 'capsule-countdown', 'Capsule Opening Soon!', 'Your capsule "High School Reunion" will open in 6 days', 0, NULL, 'medium', '/capsules/6', 6, '{"capsuleId": 6, "daysLeft": 6}', '2025-06-10 18:00:00', '2025-06-04 09:00:00', '2025-06-04 09:00:00', NULL),

(2, 1, 'user-centric', 'recipient-opened', 'Capsule Opened!', 'John Smith opened your capsule "University Memories"', 0, NULL, 'medium', '/capsules/9', 9, '{"capsuleId": 9, "recipientName": "John Smith"}', NULL, '2025-05-25 10:25:00', '2025-05-25 10:25:00', NULL),

(3, 1, 'application', 'feature-update', 'New Feature Available', 'Physical capsule tracking is now available! Track your physical time capsules with GPS coordinates.', 1, '2025-05-22 14:30:00', 'low', '/features/physical-tracking', NULL, '{"feature": "physical-tracking"}', NULL, '2025-05-20 10:00:00', '2025-05-22 14:30:00', NULL),

(4, 1, 'discovery', 'trending-capsule', 'Trending Capsule', 'Check out this popular capsule: "Time Capsule for Humanity" by Future Historian', 0, NULL, 'low', '/capsules/public/trending', NULL, '{"capsuleId": "trending-1"}', '2025-06-11 00:00:00', '2025-06-03 16:00:00', '2025-06-03 16:00:00', NULL),

-- Notifications for user 2 (sarah.jones@email.com)
(5, 2, 'user-centric', 'capsule-invitation', 'Capsule Invitation', 'John Doe invited you to their capsule "My Wedding Memories"', 0, NULL, 'high', '/capsules/1/accept', 1, '{"capsuleId": 1, "inviterName": "John Doe"}', '2025-07-01 14:30:00', '2025-06-01 14:30:00', '2025-06-01 14:30:00', NULL),

(6, 2, 'user-centric', 'capsule-countdown', 'Capsule Opening Soon!', 'Your capsule "New Year Resolutions 2020" will open in 11 days', 0, NULL, 'medium', '/capsules/7', 7, '{"capsuleId": 7, "daysLeft": 11}', '2025-06-15 12:00:00', '2025-06-04 10:00:00', '2025-06-04 10:00:00', NULL),

(7, 2, 'application', 'maintenance', 'Scheduled Maintenance', 'System maintenance is scheduled for June 8th from 2:00 AM to 4:00 AM UTC. Service may be temporarily unavailable.', 1, '2025-06-03 09:15:00', 'medium', '/status', NULL, '{"maintenanceDate": "2025-06-08T02:00:00Z"}', '2025-06-08 04:00:00', '2025-06-02 10:00:00', '2025-06-03 09:15:00', NULL),

-- Notifications for user 3 (mike.wilson@email.com)
(8, 3, 'user-centric', 'capsule-reminder', 'Don\'t Forget!', 'Your capsule "Startup Journey Memories" is scheduled to open in December 2027. You can still add more content!', 1, '2025-06-01 12:45:00', 'low', '/capsules/4/edit', 4, '{"capsuleId": 4}', '2025-12-31 00:00:00', '2025-06-01 08:00:00', '2025-06-01 12:45:00', NULL),

(9, 3, 'application', 'maintenance', 'Scheduled Maintenance', 'System maintenance is scheduled for June 8th from 2:00 AM to 4:00 AM UTC. Service may be temporarily unavailable.', 0, NULL, 'medium', '/status', NULL, '{"maintenanceDate": "2025-06-08T02:00:00Z"}', '2025-06-08 04:00:00', '2025-06-02 10:00:00', '2025-06-02 10:00:00', NULL),

-- Notifications for user 4 (emma.garcia@email.com)
(10, 4, 'user-centric', 'capsule-created', 'Capsule Created Successfully', 'Your capsule "Family Vacation 2025" has been created and will open on March 20, 2030', 1, '2025-03-20 12:30:00', 'low', '/capsules/5', 5, '{"capsuleId": 5}', NULL, '2025-03-20 12:00:00', '2025-03-20 12:30:00', NULL),

(11, 4, 'discovery', 'global-stats', 'Platform Update', 'This week: 15 new users joined and 23 new capsules were created!', 0, NULL, 'low', '/statistics', NULL, '{"weeklyUsers": 15, "weeklyCapsules": 23}', '2025-06-12 00:00:00', '2025-06-05 08:00:00', '2025-06-05 08:00:00', NULL),

-- Notifications for user 5 (alex.kim@email.com)
(12, 5, 'user-centric', 'capsule-countdown', 'Final Week!', 'Your capsule "High School Reunion" will open in 6 days', 0, NULL, 'high', '/capsules/6', 6, '{"capsuleId": 6, "daysLeft": 6}', '2025-06-10 18:00:00', '2025-06-04 11:00:00', '2025-06-04 11:00:00', NULL),

(13, 5, 'application', 'version-update', 'App Update Available', 'Version 2.1.0 is now available with improved notification system and new features!', 0, NULL, 'low', '/updates', NULL, '{"version": "2.1.0", "features": ["notifications", "ui-improvements"]}', NULL, '2025-06-01 15:00:00', '2025-06-01 15:00:00', NULL),

-- System-wide notifications
(14, 1, 'application', 'maintenance', 'Scheduled Maintenance', 'System maintenance is scheduled for June 8th from 2:00 AM to 4:00 AM UTC. Service may be temporarily unavailable.', 0, NULL, 'medium', '/status', NULL, '{"maintenanceDate": "2025-06-08T02:00:00Z"}', '2025-06-08 04:00:00', '2025-06-02 10:00:00', '2025-06-02 10:00:00', NULL),

-- Older notifications for testing pagination and read states
(15, 1, 'user-centric', 'capsule-opened', 'Capsule Opened', 'Your capsule "Childhood Dreams" was automatically opened', 1, '2025-05-15 14:30:00', 'medium', '/capsules/11', 11, '{"capsuleId": 11}', NULL, '2025-05-15 14:20:00', '2025-05-15 14:30:00', NULL),

(16, 2, 'user-centric', 'recipient-joined', 'Recipient Joined', 'Emma Garcia has joined the platform and can now receive your capsules!', 1, '2025-02-10 12:00:00', 'low', '/users/emma.garcia', 4, '{"userId": 4, "userName": "Emma Garcia"}', NULL, '2025-02-10 11:45:00', '2025-02-10 12:00:00', NULL),

(17, 3, 'discovery', 'community-milestone', 'Community Milestone', 'Time Capsule platform has reached 1000 registered users!', 1, '2025-04-15 10:00:00', 'low', '/community', NULL, '{"milestone": "1000-users", "date": "2025-04-15"}', NULL, '2025-04-15 09:00:00', '2025-04-15 10:00:00', NULL);

-- Summary of corrected data:
-- ✅ Fixed table names: user_notifications, user_notification_preferences  
-- ✅ Fixed column names: user_id, is_read, read_at, email_enabled, push_enabled, etc.
-- ✅ Added base entity fields: id, created, updated, deleted
-- ✅ Used correct enum values: application/user-centric/discovery, low/medium/high
-- ✅ Added proper foreign key references to existing users (1-5)
-- ✅ Realistic notification types and metadata
-- ✅ Mix of read/unread notifications for testing
-- ✅ Various priority levels and categories
-- ✅ Expiring and non-expiring notifications
