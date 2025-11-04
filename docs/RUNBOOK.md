# Production Runbook

This runbook provides troubleshooting guides and operational procedures for the production deployment.

## Table of Contents

1. [Common Issues](#common-issues)
2. [Troubleshooting Procedures](#troubleshooting-procedures)
3. [Emergency Procedures](#emergency-procedures)
4. [Maintenance Tasks](#maintenance-tasks)
5. [Contact Information](#contact-information)

## Common Issues

### Application Not Loading

**Symptoms**: 
- Blank page or error page
- 500 Internal Server Error
- Timeout errors

**Possible Causes**:
1. Environment variables not set correctly
2. Convex connection failure
3. Build errors
4. Server resource exhaustion

**Resolution Steps**:

1. **Check Health Endpoint**:
   ```bash
   curl https://your-domain.com/api/health
   ```
   Should return `{"status":"ok"}`

2. **Check Application Logs**:
   - Review platform-specific logs
   - Check Sentry for errors
   - Review Convex dashboard

3. **Verify Environment Variables**:
   - Check `NEXT_PUBLIC_CONVEX_URL` is set
   - Verify all required secrets are present
   - Check for typos in variable names

4. **Check Convex Status**:
   - Visit Convex dashboard
   - Verify deployment is active
   - Check for errors in Convex logs

### Authentication Not Working

**Symptoms**:
- Users cannot log in
- Session expires immediately
- Redirect loops

**Possible Causes**:
1. Session secret misconfigured
2. CSRF token issues
3. Convex auth configuration error
4. Cookie issues

**Resolution Steps**:

1. **Check Session Secret**:
   - Verify `SESSION_SECRET` is set and at least 32 characters
   - Check if secret was changed recently

2. **Check CSRF Secret**:
   - Verify `CSRF_SECRET` is set correctly
   - Check CSRF endpoint: `/api/csrf`

3. **Check Browser Console**:
   - Look for authentication errors
   - Check network tab for failed requests

4. **Verify Convex Auth**:
   - Check Convex dashboard for auth configuration
   - Verify user data in Convex

### Database Connection Issues

**Symptoms**:
- Data not loading
- "Connection failed" errors
- Empty lists

**Possible Causes**:
1. Convex URL incorrect
2. Convex deployment down
3. Network issues
4. Rate limiting

**Resolution Steps**:

1. **Verify Convex URL**:
   ```bash
   echo $NEXT_PUBLIC_CONVEX_URL
   ```
   Should be a valid Convex URL

2. **Test Convex Connection**:
   ```bash
   curl https://your-convex-url.convex.cloud/api/health
   ```

3. **Check Convex Dashboard**:
   - Verify deployment is active
   - Check for errors
   - Review query performance

4. **Check Rate Limits**:
   - Review Convex usage
   - Check if limits are exceeded

### Performance Issues

**Symptoms**:
- Slow page loads
- Timeouts
- High CPU/memory usage

**Possible Causes**:
1. Large bundle size
2. Inefficient queries
3. Resource exhaustion
4. Network issues

**Resolution Steps**:

1. **Check Bundle Size**:
   ```bash
   ANALYZE=true npm run build
   ```
   Review bundle analysis report

2. **Monitor Performance**:
   - Check Web Vitals
   - Review Sentry performance data
   - Check server resources

3. **Optimize Queries**:
   - Review Convex query performance
   - Add indexes if needed
   - Optimize data fetching

4. **Scale Resources**:
   - Increase server resources if needed
   - Enable CDN if available
   - Optimize caching

## Troubleshooting Procedures

### Step 1: Gather Information

1. **Error Details**:
   - Error message
   - Stack trace
   - When it occurred
   - User actions before error

2. **Environment**:
   - Deployment URL
   - Environment variables (values hidden)
   - Recent deployments

3. **Logs**:
   - Application logs
   - Sentry errors
   - Convex logs
   - Browser console errors

### Step 2: Identify Root Cause

1. Check Sentry for error reports
2. Review application logs
3. Check Convex dashboard
4. Test affected functionality
5. Review recent changes

### Step 3: Apply Fix

1. **Quick Fix** (if available):
   - Restart application
   - Clear cache
   - Rollback deployment

2. **Permanent Fix**:
   - Fix root cause
   - Test fix in staging
   - Deploy to production
   - Monitor for issues

### Step 4: Verify Resolution

1. Test affected functionality
2. Monitor error rates
3. Check performance metrics
4. Confirm with affected users

## Emergency Procedures

### Complete Service Outage

**Immediate Actions**:

1. **Check Status**:
   - Health endpoint: `/api/health`
   - Platform status page
   - Convex status

2. **Rollback** (if recent deployment):
   ```bash
   # Revert to previous deployment
   # Platform-specific rollback command
   ```

3. **Notify Stakeholders**:
   - Send incident notification
   - Update status page if available

4. **Investigate**:
   - Check all logs
   - Review recent changes
   - Test basic functionality

### Data Loss

**Immediate Actions**:

1. **Stop All Operations**:
   - Prevent further data loss
   - Document current state

2. **Assess Damage**:
   - What data was lost?
   - When did it occur?
   - Can it be recovered?

3. **Recovery**:
   - Check Convex backups
   - Restore from backup if available
   - Document recovery process

4. **Prevention**:
   - Review what caused data loss
   - Implement safeguards
   - Update procedures

### Security Incident

**Immediate Actions**:

1. **Contain Threat**:
   - Disable affected accounts
   - Revoke compromised secrets
   - Isolate affected systems

2. **Assess Damage**:
   - What was accessed?
   - What data was exposed?
   - When did it occur?

3. **Remediate**:
   - Rotate all secrets
   - Patch vulnerabilities
   - Update security measures

4. **Notify**:
   - Internal team
   - Affected users (if required)
   - Authorities (if required by law)

## Maintenance Tasks

### Daily

- [ ] Check error rates in Sentry
- [ ] Review application logs
- [ ] Monitor performance metrics
- [ ] Check Convex dashboard

### Weekly

- [ ] Review security logs
- [ ] Check for dependency updates
- [ ] Review performance trends
- [ ] Backup verification

### Monthly

- [ ] Security audit
- [ ] Performance optimization review
- [ ] Dependency updates
- [ ] Documentation updates

### Quarterly

- [ ] Full security review
- [ ] Performance optimization
- [ ] Disaster recovery drill
- [ ] Capacity planning

## Monitoring Checklist

### Application Health

- [ ] Health endpoint responding
- [ ] Response times acceptable
- [ ] Error rates normal
- [ ] Uptime > 99.9%

### Database

- [ ] Convex connection stable
- [ ] Query performance acceptable
- [ ] No data corruption
- [ ] Backups successful

### Security

- [ ] No unauthorized access
- [ ] No security alerts
- [ ] SSL certificate valid
- [ ] Security headers present

### Performance

- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] Resource usage normal
- [ ] No memory leaks

## Rollback Procedure

### When to Rollback

- Critical bugs introduced
- Performance degradation
- Security issues
- Data corruption

### Rollback Steps

1. **Identify Last Good Deployment**:
   - Check deployment history
   - Identify commit hash
   - Review what changed

2. **Execute Rollback**:
   ```bash
   # Platform-specific rollback
   # Usually via platform dashboard
   ```

3. **Verify Rollback**:
   - Test critical functionality
   - Check error rates
   - Monitor performance

4. **Document**:
   - Why rollback was needed
   - What was fixed
   - Prevention measures

## Contact Information

### Internal Team

- **Development Team**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Security Team**: [Contact Info]

### External Services

- **Convex Support**: https://convex.dev/support
- **Sentry Support**: https://sentry.io/support
- **Platform Support**: [Platform-specific]

### Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **Manager**: [Contact Info]
- **Security Team**: [Contact Info]

## Appendix

### Useful Commands

```bash
# Health check
curl https://your-domain.com/api/health

# Check build
npm run build

# Run tests
npm run test:run

# Type check
npm run typecheck

# Lint check
npm run lint
```

### Useful URLs

- Application: https://your-domain.com
- Convex Dashboard: https://dashboard.convex.dev
- Sentry Dashboard: https://sentry.io
- Platform Dashboard: [Platform-specific]

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

