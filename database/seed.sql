-- AutoSathi Sample Data
-- This file contains sample data for testing and demonstration

-- Insert sample users
INSERT INTO users (first_name, last_name, email, password_hash, phone, role) VALUES
('Rahul', 'Sharma', 'rahul.sharma@example.com', '$2b$10$example_hash_change_me', '+919876543210', 'user'),
('Priya', 'Patel', 'priya.patel@example.com', '$2b$10$example_hash_change_me', '+919876543211', 'user'),
('Admin', 'User', 'admin@autosathi.com', '$2b$10$example_hash_change_me', '+919876543212', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for vehicles
DO $$
DECLARE
    rahul_id UUID;
    priya_id UUID;
BEGIN
    SELECT id INTO rahul_id FROM users WHERE email = 'rahul.sharma@example.com';
    SELECT id INTO priya_id FROM users WHERE email = 'priya.patel@example.com';
    
    -- Insert sample vehicles for Rahul
    INSERT INTO vehicles (user_id, make, model, year, vehicle_type, fuel_type, registration_number, chassis_number, engine_number, purchase_date, purchase_odometer, current_odometer) VALUES
    (rahul_id, 'Maruti Suzuki', 'Swift', 2020, 'car', 'petrol', 'MH01AB1234', 'MA3ELA56S7C890123', 'G12B567890', '2020-01-15', 0, 45000),
    (rahul_id, 'Honda', 'Activa', 2019, 'scooter', 'petrol', 'MH01CD5678', 'ME4JLA89S1D234567', 'H125A123456', '2019-06-20', 0, 12000)
    ON CONFLICT (registration_number) DO NOTHING;
    
    -- Insert sample vehicles for Priya
    INSERT INTO vehicles (user_id, make, model, year, vehicle_type, fuel_type, registration_number, chassis_number, engine_number, purchase_date, purchase_odometer, current_odometer) VALUES
    (priya_id, 'Hyundai', 'Creta', 2021, 'car', 'diesel', 'MH02EF9012', 'MALAD5678K901234', 'D1FA567890', '2021-03-10', 0, 28000),
    (priya_id, 'Royal Enfield', 'Classic 350', 2022, 'bike', 'petrol', 'MH02GH3456', 'MTE3CD4567E890123', 'UCE3567890', '2022-01-05', 0, 8000)
    ON CONFLICT (registration_number) DO NOTHING;
END $$;

-- Insert sample insurance data
INSERT INTO insurance (vehicle_id, policy_number, insurance_company, policy_type, start_date, expiry_date, premium_amount, is_active) VALUES
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), 'INS123456789', 'ICICI Lombard', 'comprehensive', '2024-01-01', '2025-01-01', 15000.00, true),
((SELECT id FROM vehicles WHERE registration_number = 'MH01CD5678'), 'INS987654321', 'Bajaj Allianz', 'comprehensive', '2024-06-01', '2025-06-01', 3500.00, true),
((SELECT id FROM vehicles WHERE registration_number = 'MH02EF9012'), 'INS456789012', 'HDFC Ergo', 'comprehensive', '2024-02-15', '2025-02-15', 18000.00, true),
((SELECT id FROM vehicles WHERE registration_number = 'MH02GH3456'), 'INS789012345', 'National Insurance', 'comprehensive', '2024-03-20', '2025-03-20', 4500.00, true)
ON CONFLICT (policy_number) DO NOTHING;

-- Insert sample PUC data
INSERT INTO puc (vehicle_id, certificate_number, test_date, expiry_date, testing_center, is_valid) VALUES
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), 'PUC2024001', '2024-01-10', '2025-01-10', 'Maharashtra RTO', true),
((SELECT id FROM vehicles WHERE registration_number = 'MH01CD5678'), 'PUC2024002', '2024-06-15', '2025-06-15', 'Mumbai RTO', true),
((SELECT id FROM vehicles WHERE registration_number = 'MH02EF9012'), 'PUC2024003', '2024-02-20', '2025-02-20', 'Pune RTO', true),
((SELECT id FROM vehicles WHERE registration_number = 'MH02GH3456'), 'PUC2024004', '2024-03-25', '2025-03-25', 'Pimpri-Chinchwad RTO', true)
ON CONFLICT (certificate_number) DO NOTHING;

-- Insert sample service records
INSERT INTO service_records (vehicle_id, service_type, service_center, service_date, odometer_reading, cost, description, next_service_date, next_service_odometer) VALUES
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), 'Regular Service', 'Maruti Suzuki Service Center', '2024-01-15', 42000, 4500.00, 'Oil change, filter replacement, general checkup', '2024-07-15', 52000),
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), 'Tyre Replacement', 'MRF Tyre Service', '2024-03-20', 44000, 12000.00, 'All four tyres replaced', NULL, NULL),
((SELECT id FROM vehicles WHERE registration_number = 'MH01CD5678'), 'Regular Service', 'Honda Service Center', '2024-06-20', 11500, 1200.00, 'Oil change, spark plug replacement', '2024-12-20', 16500),
((SELECT id FROM vehicles WHERE registration_number = 'MH02EF9012'), 'Regular Service', 'Hyundai Service Center', '2024-02-25', 25000, 6500.00, 'Comprehensive service with oil and filter change', '2024-08-25', 35000),
((SELECT id FROM vehicles WHERE registration_number = 'MH02GH3456'), 'First Service', 'Royal Enfield Service Center', '2024-04-10', 7000, 2500.00, 'First free service', '2024-10-10', 12000);

