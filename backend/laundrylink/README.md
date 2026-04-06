# LaundryLink Backend - Spring Boot API

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- PostgreSQL database (Supabase recommended)

### Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual credentials:
   ```env
   DATABASE_URL=jdbc:postgresql://db.YOUR_SUPABASE_HOST.supabase.co:5432/postgres
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=YOUR_ACTUAL_PASSWORD
   JWT_SECRET=YourUniqueSecretKey32CharactersMinimum
   ```

### Step 2: Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### Step 3: Install Dependencies

```bash
./mvnw clean install
```

Or on Windows:
```cmd
mvnw.cmd clean install
```

### Step 4: Run the Application

```bash
./mvnw spring-boot:run
```

Or on Windows:
```cmd
mvnw.cmd spring-boot:run
```

The server will start on `http://localhost:8080`

## API Endpoints

### Health Check
```http
GET http://localhost:8080/api/auth/health
```

### Register
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER"
}
```

Allowed registration roles are `CUSTOMER` and `SHOP_OWNER`. `ADMIN` is reserved and cannot be created through self-registration.

### Login
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

## Response Format

All API responses follow this standard envelope:

```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "timestamp": "2026-03-08T10:30:00Z"
}
```

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan@example.com",
    "password": "SecurePass123",
    "role": "SHOP_OWNER"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePass123"
  }'
```

## Project Structure

```
src/main/java/edu/cit/canete/laundrylink/
├── config/              # Spring configuration classes
│   └── SecurityConfig.java
├── controller/          # REST API controllers
│   └── AuthController.java
├── dto/                 # Data Transfer Objects
│   ├── LoginRequest.java
│   └── RegisterRequest.java
├── entity/              # JPA entities
│   └── User.java
├── repository/          # Spring Data JPA repositories
│   └── UserRepository.java
├── security/            # Security utilities
│   └── JwtUtil.java
└── service/             # Business logic
    └── AuthService.java
```

## Troubleshooting

### Port 8080 already in use
Change the port in `application.properties`:
```properties
server.port=8081
```

### Database connection failed
- Check your Supabase credentials in `.env`
- Verify your database is accessible
- Check firewall/network settings

### JWT errors
- Ensure `JWT_SECRET` is at least 32 characters
- Verify the secret matches between requests

## Security Notes

- Passwords are hashed with BCrypt (12 rounds)
- JWT tokens expire after 24 hours (configurable)
- CORS is configured for frontend origins
- Never commit `.env` file to version control
