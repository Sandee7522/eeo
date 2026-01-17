This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## ###########################################################
 
* inisilize the nextjs project 

* Add authentication with Google and github *both are pending*

* create schema for users

Har schema change ke baad:
# Step 1: Database update karo (db push ya migrate)
npx prisma db push

# Step 2: Prisma Client regenerate karo (ZAROORI!)
npx prisma generate

# Step :___ check your data storded data are not

  npx prisma studio



# Jap Tracker API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication Endpoints

### 1. Sign Up
**Endpoint:** `POST /api/auth?action=signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "provider": "EMAIL",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

---

### 2. Sign In
**Endpoint:** `POST /api/auth?action=signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "provider": "EMAIL"
    },
    "token": "jwt-token-here"
  }
}
```

---

### 3. Forgot Password
**Endpoint:** `POST /api/auth?action=forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent",
  "resetToken": "reset-token-here"  // Only in development
}
```

---

### 4. Reset Password
**Endpoint:** `POST /api/auth?action=reset-password`

**Request Body:**
```json
{
  "email": "john@example.com",
  "resetToken": "reset-token-from-email",
  "newPassword": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

### 5. Get Profile
**Endpoint:** `GET /api/auth?action=profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "provider": "EMAIL",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "japs": 5
    }
  }
}
```

---

### 6. Logout
**Endpoint:** `POST /api/auth?action=logout`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📊 Jap Management Endpoints

### 1. Create Jap
**Endpoint:** `POST /api/japs`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Daily Exercise",
  "description": "Track daily workouts",
  "goal": 100
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Jap created successfully",
  "data": {
    "id": "uuid",
    "name": "Daily Exercise",
    "description": "Track daily workouts",
    "count": 0,
    "goal": 100,
    "isActive": true,
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Get All Japs
**Endpoint:** `GET /api/japs`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `isActive` (optional): "true" or "false"
- `search` (optional): Search by name

**Example:** `GET /api/japs?isActive=true&search=exercise`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Japs retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Daily Exercise",
      "description": "Track daily workouts",
      "count": 25,
      "goal": 100,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "history": 25
      }
    }
  ]
}
```

---

### 3. Get Single Jap
**Endpoint:** `GET /api/japs?japId=<jap-id>`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Jap retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Daily Exercise",
    "count": 25,
    "goal": 100,
    "history": [
      {
        "id": "uuid",
        "count": 1,
        "date": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 4. Update Jap
**Endpoint:** `PATCH /api/japs?japId=<jap-id>`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "goal": 150,
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Jap updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "goal": 150,
    "isActive": false
  }
}
```

---

### 5. Delete Jap
**Endpoint:** `DELETE /api/japs?japId=<jap-id>`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Jap deleted successfully"
}
```

---

### 6. Increment Count
**Endpoint:** `POST /api/japs?action=increment&japId=<jap-id>`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "count": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Count incremented successfully",
  "data": {
    "id": "uuid",
    "count": 26,
    "history": [...]
  }
}
```

---

### 7. Get Jap History
**Endpoint:** `GET /api/japs?action=history&japId=<jap-id>`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `limit` (optional): Number (default: 100)

**Success Response (200):**
```json
{
  "success": true,
  "message": "History retrieved successfully",
  "data": {
    "history": [
      {
        "id": "uuid",
        "count": 1,
        "date": "2024-01-01T10:00:00.000Z"
      }
    ],
    "totalCount": 25
  }
}
```

---

### 8. Get User Stats
**Endpoint:** `GET /api/japs?action=stats`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "totalJaps": 5,
    "activeJaps": 3,
    "totalCount": 125,
    "goalsProgress": [
      {
        "id": "uuid",
        "name": "Daily Exercise",
        "current": 25,
        "goal": 100,
        "percentage": "25.00"
      }
    ],
    "recentActivity": [...]
  }
}
```

---

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Jap not found or access denied"
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔑 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## 🛡️ Security Features

✅ JWT-based authentication  
✅ Bcrypt password hashing (12 rounds)  
✅ User ID extracted from token only  
✅ Secure password reset flow  
✅ Token expiration (7 days default)  
✅ Reset token expiration (1 hour)  
✅ Input validation with Zod  
✅ SQL injection protection (Prisma)  
✅ No sensitive data in error messages