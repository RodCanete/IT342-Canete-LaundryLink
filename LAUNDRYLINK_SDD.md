# LaundryLink — System Design Document (Agent Reference)
> Version 2.0 | March 2, 2026 | Cañete, Rod Gabrielle Maluya
> IT342-G2 — System Integration and Architecture | Cebu Institute of Technology – University

---

## 1. PROJECT SUMMARY

**LaundryLink** is a prepaid priority queue management system for laundry shops.  
Customers reserve limited processing slots at partner shops, pay online via PayMongo, and receive a QR-coded booking confirmation.

| Field | Value |
|---|---|
| Domain | Laundry Service / Queue Management |
| Primary Users | Customers (`CUSTOMER` role), Shop Admins (`ADMIN` role) |
| Problem | First-come-first-served queues, manual payments, unpredictable wait times |
| Solution | Prepaid online booking with slot capacity enforcement and PayMongo payment |

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.x, Spring Security, Spring Data JPA, Spring Mail |
| Database | Supabase (hosted PostgreSQL) |
| Authentication | JWT (JJWT library), BCrypt (rounds=12), Google OAuth 2.0 |
| Payment | PayMongo API (Sandbox/Test Mode) |
| Email | JavaMailSender + SMTP (Gmail / SendGrid) |
| External API | Google Maps JavaScript API + Places API + Geocoding API |
| File Storage | Supabase Storage or server filesystem |
| Web Frontend | ReactJS 18, JavaScript, Tailwind CSS, Axios |
| Mobile | Kotlin, Jetpack Compose, Retrofit2 |
| Build Tools | Maven (backend), npm (web), Gradle (Android) |
| Deployment | Railway or Render (backend), Vercel (web), APK sideload (mobile) |

---

## 3. ARCHITECTURE

**Pattern:** Layered (N-Tier) — three-tier: Client → Spring Boot Backend → Supabase PostgreSQL

### Backend Layers (Spring Boot)
```
Security Filter Chain  →  Controller Layer  →  Service Layer  →  Repository Layer  →  Supabase PostgreSQL
                                ↕
                              DTOs
                                ↕
                     Global Exception Handler (@ControllerAdvice)
```

- **Controller Layer** — handles HTTP, validates input, delegates to Service, returns DTOs
- **Service Layer** — all business logic (slot checks, payment webhook, QR generation, email)
- **Repository Layer** — Spring Data JPA repositories
- **DTOs** — used on ALL API inputs/outputs; passwords NEVER exposed in responses
- **Security Config** — Spring Security filter chain, JWT filter, OAuth2 config, RBAC rules
- **Global Exception Handler** — standardized JSON error responses

### External Integrations
- Google OAuth 2.0 (authentication)
- PayMongo (payments)
- SMTP Email (notifications)
- Supabase Storage (file uploads)
- Google Maps Platform (shop discovery)
- QR Code generation library

---

## 4. MAVEN PROJECT CONFIG

```
Group ID:    edu.cit.canete
Artifact ID: laundrylink
Base Package: edu.cit.canete.laundrylink
Spring Boot: 3.5.x
Build Tool:  Maven
Java:        17
```

### Package Structure
```
edu.cit.canete.laundrylink/
├── config/          # SecurityConfig, CorsConfig, AppConfig
├── controller/      # AuthController, BookingController, ShopController, PaymentController, AdminController
├── dto/             # Request/Response DTOs
├── entity/          # JPA entities
├── repository/      # Spring Data JPA interfaces
├── security/        # JwtUtil, JwtFilter, UserDetailsServiceImpl
└── service/         # AuthService, BookingService, PaymentService, EmailService, QrService
```

---

## 5. DATABASE SCHEMA

**Database:** Supabase (PostgreSQL) | All primary keys: UUID

### Table: `users`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| first_name | VARCHAR | NOT NULL |
| last_name | VARCHAR | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | nullable (null for OAuth-only users) |
| role | ENUM('CUSTOMER','ADMIN') | NOT NULL, default 'CUSTOMER' |
| oauth_provider | VARCHAR | nullable |
| oauth_id | VARCHAR | nullable |
| created_at | TIMESTAMP | default now() |

### Table: `shops`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR | NOT NULL |
| address | TEXT | NOT NULL |
| city | VARCHAR | NOT NULL |
| latitude | DECIMAL | |
| longitude | DECIMAL | |
| operating_hours | VARCHAR | |
| created_at | TIMESTAMP | |

### Table: `services`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| shop_id | UUID | FK → shops.id |
| name | VARCHAR | NOT NULL |
| type | ENUM('STANDARD','PRIORITY') | NOT NULL |
| price | DECIMAL | NOT NULL |
| created_at | TIMESTAMP | |

