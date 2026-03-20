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
