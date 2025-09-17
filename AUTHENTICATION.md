# Authentication System Documentation

## Overview

This authentication system provides secure user management with JWT-based authentication, rate limiting, and role-based access control integrated with Arcjet security.

## Features

### User Management

- User registration with email validation
- Secure password hashing using bcryptjs (12 salt rounds)
- JWT token-based authentication
- User profile management
- Password change functionality

### Security Features

- Dynamic rate limiting based on user role:
  - **Guests (unauthenticated)**: 5 requests/minute
  - **Users (authenticated)**: 15 requests/minute
  - **Admins**: 30 requests/minute
- Additional rate limiting for auth endpoints (5 attempts per 15 minutes)
- Bot detection and blocking via Arcjet
- Security threat shield
- Input validation and sanitization

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/login`

Authenticate user and receive access token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/auth/profile`

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/auth/profile`

Update user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "John Smith"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/change-password`

Change user password (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

#### POST `/api/auth/logout`

Logout user (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200):**

```json
{
  "message": "Logout successful"
}
```

## Error Responses

### Validation Errors (400)

```json
{
  "error": "Validation Error",
  "message": "Name, email, and password are required"
}
```

### Authentication Errors (401)

```json
{
  "error": "Authentication Error",
  "message": "Invalid email or password"
}
```

### Rate Limit Exceeded (429)

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Consider registering for higher limits.",
  "retryAfter": 60
}
```

### Conflict Errors (409)

```json
{
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

## Environment Variables

Add these to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:port/database

# Authentication Rate Limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
AUTH_RATE_LIMIT_MAX=5             # 5 attempts per window
PROFILE_RATE_LIMIT_MAX=20         # 20 profile requests per window
```

## Usage Examples

### Frontend Integration

#### Registration

```javascript
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "securepassword123",
  }),
});

const data = await response.json();
if (response.ok) {
  localStorage.setItem("token", data.token);
  // Redirect to dashboard
}
```

#### Making Authenticated Requests

```javascript
const token = localStorage.getItem("token");

const response = await fetch("/api/auth/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const userProfile = await response.json();
```

## Security Best Practices

1. **Always use HTTPS** in production to protect token transmission
2. **Store JWT tokens securely** (httpOnly cookies recommended over localStorage)
3. **Implement token refresh** for better security
4. **Use strong JWT secrets** (minimum 32 characters, cryptographically random)
5. **Validate and sanitize all inputs**
6. **Monitor authentication logs** for suspicious activity
7. **Implement account lockout** after multiple failed attempts

## Rate Limiting Details

The system implements multi-layer rate limiting:

1. **Arcjet Security Layer**: Dynamic limits based on user role
2. **Express Rate Limit**: Additional protection for auth endpoints
3. **Progressive Enhancement**: Higher limits for authenticated users

This encourages user registration while protecting against abuse.