### Table: `slot_configs`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| shop_id | UUID | FK → shops.id |
| service_id | UUID | FK → services.id |
| date | DATE | NOT NULL |
| max_slots | INT | NOT NULL |
| updated_at | TIMESTAMP | |

### Table: `bookings`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| shop_id | UUID | FK → shops.id |
| service_id | UUID | FK → services.id |
| booking_code | VARCHAR | NOT NULL, UNIQUE |
| status | ENUM | NOT NULL — see booking lifecycle below |
| booking_date | DATE | NOT NULL |
| time_slot | TIME | NOT NULL |
| file_url | TEXT | nullable |
| qr_code_url | TEXT | nullable |
| created_at | TIMESTAMP | |

**Booking Status Lifecycle:**
```
PENDING_PAYMENT → PAID → DROPPED_OFF → PROCESSING → COMPLETED
```

### Table: `payments`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| booking_id | UUID | FK → bookings.id |
| payment_intent_id | VARCHAR | UNIQUE |
| amount | DECIMAL | |
| currency | VARCHAR | |
| status | ENUM | |
| paid_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### Table: `refresh_tokens`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| token | TEXT | NOT NULL, UNIQUE |
| expires_at | TIMESTAMP | NOT NULL |
| revoked | BOOLEAN | default false |
| created_at | TIMESTAMP | |

### Entity Relationships
- User → Bookings (1:many)
- User → RefreshTokens (1:many)
- Shop → Services (1:many)
- Shop → SlotConfigs (1:many)
- Service → Bookings (1:many)
- Service → SlotConfigs (1:many)
- Booking → Payment (1:1)

---

## 6. ROLES & ACCESS CONTROL

| Role | Permissions |
|---|---|
| `CUSTOMER` | Register, login, browse shops, create bookings, upload files, view own bookings, pay |
| `ADMIN` | All customer permissions + view all bookings, update booking status, configure slot limits |

- Enforced at API level via Spring Security `@PreAuthorize`
- Enforced at UI level via React route guards and Kotlin navigation guards
- All admin endpoints require `ADMIN` role JWT

---

## 7. SECURITY RULES

- HTTPS for all communications
- Passwords: BCrypt with **salt rounds = 12** — NEVER store plain text
- JWT access tokens (JJWT library) — Bearer token in Authorization header
- No plain-text passwords ever in responses (DTOs enforce this)
- SQL injection prevention: parameterized queries via Spring Data JPA
- XSS protection on all user inputs
- Rate limiting: 100 requests/minute per IP
- DTOs on ALL responses — sensitive fields stripped

### Secrets Management
- All credentials (DB password, JWT secret, PayMongo keys, SMTP password) via **environment variables only**
- Never hardcode secrets in source code
- Use `${ENV_VAR}` placeholders in `application.properties`
- `.env` files are **gitignored** — never committed

---

## 8. API CONTRACT

### Base URL
```
https://[server_hostname]:[port]/api/v1
```

### Standard Response Envelope
```json
{
  "success": boolean,
  "data": object | null,
  "error": { "code": "string", "message": "string", "details": object | null },
  "timestamp": "ISO-8601 string"
}
```

### Authentication Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login with email/password |
| POST | `/api/auth/logout` | JWT | Logout current user |
| GET | `/api/auth/me` | JWT | Get current authenticated user |
| GET | `/api/auth/oauth2/google` | None | Initiate Google OAuth flow |
| GET | `/api/auth/oauth2/callback` | None | Google OAuth callback → returns system JWT |

**POST /api/auth/register — Request:**
```json
{ "email": "string", "password": "string", "firstname": "string", "lastname": "string" }
```
**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "email": "string", "firstname": "string", "lastname": "string" },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**POST /api/auth/login — Request:**
```json
{ "email": "string", "password": "string" }
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "email": "string", "firstname": "string", "lastname": "string", "role": "string" },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Shop Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/shops` | None | List all partner shops |
| GET | `/api/shops/{id}` | None | Shop detail |
| GET | `/api/shops/{id}/services` | None | Shop service tiers |
| GET | `/api/shops/map-data` | None | Coordinates for Google Maps markers |
| GET | `/api/shops/nearby?lat={}&lng={}` | None | Nearby shops via Google Places API |

