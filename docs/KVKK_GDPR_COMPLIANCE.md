# KVKK/GDPR Compliance Documentation

## TC Number (Turkish National ID) Security and Privacy

This document outlines the security measures and compliance controls implemented for handling Turkish National ID (TC) numbers in the PORTAL system, in accordance with KVKK (Turkish Personal Data Protection Law) and GDPR requirements.

## Overview

TC numbers are classified as sensitive personal data (PII) and are subject to strict security and privacy controls. This system implements comprehensive protection measures to ensure compliance with data protection regulations.

## Security Measures Implemented

### 1. Data Encryption at Rest

**Implementation:**
- TC numbers are hashed using SHA-256 with a salt before storage
- Hash function: `hashTcNumber()` in `convex/tc_security.ts`
- Salt: Stored in system configuration (should be moved to environment variables in production)

**Technical Details:**
- Algorithm: SHA-256
- Salt: Application-specific salt (currently constant, should be configurable)
- Format: 64-character hexadecimal hash
- Deterministic: Same TC number always produces the same hash (enables indexing/search)

**Location:** `convex/tc_security.ts`

### 2. Role-Based Access Control (RBAC)

**Authorized Roles:**
- `SUPER_ADMIN`: Full access
- `ADMIN`: Full access
- `MANAGER`: Full access
- `MEMBER`: No access to TC numbers
- `VIEWER`: No access to TC numbers
- `VOLUNTEER`: No access to TC numbers

**Implementation:**
- All queries and mutations accessing TC numbers require authentication
- Access control enforced via `requireTcNumberAccess()` function
- Unauthorized access attempts are logged and rejected

**Location:** `convex/tc_security.ts` - `canAccessTcNumber()` and `requireTcNumberAccess()`

### 3. Access Logging and Audit Trails

**Audit Logging:**
- All TC number access is logged with:
  - User ID and role
  - Action performed (create, read, update, search)
  - Timestamp
  - Masked TC number (first 3 and last 2 digits only)

**Log Format:**
```
[AUDIT] {action} by user {userId} ({role}) - TC: {maskedTc} - {additionalInfo}
```

**Implementation:**
- Function: `logTcNumberAccess()` in `convex/tc_security.ts`
- All TC number operations log access automatically
- Logs use `console.warn` to comply with linting rules

**Location:** All Convex functions that handle TC numbers

### 4. Data Masking in Logs

**Implementation:**
- TC numbers are automatically masked in all log outputs
- Mask format: `123*********` (first 3 digits, 6 asterisks, last 2 digits)
- Logger automatically detects and masks TC number fields

**Fields Automatically Masked:**
- `tc_no`
- `applicant_tc_no`
- `tcNo`
- Any field containing "tc" in the name

**Location:** `src/lib/logger.ts` - `maskSensitive()` function

### 5. Input Validation

**Validation Rules:**
- TC numbers must be exactly 11 digits
- Format validation: `/^\d{11}$/`
- Validation occurs before hashing and storage

**Implementation:**
- Function: `validateTcNumber()` in `convex/tc_security.ts`
- All TC number inputs are validated before processing

### 6. Index Usage

**Current Implementation:**
- Indexes operate on hashed TC numbers
- Search operations hash the search term before querying
- Backward compatibility: System checks both hashed and plain values during migration period

**Indexes:**
- `beneficiaries.by_tc_no`: Indexes hashed `tc_no`
- `scholarship_applications.by_tc_no`: Indexes hashed `applicant_tc_no`

## Data Collection and Consent

### Consent Requirements

**Legal Basis:**
- Explicit consent required before collecting TC numbers
- Consent must be documented and stored
- Users must be informed about:
  - Purpose of data collection
  - How data will be used
  - Data retention period
  - Their rights (access, rectification, deletion)

**Implementation:**
- Consent records stored in `consents` table
- Consent type: `data_processing`
- Status tracking: `active`, `revoked`, `expired`

**Location:** `convex/consents.ts` and `convex/schema.ts`

## Data Retention Policy

### Retention Period

**Current Policy:**
- TC numbers are retained for as long as necessary for:
  - Processing aid applications
  - Managing beneficiary records
  - Fulfilling legal obligations
  - Scholarship application processing

**Deletion:**
- TC numbers are automatically deleted when:
  - Beneficiary record is deleted (status: `SILINDI`)
  - Consent is revoked and retention period expires
  - Legal retention period expires

**Implementation:**
- Soft delete: Records marked as deleted, not immediately removed
- Hard delete: Scheduled cleanup of records past retention period
- Audit trail: Deletion actions are logged

