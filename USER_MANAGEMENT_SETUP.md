# User Management System Setup

## Overview
A complete user authentication and management system has been implemented with admin controls and user tracking.

## What's Been Implemented

### 1. User Model (`lib/models/User.ts`)
- Username and email (unique)
- Password (hashed with bcryptjs)
- Admin flag to control access
- Password comparison method for authentication

### 2. Authentication API Endpoints

#### Login (`/api/auth/login`)
- POST endpoint for user login
- Returns JWT token stored in httpOnly cookie
- Validates credentials and returns user info

#### Register (`/api/auth/register`)
- POST endpoint for user registration
- **Admin-only access** - only admins can register new users
- Allows setting admin flag when creating users
- Validates unique username/email

#### Logout (`/api/auth/logout`)
- POST endpoint to clear authentication cookie

#### Me (`/api/auth/me`)
- GET endpoint to fetch current logged-in user
- Used for auth verification

### 3. Authentication Utilities (`lib/auth.ts`)
- `verifyAuth()` - Verifies JWT token from request
- `getTokenFromRequest()` - Extracts token from cookies

### 4. Pages

#### Login Page (`/app/auth/login`)
- Clean login form with username and password
- Password visibility toggle
- Error handling and loading states
- Redirects to dashboard on successful login

#### User Registration Page (`/app/auth/register`)
- **Admin-only access** - redirects non-admins to dashboard
- Register new users with username, email, password
- Admin checkbox to grant admin privileges
- Success/error notifications
- Form validation

#### Home Page (`/app/page.tsx`)
- Redirects authenticated users to `/dashboard`
- Redirects unauthenticated users to `/auth/login`

#### Dashboard (`/app/dashboard/page.tsx`)
- Main dashboard with inventory overview
- Auth check on load
- Stats, recent items, recent issues, expiry alerts

### 5. Updated Sidebar (`/app/components/Sidebar.tsx`)
- Displays current logged-in user
- User avatar with first letter
- Shows admin/user role
- User menu with:
  - Register User button (admin-only)
  - Logout button
- Clickable user profile section

### 6. Updated Data Models

#### Item Model (`lib/models/Item.ts`)
- Added `recordedByUserId` field to track which user created the item
- Keeps existing `recordedBy` field for backward compatibility

#### IssuedItem Model (`lib/models/IssuedItem.ts`)
- Added `issuedByUserId` field to track who issued the item
- Added `approvedByUserId` field to track who approved
- Keeps existing string fields for backward compatibility

## Environment Variables

Add to `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/Inventory
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Dependencies Added

```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.1.2",
  "@types/jsonwebtoken": "^9.0.7"
}
```

Run `npm install` to install new dependencies.

## Flow

1. **First Time Setup**
   - Create first admin user directly in MongoDB
   - Or modify register endpoint temporarily to allow first user creation

2. **User Login**
   - User goes to `/auth/login`
   - Enters credentials
   - JWT token stored in httpOnly cookie
   - Redirected to `/dashboard`

3. **Admin User Registration**
   - Admin goes to `/auth/register`
   - Fills user details
   - Can check "Admin User" checkbox
   - New user created and can login

4. **Regular User**
   - Cannot access `/auth/register`
   - Can only use inventory features
   - All actions tracked with their user ID

## Security Features

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens in httpOnly cookies (secure, not accessible via JS)
- Admin-only registration endpoint
- Auth verification on protected routes
- Token expiration (7 days)

## Next Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create first admin user**
   ```bash
   npm run create-admin
   ```
   
   Or with custom credentials:
   ```bash
   npm run create-admin -- username email password
   ```
   
   Example:
   ```bash
   npm run create-admin -- admin admin@company.com MySecurePassword123
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Login**
   - Go to `http://localhost:3000`
   - You'll be redirected to `/auth/login`
   - Use the admin credentials you created
   - You'll be redirected to `/dashboard`

5. **Register more users**
   - Click on your user profile in the sidebar
   - Click "Register User"
   - Fill in user details
   - Check "Admin User" if you want to make them an admin
   - Click "Register User"

6. **Update item/issue creation endpoints**
   - Modify `/api/items/route.ts` to capture `recordedByUserId` from auth
   - Modify `/api/issues/route.ts` to capture `issuedByUserId` from auth
   - This will automatically track who created/issued items