### Booking Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/slots?shopId={}&serviceId={}&date={}` | JWT | Available time slots |
| POST | `/api/bookings` | JWT (CUSTOMER) | Create booking (status: PENDING_PAYMENT) |
| GET | `/api/bookings/{id}` | JWT | Get booking detail + QR + file URL |
| GET | `/api/bookings/my` | JWT (CUSTOMER) | All bookings for current user |
| POST | `/api/bookings/{id}/upload` | JWT (CUSTOMER) | Upload file (multipart/form-data, max 10MB, image/pdf) |
| GET | `/api/bookings/{id}/file` | JWT | View/download uploaded file |

**POST /api/bookings — Request:**
```json
{ "shopId": "uuid", "serviceId": "uuid", "date": "YYYY-MM-DD", "timeSlot": "HH:MM" }
```

### Payment Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/create-intent` | JWT (CUSTOMER) | Create PayMongo Payment Intent |
| POST | `/api/payments/webhook` | PayMongo sig | Handle PayMongo webhook → update to PAID, generate QR, send email |

### Admin Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/bookings?date={}&shopId={}` | JWT (ADMIN) | All bookings, filterable |
| PATCH | `/api/admin/bookings/{id}/status` | JWT (ADMIN) | Update booking status |
| PUT | `/api/admin/shops/{id}/slot-limit` | JWT (ADMIN) | Set daily Priority slot limit |

**PATCH /api/admin/bookings/{id}/status — Request:**
```json
{ "status": "DROPPED_OFF" | "PROCESSING" | "COMPLETED" }
```

**PUT /api/admin/shops/{id}/slot-limit — Request:**
```json
{ "date": "YYYY-MM-DD", "maxSlots": 10 }
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation failure |
| 401 | Unauthorized / Token expired |
| 403 | Forbidden / Wrong role |
| 404 | Not Found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal Server Error |

### Error Codes

| Code | Message |
|---|---|
| AUTH-001 | Invalid email or password |
| AUTH-002 | JWT token expired |
| AUTH-003 | Admin role required |
| OAUTH-001 | Google OAuth authentication failed |
| SLOT-001 | No available slots for selected date/time |
| SLOT-002 | Daily Priority slot limit reached |
| BOOKING-001 | Booking not found |
| UPLOAD-001 | File type not allowed (image/pdf only) |
| UPLOAD-002 | File size exceeds 10MB |
| PAYMENT-001 | PayMongo Payment Intent creation failed |
| PAYMENT-002 | Webhook signature verification failed |
| MAPS-001 | Google Maps API key invalid or quota exceeded |
| SYSTEM-001 | Internal server error |

---

## 9. FEATURES SPECIFICATION

### Feature 1: User Authentication
- Register with email + password (min 8 chars, BCrypt rounds=12)
- JWT access token returned on register and login
- `/api/auth/me` endpoint returns current user profile
- Duplicate email check on registration

### Feature 2: Google OAuth 2.0
- "Login with Google" on web and mobile
- Backend creates/links user record after OAuth callback
- Backend generates its OWN JWT — not Google's token
- If new user: send welcome email via SMTP

### Feature 3: Role-Based Access Control
- Roles: `CUSTOMER` and `ADMIN`
- Spring Security `@PreAuthorize` on admin endpoints
- React route guards + Kotlin screen navigation guards

### Feature 4: Shop & Service Listing
- List partner shops (3–5 shops, seeded data)
- Each shop has Standard and Priority service tiers
- Google Maps marker for each shop

### Feature 5: Google Maps Integration
- Google Places API — discover nearby laundry shops by user location
- Interactive map with clickable marker pins
- Clicking pin: shop name, address, rating, "Book Now" link
- Backend endpoint: `GET /api/shops/nearby?lat={}&lng={}`

### Feature 6: Booking & Slot Management
- Date picker → time slot selector (capacity enforced)
- System rejects booking when daily Priority slot limit reached
- Booking created with status `PENDING_PAYMENT`

### Feature 7: File Upload
- Optional photo or PDF attached to booking
- Stored in Supabase Storage or server filesystem
- File URL linked to booking record in DB
- Both customer and admin can view/download

### Feature 8: PayMongo Payment (Sandbox)
- Flow: Create Payment Intent → Redirect to PayMongo → Webhook fires → Booking → `PAID` → QR generated
- Validate webhook signature
- Record payment in `payments` table
- Uses real PayMongo test mode keys (no simulation)

### Feature 9: SMTP Email
- **Email 1 (Welcome):** On registration or first OAuth login — contains name + booking link
- **Email 2 (Receipt):** After PayMongo confirms payment — booking ID, shop, date, time, QR image
- Uses JavaMailSender (Spring Boot) — actually delivered to inbox, no console print

### Feature 10: Admin Panel
- View/filter all bookings by date and shop
- Update booking status (DROPPED_OFF → PROCESSING → COMPLETED)
- Set daily Priority slot limit per shop per date
- View/download customer-uploaded files

---

## 10. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Specification |
|---|---|
| API response time | ≤ 2 seconds for 95% of requests |
| Web page load | ≤ 3 seconds on broadband |
| Mobile cold start | ≤ 3 seconds |
| Concurrent users | 100 |
| DB query time | ≤ 500ms |
| Android minimum | API Level 26+ (Android 8.0+) |
| Browsers | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Screen sizes | Mobile 360px+, Tablet 768px+, Desktop 1024px+ |
| Touch targets | Minimum 44×44px on mobile |
| Accessibility | WCAG 2.1 Level AA |

---

## 11. UI/UX DESIGN SYSTEM

| Element | Specification |
|---|---|
| Primary color | `#3B82F6` (sky blue) |
| Secondary | `#0EA5E9` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Typography | Inter font family |
| Spacing | 8px grid system |
| Breakpoints | 640px, 768px, 1024px |

