-- Create database
DROP DATABASE IF EXISTS hall_booking;
CREATE DATABASE hall_booking;
USE hall_booking;

-- Users table with Google OAuth and Phone support
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    phone_verified BOOLEAN DEFAULT false,
    role ENUM('user', 'admin') DEFAULT 'user',
    membership_tier ENUM('classic', 'silver', 'gold', 'platinum') DEFAULT 'classic',
    concierge_status ENUM('none', 'requested', 'connected') DEFAULT 'none',
    profile_image VARCHAR(500),
    
    -- User profile fields
    location VARCHAR(255),
    bio TEXT,
    social_links JSON,
    
    -- Google OAuth fields
    google_id VARCHAR(255) UNIQUE,
    auth_provider ENUM('local', 'google', 'phone') DEFAULT 'local',
    
    -- Phone OTP fields
    otp_code VARCHAR(6),
    otp_expires_at DATETIME,
    otp_verified BOOLEAN DEFAULT false,
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_google_id (google_id),
    INDEX idx_role (role),
    INDEX idx_auth_provider (auth_provider)
);

-- Halls table
CREATE TABLE IF NOT EXISTS halls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    price_per_hour DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    image_url TEXT,
    images JSON,
    amenities JSON,
    type VARCHAR(100) DEFAULT 'Banquet Hall',
    rating DECIMAL(3, 2) DEFAULT 4.5,
    total_reviews INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_city (city),
    INDEX idx_price (price_per_hour),
    INDEX idx_capacity (capacity),
    INDEX idx_rating (rating)
);

-- Bookings table with payment method support
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    hall_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hours INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    guests INT,
    event_type VARCHAR(100),
    special_requests TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    addons JSON,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('Card', 'UPI', 'Cash') DEFAULT 'Card',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_hall (hall_id),
    INDEX idx_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    hall_id INT NOT NULL,
    booking_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_hall (hall_id),
    INDEX idx_rating (rating)
);

-- Favorites/Wishlist table
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    hall_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, hall_id),
    INDEX idx_user (user_id)
);

-- OTP Logs table (for tracking OTP attempts)
CREATE TABLE IF NOT EXISTS otp_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose ENUM('registration', 'login', 'verification') DEFAULT 'login',
    status ENUM('sent', 'verified', 'expired', 'failed') DEFAULT 'sent',
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME NULL,
    expires_at DATETIME NULL,
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);

-- Payment Methods table (for storing user's cards and UPI)
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    method_type ENUM('Card', 'UPI') NOT NULL,
    
    -- Card details (encrypted in production)
    card_number VARCHAR(20),
    card_holder_name VARCHAR(255),
    card_expiry VARCHAR(7),
    card_type VARCHAR(20),
    
    -- UPI details
    upi_id VARCHAR(255),
    
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (method_type)
);

-- User Activity Logs table (for Recent Activity section)
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_type ENUM('login', 'profile_update', 'booking_created', 'booking_cancelled', 'payment_added', 'password_changed', 'photo_uploaded') NOT NULL,
    activity_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (activity_type),
    INDEX idx_created (created_at)
);

