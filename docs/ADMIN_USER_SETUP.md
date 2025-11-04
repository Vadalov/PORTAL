# Admin User Setup Guide

This guide explains how to create the initial admin user for production deployment.

## Method 1: Via Application UI (Recommended)

1. **Deploy the application** to production
2. **Access the registration page** (if available) or login page
3. **Create initial user** with admin credentials
4. **Update user role** to `SUPER_ADMIN` or `ADMIN` via Convex dashboard

## Method 2: Via Convex Dashboard

1. **Login to Convex Dashboard**: https://dashboard.convex.dev
2. **Select your production project**
3. **Navigate to Data tab**
4. **Select `users` collection**
5. **Click "Add Document"**
6. **Fill in required fields**:
   ```json
   {
     "name": "Admin User",
     "email": "admin@yourdomain.com",
     "password": "hashed-password-here",
     "role": "SUPER_ADMIN",
     "status": "active",
     "created_at": "2025-01-XX",
     "updated_at": "2025-01-XX"
   }
   ```

**Note**: Password must be hashed. Use your authentication system's password hashing.

## Method 3: Via Convex Functions

Create a temporary function to create admin user:

```typescript
// convex/createAdmin.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(), // Will be hashed in the function
  },
  handler: async (ctx, args) => {
    // Hash password (use your auth system's hashing)
    // Create user with SUPER_ADMIN role
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "active",
      // ... other required fields
    });
  },
});
```

Then run:
```bash
npx convex run createAdmin:createAdmin --args '{"name":"Admin","email":"admin@example.com","password":"secure-password"}'
```

## Method 4: Using Existing Script

If you have a script for creating test users:

1. **Update script** to work with production Convex URL
2. **Set environment variable**: `NEXT_PUBLIC_CONVEX_URL=your-production-url`
3. **Run script**: `npx tsx src/scripts/create-test-users.ts`
4. **Update user role** to `SUPER_ADMIN` if needed

## Initial Admin User Details

### Recommended Configuration

- **Email**: Use a dedicated admin email (e.g., `admin@yourdomain.com`)
- **Password**: Strong password (12+ characters, mixed case, numbers, symbols)
- **Role**: `SUPER_ADMIN` (full system access)
- **Status**: `active`

### Security Best Practices

1. **Use strong password**: Minimum 12 characters, complex
2. **Enable 2FA**: If your authentication system supports it
3. **Document credentials securely**: Store in password manager
4. **Limit access**: Only create admin users when necessary
5. **Regular audit**: Review admin users periodically

## Verification

After creating admin user:

1. **Login test**: Verify you can log in with admin credentials
2. **Permission test**: Verify you have full access
3. **Role verification**: Check user role in Convex dashboard
4. **Delete test users**: Remove any test users created during setup

## Troubleshooting

### Cannot Login

- Verify user exists in Convex
- Check password is correct
- Verify user status is `active`
- Check authentication configuration

### No Permissions

- Verify user role is `SUPER_ADMIN` or `ADMIN`
- Check role-based access control configuration
- Review permission settings

### User Not Found

- Verify user was created in correct Convex project
- Check Convex URL is correct
- Verify collection name is `users`

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