### Web Pages
1. **Homepage / Shop Listing** — Google Map + shop cards with "Book Now"
2. **Login / Register** — email/password + "Continue with Google" button
3. **Shop Detail / Service Selection** — Standard vs Priority tiers, slot count
4. **Booking Flow (4 steps)** — Date picker → Time slot → File upload → Summary
5. **Payment & Confirmation** — PayMongo redirect → QR code display
6. **My Bookings** — status lifecycle badges, QR + file access
7. **Admin Dashboard** — booking table, status update, slot limit config

### Mobile Screens (Kotlin/Jetpack Compose)
- Full feature parity with web
- Bottom navigation: Home | Bookings | Profile (customer) / Bookings | Slots (admin)
- Pull-to-refresh on lists
- QR code cached locally after booking confirmation

### Figma Links
- Web: https://www.figma.com/make/wX7ZCQzbscXzy42h31IzhW/Design-LaundryLink-WebApp
- Mobile: https://www.figma.com/design/JmhObEMFhuAbU0rnudBQI3/LaundryLink_Mobile

---

## 12. SCOPE

### IN SCOPE
- JWT authentication (email/password) + Google OAuth 2.0
- RBAC: CUSTOMER and ADMIN roles
- Shop listing (3–5 partner shops, seeded)
- Standard and Priority service tiers
- Date/time slot booking with real-time capacity enforcement
- File upload (photo/PDF, max 10MB) linked to booking
- Google Maps Platform integration (shop discovery + map markers)
- PayMongo sandbox payment with webhook confirmation
- SMTP email: welcome + booking receipt
- QR code generation for booking confirmation
- Admin panel: booking management + slot limit config
- Kotlin Android app (full feature parity with web)
- Supabase PostgreSQL (7+ tables)

### OUT OF SCOPE
- Delivery / rider logistics
- Real-time GPS tracking
- Reviews and ratings
- In-app messaging
- Loyalty or subscription systems
- Multi-vendor self-registration
- Analytics dashboards, revenue graphs, dynamic pricing

---

## 14. CODING AGENT QUICK REFERENCE

When generating code for this project, always follow these rules:

### Always
- Use `edu.cit.canete.laundrylink` as the base package
- Use UUID as primary key type for all entities
- Use DTOs for all API inputs and outputs — never expose entity directly
- Hash passwords with BCrypt strength 12
- Return the standard response envelope: `{ success, data, error, timestamp }`
- Use `application.properties` with `${ENV_VAR}` placeholders — never hardcode secrets
- Add `@Valid` on all controller request bodies
- Use `snake_case` for database column names, `camelCase` for Java fields — map with `@Column(name="...")`

### Never
- Store plain-text passwords
- Return `password_hash` in any API response
- Hardcode DB credentials, JWT secret, API keys, or SMTP passwords in source code
- Use `ddl-auto=create` or `ddl-auto=update` in production — use `validate`
- Skip webhook signature validation for PayMongo

### File Upload Rules
- Accept only `image/*` and `application/pdf`
- Max file size: 10MB
- Store in Supabase Storage, save URL in `bookings.file_url`

### Booking Status Rules
- New booking always starts as `PENDING_PAYMENT`
- Only PayMongo webhook can transition to `PAID`
- Only ADMIN can transition: `PAID → DROPPED_OFF → PROCESSING → COMPLETED`
- Enforce daily slot limit before creating any PRIORITY booking

### JWT Rules
- After Google OAuth: generate your OWN JWT — do not pass Google's token to client
- Include `email` as subject and `role` as claim
- Validate token on every protected request via JWT filter