-- Membership Requests table (Guest Priority List)
CREATE TABLE IF NOT EXISTS membership_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    preferred_location VARCHAR(255),
    message TEXT,
    tier ENUM('silver', 'gold', 'platinum') DEFAULT 'silver',
    status ENUM('pending', 'approved', 'rejected', 'contacted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users will be inserted via seed.js to ensure valid BCrypt hashes

-- Insert Halls (Original + New Premium Halls)
INSERT INTO halls (name, location, city, state, price_per_hour, capacity, description, image_url, images, amenities, type, rating, total_reviews) VALUES
-- Original 10
(
    'The Imperial Grand Palace',
    'Taj Lake Palace Road, Udaipur',
    'Udaipur',
    'Rajasthan',
    150000,
    1200,
    'A 19th-century royal residence turned exclusive event venue. Featuring hand-painted frescoes, crystal chandeliers from Belgium, and a floating marble courtyard. Perfect for royal weddings and summits.',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600',
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1600',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600'
    ),
    JSON_ARRAY('Helipad Access', 'Royal Butler Service', 'Lake View', 'Heritage Rooms'),
    'Palace',
    5.0,
    342
),
(
    'Skyline Glass Penthouse',
    'Worli Sea Face, Mumbai',
    'Mumbai',
    'Maharashtra',
    85000,
    150,
    'Hovering 60 floors above the Arabian Sea, this all-glass penthouse offers 360-degree views of the Mumbai skyline. Minimalist black-marble interiors designed for elite cocktail parties and product launches.',
    'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfe1?q=80&w=1600',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600'
    ),
    JSON_ARRAY('Private Elevator', 'Infinity Pool', 'Michelin Chef Kitchen', 'Soundproof'),
    'Penthouse',
    4.9,
    128
),
(
    'The Velvet Lounge & Ballroom',
    'Indiranagar, Bangalore',
    'Bangalore',
    'Karnataka',
    45000,
    500,
    'A masterpiece of Art Deco design. Dark velvet drapes, gold-leaf ceilings, and a dedicated jazz stage make this the most atmospheric venue for receptions and galas.',
    'https://images.unsplash.com/photo-1514395465013-2dc0ad8b9432?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1514395465013-2dc0ad8b9432?q=80&w=1600',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1600'
    ),
    JSON_ARRAY('Steinway Piano', 'Valet Parking', 'Cigar Lounge', 'Ambient Lighting'),
    'Ballroom',
    4.8,
    215
),
(
    'Eden Botanical Conservatory',
    'Mehrauli, New Delhi',
    'New Delhi',
    'Delhi',
    60000,
    400,
    'Celebrate amidst nature in this climate-controlled glass conservatory. Surrounded by acres of heritage forests and manicured English gardens.',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600',
        'https://images.unsplash.com/photo-1587271407850-8d438913d2c1?q=80&w=1600'
    ),
    JSON_ARRAY('Climate Control', 'Bridal Suite', 'Golf Cart Service', 'Organic Catering'),
    'Garden',
    4.7,
    189
),
(
    'Azure Coastal Pavilion',
    'ECR, Chennai',
    'Chennai',
    'Tamil Nadu',
    55000,
    300,
    'Where the ocean meets luxury. Majestic teak wood pillars support a soaring roof right on the beach, offering an open-air experience with total privacy.',
    'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=1600',
        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600'
    ),
    JSON_ARRAY('Private Beach', 'Fireworks Permit', 'Luxury Tents', 'Seafood Bar'),
    'Pavilion',
    4.9,
    156
),
(
    'Noir Corporate Heights',
    'Hitech City, Hyderabad',
    'Hyderabad',
    'Telangana',
    35000,
    200,
    'Sleek, intimidating, and impressive. This all-black corporate venue features smart glass walls, holographic projection capability, and ergonomic Herman Miller seating.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1600'
    ),
    JSON_ARRAY('Telepresence', 'AI Concierge', 'Espresso Bar', 'Biometric Entry'),
    'Corporate',
    4.6,
    98
),
(
    'The Crystal Atrium',
    'Connaught Place, New Delhi',
    'New Delhi',
    'Delhi',
    75000,
    600,
    'A stunning glass and steel structure with a retractable roof. Natural light floods the space during the day, while at night, programmable LED lighting creates a magical ambiance.',
    'https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?q=80&w=1600',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600'
    ),
    JSON_ARRAY('Retractable Roof', 'LED Lighting', 'Premium Sound System', 'VIP Lounge'),
    'Atrium',
    4.8,
    267
),
(
    'Royal Heritage Haveli',
    'Old City, Jaipur',
    'Jaipur',
    'Rajasthan',
    95000,
    800,
    'A 200-year-old restored haveli featuring traditional Rajasthani architecture, intricate mirror work, and sprawling courtyards. Experience royal hospitality at its finest.',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600'
    ),
    JSON_ARRAY('Traditional Decor', 'Elephant Entry', 'Folk Performers', 'Rajasthani Cuisine'),
    'Haveli',
    5.0,
    412
),
(
    'Seaside Sunset Terrace',
    'Baga Beach, Goa',
    'Goa',
    'Goa',
    40000,
    250,
    'An open-air terrace overlooking the Arabian Sea. Perfect for beach weddings and sunset parties with the sound of waves as your soundtrack.',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600',
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1600'
    ),
    JSON_ARRAY('Ocean View', 'Beach Access', 'Bonfire Setup', 'Live Music Stage'),
    'Terrace',
    4.7,
    198
),
(
    'Metropolitan Convention Center',
    'MG Road, Bangalore',
    'Bangalore',
    'Karnataka',
    50000,
    1000,
    'A state-of-the-art convention center with modular spaces, advanced AV equipment, and simultaneous translation facilities. Ideal for conferences and large corporate events.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600'
    ),
    JSON_ARRAY('Modular Spaces', 'AV Equipment', 'Translation Booths', 'High-Speed WiFi'),
    'Convention Center',
    4.6,
    324
),
-- New Premium Halls
(
    'The Royal Jaipur Palace',
    'Bhawani Singh Road, Jaipur',
    'Jaipur',
    'Rajasthan',
    120000,
    1500,
    'Experience the grandeur of Rajput royalty. This 18th-century palace features sprawling frantic gardens, peacocks, and hand-carved marble interiors. The definitive venue for a royal destination wedding.',
    'https://images.unsplash.com/photo-1599661046289-e3189781280c?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1599661046289-e3189781280c?q=80&w=1600',
        'https://images.unsplash.com/photo-1605218427339-a9a7b9735d4f?q=80&w=1600',
        'https://images.unsplash.com/photo-1590059530493-272da604085e?q=80&w=1600'
    ),
    JSON_ARRAY('Helipad', 'Horse Carriage', 'Vintage Cars', 'Royal Suite', 'Sabyasachi Decor'),
    'Palace',
    5.0,
    450
),
(
    'Himalayan Cloud Resort',
    'Chharabra, Shimla',
    'Shimla',
    'Himachal Pradesh',
    65000,
    300,
    'Perched 8,000 feet above sea level, offering panoramic views of the snow-capped Himalayas. A fairy-tale castle in the clouds with heated outdoor pools and cedar forests.',
    'https://images.unsplash.com/photo-1566679056015-1efacbd1c145?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1566679056015-1efacbd1c145?q=80&w=1600',
        'https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?q=80&w=1600',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600'
    ),
    JSON_ARRAY('Heated Pool', 'Spa', 'Bonfire', 'Mountain View', 'Skiing'),
    'Resort',
    4.8,
    180
),
(
    'Grand Chola Imperial',
    'Guindy, Chennai',
    'Chennai',
    'Tamil Nadu',
    80000,
    2000,
    'A tribute to the Chola dynasty. This architectural marvel features massive granite columns, grand staircases, and one of the largest pillar-less ballrooms in the country.',
    'https://images.unsplash.com/photo-1578165608772-205562725515?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1578165608772-205562725515?q=80&w=1600',
        'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1600'
    ),
    JSON_ARRAY('Largest Ballroom', '7 Restaurants', 'Spa', 'Valet', 'Helipad'),
    'Hotel',
    4.7,
    320
),
(
    'Backwater Lagoon Villa',
    'Kumarakom, Kerala',
    'Kumarakom',
    'Kerala',
    55000,
    150,
    'Situated on the banks of Vembanad Lake. Traditional Kerala architecture with private pools, houseboat cruises, and Ayurvedic spa treatments.',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1600',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600'
    ),
    JSON_ARRAY('Houseboat', 'Ayurveda', 'Private Pool', 'Seafood', 'Fishing'),
    'Villa',
    4.9,
    210
),
(
    'The Glasshouse on the Ganges',
    'Rishikesh, Uttarakhand',
    'Rishikesh',
    'Uttarakhand',
    40000,
    100,
    'A spiritual yet luxurious retreat right on the banks of the Ganges. Features a private sand beach, mango orchard, and Zen gardens.',
    'https://images.unsplash.com/photo-1549488497-29cb6ba25952?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1549488497-29cb6ba25952?q=80&w=1600',
        'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1600'
    ),
    JSON_ARRAY('Private Beach', 'Yoga Hall', 'Organic Food', 'River Rafting'),
    'Resort',
    4.6,
    140
),
(
    'Midnight Sky Deck',
    'UB City, Bangalore',
    'Bangalore',
    'Karnataka',
    60000,
    250,
    'Uber-luxury rooftop lounge with 360-degree views of Bangalore. Known for its climate-controlled biodomes and celebrity DJ events.',
    'https://images.unsplash.com/photo-1570701255554-47dd1084b2e8?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1570701255554-47dd1084b2e8?q=80&w=1600',
        'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=1600'
    ),
    JSON_ARRAY('Rooftop', 'DJ Deck', 'Mixology Bar', 'VIP Pods'),
    'Lounge',
    4.8,
    350
),
(
    'The Colonial Verandah',
    'Fort Kochi, Kerala',
    'Kochi',
    'Kerala',
    30000,
    120,
    'Restored Dutch colonial mansion with teak floors, high ceilings, and an open courtyard. Steeped in history and charm.',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600',
        'https://images.unsplash.com/photo-1493612276216-9c5901955d43?q=80&w=1600'
    ),
    JSON_ARRAY('Art Gallery', 'Seafood', 'Live Jazz', 'Heritage Tour'),
    'Heritage',
    4.7,
    190
),
(
    'Desert Mirage Camp',
    'Sam Sand Dunes, Jaisalmer',
    'Jaisalmer',
    'Rajasthan',
    45000,
    300,
    'Luxury air-conditioned tents in the middle of the Thar Desert. Night safaris, folk dances under the stars, and royal Rajasthani feasts.',
    'https://images.unsplash.com/photo-1533630764723-380af623ba92?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1533630764723-380af623ba92?q=80&w=1600',
        'https://images.unsplash.com/photo-1504280506541-aca1cd620fd0?q=80&w=1600'
    ),
    JSON_ARRAY('Luxury Tents', 'Camel Safari', 'Folk Music', 'Bonfire'),
    'Camp',
    4.8,
    280
),
(
    'Sapphire Coast Beach Club',
    'Candolim, Goa',
    'Goa',
    'Goa',
    50000,
    400,
    'Elite beach club with white cabanas, infinity pool merging with the ocean, and international DJs. The ultimate party destination.',
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1600',
        'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1600'
    ),
    JSON_ARRAY('Private Beach', 'Infinity Pool', 'Cabanas', 'Sushi Bar'),
    'Club',
    4.9,
    500
),
(
    'Vinery Estate & Manor',
    'Nandi Hills, Bangalore',
    'Bangalore',
    'Karnataka',
    45000,
    200,
    'Tuscan-styled vineyard estate. Host wine-tasting events or intimate weddings amidst acres of grapevines and rolling hills.',
    'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1600',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1600',
        'https://images.unsplash.com/photo-1524177420935-7c08ca1df5c3?q=80&w=1600'
    ),
    JSON_ARRAY('Vineyard', 'Wine Tasting', 'Italian Cuisine', 'Stay Heritage'),
    'Estate',
    4.8,
    160
);

-- Data for bookings, payment_methods, and activity logs will be seeded via seed.js to ensure User Foreign Keys exist first.
