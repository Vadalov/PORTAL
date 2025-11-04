# Convex Backend Deployment Guide

This guide covers deploying and managing the Convex backend for production.

## Prerequisites

- Convex account (sign up at https://convex.dev)
- Convex CLI installed: `npm install -g convex`
- Node.js 20+ installed

## Initial Setup

### 1. Login to Convex

```bash
npx convex dev
```

This will:
- Open your browser for authentication
- Create a `.env.local` file with your deployment URL
- Start the development deployment

### 2. Get Your Deployment URL

After logging in, your Convex deployment URL will be in `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
```

## Development vs Production

### Development Deployment

- Automatically created when you run `npx convex dev`
- Used for local development
- Changes are pushed immediately
- URL format: `https://your-project-name.convex.cloud`

### Production Deployment

For production, you have two options:

#### Option 1: Use Same Project (Recommended for Small Projects)

1. Use the same Convex project for both dev and prod
2. Set `NEXT_PUBLIC_CONVEX_URL` in production to your Convex URL
3. Deploy functions: `npx convex deploy`

**Pros**: Simple, no data migration needed
**Cons**: Dev and prod share the same database

#### Option 2: Separate Production Project

1. Create a new Convex project for production:
   ```bash
   npx convex deploy --prod
   ```

2. Get production URL from Convex dashboard
3. Set `NEXT_PUBLIC_CONVEX_URL` to production URL
4. Deploy functions to production:
   ```bash
   npx convex deploy --prod
   ```

**Pros**: Isolated environments, safer for production
**Cons**: Requires data migration if needed

## Deploying Functions

### Deploy to Development

```bash
npx convex dev
```

This automatically deploys changes as you develop.

### Deploy to Production

```bash
npx convex deploy --prod
```

Or if using a separate project:

```bash
npx convex deploy --prod --prod-url https://your-prod-project.convex.cloud
```

## Schema Deployment

The schema is defined in `convex/schema.ts`. When you deploy:

1. Schema changes are automatically detected
2. Convex will prompt you to confirm schema changes
3. Review changes carefully before confirming

### Important Schema Considerations

- **Breaking Changes**: Adding required fields to existing tables will fail
- **Data Migration**: Plan migrations for schema changes
- **Indexes**: Add indexes for frequently queried fields

## Function Deployment

All Convex functions are in the `convex/` directory:

- `users.ts` - User management
- `beneficiaries.ts` - Beneficiary management
- `donations.ts` - Donation tracking
- `tasks.ts` - Task management
- `meetings.ts` - Meeting management
- `messages.ts` - Messaging
- `aid_applications.ts` - Aid applications
- `finance_records.ts` - Financial records
- `auth.ts` - Authentication

Functions are automatically deployed when you run `npx convex deploy`.

## Verifying Deployment

### 1. Check Convex Dashboard

1. Visit: https://dashboard.convex.dev
2. Select your project
3. Check "Functions" tab to see all deployed functions
4. Check "Data" tab to verify schema

### 2. Test Functions

```bash
# Test a query function
npx convex run beneficiaries:list

# Test a mutation function
npx convex run beneficiaries:create '{ "name": "Test", "tc_no": "12345678901", ... }'
```

### 3. Check Application

1. Deploy your Next.js app with `NEXT_PUBLIC_CONVEX_URL` set
2. Test authentication
3. Test CRUD operations
4. Monitor Convex dashboard for errors

## Environment Variables

### Required for Production

```env
NEXT_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud
```

### Optional

- Convex auth configuration (if using custom auth)
- Convex API keys (if needed for server-side operations)

## Data Migration

### Exporting Data

1. Use Convex dashboard to export data
2. Or use Convex functions to export data programmatically

### Importing Data

1. Use Convex dashboard data import feature
2. Or create migration scripts using Convex mutations

### Migration Best Practices

1. **Backup First**: Always backup data before migration
2. **Test in Development**: Test migrations in dev environment first
3. **Incremental**: Migrate in small batches if possible
4. **Verify**: Check data integrity after migration

## Monitoring

### Convex Dashboard

Monitor your deployment:
- Function execution times
- Error rates
- Data usage
- Query performance

### Logs

View function logs in Convex dashboard:
- Click on a function
- View execution history
- Check error messages

### Alerts

Set up alerts in Convex dashboard for:
- High error rates
- Slow queries
- Data usage limits

## Troubleshooting

### Functions Not Deploying

1. Check Convex CLI is up to date: `npm install -g convex@latest`
2. Verify you're logged in: `npx convex dev`
3. Check for syntax errors in function files
4. Review Convex dashboard for error messages

### Schema Changes Failing

1. Check for breaking changes
2. Make changes incrementally
3. Add optional fields first, then make required
4. Use migrations for complex changes

### Connection Issues

1. Verify `NEXT_PUBLIC_CONVEX_URL` is correct
2. Check network connectivity
3. Verify Convex service status
4. Check browser console for errors

## Best Practices

### Development

1. Use `npx convex dev` for active development
2. Test functions before deploying
3. Review schema changes carefully
4. Keep dev and prod schemas in sync

### Production

1. Deploy to production during low-traffic periods
2. Test in staging first if possible
3. Monitor after deployment
4. Have rollback plan ready

### Security

1. Never commit `.env.local` with secrets
2. Use environment variables for all configuration
3. Review function permissions
4. Monitor for unauthorized access

## Additional Resources

- Convex Documentation: https://docs.convex.dev
- Convex Dashboard: https://dashboard.convex.dev
- Convex Discord: https://convex.dev/community

---

**Last Updated**: 2025-01-XX
**Convex Version**: Latest

