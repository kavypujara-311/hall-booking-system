# Hall Booking System - Backend API

## Setup Instructions

### 1. Database Setup
1. Make sure MySQL is installed and running
2. Create the database and tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

### 2. Environment Configuration
Update the `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hall_booking
JWT_SECRET=your_secret_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Halls
- `GET /api/halls` - Get all halls (with filters)
- `GET /api/halls/:id` - Get single hall
- `POST /api/halls` - Create hall (Admin)
- `PUT /api/halls/:id` - Update hall (Admin)
- `DELETE /api/halls/:id` - Delete hall (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

## Server Status
Server runs on: `http://localhost:5000`
API Base URL: `http://localhost:5000/api`
