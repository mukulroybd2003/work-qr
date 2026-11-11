-- ========================================================
-- WORKER QR VERIFICATION MANAGEMENT SYSTEM - SEED DATA
-- Default Admin credentials:
-- Username: admin
-- Password: Password@123!
-- ========================================================

USE `worker_qr_system`;

-- 1. Insert Default Administrator (Password: Password@123!)
-- Hash generated using password_hash('Password@123!', PASSWORD_BCRYPT)
INSERT INTO `admins` (`id`, `name`, `username`, `email`, `password_hash`, `role`, `is_active`, `created_at`) 
VALUES (
  1, 
  'System Administrator', 
  'admin', 
  'admin@organization.local', 
  '$2y$10$k1wXf7j.zT0oA8M7z3J.0eS8oG/xR0lU0bL3.wT6jQ3f8sC3qZl2K', 
  'superadmin', 
  1, 
  NOW()
) ON DUPLICATE KEY UPDATE `id`=`id`;

-- 2. Insert Default System Settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `updated_at`) VALUES
('app_name', 'Worker QR Verification System', NOW()),
('organization_name', 'Apex Global Workforce Services', NOW()),
('logo_url', '/assets/images/logo.png', NOW()),
('primary_color', '#059669', NOW()),
('contact_email', 'compliance@apexworkforce.org', NOW()),
('contact_phone', '+1 (800) 555-0199', NOW()),
('public_page_title', 'OFFICIAL WORKER VERIFICATION RECORD', NOW()),
('worker_code_prefix', 'WRK-', NOW()),
('default_permit_type', 'General Work Authorization', NOW()),
('timezone', 'UTC', NOW()),
('public_show_dob', '0', NOW()),
('public_show_gender', '1', NOW()),
('public_show_id_number', '1', NOW()),
('public_show_photo', '1', NOW()),
('qr_size', '300', NOW())
ON DUPLICATE KEY UPDATE `updated_at`=NOW();

-- 3. Insert Custom Fields
INSERT INTO `custom_fields` (`id`, `field_name`, `field_key`, `field_type`, `field_options`, `is_required`, `is_public`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'Department / Division', 'department', 'select', 'Civil Engineering\nLogistics & Supply\nElectrical Safety\nQuality Assurance\nMechanical Operations', 1, 1, 1, 1, NOW()),
(2, 'Site Safety Certification ID', 'safety_cert_id', 'text', NULL, 0, 1, 2, 1, NOW()),
(3, 'Blood Group', 'blood_group', 'select', 'A+\nA-\nB+\nB-\nO+\nO-\nAB+\nAB-', 0, 0, 3, 1, NOW()),
(4, 'Emergency Contact Phone', 'emergency_contact', 'text', NULL, 0, 0, 4, 1, NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 4. Insert Demo Workers
INSERT INTO `workers` (`id`, `worker_code`, `full_name`, `id_number`, `profession`, `nationality`, `date_of_birth`, `gender`, `photo`, `notes`, `is_active`, `created_at`) VALUES
(1, 'WRK-10024', 'Marcus Vance Reynolds', 'NID-94827104', 'Senior Structural Inspector', 'United States', '1988-06-14', 'Male', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', 'Certified OSHA 30 supervisor with clear safety record.', 1, NOW()),
(2, 'WRK-10025', 'Sofia Elena Rostova', 'ID-77391842', 'Electrical Systems Specialist', 'Spain', '1992-11-23', 'Female', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', 'High voltage certified, lead technician at Northern Sector.', 1, NOW()),
(3, 'WRK-10026', 'Tariq Al-Mansoor', 'CIV-48192039', 'Heavy Equipment Fleet Operator', 'Jordan', '1985-03-09', 'Male', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', 'Authorized for Class-IV tower cranes and earthmovers.', 1, NOW()),
(4, 'WRK-10027', 'Ananya Devi Sharma', 'IN-66291048', 'Environmental Safety Coordinator', 'India', '1990-09-17', 'Female', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', 'Audits hazardous materials compliance across facilities.', 1, NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 5. Insert Permits
INSERT INTO `permits` (`id`, `worker_id`, `permit_type`, `permit_number`, `declaration_start_date`, `declaration_end_date`, `status`, `created_at`) VALUES
(1, 1, 'Commercial Site Work Permit', 'PRM-2026-0891', '2026-01-01', '2027-01-01', 'active', NOW()),
(2, 2, 'High Voltage Operations Permit', 'PRM-2026-0412', '2026-02-15', '2026-12-31', 'active', NOW()),
(3, 3, 'Heavy Machinery Class-A Permit', 'PRM-2025-9014', '2025-01-10', '2026-01-09', 'expired', NOW()),
(4, 4, 'Hazardous Materials Handling Permit', 'PRM-2026-1184', '2026-03-01', '2027-02-28', 'active', NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 6. Insert Worker Benefits
INSERT INTO `worker_benefits` (`id`, `worker_id`, `benefit_name`, `benefit_type`, `benefit_description`, `is_public`, `created_at`) VALUES
(1, 1, 'Comprehensive Comprehensive Medical Cover', 'Healthcare', 'Gold tier inpatient & outpatient coverage including emergency care.', 1, NOW()),
(2, 1, 'Hazardous Duty Allowance', 'Compensation', 'Applicable on high-altitude inspection assignments.', 0, NOW()),
(3, 2, 'Workplace Accident Indemnity', 'Insurance', 'Full occupational injury compensation scheme.', 1, NOW()),
(4, 2, 'Annual Professional Skill Allowance', 'Education', 'Certified industrial continuing education stipend.', 1, NOW()),
(5, 3, 'Heavy Operator Healthcare Plan', 'Healthcare', 'Includes audiometry, orthopedic & vision checks.', 1, NOW()),
(6, 4, 'Hazmat Health Surveillance Protocol', 'Healthcare', 'Quarterly toxicology and bio-monitoring protocol.', 1, NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 7. Insert Custom Field Values
INSERT INTO `custom_field_values` (`id`, `worker_id`, `custom_field_id`, `field_value`, `created_at`) VALUES
(1, 1, 1, 'Civil Engineering', NOW()),
(2, 1, 2, 'OSHA-30-NYC-88492', NOW()),
(3, 1, 3, 'O+', NOW()),
(4, 2, 1, 'Electrical Safety', NOW()),
(5, 2, 2, 'IEEE-HV-ESP-99120', NOW()),
(6, 3, 1, 'Mechanical Operations', NOW()),
(7, 4, 1, 'Quality Assurance', NOW()),
(8, 4, 2, 'EPA-HAZ-2026-441', NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 8. Insert QR Codes (Token hashes correspond to secure tokens)
-- Token for Marcus Vance Reynolds: 8e5d3c2b1a9f0e4d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d
-- SHA-256 hash: stored in token_hash
INSERT INTO `qr_codes` (`id`, `permit_id`, `token_hash`, `is_active`, `generated_at`) VALUES
(1, 1, 'b7324faeb6b3b5c77741829e2f41656ca8018337dc7b574a72d3cae8cba50ef1', 1, NOW()),
(2, 2, '4d8a17f69201a4816c483a985e510884df1956e18f29ea156e580e03be7839ec', 1, NOW()),
(3, 4, '916be68972f778396016e344ee489eb2cf95dfb4e5482386561cfcbccf560064', 1, NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 9. Insert Initial Audit Log
INSERT INTO `audit_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `created_at`) VALUES
(1, 1, 'SYSTEM_INITIALIZE', 'System', 1, 'Worker QR Verification System database initialized with default schema & seed.', '127.0.0.1', NOW());