## Access Rights (Data Subject Rights)

### Right to Access

**Implementation:**
- Users can request access to their TC number data
- Access requests must be authenticated
- Response includes:
  - What data is stored (hashed value)
  - When it was collected
  - How it's being used
  - Who has access

### Right to Rectification

**Implementation:**
- Users can request correction of their TC number
- Updates require authentication and proper role
- All updates are logged for audit

### Right to Erasure (Right to be Forgotten)

**Implementation:**
- Users can request deletion of their TC number
- Deletion requires:
  - Authentication
  - Proper authorization (ADMIN/MANAGER role)
  - Verification of identity
- Deletion is logged for audit

### Right to Data Portability

**Implementation:**
- Users can request export of their data
- Export includes masked TC numbers only
- Format: JSON or CSV
- Secure delivery method required

## Security Best Practices

### Development Guidelines

1. **Never log raw TC numbers:**
   - Always use `maskTcNumber()` before logging
   - Logger automatically masks TC numbers

2. **Always validate input:**
   - Use `validateTcNumber()` before processing
   - Reject invalid formats

3. **Always hash before storage:**
   - Use `hashTcNumber()` before database operations
   - Never store plain TC numbers

4. **Always check permissions:**
   - Use `requireTcNumberAccess()` in all TC number operations
   - Don't bypass access controls

5. **Always log access:**
   - Use `logTcNumberAccess()` for audit trails
   - Include relevant context

### Code Examples

**Correct TC Number Handling:**
```typescript
// Validate input
if (!validateTcNumber(tcNo)) {
  throw new Error("Invalid TC number format");
}

// Require authentication
const userInfo = await requireTcNumberAccess(ctx);

// Hash before storage
const hashedTc = await hashTcNumber(tcNo);

// Log access
logTcNumberAccess("Operation", userInfo, maskTcNumber(tcNo));

// Store hashed value
await ctx.db.insert("table", { tc_no: hashedTc });
```

**Incorrect TC Number Handling:**
```typescript
// ❌ DON'T: Store plain TC number
await ctx.db.insert("table", { tc_no: tcNo });

// ❌ DON'T: Log raw TC number
console.log(`TC number: ${tcNo}`);

// ❌ DON'T: Skip access control
const result = await ctx.db.query("table").collect();
```

## Compliance Checklist

### KVKK Compliance

- [x] Data encryption at rest (hashing)
- [x] Access control (role-based)
- [x] Audit logging
- [x] Data masking in logs
- [x] Consent management
- [x] Data retention policy
- [x] Data subject rights implementation
- [x] Security measures documentation

### GDPR Compliance

- [x] Lawful basis for processing (consent)
- [x] Data minimization (only collect what's needed)
- [x] Purpose limitation (clear purpose)
- [x] Storage limitation (retention policy)
- [x] Accuracy (validation and updates)
- [x] Security (encryption, access control)
- [x] Accountability (audit trails)
- [x] Data subject rights (access, rectification, erasure, portability)

## Incident Response

### Data Breach Procedures

1. **Detection:**
   - Monitor audit logs for unauthorized access
   - Alert on suspicious patterns
   - Review access logs regularly

2. **Response:**
   - Immediately revoke compromised access
   - Assess scope of breach
   - Notify data protection authority (if required)
   - Notify affected individuals (if required)

3. **Documentation:**
   - Document all incidents
   - Maintain incident log
   - Review and update security measures

## Regular Audits

### Audit Schedule

- **Weekly:** Review access logs
- **Monthly:** Review user permissions
- **Quarterly:** Security assessment
- **Annually:** Full compliance audit

### Audit Checklist

- [ ] Review all TC number access logs
- [ ] Verify access controls are working
- [ ] Check for unauthorized access attempts
- [ ] Review consent records
- [ ] Verify data retention compliance
- [ ] Test data subject rights procedures
- [ ] Review and update documentation

## Contact Information

For questions or concerns about TC number handling or data protection:

- **Data Protection Officer:** [To be assigned]
- **Email:** [To be configured]
- **Phone:** [To be configured]

## Version History

- **v1.0** (2024): Initial implementation
  - TC number hashing
  - Role-based access control
  - Audit logging
  - Data masking

## References

- [KVKK Law No. 6698](https://www.kvkk.gov.tr/)
- [GDPR Regulation (EU) 2016/679](https://gdpr.eu/)
- [Convex Security Documentation](https://docs.convex.dev/security)

---

**Last Updated:** 2024
**Next Review:** Quarterly

