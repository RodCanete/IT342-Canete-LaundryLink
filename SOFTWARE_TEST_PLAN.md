# LaundryLink System — Software Test Plan

**Document Version:** 1.1  
**Date:** 2026-05-09  
**Author:** Rod Gabrielle Cañete  
**System:** LaundryLink — Multi-Platform Laundry Booking System  
**Platforms Covered:** Backend (Spring Boot REST API), Web Frontend (React + Vite), Mobile (Android Kotlin)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-09 | Initial test plan |
| 1.1 | 2026-05-09 | Added FR-21 (GET /api/auth/me); updated FR-20 with welcome email + booking confirmation email via `EmailService`; corrected auth response shape (`accessToken` + nested `user`); added `GlobalExceptionHandler` validation error tests; added TC-03-02a (Google OAuth welcome email); updated automated test samples to reflect current API shape |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Scope](#2-scope)
3. [Test Strategy](#3-test-strategy)
4. [Test Environment](#4-test-environment)
5. [Functional Requirements Coverage Matrix](#5-functional-requirements-coverage-matrix)
6. [Test Cases](#6-test-cases)
   - [FR-01 — User Registration](#fr-01--user-registration)
   - [FR-02 — User Login (Email/Password)](#fr-02--user-login-emailpassword)
   - [FR-03 — Google OAuth Login](#fr-03--google-oauth-login)
   - [FR-04 — Role-Based Access Control](#fr-04--role-based-access-control)
   - [FR-05 — Shop Discovery & Listing](#fr-05--shop-discovery--listing)
   - [FR-06 — Shop Detail View](#fr-06--shop-detail-view)
   - [FR-07 — Slot Availability Query](#fr-07--slot-availability-query)
   - [FR-08 — Booking Creation](#fr-08--booking-creation)
   - [FR-09 — Payment Processing (PayMongo)](#fr-09--payment-processing-paymongo)
   - [FR-10 — QR Code Generation](#fr-10--qr-code-generation)
   - [FR-11 — Booking Status Lifecycle](#fr-11--booking-status-lifecycle)
   - [FR-12 — Customer Booking History](#fr-12--customer-booking-history)
   - [FR-13 — Shop Owner — Shop Management](#fr-13--shop-owner--shop-management)
   - [FR-14 — Shop Owner — Service Management](#fr-14--shop-owner--service-management)
   - [FR-15 — Shop Owner — Schedule / Slot Configuration](#fr-15--shop-owner--schedule--slot-configuration)
   - [FR-16 — Shop Owner — Booking Dashboard](#fr-16--shop-owner--booking-dashboard)
   - [FR-17 — Admin — Global Booking Dashboard](#fr-17--admin--global-booking-dashboard)
   - [FR-18 — Admin — Daily Priority Slot Limit Management](#fr-18--admin--daily-priority-slot-limit-management)
   - [FR-19 — File Upload / Attachment](#fr-19--file-upload--attachment)
   - [FR-20 — Email Notifications](#fr-20--email-notifications)
   - [FR-21 — Current User Profile (GET /api/auth/me)](#fr-21--current-user-profile-get-apiauthme)
7. [Test Scripts / Step-by-Step Procedures](#7-test-scripts--step-by-step-procedures)
8. [Automated Test Cases](#8-automated-test-cases)
   - [Backend — JUnit 5 + Mockito](#backend--junit-5--mockito)
   - [Frontend — Vitest + React Testing Library](#frontend--vitest--react-testing-library)
   - [API Integration — REST Assured](#api-integration--rest-assured)
   - [Mobile — Espresso (Android)](#mobile--espresso-android)
9. [Non-Functional Test Areas](#9-non-functional-test-areas)
10. [Test Execution Schedule](#10-test-execution-schedule)
11. [Entry & Exit Criteria](#11-entry--exit-criteria)
12. [Defect Management](#12-defect-management)

---

## 1. Introduction

### 1.1 Purpose

This Software Test Plan (STP) defines the testing strategy, scope, test cases, test scripts, and automated test specifications for the **LaundryLink** system — a multi-platform laundry booking application. The goal is to verify that all implemented functional requirements behave correctly across the backend API, web frontend, and Android mobile app.

### 1.2 System Overview

LaundryLink is a three-tier system:

| Tier | Technology | Role |
|------|-----------|------|
| **Backend** | Java 17, Spring Boot 3.5, PostgreSQL (Supabase) | REST API, business logic, auth, data persistence |
| **Web Frontend** | React 19, TypeScript, Vite, TailwindCSS | Customer-facing SPA + Admin/Owner portals |
| **Mobile** | Android Kotlin, Retrofit2, MVVM | Customer-facing mobile app |

### 1.3 Auth Response Shape (v1.1)

As of the current implementation, all auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/google`) return:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "<uuid>",
    "email": "user@example.com",
    "firstName": "Rod",
    "lastName": "Cañete",
    "role": "CUSTOMER"
  }
}
```

Test cases in this document use `accessToken` and the nested `user` object accordingly.

### 1.4 References

- `SDD_LaundryLinkSystem_Cañete.pdf` — System Design Document
- `db/seed_demo.sql` — Demo database seed
- `application.properties` — Environment configuration

---

## 2. Scope

### 2.1 In Scope

| Area | What Is Tested |
|------|----------------|
| Authentication | Registration, login, JWT, Google OAuth |
| Authorization | Role enforcement (CUSTOMER, SHOP_OWNER, ADMIN) |
| Current User Profile | GET /api/auth/me endpoint |
| Shop Features | Listing, detail view, map display |
| Booking Flow | Slot availability, booking creation, capacity enforcement |
| Payments | PayMongo intent creation, webhook confirmation |
| QR Codes | Generation, download, format correctness |
| Status Lifecycle | PAID → DROPPED_OFF → PROCESSING → COMPLETED |
| Owner Portal | Shop/service/slot CRUD, booking management |
| Admin Portal | Global dashboard, priority slot limits |
| File Uploads | Attachment via Supabase Storage |
| Email Notifications | Welcome email on registration, booking confirmation email on payment |
| Mobile App | Auth, shop browsing, booking flow |
| Security | JWT validation, unauthorized access rejection |
| Input Validation | Required fields, format checks, boundary values (via GlobalExceptionHandler) |
| Global Exception Handling | Centralized validation error formatting |

### 2.2 Out of Scope

- Infrastructure / DevOps pipeline
- Supabase internal database performance tuning
- PayMongo internal payment gateway processing
- Google Maps API accuracy

---

## 3. Test Strategy

### 3.1 Testing Levels

```
┌──────────────────────────────────────────┐
│         End-to-End / UI Tests            │  Cypress (web), Espresso (mobile)
├──────────────────────────────────────────┤
│         Integration Tests                │  REST Assured, Spring Boot Test
├──────────────────────────────────────────┤
│         Unit Tests                       │  JUnit 5 + Mockito (BE), Vitest (FE)
└──────────────────────────────────────────┘
```

### 3.2 Test Types

| Type | Tool | Target |
|------|------|--------|
| Unit | JUnit 5, Mockito | Services, Utilities (BE) |
| Unit | Vitest, React Testing Library | Components, Hooks (FE) |
| Integration | Spring Boot Test, REST Assured | API endpoints |
| End-to-End | Cypress | Web user flows |
| Instrumentation | Espresso | Android UI flows |
| Security | Manual + OWASP checks | Auth, JWT, RBAC |
| Exploratory | Manual | Edge cases, UX |

### 3.3 Test Prioritization

| Priority | Criteria |
|----------|---------|
| **P1 — Critical** | Auth, booking creation, payment, RBAC enforcement |
| **P2 — High** | Status lifecycle, slot capacity, owner/admin portals |
| **P3 — Medium** | QR codes, file upload, email notifications |
| **P4 — Low** | UI polish, map display accuracy |

---

## 4. Test Environment

### 4.1 Backend Test Environment

| Item | Value |
|------|-------|
| JDK | Java 17 |
| Framework | Spring Boot 3.5 Test slice (`@SpringBootTest`) |
| Database | H2 in-memory (unit) / Supabase test instance (integration) |
| Mock Layer | Mockito 5.x |
| Assert Library | AssertJ |
| Test Runner | Maven Surefire Plugin |

### 4.2 Frontend Test Environment

| Item | Value |
|------|-------|
| Runtime | Node.js 20+ |
| Test Framework | Vitest |
| Component Testing | React Testing Library |
| Mocking | MSW (Mock Service Worker) for API mocks |
| Browser | jsdom (unit), Playwright/Chromium (E2E) |

### 4.3 Mobile Test Environment

| Item | Value |
|------|-------|
| Device | Android Emulator API 26+ |
| Framework | Espresso, JUnit4 |
| Mock Server | MockWebServer (OkHttp) |

### 4.4 Environment Variables Required

```
SPRING_DATASOURCE_URL      - PostgreSQL connection string
JWT_SECRET                 - JWT signing secret (min 256-bit)
GOOGLE_CLIENT_ID           - Google OAuth client ID
PAYMONGO_SECRET_KEY        - PayMongo secret key
PAYMONGO_WEBHOOK_SECRET    - PayMongo webhook signing secret
SUPABASE_URL               - Supabase project URL
SUPABASE_SERVICE_KEY       - Supabase service role key
MAIL_USERNAME / MAIL_PASSWORD - SMTP credentials
APP_MAIL_FROM              - From address for outgoing emails
APP_FRONTEND_URL           - Frontend base URL used in email links
```

---

## 5. Functional Requirements Coverage Matrix

| Req ID | Feature | Unit | Integration | E2E | Priority |
|--------|---------|:----:|:-----------:|:---:|:--------:|
| FR-01 | User Registration | ✓ | ✓ | ✓ | P1 |
| FR-02 | Email/Password Login | ✓ | ✓ | ✓ | P1 |
| FR-03 | Google OAuth Login | ✓ | ✓ | ✓ | P1 |
| FR-04 | Role-Based Access Control | ✓ | ✓ | ✓ | P1 |
| FR-05 | Shop Discovery & Listing | ✓ | ✓ | ✓ | P2 |
| FR-06 | Shop Detail View | ✓ | ✓ | ✓ | P2 |
| FR-07 | Slot Availability Query | ✓ | ✓ | ✓ | P1 |
| FR-08 | Booking Creation | ✓ | ✓ | ✓ | P1 |
| FR-09 | Payment Processing | ✓ | ✓ | — | P1 |
| FR-10 | QR Code Generation | ✓ | ✓ | ✓ | P2 |
| FR-11 | Booking Status Lifecycle | ✓ | ✓ | ✓ | P1 |
| FR-12 | Customer Booking History | ✓ | ✓ | ✓ | P2 |
| FR-13 | Owner Shop Management | ✓ | ✓ | ✓ | P2 |
| FR-14 | Owner Service Management | ✓ | ✓ | ✓ | P2 |
| FR-15 | Owner Slot Configuration | ✓ | ✓ | ✓ | P2 |
| FR-16 | Owner Booking Dashboard | ✓ | ✓ | ✓ | P2 |
| FR-17 | Admin Global Dashboard | ✓ | ✓ | ✓ | P2 |
| FR-18 | Admin Priority Slot Limits | ✓ | ✓ | ✓ | P2 |
| FR-19 | File Upload / Attachment | — | ✓ | ✓ | P3 |
| FR-20 | Email Notifications | ✓ | ✓ | — | P3 |
| FR-21 | Current User Profile (GET /me) | ✓ | ✓ | ✓ | P2 |

---

## 6. Test Cases

> **Legend:**  
> **TC-ID** — Unique test case identifier  
> **Pre** — Preconditions  
> **Steps** — Numbered action steps  
> **Expected** — Expected outcome  
> **Type** — Unit (U) / Integration (I) / E2E (E) / Manual (M)

---

### FR-01 — User Registration

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-01-01 | Register with valid credentials | I | P1 |
| TC-01-02 | Register with duplicate email | I | P1 |
| TC-01-03 | Register with missing required fields | I | P1 |
| TC-01-04 | Register with invalid email format | I | P1 |
| TC-01-05 | Password stored as BCrypt hash (not plaintext) | U | P1 |
| TC-01-06 | Registered user has CUSTOMER role by default | I | P1 |
| TC-01-07 | Register response contains accessToken and nested user object | I | P1 |
| TC-01-08 | Welcome email sent on successful registration | U | P3 |
| TC-01-09 | Admin role cannot be set through registration | I | P1 |

**TC-01-01: Register with valid credentials**
- **Pre:** Clean database, no existing user with `test@example.com`
- **Input:** `{ "email": "test@example.com", "password": "SecurePass123!", "firstName": "Test", "lastName": "User" }`
- **Steps:**
  1. POST `/api/auth/register` with the payload above
- **Expected:** HTTP 201, response body contains `{ "accessToken": "<jwt>", "user": { "email": "test@example.com", "role": "CUSTOMER" } }`, user record created in DB

**TC-01-02: Register with duplicate email**
- **Pre:** User with `test@example.com` already exists
- **Input:** Same payload as TC-01-01
- **Steps:**
  1. POST `/api/auth/register` with duplicate email
- **Expected:** HTTP 409 Conflict, error code `AUTH-409`, no second user record created

**TC-01-03: Register with missing required fields**
- **Input:** `{ "email": "", "password": "", "firstName": "" }`
- **Expected:** HTTP 400 Bad Request, `GlobalExceptionHandler` returns validation errors listed per field (e.g., `"firstName: must not be blank"`)

**TC-01-04: Register with invalid email format**
- **Input:** `{ "email": "not-an-email", "password": "pass", "firstName": "X" }`
- **Expected:** HTTP 400 Bad Request, email format validation error

**TC-01-05: Password stored as BCrypt hash**
- **Pre:** Register a user via TC-01-01
- **Steps:**
  1. Query DB: `SELECT password_hash FROM users WHERE email = 'test@example.com'`
- **Expected:** Password field starts with `$2a$` (BCrypt prefix), plaintext password is not stored

**TC-01-06: Default role is CUSTOMER**
- **Pre:** Register via TC-01-01
- **Steps:**
  1. Query DB: `SELECT role FROM users WHERE email = 'test@example.com'`
- **Expected:** Role = `CUSTOMER`

**TC-01-07: Response contains accessToken and nested user**
- **Pre:** Register via TC-01-01
- **Expected:** Response JSON has top-level `accessToken` (JWT string) and `user` object containing `id`, `email`, `firstName`, `lastName`, `role`

**TC-01-08: Welcome email sent on registration**
- **Pre:** Mock `JavaMailSender`
- **Steps:**
  1. POST `/api/auth/register` with valid payload
  2. Verify mock mail sender was called
- **Expected:** `EmailService.sendWelcomeEmail()` invoked with the new user's email and first name; subject = "Welcome to LaundryLink!"

**TC-01-09: Admin registration blocked**
- **Input:** `{ ..., "role": "ADMIN" }`
- **Expected:** HTTP 409 or HTTP 400, user not created as ADMIN

---

### FR-02 — User Login (Email/Password)

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-02-01 | Login with correct credentials | I | P1 |
| TC-02-02 | Login with wrong password | I | P1 |
| TC-02-03 | Login with non-existent email | I | P1 |
| TC-02-04 | JWT token is valid and contains correct claims | U | P1 |
| TC-02-05 | Expired JWT is rejected | U | P1 |
| TC-02-06 | Tampered JWT is rejected | U | P1 |
| TC-02-07 | Login response contains accessToken and nested user object | I | P1 |

**TC-02-01: Login with correct credentials**
- **Pre:** User registered with `user@example.com` / `SecurePass123!`
- **Input:** `{ "email": "user@example.com", "password": "SecurePass123!" }`
- **Steps:**
  1. POST `/api/auth/login`
- **Expected:** HTTP 200, response contains `accessToken` (JWT string) and `user.role`

**TC-02-02: Login with wrong password**
- **Input:** `{ "email": "user@example.com", "password": "WrongPass" }`
- **Expected:** HTTP 401 Unauthorized, error code `AUTH-001`, no token returned

**TC-02-03: Login with non-existent email**
- **Input:** `{ "email": "nobody@example.com", "password": "anything" }`
- **Expected:** HTTP 401 Unauthorized

**TC-02-04: JWT contains correct claims**
- **Pre:** Perform login as TC-02-01
- **Steps:**
  1. Decode the returned JWT (base64 decode the payload section)
- **Expected:** Payload contains `sub` (email), `role`, `exp` (future timestamp)

**TC-02-05: Expired JWT is rejected**
- **Steps:**
  1. Create a JWT with `exp` set to a past timestamp
  2. GET `/api/bookings` with `Authorization: Bearer <expired_token>`
- **Expected:** HTTP 401 Unauthorized

**TC-02-06: Tampered JWT is rejected**
- **Steps:**
  1. Take a valid JWT and modify one character in the signature
  2. Use tampered token on any authenticated endpoint
- **Expected:** HTTP 401 Unauthorized

**TC-02-07: Login response shape**
- **Steps:**
  1. POST `/api/auth/login` with valid credentials
  2. Inspect response body
- **Expected:** Top-level `accessToken` field present; nested `user` object with `id`, `email`, `firstName`, `lastName`, `role`

---

### FR-03 — Google OAuth Login

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-03-01 | Successful Google OAuth token verification | U | P1 |
| TC-03-02 | New Google user created with CUSTOMER role | I | P1 |
| TC-03-02a | Welcome email sent when new Google user is created | U | P3 |
| TC-03-03 | Existing Google user returns existing account | I | P1 |
| TC-03-04 | Invalid Google ID token rejected | I | P1 |
| TC-03-05 | Empty Google ID token returns 400 | I | P1 |

**TC-03-01: Successful Google OAuth token verification**
- **Pre:** Mock `GoogleTokenVerifier` to return a valid `GoogleOAuthProfile`
- **Input:** `{ "idToken": "<mock_valid_token>" }`
- **Steps:**
  1. POST `/api/auth/google`
- **Expected:** HTTP 200, `accessToken` returned, `user.role = "CUSTOMER"`

**TC-03-02: New Google user created**
- **Pre:** No user with the Google email exists
- **Steps:**
  1. POST `/api/auth/google` with new Google profile
- **Expected:** New user record created in DB with `oauth_id` set, role = `CUSTOMER`

**TC-03-02a: Welcome email sent on new Google registration**
- **Pre:** Mock `JavaMailSender`; no existing user with Google email
- **Steps:**
  1. POST `/api/auth/google` with new Google profile
  2. Verify mock mail sender called
- **Expected:** `EmailService.sendWelcomeEmail()` invoked with the Google account email and first name

**TC-03-03: Existing Google user returns existing account**
- **Pre:** User already linked with the same `oauth_id` exists
- **Steps:**
  1. POST `/api/auth/google` with same Google token
- **Expected:** No duplicate user created, existing user's `accessToken` returned

**TC-03-04: Invalid Google ID token rejected**
- **Pre:** Mock verifier throws `GeneralSecurityException`
- **Steps:**
  1. POST `/api/auth/google` with invalid token
- **Expected:** HTTP 401 Unauthorized

**TC-03-05: Empty Google ID token returns 400**
- **Input:** `{ "idToken": "" }`
- **Expected:** HTTP 400 Bad Request, error code `AUTH-400`

---

### FR-04 — Role-Based Access Control

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-04-01 | Unauthenticated request rejected on protected endpoints | I | P1 |
| TC-04-02 | CUSTOMER cannot access `/api/owner/**` endpoints | I | P1 |
| TC-04-03 | CUSTOMER cannot access `/api/admin/**` endpoints | I | P1 |
| TC-04-04 | SHOP_OWNER cannot access `/api/admin/**` endpoints | I | P1 |
| TC-04-05 | ADMIN can access `/api/admin/**` endpoints | I | P1 |
| TC-04-06 | SHOP_OWNER can access `/api/owner/**` endpoints | I | P1 |
| TC-04-07 | Public endpoints accessible without auth | I | P2 |

**TC-04-01: Unauthenticated request rejected**
- **Steps:**
  1. GET `/api/bookings` with no `Authorization` header
- **Expected:** HTTP 401

**TC-04-02: CUSTOMER blocked from owner endpoints**
- **Pre:** JWT for a CUSTOMER role user
- **Steps:**
  1. GET `/api/owner/shop` with CUSTOMER JWT
- **Expected:** HTTP 403 Forbidden

**TC-04-03: CUSTOMER blocked from admin endpoints**
- **Steps:**
  1. GET `/api/admin/bookings` with CUSTOMER JWT
- **Expected:** HTTP 403 Forbidden

**TC-04-04: SHOP_OWNER blocked from admin endpoints**
- **Steps:**
  1. GET `/api/admin/bookings` with SHOP_OWNER JWT
- **Expected:** HTTP 403 Forbidden

**TC-04-05: ADMIN can access admin endpoints**
- **Steps:**
  1. GET `/api/admin/bookings` with ADMIN JWT
- **Expected:** HTTP 200

**TC-04-06: SHOP_OWNER can access owner endpoints**
- **Steps:**
  1. GET `/api/owner/shop` with SHOP_OWNER JWT
- **Expected:** HTTP 200

**TC-04-07: Public endpoints require no auth**
- **Steps:**
  1. GET `/api/shops` without any Authorization header
- **Expected:** HTTP 200, shop list returned

---

### FR-05 — Shop Discovery & Listing

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-05-01 | Retrieve all shops | I | P2 |
| TC-05-02 | Shop list includes required fields | I | P2 |
| TC-05-03 | Empty shop list returns empty array | I | P3 |
| TC-05-04 | Web UI renders shop cards | E | P2 |
| TC-05-05 | Google Map displays shop markers | E | P3 |

**TC-05-01: Retrieve all shops**
- **Pre:** At least 1 shop in DB
- **Steps:**
  1. GET `/api/shops`
- **Expected:** HTTP 200, JSON array with at least 1 shop object

**TC-05-02: Shop list includes required fields**
- **Steps:**
  1. GET `/api/shops`
  2. Inspect first shop object
- **Expected:** Each shop has: `id`, `name`, `address`, `latitude`, `longitude`

**TC-05-04: Web UI renders shop cards**
- **Steps:**
  1. Navigate to `/shops`
  2. Wait for data to load
- **Expected:** Shop cards visible, each shows shop name, address, and a "Book Now" button

---

### FR-06 — Shop Detail View

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-06-01 | Get shop by valid ID | I | P2 |
| TC-06-02 | Get shop by invalid/non-existent ID | I | P2 |
| TC-06-03 | Shop detail includes services list | I | P2 |
| TC-06-04 | Web UI renders shop detail correctly | E | P2 |

**TC-06-01: Get shop by valid ID**
- **Input:** Valid shop UUID
- **Steps:**
  1. GET `/api/shops/{id}`
- **Expected:** HTTP 200, shop object with `services` array

**TC-06-02: Get shop by non-existent ID**
- **Input:** Random UUID not in DB
- **Steps:**
  1. GET `/api/shops/00000000-0000-0000-0000-000000000000`
- **Expected:** HTTP 404 Not Found

**TC-06-03: Shop detail includes services**
- **Steps:**
  1. GET `/api/shops/{id}`
  2. Inspect `services` field
- **Expected:** Array with objects containing `id`, `type` (STANDARD/PRIORITY), `price`

---

### FR-07 — Slot Availability Query

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-07-01 | Query available slots for a date | I | P1 |
| TC-07-02 | Fully booked slot returns zero availability | I | P1 |
| TC-07-03 | Slot availability decrements on booking | I | P1 |
| TC-07-04 | Query with missing parameters returns error | I | P2 |
| TC-07-05 | Past date returns no available slots | I | P2 |

**TC-07-01: Query available slots for a date**
- **Pre:** Slot config exists for shop with limit > 0
- **Steps:**
  1. GET `/api/slots/available?shopId={id}&date=2026-06-01&serviceType=STANDARD`
- **Expected:** HTTP 200, `availableSlots` > 0

**TC-07-02: Fully booked slot**
- **Pre:** All slots for a given date are booked
- **Steps:**
  1. GET `/api/slots/available?shopId={id}&date={fullyBookedDate}&serviceType=PRIORITY`
- **Expected:** `availableSlots = 0`

**TC-07-03: Slot decrements on booking**
- **Pre:** Note current `availableSlots` count
- **Steps:**
  1. Create a valid booking for that shop/date/service
  2. Re-query slot availability
- **Expected:** `availableSlots` reduced by 1

**TC-07-04: Missing parameters return error**
- **Steps:**
  1. GET `/api/slots/available` (no query params)
- **Expected:** HTTP 400 Bad Request

---

### FR-08 — Booking Creation

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-08-01 | Create booking with valid input | I | P1 |
| TC-08-02 | Booking creation generates unique booking code | I | P1 |
| TC-08-03 | Cannot book when no slots available | I | P1 |
| TC-08-04 | Cannot book without authentication | I | P1 |
| TC-08-05 | Booking initial status is PENDING | I | P1 |
| TC-08-06 | Cannot book for a past date | I | P2 |
| TC-08-07 | Cannot book with invalid service ID | I | P2 |

**TC-08-01: Create booking with valid input**
- **Pre:** Authenticated CUSTOMER, available slot exists
- **Input:**
  ```json
  {
    "shopId": "<valid-uuid>",
    "serviceId": "<valid-uuid>",
    "bookingDate": "2026-06-01",
    "timeSlot": "09:00"
  }
  ```
- **Steps:**
  1. POST `/api/bookings` with CUSTOMER JWT
- **Expected:** HTTP 201, booking object with `id`, `bookingCode`, `status = PENDING`

**TC-08-02: Booking code is unique**
- **Steps:**
  1. Create two separate bookings
  2. Compare `bookingCode` values
- **Expected:** Both codes are non-null and different from each other

**TC-08-03: Cannot book when no slots available**
- **Pre:** Slot limit reached for the given date
- **Steps:**
  1. POST `/api/bookings` for fully-booked slot
- **Expected:** HTTP 409 Conflict or HTTP 400 with "no slots available" message

**TC-08-04: Cannot book without auth**
- **Steps:**
  1. POST `/api/bookings` with no Authorization header
- **Expected:** HTTP 401

**TC-08-06: Cannot book for a past date**
- **Input:** `bookingDate` = yesterday's date
- **Expected:** HTTP 400 Bad Request

---

### FR-09 — Payment Processing (PayMongo)

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-09-01 | Create payment intent for a booking | I | P1 |
| TC-09-02 | Payment intent references correct booking and amount | I | P1 |
| TC-09-03 | Webhook confirms payment and updates booking status to PAID | I | P1 |
| TC-09-04 | Webhook with invalid signature is rejected | I | P1 |
| TC-09-05 | Duplicate webhook event is idempotent | I | P2 |
| TC-09-06 | Booking confirmation email sent after payment webhook | U | P3 |

**TC-09-01: Create payment intent**
- **Pre:** Authenticated CUSTOMER, valid booking ID
- **Input:** `{ "bookingId": "<uuid>", "amount": 15000 }` (in centavos)
- **Steps:**
  1. POST `/api/payments/intent` with CUSTOMER JWT
- **Expected:** HTTP 200, response contains `paymentIntentId` and `clientKey`

**TC-09-02: Payment intent references correct amount**
- **Steps:**
  1. Create payment intent
  2. Verify `amount` in response matches expected service price
- **Expected:** Amount matches service price × 100 (centavos)

**TC-09-03: Webhook updates booking status to PAID**
- **Pre:** Mock PayMongo webhook payload with `payment.paid` event
- **Steps:**
  1. POST `/api/payments/webhook` with valid signed payload
- **Expected:** HTTP 200, corresponding booking status updated to `PAID`

**TC-09-04: Invalid webhook signature rejected**
- **Steps:**
  1. POST `/api/payments/webhook` with `PayMongo-Signature` header tampered
- **Expected:** HTTP 400 or HTTP 401

**TC-09-06: Booking confirmation email sent after payment**
- **Pre:** Mock `JavaMailSender`; `PaymentSucceededListener` wired to `BookingService.markPaid()`
- **Steps:**
  1. Publish a `PaymentSucceededEvent` for a booking
  2. Verify `EmailService.sendBookingConfirmationEmail()` is called
- **Expected:** Email sent to customer with correct `bookingCode`, shop name, service name, date, time slot, and amount; subject contains booking code

---

### FR-10 — QR Code Generation

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-10-01 | QR code generated for confirmed booking | I | P2 |
| TC-10-02 | QR code response is a valid image | I | P2 |
| TC-10-03 | QR code contains correct booking code | U | P2 |
| TC-10-04 | Non-owner cannot download another user's QR | I | P2 |

**TC-10-01: QR code generated for booking**
- **Pre:** Booking exists with status `PAID`
- **Steps:**
  1. GET `/api/bookings/{id}/qrcode` with owner's CUSTOMER JWT
- **Expected:** HTTP 200, `Content-Type: image/png`

**TC-10-02: QR code is valid image bytes**
- **Steps:**
  1. Download QR code as per TC-10-01
  2. Check response body is non-empty PNG bytes
- **Expected:** Response has valid PNG header (`\x89PNG`)

**TC-10-03: QR code encodes booking code**
- **Steps:**
  1. Generate QR code for booking with `bookingCode = "LLK-ABC123"`
  2. Decode QR image content
- **Expected:** Decoded string equals the booking code

**TC-10-04: User cannot access another's QR**
- **Pre:** Booking belongs to User A
- **Steps:**
  1. GET `/api/bookings/{id}/qrcode` with User B's JWT
- **Expected:** HTTP 403 Forbidden

---

### FR-11 — Booking Status Lifecycle

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-11-01 | Owner can update status from PAID to DROPPED_OFF | I | P1 |
| TC-11-02 | Owner can update status from DROPPED_OFF to PROCESSING | I | P1 |
| TC-11-03 | Owner can update status from PROCESSING to COMPLETED | I | P1 |
| TC-11-04 | Invalid status transition is rejected | I | P1 |
| TC-11-05 | Customer cannot update booking status | I | P1 |
| TC-11-06 | Admin can force-update any booking status | I | P2 |

**TC-11-01: PAID → DROPPED_OFF**
- **Pre:** Booking with status `PAID`, authenticated as shop OWNER
- **Input:** `{ "status": "DROPPED_OFF" }`
- **Steps:**
  1. PUT `/api/bookings/{id}/status` with OWNER JWT
- **Expected:** HTTP 200, booking status updated to `DROPPED_OFF`

**TC-11-02: DROPPED_OFF → PROCESSING**
- **Pre:** Booking with status `DROPPED_OFF`
- **Steps:**
  1. PUT `/api/bookings/{id}/status` with `{ "status": "PROCESSING" }`
- **Expected:** HTTP 200, status = `PROCESSING`

**TC-11-03: PROCESSING → COMPLETED**
- **Expected:** HTTP 200, status = `COMPLETED`

**TC-11-04: Invalid status transition rejected**
- **Pre:** Booking with status `PAID`
- **Input:** `{ "status": "COMPLETED" }` (skipping intermediate states)
- **Expected:** HTTP 400 or HTTP 422 with invalid transition message

**TC-11-05: Customer cannot update status**
- **Steps:**
  1. PUT `/api/bookings/{id}/status` with CUSTOMER JWT
- **Expected:** HTTP 403 Forbidden

---

### FR-12 — Customer Booking History

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-12-01 | Customer sees only their own bookings | I | P2 |
| TC-12-02 | Bookings returned in reverse-chronological order | I | P3 |
| TC-12-03 | Booking detail accessible by booking ID | I | P2 |
| TC-12-04 | Web UI displays booking list correctly | E | P2 |

**TC-12-01: Customer sees only own bookings**
- **Pre:** User A has 2 bookings, User B has 1 booking
- **Steps:**
  1. GET `/api/bookings` with User A's JWT
- **Expected:** 2 bookings returned, none belonging to User B

**TC-12-03: Booking detail by ID**
- **Pre:** Booking ID belongs to authenticated user
- **Steps:**
  1. GET `/api/bookings/{id}`
- **Expected:** HTTP 200, full booking details including `shop`, `service`, `status`

---

### FR-13 — Shop Owner — Shop Management

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-13-01 | Owner can retrieve their shop | I | P2 |
| TC-13-02 | Owner can update shop name and address | I | P2 |
| TC-13-03 | Non-owner cannot update another's shop | I | P2 |
| TC-13-04 | Update with empty name is rejected | I | P3 |

**TC-13-01: Owner retrieves their shop**
- **Pre:** SHOP_OWNER JWT for owner linked to a shop
- **Steps:**
  1. GET `/api/owner/shop`
- **Expected:** HTTP 200, shop object with owner's shop data

**TC-13-02: Owner updates shop**
- **Input:** `{ "name": "Updated Shop Name", "address": "123 New St" }`
- **Steps:**
  1. PUT `/api/owner/shop` with SHOP_OWNER JWT
- **Expected:** HTTP 200, updated shop data returned

**TC-13-03: Non-owner cannot update shop**
- **Steps:**
  1. PUT `/api/owner/shop` with a different SHOP_OWNER's JWT
- **Expected:** HTTP 403 Forbidden or empty result (owner has no linked shop)

---

### FR-14 — Shop Owner — Service Management

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-14-01 | Owner can create a new service | I | P2 |
| TC-14-02 | Owner can update service price | I | P2 |
| TC-14-03 | Owner can delete a service | I | P2 |
| TC-14-04 | Service type must be STANDARD or PRIORITY | I | P2 |
| TC-14-05 | Cannot create service with negative price | I | P3 |

**TC-14-01: Create new service**
- **Input:** `{ "type": "STANDARD", "price": 150.00, "description": "Regular wash" }`
- **Steps:**
  1. POST `/api/shops/{shopId}/services` with OWNER JWT
- **Expected:** HTTP 201, new service with `id` returned

**TC-14-04: Invalid service type rejected**
- **Input:** `{ "type": "EXPRESS", "price": 200.00 }`
- **Expected:** HTTP 400 Bad Request

---

### FR-15 — Shop Owner — Schedule / Slot Configuration

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-15-01 | Owner can create slot configuration | I | P2 |
| TC-15-02 | Owner can update slot limit | I | P2 |
| TC-15-03 | Slot limit of 0 disables bookings for that day | I | P2 |
| TC-15-04 | Cannot set negative slot limit | I | P3 |
| TC-15-05 | Slot config applies to correct service type | I | P2 |

**TC-15-01: Create slot configuration**
- **Input:** `{ "dayOfWeek": "MONDAY", "serviceType": "PRIORITY", "maxSlots": 5 }`
- **Steps:**
  1. POST `/api/owner/slots` with OWNER JWT
- **Expected:** HTTP 201, slot config created

**TC-15-03: Zero slot limit disables bookings**
- **Pre:** Slot config has `maxSlots = 0`
- **Steps:**
  1. Query available slots for that shop/day
- **Expected:** `availableSlots = 0`, booking attempt returns conflict

---

### FR-16 — Shop Owner — Booking Dashboard

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-16-01 | Owner sees all bookings for their shop | I | P2 |
| TC-16-02 | Owner does not see bookings for other shops | I | P2 |
| TC-16-03 | Owner can filter bookings by date | I | P3 |

**TC-16-01: Owner sees shop bookings**
- **Steps:**
  1. GET `/api/owner/bookings` with OWNER JWT
- **Expected:** HTTP 200, only bookings for that owner's shop

**TC-16-02: Bookings are scoped to owner's shop**
- **Pre:** Two shops, each with bookings
- **Steps:**
  1. Owner A calls GET `/api/owner/bookings`
- **Expected:** Only Shop A's bookings returned

---

### FR-17 — Admin — Global Booking Dashboard

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-17-01 | Admin sees all bookings across all shops | I | P2 |
| TC-17-02 | Admin can filter by shop ID | I | P2 |
| TC-17-03 | Admin can filter by date | I | P2 |
| TC-17-04 | Non-admin cannot access admin booking endpoint | I | P1 |

**TC-17-01: Admin sees all bookings**
- **Steps:**
  1. GET `/api/admin/bookings` with ADMIN JWT
- **Expected:** HTTP 200, bookings from all shops in array

**TC-17-04: Non-admin blocked**
- **Steps:**
  1. GET `/api/admin/bookings` with CUSTOMER JWT
- **Expected:** HTTP 403 Forbidden

---

### FR-18 — Admin — Daily Priority Slot Limit Management

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-18-01 | Admin can set daily priority slot limit | I | P2 |
| TC-18-02 | New limit is enforced immediately | I | P2 |
| TC-18-03 | Limit applied only to correct shop | I | P2 |
| TC-18-04 | Cannot set limit below zero | I | P3 |

**TC-18-01: Admin sets daily limit**
- **Input:** `{ "shopId": "<uuid>", "date": "2026-06-01", "limit": 3 }`
- **Steps:**
  1. POST `/api/admin/slots/daily-limit` with ADMIN JWT
- **Expected:** HTTP 200, limit applied

**TC-18-02: New limit enforced on availability query**
- **Pre:** Limit set to 3 for a date, 2 bookings exist
- **Steps:**
  1. Query available slots
- **Expected:** `availableSlots = 1`

---

### FR-19 — File Upload / Attachment

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-19-01 | Customer can upload attachment to booking | I | P3 |
| TC-19-02 | File exceeding 10MB is rejected | I | P3 |
| TC-19-03 | Owner can view/download customer attachment | I | P3 |
| TC-19-04 | Unsupported file type is rejected | I | P3 |

**TC-19-01: Upload attachment**
- **Pre:** Authenticated CUSTOMER, valid booking ID
- **Steps:**
  1. POST multipart form to attachment upload endpoint with a valid file (< 10MB)
- **Expected:** HTTP 200, Supabase URL returned

**TC-19-02: File exceeding 10MB rejected**
- **Steps:**
  1. Upload a file > 10MB
- **Expected:** HTTP 413 Payload Too Large or HTTP 400

---

### FR-20 — Email Notifications

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-20-01 | Welcome email sent on email/password registration | U | P3 |
| TC-20-02 | Welcome email sent on Google OAuth new user creation | U | P3 |
| TC-20-03 | Booking confirmation email sent after payment webhook | U | P3 |
| TC-20-04 | Booking confirmation email contains correct booking details | U | P3 |
| TC-20-05 | Email failure does not fail the registration transaction | U | P3 |
| TC-20-06 | Email failure does not fail the payment transaction | U | P3 |

**TC-20-01: Welcome email on registration**
- **Pre:** Mock `JavaMailSender`
- **Steps:**
  1. POST `/api/auth/register` with valid payload
  2. Verify `EmailService.sendWelcomeEmail()` called
- **Expected:** `send()` invoked with recipient = registered email, subject = "Welcome to LaundryLink!"

**TC-20-02: Welcome email on Google OAuth**
- **Pre:** Mock `JavaMailSender`; new Google user (no existing account)
- **Steps:**
  1. POST `/api/auth/google` with a new Google profile
  2. Verify `EmailService.sendWelcomeEmail()` called
- **Expected:** `send()` invoked with the Google account's email and first name

**TC-20-03: Booking confirmation email on payment**
- **Pre:** Mock `JavaMailSender`
- **Steps:**
  1. Trigger `PaymentSucceededEvent` for a known booking
  2. Verify `EmailService.sendBookingConfirmationEmail()` called
- **Expected:** Email sent to customer; subject = "LaundryLink – Booking Confirmed: <bookingCode>"

**TC-20-04: Booking confirmation email contains correct details**
- **Steps:**
  1. Trigger `PaymentSucceededEvent`
  2. Capture email body from mock
- **Expected:** HTML body contains booking code, shop name, service name, booking date, time slot, and amount paid

**TC-20-05: Email failure is non-blocking for registration**
- **Pre:** Mock `JavaMailSender` to throw `MailException`
- **Steps:**
  1. POST `/api/auth/register`
- **Expected:** User still created (HTTP 201), exception caught and logged, not propagated

**TC-20-06: Email failure is non-blocking for payment**
- **Pre:** Mock `JavaMailSender` to throw `MailException`
- **Steps:**
  1. Trigger `PaymentSucceededEvent`
- **Expected:** Booking marked as `PAID`, exception caught and logged, no transaction rollback

---

### FR-21 — Current User Profile (GET /api/auth/me)

| TC-ID | Title | Type | Priority |
|-------|-------|------|----------|
| TC-21-01 | Authenticated user retrieves their own profile | I | P2 |
| TC-21-02 | Response includes all expected profile fields | I | P2 |
| TC-21-03 | Request without Authorization header returns 401 | I | P1 |
| TC-21-04 | Request with invalid/expired JWT returns 401 | I | P1 |
| TC-21-05 | SHOP_OWNER can retrieve their profile | I | P2 |
| TC-21-06 | ADMIN can retrieve their profile | I | P2 |

**TC-21-01: Authenticated user retrieves profile**
- **Pre:** Valid CUSTOMER JWT
- **Steps:**
  1. GET `/api/auth/me` with `Authorization: Bearer <token>`
- **Expected:** HTTP 200, response body contains user profile data

**TC-21-02: Response includes all expected profile fields**
- **Steps:**
  1. GET `/api/auth/me` with valid JWT
  2. Inspect response body
- **Expected:** Response contains: `id`, `firstName`, `lastName`, `email`, `role`, `oauthProvider`

**TC-21-03: No Authorization header returns 401**
- **Steps:**
  1. GET `/api/auth/me` with no Authorization header
- **Expected:** HTTP 401 Unauthorized, error code `AUTH-001`

**TC-21-04: Invalid JWT returns 401**
- **Steps:**
  1. GET `/api/auth/me` with a tampered or expired token
- **Expected:** HTTP 401 Unauthorized

**TC-21-05: SHOP_OWNER profile retrieval**
- **Pre:** Valid SHOP_OWNER JWT
- **Steps:**
  1. GET `/api/auth/me`
- **Expected:** HTTP 200, `role = "SHOP_OWNER"`

**TC-21-06: ADMIN profile retrieval**
- **Pre:** Valid ADMIN JWT
- **Steps:**
  1. GET `/api/auth/me`
- **Expected:** HTTP 200, `role = "ADMIN"`

---

## 7. Test Scripts / Step-by-Step Procedures

### 7.1 End-to-End: Customer Booking Flow

**Objective:** Verify a customer can register, find a shop, book a service, pay, and receive a QR code.

```
STEP 1 — Registration
  1. Open browser to http://localhost:5173/register
  2. Enter: First Name, Last Name, Email = "flow@test.com", Password = "Password123!"
  3. Click "Register"
  ASSERT: Redirect to /customer/dashboard or /shops
  ASSERT: Welcome email sent (check mail sandbox)

STEP 2 — Shop Discovery
  1. Navigate to /shops
  ASSERT: At least one shop card displayed
  2. Click on the first shop card
  ASSERT: Shop detail page loaded with services list

STEP 3 — Booking
  1. Click "Book Now"
  2. Select service type (STANDARD or PRIORITY)
  3. Select a future date from the date picker
  4. Select an available time slot
  5. Click "Confirm Booking"
  ASSERT: Redirected to payment page

STEP 4 — Payment
  1. Enter test card: 4343434343434345, CVC: any, Expiry: future
  2. Submit payment
  ASSERT: Redirect to /bookings/confirmation
  ASSERT: Booking confirmation email sent (check mail sandbox)

STEP 5 — Confirmation
  1. On confirmation page
  ASSERT: Booking code displayed
  ASSERT: QR code image visible
  ASSERT: Download QR button works

STEP 6 — Booking History
  1. Navigate to /bookings
  ASSERT: New booking appears in list with correct status

STEP 7 — Profile Check
  1. Navigate to profile or call GET /api/auth/me
  ASSERT: Returns logged-in user's firstName, lastName, email, role
```

---

### 7.2 End-to-End: Shop Owner Status Update Flow

```
STEP 1 — Owner Login
  1. Login as user with SHOP_OWNER role
  ASSERT: Redirect to /shop-owner/dashboard

STEP 2 — View Bookings
  1. Navigate to /shop-owner/bookings
  ASSERT: Customer bookings listed with status PAID

STEP 3 — Status Update: DROPPED_OFF
  1. Click "Mark Dropped Off" on a PAID booking
  ASSERT: Status badge changes to DROPPED_OFF

STEP 4 — Status Update: PROCESSING
  1. Click "Start Processing"
  ASSERT: Status changes to PROCESSING

STEP 5 — Status Update: COMPLETED
  1. Click "Mark Completed"
  ASSERT: Status changes to COMPLETED
```

---

### 7.3 End-to-End: Admin Slot Management Flow

```
STEP 1 — Admin Login
  1. Login as user with ADMIN role
  ASSERT: Admin dashboard accessible at /admin

STEP 2 — View All Bookings
  1. Navigate to /admin
  ASSERT: Bookings from all shops displayed
  2. Apply date filter: select today's date
  ASSERT: Only today's bookings shown

STEP 3 — Update Priority Slot Limit
  1. Navigate to /admin/slots
  2. Select a shop
  3. Select a date
  4. Set new limit to 3
  5. Click "Save"
  ASSERT: Success message shown
  ASSERT: Booking flow for that shop/date now reflects 3 available priority slots
```

---

### 7.4 Security Test Procedure: JWT Bypass Attempt

```
STEP 1 — Obtain valid JWT for CUSTOMER user
STEP 2 — Decode the JWT payload (base64)
STEP 3 — Modify the `role` claim to "ADMIN"
STEP 4 — Re-encode with original base64 (keeping original signature)
STEP 5 — Send GET /api/admin/bookings with tampered token
ASSERT: HTTP 401 Unauthorized (signature mismatch)

STEP 6 — Attempt to call /api/owner/shop with CUSTOMER token (no modification)
ASSERT: HTTP 403 Forbidden

STEP 7 — Call GET /api/auth/me with tampered token
ASSERT: HTTP 401 Unauthorized
```

---

### 7.5 Security Test Procedure: SQL Injection Check

```
For each text input field on registration and login forms:
  STEP 1 — Enter payload: ' OR '1'='1
  STEP 2 — Submit form
  ASSERT: HTTP 400 validation error OR normal 401/200 (no DB error exposed)
  ASSERT: No stack trace or SQL error message in response body

For API endpoints accepting query parameters:
  STEP 1 — GET /api/shops?id=1' OR '1'='1
  ASSERT: HTTP 400 or proper 404 (not 500 Internal Server Error)
  ASSERT: GlobalExceptionHandler returns structured error, not raw exception
```

---

### 7.6 GlobalExceptionHandler Validation Error Format Test

```
STEP 1 — POST /api/auth/register with missing required fields: {}
STEP 2 — Inspect response body structure
ASSERT: HTTP 400
ASSERT: Response contains error code "VALIDATION-001"
ASSERT: Response message lists all failing fields in format "fieldName: constraint message"
ASSERT: No raw Java stack trace in response
```

---

## 8. Automated Test Cases

### Backend — JUnit 5 + Mockito

#### `AuthServiceTest.java`

```java
package edu.cit.canete.laundrylink.features.auth;

import edu.cit.canete.laundrylink.shared.notification.EmailService;
import edu.cit.canete.laundrylink.shared.security.JwtUtil;
import edu.cit.canete.laundrylink.shared.user.User;
import edu.cit.canete.laundrylink.shared.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock BCryptPasswordEncoder encoder;
    @Mock JwtUtil jwtUtil;
    @Mock EmailService emailService;

    @InjectMocks AuthService authService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setEmail("test@example.com");
        mockUser.setFirstName("Test");
        mockUser.setLastName("User");
        mockUser.setPasswordHash("$2a$12$hashedpassword");
        mockUser.setRole("CUSTOMER");
    }

    // TC-01-01: Register with valid credentials — response contains accessToken + user object
    @Test
    void register_validCredentials_returnsAuthResponse() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(encoder.encode(anyString())).thenReturn("$2a$12$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("jwt.token.here");

        var request = new RegisterRequest("Test", "User", "test@example.com", "Password123!", null);
        var result = authService.register(request);

        assertThat(result).containsKey("accessToken");
        assertThat(result).containsKey("user");
        verify(userRepository).save(any(User.class));
    }

    // TC-01-08: Welcome email sent on registration
    @Test
    void register_validCredentials_sendsWelcomeEmail() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(encoder.encode(anyString())).thenReturn("$2a$12$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("token");

        var request = new RegisterRequest("Test", "User", "test@example.com", "Password123!", null);
        authService.register(request);

        verify(emailService).sendWelcomeEmail("test@example.com", "Test");
    }

    // TC-01-02: Duplicate email registration
    @Test
    void register_duplicateEmail_throwsException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        var request = new RegisterRequest("Test", "User", "test@example.com", "pass", null);

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(anyString(), anyString());
    }

    // TC-01-05: Password is BCrypt hashed
    @Test
    void register_passwordIsBcryptHashed() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(encoder.encode("plainPassword")).thenReturn("$2a$12$hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("token");

        authService.register(new RegisterRequest("User", "Test", "u@test.com", "plainPassword", null));

        verify(encoder).encode("plainPassword");
    }

    // TC-02-01: Login with correct credentials
    @Test
    void login_correctCredentials_returnsAuthResponse() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(encoder.matches("Password123!", mockUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("valid.jwt.token");

        var result = authService.login(new LoginRequest("test@example.com", "Password123!"));

        assertThat(result).containsKey("accessToken");
        assertThat(result.get("accessToken")).isEqualTo("valid.jwt.token");
    }

    // TC-02-02: Login with wrong password
    @Test
    void login_wrongPassword_throwsUnauthorized() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(encoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("test@example.com", "wrong")))
            .isInstanceOf(RuntimeException.class);
    }

    // TC-02-03: Login with non-existent email
    @Test
    void login_nonExistentEmail_throwsUnauthorized() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("ghost@example.com", "pass")))
            .isInstanceOf(RuntimeException.class);
    }
}
```

---

#### `AuthMeEndpointTest.java` (FR-21 — new)

```java
package edu.cit.canete.laundrylink.features.auth;

import edu.cit.canete.laundrylink.shared.user.AuthenticatedUserService;
import edu.cit.canete.laundrylink.shared.user.User;
import edu.cit.canete.laundrylink.shared.web.ApiResponseFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthMeEndpointTest {

    @Mock AuthService authService;
    @Mock AuthenticatedUserService authenticatedUserService;
    @Mock ApiResponseFactory responseFactory;

    @InjectMocks AuthController authController;

    // TC-21-01: Authenticated user retrieves their profile
    @Test
    void me_validToken_returnsUserProfile() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFirstName("Rod");
        user.setLastName("Cañete");
        user.setEmail("rod@test.com");
        user.setRole("CUSTOMER");

        when(authenticatedUserService.requireUser(anyString())).thenReturn(user);
        when(responseFactory.successResponse(any(), eq(HttpStatus.OK)))
            .thenAnswer(inv -> org.springframework.http.ResponseEntity.ok(inv.getArgument(0)));

        var response = authController.me("Bearer valid.jwt.token");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    // TC-21-03: No Authorization header returns 401
    @Test
    void me_noAuthHeader_returnsUnauthorized() {
        when(authenticatedUserService.requireUser(null))
            .thenThrow(new RuntimeException("Authorization required"));
        when(responseFactory.errorResponse(anyString(), anyString(), eq(HttpStatus.UNAUTHORIZED)))
            .thenReturn(org.springframework.http.ResponseEntity.status(401).build());

        var response = authController.me(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
```

---

#### `PaymentSucceededListenerTest.java` (FR-20 email on payment — new)

```java
package edu.cit.canete.laundrylink.features.payment.event;

import edu.cit.canete.laundrylink.features.booking.Booking;
import edu.cit.canete.laundrylink.features.booking.BookingService;
import edu.cit.canete.laundrylink.features.shop.Service;
import edu.cit.canete.laundrylink.features.shop.Shop;
import edu.cit.canete.laundrylink.shared.notification.EmailService;
import edu.cit.canete.laundrylink.shared.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentSucceededListenerTest {

    @Mock BookingService bookingService;
    @Mock EmailService emailService;

    @InjectMocks PaymentSucceededListener listener;

    // TC-09-06 / TC-20-03: Booking confirmation email sent after payment
    @Test
    void onPaymentSucceeded_sendsBookingConfirmationEmail() {
        UUID bookingId = UUID.randomUUID();

        User customer = new User();
        customer.setFirstName("Rod");
        customer.setLastName("Cañete");
        customer.setEmail("rod@test.com");

        Shop shop = new Shop();
        shop.setName("Clean & Fold");

        Service service = new Service();
        service.setName("Standard Wash");
        service.setPrice(new BigDecimal("150.00"));

        Booking booking = new Booking();
        booking.setBookingCode("LLK-XYZ999");
        booking.setUser(customer);
        booking.setShop(shop);
        booking.setService(service);
        booking.setBookingDate(LocalDate.of(2026, 6, 15));
        booking.setTimeSlot(LocalTime.of(9, 0));

        when(bookingService.markPaid(bookingId)).thenReturn(booking);

        listener.onPaymentSucceeded(new PaymentSucceededEvent(bookingId));

        verify(emailService).sendBookingConfirmationEmail(
            eq("rod@test.com"),
            eq("Rod Cañete"),
            eq("LLK-XYZ999"),
            eq("Clean & Fold"),
            eq("Standard Wash"),
            eq("2026-06-15"),
            anyString(),
            eq("150.00")
        );
    }

    // TC-20-06: Email failure does not propagate (EmailService catches internally)
    @Test
    void onPaymentSucceeded_emailServiceFailure_doesNotThrow() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = buildMinimalBooking();
        when(bookingService.markPaid(bookingId)).thenReturn(booking);
        doThrow(new RuntimeException("SMTP error")).when(emailService)
            .sendBookingConfirmationEmail(any(), any(), any(), any(), any(), any(), any(), any());

        // Should not throw — EmailService catches internally with @Async
        assertThatCode(() -> listener.onPaymentSucceeded(new PaymentSucceededEvent(bookingId)))
            .doesNotThrowAnyException();
    }

    private Booking buildMinimalBooking() {
        User u = new User(); u.setFirstName("A"); u.setLastName("B"); u.setEmail("a@b.com");
        Shop s = new Shop(); s.setName("S");
        Service sv = new Service(); sv.setName("SV"); sv.setPrice(BigDecimal.TEN);
        Booking b = new Booking();
        b.setUser(u); b.setShop(s); b.setService(sv);
        b.setBookingCode("LLK-000"); b.setBookingDate(LocalDate.now()); b.setTimeSlot(LocalTime.NOON);
        return b;
    }
}
```

---

#### `GlobalExceptionHandlerTest.java` (new)

```java
package edu.cit.canete.laundrylink.shared.exception;

import edu.cit.canete.laundrylink.shared.web.ApiResponseFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock ApiResponseFactory apiResponseFactory;
    @InjectMocks GlobalExceptionHandler handler;

    // TC-01-03: Validation errors formatted with VALIDATION-001 code
    @Test
    void handleValidation_returnsStructuredError() {
        FieldError fieldError = new FieldError("req", "firstName", "must not be blank");
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        when(apiResponseFactory.error(eq("VALIDATION-001"), contains("firstName")))
            .thenReturn(java.util.Map.of("code", "VALIDATION-001", "message", "firstName: must not be blank"));

        var response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(apiResponseFactory).error(eq("VALIDATION-001"), contains("firstName: must not be blank"));
    }

    // TC-07-04: Unhandled exceptions return SERVER-001
    @Test
    void handleAll_unexpectedException_returnsServerError() {
        when(apiResponseFactory.error(eq("SERVER-001"), anyString()))
            .thenReturn(java.util.Map.of("code", "SERVER-001"));

        var response = handler.handleAll(new RuntimeException("something broke"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

---

#### `BookingServiceTest.java`

```java
package edu.cit.canete.laundrylink.features.booking;

import edu.cit.canete.laundrylink.features.slot.SlotService;
import edu.cit.canete.laundrylink.shared.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock SlotService slotService;
    @Mock QrCodeService qrCodeService;

    @InjectMocks BookingService bookingService;

    // TC-08-01: Create booking with valid input
    @Test
    void createBooking_validInput_returnsBooking() {
        UUID shopId = UUID.randomUUID();
        UUID serviceId = UUID.randomUUID();
        User customer = new User();
        customer.setId(UUID.randomUUID());

        when(slotService.hasAvailability(any(), any(), any())).thenReturn(true);
        when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var request = new CreateBookingRequest(shopId, serviceId, LocalDate.now().plusDays(1), "09:00");
        Booking result = bookingService.createBooking(request, customer);

        assertThat(result).isNotNull();
        assertThat(result.getBookingCode()).isNotNull();
        verify(slotService).decrementAvailability(any(), any(), any());
    }

    // TC-08-03: No slots available
    @Test
    void createBooking_noSlotsAvailable_throwsConflict() {
        when(slotService.hasAvailability(any(), any(), any())).thenReturn(false);

        assertThatThrownBy(() ->
            bookingService.createBooking(
                new CreateBookingRequest(UUID.randomUUID(), UUID.randomUUID(),
                    LocalDate.now().plusDays(1), "10:00"),
                new User()
            )
        ).isInstanceOf(RuntimeException.class);
    }

    // TC-11-01: Status transition PAID → DROPPED_OFF
    @Test
    void updateStatus_paidToDroppedOff_succeeds() {
        Booking booking = new Booking();
        booking.setStatus(BookingStatus.PAID);
        when(bookingRepository.findById(any())).thenReturn(java.util.Optional.of(booking));
        when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Booking updated = bookingService.updateStatus(UUID.randomUUID(), BookingStatus.DROPPED_OFF);

        assertThat(updated.getStatus()).isEqualTo(BookingStatus.DROPPED_OFF);
    }

    // TC-11-04: Invalid status transition
    @Test
    void updateStatus_invalidTransition_throwsException() {
        Booking booking = new Booking();
        booking.setStatus(BookingStatus.PAID);
        when(bookingRepository.findById(any())).thenReturn(java.util.Optional.of(booking));

        assertThatThrownBy(() ->
            bookingService.updateStatus(UUID.randomUUID(), BookingStatus.COMPLETED)
        ).isInstanceOf(RuntimeException.class);
    }
}
```

---

### API Integration — REST Assured

#### `AuthIntegrationTest.java`

```java
package edu.cit.canete.laundrylink.integration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIntegrationTest {

    @LocalServerPort int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
    }

    // TC-01-01: Register returns accessToken + nested user
    @Test
    void register_validPayload_returns201WithAccessToken() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                {
                  "firstName": "Test",
                  "lastName": "User",
                  "email": "newuser@test.com",
                  "password": "SecurePass123!"
                }
                """)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(201)
            .body("accessToken", notNullValue())
            .body("user.role", equalTo("CUSTOMER"))
            .body("user.email", equalTo("newuser@test.com"));
    }

    // TC-01-02: Duplicate email returns 409
    @Test
    void register_duplicateEmail_returns409() {
        String payload = """
            { "firstName": "A", "lastName": "B", "email": "dup@test.com", "password": "Pass123!" }
            """;

        given().contentType(ContentType.JSON).body(payload).post("/auth/register");

        given()
            .contentType(ContentType.JSON)
            .body(payload)
        .when()
            .post("/auth/register")
        .then()
            .statusCode(409);
    }

    // TC-01-03: Missing fields returns 400 with VALIDATION-001
    @Test
    void register_missingFields_returns400WithValidationCode() {
        given()
            .contentType(ContentType.JSON)
            .body("{}")
        .when()
            .post("/auth/register")
        .then()
            .statusCode(400)
            .body("code", equalTo("VALIDATION-001"));
    }

    // TC-21-01: GET /api/auth/me with valid token returns profile
    @Test
    void me_validToken_returnsUserProfile() {
        String token = obtainCustomerToken();

        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("/auth/me")
        .then()
            .statusCode(200)
            .body("id", notNullValue())
            .body("email", notNullValue())
            .body("firstName", notNullValue())
            .body("role", notNullValue());
    }

    // TC-21-03: GET /api/auth/me without token returns 401
    @Test
    void me_noToken_returns401() {
        given()
        .when()
            .get("/auth/me")
        .then()
            .statusCode(401);
    }

    // TC-04-01
    @Test
    void bookings_noAuth_returns401() {
        given()
        .when()
            .get("/bookings")
        .then()
            .statusCode(401);
    }

    // TC-04-02
    @Test
    void ownerEndpoint_withCustomerToken_returns403() {
        String token = obtainCustomerToken();

        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("/owner/shop")
        .then()
            .statusCode(403);
    }

    private String obtainCustomerToken() {
        return given()
            .contentType(ContentType.JSON)
            .body("""
                { "email": "customer@test.com", "password": "Pass123!" }
                """)
            .post("/auth/login")
            .jsonPath()
            .getString("accessToken");
    }
}
```

---

#### `BookingIntegrationTest.java`

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BookingIntegrationTest {

    @LocalServerPort int port;
    private String customerToken;
    private String ownerToken;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";
        customerToken = loginAs("customer@test.com", "Pass123!");
        ownerToken   = loginAs("owner@test.com",    "Pass123!");
    }

    // TC-08-01
    @Test
    void createBooking_validInput_returns201() {
        given()
            .header("Authorization", "Bearer " + customerToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                  "shopId": "SEED_SHOP_UUID",
                  "serviceId": "SEED_SERVICE_UUID",
                  "bookingDate": "2026-06-15",
                  "timeSlot": "09:00"
                }
                """)
        .when()
            .post("/bookings")
        .then()
            .statusCode(201)
            .body("bookingCode", notNullValue())
            .body("status", equalTo("PENDING"));
    }

    // TC-11-05: Customer cannot change status
    @Test
    void updateStatus_asCustomer_returns403() {
        given()
            .header("Authorization", "Bearer " + customerToken)
            .contentType(ContentType.JSON)
            .body("{ \"status\": \"DROPPED_OFF\" }")
        .when()
            .put("/bookings/SOME_BOOKING_UUID/status")
        .then()
            .statusCode(403);
    }

    // TC-10-01: QR code endpoint returns image
    @Test
    void getQrCode_ownBooking_returnsPng() {
        given()
            .header("Authorization", "Bearer " + customerToken)
        .when()
            .get("/bookings/BOOKING_UUID/qrcode")
        .then()
            .statusCode(200)
            .contentType("image/png");
    }

    private String loginAs(String email, String password) {
        return given()
            .contentType(ContentType.JSON)
            .body(String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password))
            .post("/auth/login")
            .jsonPath().getString("accessToken");
    }
}
```

---

### Frontend — Vitest + React Testing Library

#### `LoginPage.test.tsx`

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import * as authApi from "@/features/auth/api/auth-api";

vi.mock("@/features/auth/api/auth-api");

describe("LoginPage", () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

  // TC-02-01: Login returns accessToken + nested user
  it("shows success and redirects on valid login", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "test.jwt.token",
      user: { id: "uuid", email: "user@test.com", firstName: "Test", lastName: "User", role: "CUSTOMER" },
    });

    renderPage();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith("user@test.com", "Password123!");
    });
  });

  // TC-02-02
  it("shows error message on invalid credentials", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("Invalid credentials"));

    renderPage();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  // TC-01-03: Form validation — empty fields
  it("shows validation errors on empty submission", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
```

---

#### `ShopsPage.test.tsx`

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ShopsPage from "@/pages/ShopsPage";
import * as shopApi from "@/features/shop/api/shop-api";

vi.mock("@/features/shop/api/shop-api");

describe("ShopsPage", () => {
  // TC-05-01
  it("renders shop list from API", async () => {
    vi.mocked(shopApi.getShops).mockResolvedValue([
      { id: "1", name: "Clean & Fold", address: "123 Main St", latitude: 14.5, longitude: 121.0 },
      { id: "2", name: "Wash Express", address: "456 Side St", latitude: 14.6, longitude: 121.1 },
    ]);

    render(
      <MemoryRouter>
        <ShopsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Clean & Fold")).toBeInTheDocument();
      expect(screen.getByText("Wash Express")).toBeInTheDocument();
    });
  });

  // TC-05-03
  it("shows empty state when no shops", async () => {
    vi.mocked(shopApi.getShops).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ShopsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no shops found/i)).toBeInTheDocument();
    });
  });
});
```

---

### Mobile — Espresso (Android)

#### `LoginFragmentTest.kt`

```kotlin
package edu.cit.canete.laundrylink

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LoginFragmentTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    // TC-02-01: Successful login navigates to home
    @Test
    fun login_validCredentials_navigatesToHome() {
        onView(withId(R.id.editTextEmail))
            .perform(typeText("customer@test.com"), closeSoftKeyboard())

        onView(withId(R.id.editTextPassword))
            .perform(typeText("Password123!"), closeSoftKeyboard())

        onView(withId(R.id.buttonLogin))
            .perform(click())

        onView(withId(R.id.homeFragment))
            .check(matches(isDisplayed()))
    }

    // TC-02-02: Invalid credentials shows error
    @Test
    fun login_invalidCredentials_showsError() {
        onView(withId(R.id.editTextEmail))
            .perform(typeText("wrong@test.com"), closeSoftKeyboard())

        onView(withId(R.id.editTextPassword))
            .perform(typeText("badpass"), closeSoftKeyboard())

        onView(withId(R.id.buttonLogin))
            .perform(click())

        onView(withId(R.id.textViewError))
            .check(matches(withText(containsString("Invalid"))))
    }

    // TC-01-03: Empty form validation
    @Test
    fun login_emptyFields_showsValidationError() {
        onView(withId(R.id.buttonLogin)).perform(click())

        onView(withId(R.id.emailInputLayout))
            .check(matches(hasDescendant(withText(containsString("required")))))
    }
}
```

---

#### `BookingFlowTest.kt`

```kotlin
@RunWith(AndroidJUnit4::class)
class BookingFlowTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    // TC-08-01: Complete booking flow
    @Test
    fun bookingFlow_validInputs_showsConfirmation() {
        loginAs("customer@test.com", "Password123!")

        onView(withId(R.id.nav_shops)).perform(click())

        onView(withId(R.id.recyclerViewShops))
            .perform(RecyclerViewActions.actionOnItemAtPosition<ShopAdapter.ViewHolder>(0, click()))

        onView(withId(R.id.buttonBookNow)).perform(click())

        onView(withId(R.id.radioButtonStandard)).perform(click())

        onView(withId(R.id.datePickerButton)).perform(click())

        onView(withId(R.id.buttonConfirmBooking)).perform(click())

        onView(withId(R.id.textViewBookingCode))
            .check(matches(isDisplayed()))
    }

    // TC-12-01: My bookings shows current user's bookings
    @Test
    fun myBookings_showsOnlyCurrentUserBookings() {
        loginAs("customer@test.com", "Password123!")

        onView(withId(R.id.nav_my_bookings)).perform(click())

        onView(withId(R.id.recyclerViewBookings))
            .check(matches(isDisplayed()))
    }

    private fun loginAs(email: String, password: String) {
        onView(withId(R.id.editTextEmail)).perform(typeText(email), closeSoftKeyboard())
        onView(withId(R.id.editTextPassword)).perform(typeText(password), closeSoftKeyboard())
        onView(withId(R.id.buttonLogin)).perform(click())
    }
}
```

---

## 9. Non-Functional Test Areas

### 9.1 Security

| Test | Method | Expected |
|------|--------|---------|
| SQL Injection on login inputs | Manual / OWASP ZAP | 400/401 response, no DB error leaked; GlobalExceptionHandler returns structured error |
| XSS in shop name field | Manual injection | Content escaped in UI, no script execution |
| JWT tampering | Manual | 401 Unauthorized |
| Password in response | Inspect API responses | `password` or `passwordHash` field never returned in any response |
| HTTPS enforcement | Config check | All API calls over TLS in production |
| CORS policy | OPTIONS request check | Only allowed origins can make requests |
| Rate limiting | Repeated rapid requests | 429 Too Many Requests (if implemented) |

### 9.2 Performance

| Test | Tool | Acceptance Criterion |
|------|------|---------------------|
| Shop listing API response time | JMeter / k6 | < 500ms under 50 concurrent users |
| Booking creation response time | k6 | < 1000ms under 20 concurrent users |
| Frontend initial load time | Lighthouse | Time to Interactive < 3s |
| Mobile app cold start | Android Profiler | < 2s cold start |

### 9.3 Usability / Accessibility

| Test | Method | Expected |
|------|--------|---------|
| Keyboard navigation on forms | Manual | All form fields tab-accessible |
| Screen reader compatibility | NVDA / VoiceOver | Form labels read correctly |
| Color contrast | Lighthouse | WCAG AA compliance |
| Mobile responsiveness | Chrome DevTools | Layouts render correctly at 375px, 768px, 1280px |

---

## 10. Test Execution Schedule

| Phase | Activities | Duration |
|-------|-----------|---------|
| Phase 1 — Unit Tests | Backend services, JWT, QR, EmailService, GlobalExceptionHandler, GET /me | 1 day |
| Phase 2 — Integration Tests | All API endpoints (REST Assured), including /auth/me | 2 days |
| Phase 3 — Frontend Component Tests | Vitest + RTL for all major pages | 1 day |
| Phase 4 — End-to-End Web | Cypress: full user journeys incl. email sandbox verification | 2 days |
| Phase 5 — Mobile Tests | Espresso UI tests | 1 day |
| Phase 6 — Security & Exploratory | Manual, OWASP ZAP, GlobalExceptionHandler format checks | 1 day |
| Phase 7 — Regression | Re-run all suites after fixes | 1 day |
| **Total** | | **~9 days** |

---

## 11. Entry & Exit Criteria

### 11.1 Entry Criteria (start testing)

- [ ] All P1 features implemented and deployed to test environment
- [ ] Test database seeded with demo data (`seed_demo.sql`)
- [ ] All environment variables configured (including `APP_MAIL_FROM`, `APP_FRONTEND_URL`)
- [ ] API accessible at test base URL
- [ ] Mail sandbox (e.g., Mailtrap) configured for email capture

### 11.2 Exit Criteria (testing complete)

- [ ] 100% of P1 test cases executed
- [ ] 100% of P2 test cases executed
- [ ] No open P1 defects
- [ ] No more than 3 open P2 defects
- [ ] All automated test suites passing in CI
- [ ] Security checks completed with no critical findings
- [ ] GET /api/auth/me returns correct profile for all three roles (CUSTOMER, SHOP_OWNER, ADMIN)
- [ ] Welcome email and booking confirmation email verified in mail sandbox

---

## 12. Defect Management

### 12.1 Severity Levels

| Severity | Definition | Example |
|----------|-----------|---------|
| **S1 — Critical** | System unusable / data loss / security breach | Cannot log in, payment not processed, RBAC bypass |
| **S2 — Major** | Core feature broken | Cannot create booking, status not updating, /me returns wrong user |
| **S3 — Minor** | Feature works with workaround | Filter not working, wrong error message, email not sent |
| **S4 — Cosmetic** | UI/display issue, no functional impact | Misaligned button, typo |

### 12.2 Defect Report Template

```
ID:           BUG-XXX
Title:        <Short description>
Severity:     S1 / S2 / S3 / S4
Priority:     P1 / P2 / P3
Module:       Auth / Booking / Payment / Owner / Admin / Mobile / Email / Exception
Environment:  Backend v1.1 / Web vX.X / Android vX.X
Steps to Reproduce:
  1. ...
  2. ...
Expected Result: <what should happen>
Actual Result:   <what actually happened>
Screenshot/Log:  <attach if applicable>
Reported By:     <name>
Date:            <YYYY-MM-DD>
```

### 12.3 Defect Workflow

```
Open → In Progress → Fixed → Retest → Closed
                  ↓
             Rejected (if not a bug)
                  ↓
             Deferred (accepted for future sprint)
```

---

*End of Software Test Plan — LaundryLink System v1.1*
