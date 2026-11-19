-- ============================================================================
-- TravelMate Platform - Official MySQL Database Schema & Seed Data
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB, and phpMyAdmin
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `travelmate_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `travelmate_db`;

-- ----------------------------------------------------------------------------
-- 1. Table: users (Stores authentication, personas, and roles)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `wishlist`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `destinations`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(255) NOT NULL,
  `persona` VARCHAR(100) DEFAULT 'Explorer',
  `avatar` TEXT,
  `role` VARCHAR(50) DEFAULT 'traveler',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 2. Table: destinations (Stores curated destinations, pricing, tags)
-- ----------------------------------------------------------------------------
CREATE TABLE `destinations` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL DEFAULT '',
  `region` VARCHAR(255) NOT NULL DEFAULT '',
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `description` TEXT,
  `tagline` TEXT,
  `image` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Mountains',
  `rating` DECIMAL(3, 2) DEFAULT 4.80,
  `reviews_count` INT DEFAULT 100,
  `estimated_budget` INT NOT NULL DEFAULT 10000,
  `base_price` INT NOT NULL DEFAULT 10000,
  `duration` VARCHAR(100) NOT NULL DEFAULT '3 Days / 2 Nights',
  `best_season` VARCHAR(100) DEFAULT 'Winter',
  `activities` TEXT,
  `latitude` DOUBLE DEFAULT 0.0,
  `longitude` DOUBLE DEFAULT 0.0,
  `tags` TEXT,
  `details` LONGTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 3. Table: bookings (Stores reservations, passenger details, payment status)
-- ----------------------------------------------------------------------------
CREATE TABLE `bookings` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` INT,
  `traveler_name` VARCHAR(255) NOT NULL,
  `traveler_email` VARCHAR(255),
  `traveler_phone` VARCHAR(50),
  `destination_id` VARCHAR(100) NOT NULL,
  `destination_name` VARCHAR(255) NOT NULL,
  `travel_date` VARCHAR(100) NOT NULL,
  `travelers_count` INT DEFAULT 1,
  `amount` INT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Confirmed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 4. Table: wishlist (User bookmarked destinations)