-- Insert sample fuel entries
INSERT INTO fuel_entries (vehicle_id, fuel_date, odometer_reading, fuel_quantity, fuel_price_per_liter, total_cost, fuel_station, fuel_type, mileage_calculated) VALUES
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), '2024-01-01', 40000, 35.50, 105.50, 3745.25, 'HP Petrol Pump, Andheri', 'petrol', NULL),
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), '2024-01-15', 40450, 32.00, 106.00, 3392.00, 'Bharat Petroleum, Bandra', 'petrol', 14.06),
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), '2024-02-01', 40900, 33.50, 104.50, 3500.75, 'Indian Oil, Worli', 'petrol', 13.43),
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), '2024-02-15', 41350, 34.00, 105.00, 3570.00, 'Shell, Dadar', 'petrol', 13.24),
((SELECT id FROM vehicles WHERE registration_number = 'MH01CD5678'), '2024-06-01', 11000, 8.50, 107.00, 909.50, 'HP Petrol Pump, Thane', 'petrol', NULL),
((SELECT id FROM vehicles WHERE registration_number = 'MH01CD5678'), '2024-06-15', 11250, 7.80, 106.50, 830.70, 'Bharat Petroleum, Mulund', 'petrol', 32.05),
((SELECT id FROM vehicles WHERE registration_number = 'MH02EF9012'), '2024-02-01', 24000, 42.00, 95.50, 4011.00, 'Indian Oil, Hinjewadi', 'diesel', NULL),
((SELECT id FROM vehicles WHERE registration_number = 'MH02EF9012'), '2024-02-15', 24500, 38.50, 96.00, 3696.00, 'HP Petrol Pump, Wakad', 'diesel', 12.99),
((SELECT id FROM vehicles WHERE registration_number = 'MH02GH3456'), '2024-03-01', 6500, 12.50, 108.00, 1350.00, 'Shell, Camp', 'petrol', NULL),
((SELECT id FROM vehicles WHERE registration_number = 'MH02GH3456'), '2024-03-15', 6800, 11.80, 107.50, 1268.50, 'Bharat Petroleum, Koregaon Park', 'petrol', 25.42);

-- Insert sample notifications
INSERT INTO notifications (user_id, vehicle_id, notification_type, title, message, is_read, scheduled_date, sent_date) VALUES
((SELECT id FROM users WHERE email = 'rahul.sharma@example.com'), (SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), 'insurance', 'Insurance Renewal Reminder', 'Your vehicle insurance (MH01AB1234) is due for renewal on 2025-01-01. Please renew it before the expiry date.', false, '2024-12-01', NULL),
((SELECT id FROM users WHERE email = 'rahul.sharma@example.com'), (SELECT id FROM vehicles WHERE registration_number = 'MH01CD5678'), 'puc', 'PUC Certificate Expiry', 'Your PUC certificate (MH01CD5678) will expire on 2025-06-15. Please get your vehicle tested before the expiry date.', false, '2025-05-15', NULL),
((SELECT id FROM users WHERE email = 'priya.patel@example.com'), (SELECT id FROM vehicles WHERE registration_number = 'MH02EF9012'), 'service', 'Service Due', 'Your Hyundai Creta is due for service at odometer reading 35000 or on 2024-08-25, whichever comes first.', false, '2024-07-25', NULL),
((SELECT id FROM users WHERE email = 'priya.patel@example.com'), (SELECT id FROM vehicles WHERE registration_number = 'MH02GH3456'), 'general', 'Welcome to AutoSathi', 'Thank you for registering with AutoSathi! Start adding your vehicles to track maintenance and reminders.', true, CURRENT_DATE, CURRENT_TIMESTAMP);

-- Insert sample documents
INSERT INTO documents (vehicle_id, document_type, document_name, file_path, file_size, mime_type, upload_date, expiry_date) VALUES
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), 'insurance', 'Insurance_Policy_MH01AB1234.pdf', '/uploads/documents/insurance/INS123456789.pdf', 2048576, 'application/pdf', '2024-01-01 10:30:00', '2025-01-01'),
((SELECT id FROM vehicles WHERE registration_number = 'MH01AB1234'), 'puc', 'PUC_Certificate_MH01AB1234.pdf', '/uploads/documents/puc/PUC2024001.pdf', 1024000, 'application/pdf', '2024-01-10 14:20:00', '2025-01-10'),
((SELECT id FROM vehicles WHERE registration_number = 'MH02EF9012'), 'registration', 'RC_Book_MH02EF9012.pdf', '/uploads/documents/registration/RC_MH02EF9012.pdf', 3072000, 'application/pdf', '2024-02-15 09:15:00', NULL),
((SELECT id FROM vehicles WHERE registration_number = 'MH02GH3456'), 'service', 'Service_Invoice_MH02GH3456.pdf', '/uploads/documents/service/SVC_MH02GH3456.pdf', 512000, 'application/pdf', '2024-04-10 16:45:00', NULL);

COMMIT;
