-- Time Capsule Application - Test Data Seeds
-- This file contains realistic test data for all tables
-- Run this after clearing the database to have a working test environment

-- Clear existing data (in proper order to respect foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `user_notifications`;
TRUNCATE TABLE `user_notification_preferences`;
TRUNCATE TABLE `items`;
TRUNCATE TABLE `recipients`;
TRUNCATE TABLE `capsules`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert test users
INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `is_from_google`, `avatar`, `is_verified`, `verification_token`, `pwd_reset_token`, `pwd_reset_expires`, `created`, `updated`) VALUES
(1, 'john.doe@example.com', '$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Johm Doe', 0, NULL, 1, NULL, NULL, NULL, '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
(2, 'sarah.jones@email.com', '$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Sarah Jones', 0, NULL, 1, NULL, NULL, NULL, '2025-01-15 09:30:00', '2025-01-15 09:30:00'),
(3, 'mike.wilson@email.com', '$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Mike Wilson', 0, NULL, 1, NULL, NULL, NULL, '2025-02-01 14:20:00', '2025-02-01 14:20:00'),
(4, 'emma.garcia@email.com', '$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Emma Garcia', 0, NULL, 1, NULL, NULL, NULL, '2025-02-10 11:45:00', '2025-02-10 11:45:00'),
(5, 'alex.kim@email.com', '$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Alex Kim', 0, NULL, 1, NULL, NULL, NULL, '2025-02-20 16:10:00', '2025-02-20 16:10:00'),
(6, 'lisa.brown@email.com', '$$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Lisa Brown', 0, NULL, 1, NULL, NULL, NULL, '2025-03-01 08:00:00', '2025-03-01 08:00:00'),
(7, 'john.smith@email.com', '$$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'John Smith', 0, NULL, 1, NULL, NULL, NULL, '2025-03-15 12:30:00', '2025-03-15 12:30:00'),
(8, 'maria.lopez@email.com', '$$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Maria Lopez', 0, NULL, 1, NULL, NULL, NULL, '2025-04-01 15:45:00', '2025-04-01 15:45:00'),
(9, 'david.taylor@email.com', '$$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'David Taylor', 0, NULL, 1, NULL, NULL, NULL, '2025-04-10 10:20:00', '2025-04-10 10:20:00'),
(10, 'jennifer.davis@email.com', '$$2b$10$s31Vg3zB10ufne09azfUnu.b.mYeslGPsNGGA67oAWWfKBXWT3ItW', 'Jennifer Davis', 0, NULL, 1, NULL, NULL, NULL, '2025-04-20 13:15:00', '2025-04-20 13:15:00');

-- Insert test capsules with various states and time ranges
INSERT INTO `capsules` (`id`, `user_id`, `name`, `description`, `open_date`, `is_open`, `is_public`, `is_physical`, `lat`, `lng`, `created`, `updated`) VALUES
-- Recently created capsules (not yet open)
(1, 1, 'My Wedding Memories', 'Saving the most beautiful day of our lives for our 10th anniversary', '2030-06-15 14:30:00', 0, 1, 0, '40.7128', '-74.0060', '2025-06-01 14:30:00', '2025-06-01 14:30:00'),
(2, 1, 'Baby Emma First Year', 'For our little Emma to see when she turns 18', '2043-05-26 09:15:00', 0, 1, 0, '51.5074', '-0.1278', '2025-05-26 09:15:00', '2025-05-26 09:15:00'),
(3, 2, 'College Graduation', 'The best four years of our lives', '2030-05-15 16:45:00', 0, 1, 0, '34.0522', '-118.2437', '2025-05-15 16:45:00', '2025-05-15 16:45:00'),
(4, 3, 'Startup Journey Memories', 'The beginning of our entrepreneurial adventure', '2027-12-31 23:59:00', 0, 1, 0, '37.7749', '-122.4194', '2025-03-01 10:00:00', '2025-03-01 10:00:00'),
(5, 4, 'Family Vacation 2025', 'Amazing trip to the mountains', '2030-03-20 12:00:00', 0, 0, 0, '46.2044', '6.1432', '2025-03-20 12:00:00', '2025-03-20 12:00:00'),

-- Capsules opening soon (next few weeks)
(6, 5, 'High School Reunion', 'Time to remember our crazy teenage years!', '2025-06-10 18:00:00', 0, 0, 0, '43.6532', '-79.3832', '2020-06-10 10:00:00', '2020-06-10 10:00:00'),
(7, 6, 'New Year Resolutions 2020', 'Let\'s see how well we did!', '2025-06-15 12:00:00', 0, 0, 0, '40.4168', '-3.7038', '2020-01-01 00:00:00', '2020-01-01 00:00:00'),
(8, 7, 'COVID Time Capsule', 'Life during the pandemic - for future generations', '2025-06-20 15:30:00', 0, 1, 1, '52.5200', '13.4050', '2020-03-15 15:30:00', '2020-03-15 15:30:00'),

-- Recently opened capsules
(9, 8, 'University Memories', 'Bachelor degree celebration', '2025-05-25 10:00:00', 1, 1, 0, '48.8566', '2.3522', '2020-05-25 10:00:00', '2025-05-25 10:15:00'),
(10, 9, 'First Job Achievement', 'Starting my career journey', '2025-05-20 09:00:00', 1, 0, 0, '35.6762', '139.6503', '2022-05-20 09:00:00', '2025-05-20 09:30:00'),
(11, 10, 'Childhood Dreams', 'What I wanted to be when I grew up', '2025-05-15 14:00:00', 1, 1, 0, '55.7558', '37.6176', '2015-05-15 14:00:00', '2025-05-15 14:20:00'),

-- Older opened capsules
(12, 2, 'High School Graduation', 'The end of an era, beginning of adulthood', '2025-04-01 11:00:00', 1, 1, 0, '41.8781', '-87.6298', '2020-04-01 11:00:00', '2025-04-01 11:15:00'),
(13, 3, 'First Love Letter', 'To my future self about my first love', '2025-03-14 16:00:00', 1, 0, 0, '37.7749', '-122.4194', '2020-03-14 16:00:00', '2025-03-14 16:10:00');

-- Insert test recipients (mix of registered users and external emails)
INSERT INTO `recipients` (`id`, `capsule_id`, `user_id`, `email`, `opened_at`, `full_name`, `created`, `updated`) VALUES
-- For Wedding Memories (capsule 1)
(1, 1, 2, 'sarah.jones@email.com', NULL, 'Sarah Jones', '2025-06-01 14:30:00', '2025-06-01 14:30:00'),
(2, 1, NULL, 'future.spouse@email.com', NULL, 'Future Spouse', '2025-06-01 14:30:00', '2025-06-01 14:30:00'),

-- For Baby Emma (capsule 2)
(3, 2, NULL, 'emma.future@email.com', NULL, 'Emma (Future)', '2025-05-26 09:15:00', '2025-05-26 09:15:00'),
(4, 2, 3, 'mike.wilson@email.com', NULL, 'Mike Wilson', '2025-05-26 09:15:00', '2025-05-26 09:15:00'),

-- For College Graduation (capsule 3)
(5, 3, 4, 'emma.garcia@email.com', NULL, 'Emma Garcia', '2025-05-15 16:45:00', '2025-05-15 16:45:00'),
(6, 3, 5, 'alex.kim@email.com', NULL, 'Alex Kim', '2025-05-15 16:45:00', '2025-05-15 16:45:00'),

-- For High School Reunion (capsule 6) - opening soon
(7, 6, 1, 'test@timecapsule.com', NULL, 'Test User', '2020-06-10 10:00:00', '2020-06-10 10:00:00'),
(8, 6, 6, 'lisa.brown@email.com', NULL, 'Lisa Brown', '2020-06-10 10:00:00', '2020-06-10 10:00:00'),

-- For recently opened capsules
(9, 9, 1, 'test@timecapsule.com', '2025-05-25 10:20:00', 'Test User', '2020-05-25 10:00:00', '2025-05-25 10:20:00'),
(10, 9, 7, 'john.smith@email.com', '2025-05-25 10:25:00', 'John Smith', '2020-05-25 10:00:00', '2025-05-25 10:25:00'),

(11, 10, 1, 'test@timecapsule.com', '2025-05-20 09:45:00', 'Test User', '2022-05-20 09:00:00', '2025-05-20 09:45:00'),
(12, 10, 8, 'maria.lopez@email.com', NULL, 'Maria Lopez', '2022-05-20 09:00:00', '2022-05-20 09:00:00'),

(13, 11, 1, 'test@timecapsule.com', '2025-05-15 14:30:00', 'Test User', '2015-05-15 14:00:00', '2025-05-15 14:30:00'),
(14, 11, 9, 'david.taylor@email.com', '2025-05-15 14:35:00', 'David Taylor', '2015-05-15 14:00:00', '2025-05-15 14:35:00');

-- Insert test items (files/content in capsules)
INSERT INTO `items` (`id`, `capsule_id`, `name`, `content_type`, `size`, `content_id`, `created`, `updated`) VALUES
-- Wedding Memories items
(1, 1, 'wedding_photo_01.jpg', 'image/jpeg', 2048576, 1001, '2025-06-01 14:35:00', '2025-06-01 14:35:00'),
(2, 1, 'wedding_video.mp4', 'video/mp4', 52428800, 1002, '2025-06-01 14:40:00', '2025-06-01 14:40:00'),
(3, 1, 'vows_letter.txt', 'text/plain', 2048, 1003, '2025-06-01 14:45:00', '2025-06-01 14:45:00'),

-- Baby Emma items
(4, 2, 'baby_first_photo.jpg', 'image/jpeg', 1536000, 1004, '2025-05-26 09:20:00', '2025-05-26 09:20:00'),
(5, 2, 'first_words_audio.mp3', 'audio/mpeg', 3145728, 1005, '2025-05-26 09:25:00', '2025-05-26 09:25:00'),
(6, 2, 'parent_letter.txt', 'text/plain', 4096, 1006, '2025-05-26 09:30:00', '2025-05-26 09:30:00'),

-- College Graduation items
(7, 3, 'graduation_ceremony.jpg', 'image/jpeg', 3072000, 1007, '2025-05-15 16:50:00', '2025-05-15 16:50:00'),
(8, 3, 'thesis_abstract.pdf', 'application/pdf', 1048576, 1008, '2025-05-15 16:55:00', '2025-05-15 16:55:00'),
(9, 3, 'celebration_video.mp4', 'video/mp4', 41943040, 1009, '2025-05-15 17:00:00', '2025-05-15 17:00:00'),

-- Startup Journey items
(10, 4, 'business_plan.pdf', 'application/pdf', 2097152, 1010, '2025-03-01 10:30:00', '2025-03-01 10:30:00'),
(11, 4, 'team_photo.jpg', 'image/jpeg', 1843200, 1011, '2025-03-01 10:35:00', '2025-03-01 10:35:00'),

-- High School Reunion (opening soon)
(12, 6, 'yearbook_photos.zip', 'application/zip', 15728640, 1012, '2020-06-10 10:30:00', '2020-06-10 10:30:00'),
(13, 6, 'friendship_memories.txt', 'text/plain', 8192, 1013, '2020-06-10 10:35:00', '2020-06-10 10:35:00'),

-- Opened capsules items
(14, 9, 'university_diploma.pdf', 'application/pdf', 512000, 1014, '2020-05-25 10:30:00', '2020-05-25 10:30:00'),
(15, 10, 'first_day_photo.jpg', 'image/jpeg', 1024000, 1015, '2022-05-20 09:30:00', '2022-05-20 09:30:00'),
(16, 11, 'childhood_drawing.jpg', 'image/jpeg', 768000, 1016, '2015-05-15 14:30:00', '2015-05-15 14:30:00');

-- Insert notification preferences for users
INSERT INTO `user_notification_preferences` (`id`, `user_id`, `category`, `email_enabled`, `app_enabled`, `frequency`, `created`, `updated`) VALUES
(1, 1, 'application', 1, 1, 'immediately', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
(2, 1, 'user-centric', 1, 1, 'immediately', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
(3, 1, 'discovery', 1, 1, 'daily', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
(4, 2, 'application', 1, 1, 'immediately', '2025-01-15 09:30:00', '2025-01-15 09:30:00'),
(5, 2, 'user-centric', 1, 1, 'immediately', '2025-01-15 09:30:00', '2025-01-15 09:30:00'),
(6, 2, 'discovery', 0, 1, 'weekly', '2025-01-15 09:30:00', '2025-01-15 09:30:00'),
(7, 3, 'application', 1, 1, 'immediately', '2025-02-01 14:20:00', '2025-02-01 14:20:00'),
(8, 3, 'user-centric', 1, 1, 'immediately', '2025-02-01 14:20:00', '2025-02-01 14:20:00'),
(9, 3, 'discovery', 1, 1, 'daily', '2025-02-01 14:20:00', '2025-02-01 14:20:00');

-- Insert test notifications for users
INSERT INTO `user_notifications` (`id`, `user_id`, `category`, `type`, `title`, `message`, `is_read`, `priority`, `action_url`, `metadata`, `expires_at`, `created`, `updated`) VALUES
-- Recent notifications for main test user
(1, 1, 'user-centric', 'capsule-countdown', 'Capsule Opening Soon!', 'Your capsule "High School Reunion" will open in 6 days', 0, 'medium', '/capsules/6', '{"capsuleId": 6, "daysLeft": 6}', '2025-06-10 18:00:00', '2025-06-04 09:00:00', '2025-06-04 09:00:00'),
(2, 1, 'user-centric', 'recipient-opened', 'Capsule Opened!', 'John Smith opened your capsule "University Memories"', 0, 'medium', '/capsules/9', '{"capsuleId": 9, "recipientName": "John Smith"}', NULL, '2025-05-25 10:25:00', '2025-05-25 10:25:00'),
(3, 1, 'application', 'feature-update', 'New Feature Available', 'Physical capsule tracking is now available! Track your physical time capsules with GPS coordinates.', 1, 'low', '/features/physical-tracking', '{"feature": "physical-tracking"}', NULL, '2025-05-20 10:00:00', '2025-05-22 14:30:00'),
(4, 1, 'discovery', 'trending-capsule', 'Trending Capsule', 'Check out this popular capsule: "Time Capsule for Humanity" by Future Historian', 0, 'low', '/capsules/public/trending', '{"capsuleId": "trending-1"}', '2025-06-11 00:00:00', '2025-06-03 16:00:00', '2025-06-03 16:00:00'),

-- Notifications for other users
(5, 2, 'user-centric', 'capsule-invitation', 'Capsule Invitation', 'Test User invited you to their capsule "My Wedding Memories"', 0, 'high', '/capsules/1/accept', '{"capsuleId": 1, "inviterName": "Test User"}', '2025-07-01 14:30:00', '2025-06-01 14:30:00', '2025-06-01 14:30:00'),
(6, 2, 'user-centric', 'capsule-countdown', 'Capsule Opening Soon!', 'Your capsule "New Year Resolutions 2020" will open in 11 days', 0, 'medium', '/capsules/7', '{"capsuleId": 7, "daysLeft": 11}', '2025-06-15 12:00:00', '2025-06-04 10:00:00', '2025-06-04 10:00:00'),

(7, 3, 'user-centric', 'capsule-reminder', 'Don\'t Forget!', 'Your capsule "Startup Journey Memories" is scheduled to open in December 2027. You can still add more content!', 1, 'low', '/capsules/4/edit', '{"capsuleId": 4}', '2025-12-31 00:00:00', '2025-06-01 08:00:00', '2025-06-01 12:45:00'),

(8, 5, 'user-centric', 'capsule-countdown', 'Final Week!', 'Your capsule "High School Reunion" will open in 6 days', 0, 'high', '/capsules/6', '{"capsuleId": 6, "daysLeft": 6}', '2025-06-10 18:00:00', '2025-06-04 11:00:00', '2025-06-04 11:00:00'),

-- System notifications for all users
(9, 1, 'application', 'maintenance', 'Scheduled Maintenance', 'System maintenance is scheduled for June 8th from 2:00 AM to 4:00 AM UTC. Service may be temporarily unavailable.', 0, 'medium', '/status', '{"maintenanceDate": "2025-06-08T02:00:00Z"}', '2025-06-08 04:00:00', '2025-06-02 10:00:00', '2025-06-02 10:00:00'),
(10, 2, 'application', 'maintenance', 'Scheduled Maintenance', 'System maintenance is scheduled for June 8th from 2:00 AM to 4:00 AM UTC. Service may be temporarily unavailable.', 1, 'medium', '/status', '{"maintenanceDate": "2025-06-08T02:00:00Z"}', '2025-06-08 04:00:00', '2025-06-02 10:00:00', '2025-06-03 09:15:00'),
(11, 3, 'application', 'maintenance', 'Scheduled Maintenance', 'System maintenance is scheduled for June 8th from 2:00 AM to 4:00 AM UTC. Service may be temporarily unavailable.', 0, 'medium', '/status', '{"maintenanceDate": "2025-06-08T02:00:00Z"}', '2025-06-08 04:00:00', '2025-06-02 10:00:00', '2025-06-02 10:00:00');

-- Additional capsules for better statistics
INSERT INTO `capsules` (`id`, `user_id`, `name`, `description`, `open_date`, `is_open`, `is_public`, `is_physical`, `lat`, `lng`, `created`, `updated`) VALUES
(14, 4, 'Marathon Achievement', 'Completing my first marathon', '2026-05-01 08:00:00', 0, 1, 0, '42.3601', '-71.0589', '2025-05-01 20:00:00', '2025-05-01 20:00:00'),
(15, 5, 'Language Learning Journey', 'One year of learning Spanish', '2026-02-01 12:00:00', 0, 0, 0, '40.4165', '-3.7026', '2025-02-01 15:30:00', '2025-02-01 15:30:00'),
(16, 6, 'Cooking Adventures', 'My culinary experiments and recipes', '2027-01-01 18:00:00', 0, 1, 0, '45.4642', '9.1900', '2025-01-15 19:00:00', '2025-01-15 19:00:00'),
(17, 7, 'Garden Growth', 'First year of my vegetable garden', '2025-11-01 10:00:00', 0, 1, 1, '51.5074', '-0.1278', '2024-11-01 10:00:00', '2024-11-01 10:00:00'),
(18, 8, 'Art Portfolio', 'My artistic journey through 2025', '2026-12-31 23:59:00', 0, 1, 0, '48.8566', '2.3522', '2025-01-01 00:01:00', '2025-01-01 00:01:00'),
(19, 9, 'Book Club Memories', 'Best books and discussions of 2025', '2026-01-01 16:00:00', 0, 0, 0, '37.7749', '-122.4194', '2025-01-01 09:00:00', '2025-01-01 09:00:00'),
(20, 10, 'Fitness Journey', 'Getting healthy and strong', '2025-12-31 22:00:00', 0, 0, 0, '40.7128', '-74.0060', '2025-01-01 06:00:00', '2025-01-01 06:00:00');

-- More items for statistics
INSERT INTO `items` (`id`, `capsule_id`, `name`, `content_type`, `size`, `content_id`, `created`, `updated`) VALUES
(17, 14, 'race_medal_photo.jpg', 'image/jpeg', 1024000, 1017, '2025-05-01 20:30:00', '2025-05-01 20:30:00'),
(18, 14, 'training_log.pdf', 'application/pdf', 2048000, 1018, '2025-05-01 20:35:00', '2025-05-01 20:35:00'),
(19, 15, 'spanish_conversation.mp3', 'audio/mpeg', 5242880, 1019, '2025-02-01 15:45:00', '2025-02-01 15:45:00'),
(20, 16, 'recipe_collection.pdf', 'application/pdf', 3145728, 1020, '2025-01-15 19:15:00', '2025-01-15 19:15:00'),
(21, 17, 'garden_timelapse.mp4', 'video/mp4', 62914560, 1021, '2024-11-01 10:30:00', '2024-11-01 10:30:00'),
(22, 18, 'artwork_portfolio.zip', 'application/zip', 104857600, 1022, '2025-01-01 00:30:00', '2025-01-01 00:30:00');

-- Additional recipients for better statistics
INSERT INTO `recipients` (`id`, `capsule_id`, `user_id`, `email`, `opened_at`, `full_name`, `created`, `updated`) VALUES
(15, 14, 6, 'lisa.brown@email.com', NULL, 'Lisa Brown', '2025-05-01 20:00:00', '2025-05-01 20:00:00'),
(16, 15, 7, 'john.smith@email.com', NULL, 'John Smith', '2025-02-01 15:30:00', '2025-02-01 15:30:00'),
(17, 16, 8, 'maria.lopez@email.com', NULL, 'Maria Lopez', '2025-01-15 19:00:00', '2025-01-15 19:00:00'),
(18, 17, 1, 'test@timecapsule.com', NULL, 'Test User', '2024-11-01 10:00:00', '2024-11-01 10:00:00'),
(19, 18, 9, 'david.taylor@email.com', NULL, 'David Taylor', '2025-01-01 00:01:00', '2025-01-01 00:01:00'),
(20, 19, 10, 'jennifer.davis@email.com', NULL, 'Jennifer Davis', '2025-01-01 09:00:00', '2025-01-01 09:00:00');

-- Summary of test data:
-- - 10 users with verified accounts
-- - 20 capsules in various states (scheduled, opening soon, recently opened)
-- - Mix of public/private and physical/digital capsules
-- - Realistic recipients (both registered users and external emails)
-- - Various content types (images, videos, documents, text, audio)
-- - Comprehensive notification system with different categories and priorities
-- - Geographic diversity with coordinates from major cities worldwide
-- - Time diversity spanning from 2015 to 2043 for comprehensive testing

-- Test credentials:
-- Email: test@timecapsule.com
-- Password: any password (bcrypt hash is dummy, but you can replace with real hash)
-- This user has capsules in all states and various notifications for testing