-- ----------------------------------------------------------------------------
CREATE TABLE `wishlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `destination_id` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_destination_unique` (`user_id`, `destination_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SEED DATA INSERTION
-- ============================================================================

-- 1. Initial Users (Admin & Travelers)
-- Default passwords:
-- admin@travelmate.com / admin123 (salt: 32679f222880c5e75143a579623e1189)
-- rhea@travelmate.com  / rhea123  (salt: 7e997f7bc868eaec8c9f0ef7cf8d1b1a)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `salt`, `persona`, `avatar`, `role`, `created_at`) VALUES
(1, 'Admin Concierge', 'admin@travelmate.com', 'bbce13545df16a73531b40284ab9eb431a47314dce1fbb78bfaaa3b50c0c6604', '32679f222880c5e75143a579623e1189', 'Administrator', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', 'admin', NOW()),
(2, 'Rhea Sen', 'rhea@travelmate.com', 'e3fa1e43e2646394200782782b3d8f8d6722d9ee9306b997cb244f08f0a07994', '7e997f7bc868eaec8c9f0ef7cf8d1b1a', 'Pro Explorer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 'traveler', NOW());

-- 2. Destinations (14 Handcrafted Destinations)
INSERT INTO `destinations` (`id`, `name`, `region`, `tagline`, `image`, `rating`, `reviews_count`, `base_price`, `duration`, `tags`) VALUES
('manali', 'Manali', 'Himachal Pradesh, India', 'Valley of the Gods, snow-capped peaks and pine forest trails', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80', 4.80, 1420, 8500, '3 Days / 2 Nights', 'Snow Peaks,Adventure,Pine Forests,Cafes'),
('goa', 'Goa', 'West Coast, India', 'Sun-drenched beaches, Portuguese colonial villas and vibrant nightlife', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', 4.70, 2180, 11000, '4 Days / 3 Nights', 'Beaches,Nightlife,Water Sports,Seafood'),
('udaipur', 'Udaipur', 'Rajasthan, India', 'City of Lakes, royal marble palaces and romantic sunset boat rides', 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80', 4.90, 1680, 12500, '3 Days / 2 Nights', 'Palaces,Lakes,Royal Heritage,Fine Dining'),
('lonavala', 'Lonavala', 'Maharashtra, India', 'Misty Western Ghats, ancient Buddhist caves and cascading waterfalls', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', 4.60, 940, 6500, '2 Days / 1 Night', 'Waterfalls,Western Ghats,Trekking,Chikki'),
('kerala', 'Kerala', 'South-West Coast, India', 'God''s Own Country, emerald backwaters, tea gardens and Ayurvedic retreats', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', 4.90, 2450, 14000, '5 Days / 4 Nights', 'Backwaters,Houseboat,Tea Estates,Ayurveda'),
('dubai', 'Dubai', 'United Arab Emirates', 'Futuristic skyscrapers, golden desert dunes and world-class luxury', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', 4.80, 3120, 28000, '5 Days / 4 Nights', 'Skyscrapers,Desert Safari,Luxury,Theme Parks'),
('kasol', 'Kasol', 'Himachal Pradesh, India', 'Mini Israel of India, Parvati Valley riverbanks and mystical pine treks', 'https://images.unsplash.com/photo-1596761224566-320c2777f98d?auto=format&fit=crop&w=1200&q=80', 4.70, 1150, 6000, '3 Days / 2 Nights', 'Parvati Valley,Kheerganga Trek,Cafes,Riverside'),
('auli', 'Auli', 'Uttarakhand, India', 'India''s Skiing Paradise, sweeping meadows and Nanda Devi views', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', 4.80, 890, 9500, '3 Days / 2 Nights', 'Skiing,Snow Meadows,Ropeway,Nanda Devi'),
('jaipur', 'Jaipur', 'Rajasthan, India', 'The Pink City, majestic hilltop forts, vibrant bazaars and regal heritage', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', 4.80, 1850, 9200, '3 Days / 2 Nights', 'Heritage,Forts,Royal Architecture,Bazaars'),
('ooty', 'Ooty', 'Tamil Nadu, India', 'Queen of Hill Stations, misty Nilgiri tea estates and heritage steam toy trains', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', 4.70, 1310, 7800, '3 Days / 2 Nights', 'Tea Gardens,Toy Train,Lakes,Cool Climate'),
('darjeeling', 'Darjeeling', 'West Bengal, India', 'Land of the Thunderbolt, golden sunrise over Kanchenjunga and aroma of single estate tea', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', 4.80, 1490, 8900, '4 Days / 3 Nights', 'Himalayan Views,Tea Estates,Colonial Charm,Toy Train'),
('varanasi', 'Varanasi', 'Uttar Pradesh, India', 'The Spiritual Capital of India, sacred dawn Ganga boat journeys and timeless evening Maha Aarti', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80', 4.90, 2800, 6800, '3 Days / 2 Nights', 'Spiritual,Ghats,Ganga Aarti,Ancient Culture'),
('andaman', 'Andaman & Nicobar', 'Bay of Bengal, India', 'Tropical archipelago with turquoise lagoons, untouched white beaches and vibrant coral reefs', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 4.90, 1940, 22500, '5 Days / 4 Nights', 'Islands,Scuba Diving,Coral Reefs,Radhanagar Beach'),
('rishikesh', 'Rishikesh', 'Uttarakhand, India', 'Yoga Capital of the World, sacred Ganga riverbank ghats and thrilling white-water rapids', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80', 4.80, 2100, 7200, '3 Days / 2 Nights', 'Yoga & Wellness,River Rafting,Ashrams,Suspension Bridges'),
('ladakh', 'Leh Ladakh', 'Ladakh, India', 'Land of High Passes, azure Pangong Tso lake, and ancient cliffside monasteries', 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80', 4.90, 1720, 18500, '6 Days / 5 Nights', 'High Altitude,Pangong Lake,Monasteries,Biking,Mountains'),
('munnar', 'Munnar', 'Kerala, India', 'Endless rolling emerald tea plantations, misty mountain valleys and cascading waterfalls', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80', 4.80, 1420, 8200, '3 Days / 2 Nights', 'Tea Estates,Misty Valleys,Waterfalls,Western Ghats'),
('pondicherry', 'Pondicherry', 'Tamil Nadu Coast, India', 'French colonial boulevards, pastel villas, Promenade seaside walks and Auroville spirituality', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', 4.70, 1180, 7500, '3 Days / 2 Nights', 'French Colony,Beaches,Auroville,Cafes,Heritage'),
('shimla', 'Shimla', 'Himachal Pradesh, India', 'Queen of the Hills, historic Mall Road, neo-Gothic Christ Church and pine-scented ridge walks', 'https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=1200&q=80', 4.70, 1640, 7800, '3 Days / 2 Nights', 'Colonial Architecture,Mall Road,Toy Train,Snow Peaks'),
('coorg', 'Coorg (Kodagu)', 'Karnataka, India', 'Scotland of India, mist-covered coffee plantations, aromatic spices, and tumbling Abbey Falls', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 4.80, 1290, 8900, '3 Days / 2 Nights', 'Coffee Plantations,Waterfalls,Nature,Trekking'),
('bali', 'Bali', 'Indonesia', 'Island of the Gods, sacred ocean cliff temples, terraced emerald rice fields and sunset beach clubs', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', 4.90, 3420, 34000, '6 Days / 5 Nights', 'Tropical,Temples,Surfing,Rice Terraces,Luxury');

-- 3. Initial Bookings
INSERT INTO `bookings` (`id`, `user_id`, `traveler_name`, `traveler_email`, `traveler_phone`, `destination_id`, `destination_name`, `travel_date`, `travelers_count`, `amount`, `status`, `created_at`) VALUES
('BK-8901', 2, 'Aarav Sharma', 'aarav@gmail.com', '+91 98765 11111', 'manali', 'Manali, HP', 'Oct 12 - Oct 15, 2026', 2, 17000, 'Confirmed', NOW()),
('BK-8902', 2, 'Priya Venkatesh', 'priya@gmail.com', '+91 98765 22222', 'goa', 'Goa (Vagator)', 'Nov 04 - Nov 08, 2026', 4, 44000, 'Confirmed', NOW()),
('BK-8903', 2, 'Rohan & Sneha', 'rohan@gmail.com', '+91 98765 33333', 'udaipur', 'Udaipur (Palace Suite)', 'Oct 20 - Oct 23, 2026', 2, 38500, 'Pending', NOW()),
('BK-8904', 1, 'Vikram Malhotra', 'vikram@gmail.com', '+91 98765 44444', 'dubai', 'Dubai (Desert Safari)', 'Dec 18 - Dec 23, 2026', 3, 84000, 'Confirmed', NOW()),
('BK-8905', 2, 'Ananya Deshmukh', 'ananya@gmail.com', '+91 98765 55555', 'lonavala', 'Lonavala (Pawna Camp)', 'Sep 26 - Sep 28, 2026', 5, 14500, 'Confirmed', NOW()),
('BK-8906', 1, 'Dr. K. Nair & Family', 'drnair@gmail.com', '+91 98765 66666', 'kerala', 'Kerala (Houseboat)', 'Nov 15 - Nov 20, 2026', 4, 56000, 'Pending', NOW()),
('BK-8907', 2, 'Kabir Mehta', 'kabir@gmail.com', '+91 98765 77777', 'kasol', 'Kasol & Kheerganga', 'Oct 01 - Oct 04, 2026', 1, 6800, 'Cancelled', NOW()),
('BK-8908', 2, 'Sunita & Raj', 'sunita@gmail.com', '+91 98765 88888', 'jaipur', 'Jaipur (Hawa Mahal & Amber Fort)', 'Nov 12 - Nov 15, 2026', 2, 18400, 'Confirmed', NOW());

-- 4. Initial Wishlist
INSERT INTO `wishlist` (`user_id`, `destination_id`, `created_at`) VALUES
(2, 'manali', NOW()),
(2, 'kerala', NOW()),
(2, 'jaipur', NOW()),
(2, 'andaman', NOW());
