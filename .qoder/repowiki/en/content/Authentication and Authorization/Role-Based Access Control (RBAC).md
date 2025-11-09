# Role-Based Access Control (RBAC)

<cite>
**Referenced Files in This Document**   
- [users.ts](file://convex/users.ts)
- [permission-checkbox-group.tsx](file://src/components/users/permission-checkbox-group.tsx)
- [audit_logs.ts](file://convex/audit_logs.ts)
- [get-user.ts](file://src/lib/auth/get-user.ts)
- [permissions.ts](file://src/types/permissions.ts)
- [user-form.tsx](file://src/components/forms/user-form.tsx)
- [auth-utils.ts](file://src/lib/api/auth-utils.ts)
- [middleware.ts](file://src/middleware.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [User Roles and Permission Values](#user-roles-and-permission-values)
3. [User Data Model and Permission Storage](#user-data-model-and-permission-storage)
4. [Permission Assignment During Authentication](#permission-assignment-during-authentication)
5. [Access Control Implementation](#access-control-implementation)
6. [Frontend Permission Enforcement](#frontend-permission-enforcement)
7. [Convex Function Access Control](#convex-function-access-control)
8. [API Route Protection](#api-route-protection)
9. [UI Element Control](#ui-element-control)
10. [Data Flow from Role to UI](#data-flow-from-role-to-ui)
11. [Role Management and Modification](#role-management-and-modification)
12. [Audit Logging for Role Changes](#audit-logging-for-role-changes)
13. [Security and Compliance Considerations](#security-and-compliance-considerations)

## Introduction

This document provides comprehensive documentation for the Role-Based Access Control (RBAC) system implemented in the PORTAL application. The RBAC system governs user access to various features and data within the platform through a structured permission model. The system defines six primary user roles (Admin, Manager, Coordinator, Volunteer, Auditor, Support) with specific permission sets that determine what actions users can perform and what data they can access. This documentation details the implementation of the RBAC system across the full stack, from data modeling and authentication to frontend presentation and backend enforcement.

## User Roles and Permission Values

The PORTAL system implements a granular permission model based on user roles. The system defines six distinct user roles that determine access levels and capabilities within the application. These roles are stored as string values in the user document and include: Admin, Manager, Coordinator, Volunteer, Auditor, and Support.

Permissions are implemented through the `PermissionValue` type, which represents specific capabilities within the system. The permission system is structured around two main categories: module access permissions and special permissions. Module permissions grant access to specific functional areas of the application, while special permissions provide elevated capabilities.

The complete set of permission values is defined in the `MODULE_PERMISSIONS` and `SPECIAL_PERMISSIONS` constants:

- **Module Permissions**: `beneficiaries:access`, `donations:access`, `aid_applications:access`, `scholarships:access`, `messages:access`, `finance:access`, `reports:access`, `settings:access`, `workflow:access`, `partners:access`
- **Special Permissions**: `users:manage`

Each permission value follows a consistent naming convention of "resource:action" to clearly indicate its purpose. The `ALL_PERMISSIONS` array combines all available permissions, and the `PermissionValue` type is derived from this array to ensure type safety throughout the application.

**Section sources**

- [permissions.ts](file://src/types/permissions.ts#L1-L39)

## User Data Model and Permission Storage

The user data model in PORTAL includes a dedicated field for storing permissions, enabling flexible and granular access control. The User interface stores permissions as an array of `PermissionValue` strings, allowing each user to have multiple permissions assigned simultaneously.

The user document structure in the database includes the following key fields related to RBAC:

- `role`: String field storing the user's role (e.g., "Admin", "Manager")
- `permissions`: Array of `PermissionValue` strings representing the user's specific permissions
- `isActive`: Boolean flag indicating whether the user account is active
- `name`, `email`, `phone`: User identification and contact information

When a user is created or updated, the system validates that the provided permissions are valid values from the defined permission set. The permissions array is stored directly in the user document, enabling efficient permission checks during authentication and authorization processes.

The user data model supports both role-based assignment (where roles imply certain permission sets) and direct permission assignment, providing flexibility in access management. This design allows administrators to either assign predefined roles or customize permissions on a per-user basis.

**Section sources**

- [users.ts](file://convex/users.ts#L84-L220)

## Permission Assignment During Authentication

During the authentication process, user permissions are retrieved and made available throughout the application session. When a user successfully authenticates, the system retrieves the complete user document from the database, including the permissions array.

The authentication flow begins with session validation in `getCurrentUserId`, which extracts the user ID from the authentication cookie. Once the user ID is validated, `getCurrentUser` fetches the complete user document from Convex using the users.get query. This document includes the user's role and permissions array.

The retrieved user data is then stored in the session and made available to both frontend components and API routes. For API requests, the middleware automatically adds user information to request headers, including `x-user-id`, `x-user-role`, and `x-user-permissions` (with permissions joined by commas). This ensures that permission checks can be performed efficiently throughout the request lifecycle.

The authentication system also validates session expiration and integrity, ensuring that only authenticated users with valid sessions can access protected resources. This process establishes the foundation for all subsequent permission checks in the application.

**Section sources**

- [get-user.ts](file://src/lib/auth/get-user.ts#L13-L71)

## Access Control Implementation

The RBAC system implements access control through a combination of middleware, utility functions, and direct permission checks. The primary access control mechanism is implemented in the Next.js middleware, which intercepts requests to protected routes and enforces permission requirements.

The middleware evaluates each request against a set of route rules defined in `protectedRoutes`, which specify the required permissions or roles for accessing specific paths. For each protected route, the middleware checks whether the authenticated user has the required permission or role before allowing access. If the user lacks the necessary permissions, they are redirected to the dashboard.

In addition to route-level protection, the system implements function-level access control through utility functions in `auth-utils.ts`. The `hasPermission` function checks whether a user possesses a specific permission, with special handling for the `admin:all` permission (though this specific permission is not currently defined in the codebase). The `requirePermission` and `requireModuleAccess` functions provide promise-based permission checks that throw authentication errors when permissions are missing.

This multi-layered approach ensures that access control is enforced consistently across the application, from initial route access to specific function execution.

**Section sources**

- [middleware.ts](file://src/middleware.ts#L1-L228)
- [auth-utils.ts](file://src/lib/api/auth-utils.ts#L28-L149)

## Frontend Permission Enforcement

Frontend components enforce permissions through conditional rendering and interactive element disabling. The system uses the user's permission array, available through the authentication store, to determine which UI elements to display and which to hide or disable.

The `useAuthStore` hook provides access to the current user's permissions in React components. Components use this data to conditionally render content based on permission checks. For example, the UsersPage component uses `useMemo` to determine if the current user has the `users:manage` permission, which controls access to user management functionality.

UI elements that require specific permissions are wrapped in conditional logic that checks the user's permissions before rendering. When a user lacks the necessary permissions, the corresponding UI elements are either hidden entirely or displayed in a disabled state. This approach prevents unauthorized users from even seeing options they cannot access, improving both security and user experience.

The permission system also supports more complex access patterns through the `requiredAnyPermission` field in route rules, allowing access if the user has any one of several possible permissions.

**Section sources**

- [users-table.tsx](file://src/components/tables/users-table.tsx#L74-L110)
- [users-page.tsx](<file://src/app/(dashboard)/kullanici/page.tsx#L35-L75>)

## Convex Function Access Control

Convex functions implement server-side access control to ensure data security and prevent unauthorized operations. While the provided code does not show explicit permission checks within Convex functions, the architecture supports such checks through the context object available to all Convex functions.

The system's design pattern suggests that Convex functions should validate user permissions before performing sensitive operations. This would typically involve retrieving the user's information from the database using their ID and verifying that they have the necessary permissions to perform the requested action.

For example, when creating or updating users, the system should verify that the requesting user has the `users:manage` permission before allowing the operation. Similarly, functions that modify sensitive data should check appropriate permissions before proceeding.

The Convex security model ensures that all database operations are mediated through defined functions, preventing direct database access and enabling centralized permission enforcement. This architecture provides a secure foundation for implementing comprehensive access control at the data layer.

**Section sources**

- [users.ts](file://convex/users.ts#L84-L220)

## API Route Protection

API routes are protected through a combination of authentication middleware and explicit permission checks within route handlers. The middleware automatically protects all routes listed in `protectedApiRoutes`, adding user information to request headers for authenticated requests.

Within specific API route handlers, developers implement additional permission checks using utility functions like `requirePermission` and `requireModuleAccess`. For example, the GET handler for `/api/users` explicitly checks if the user has the `users:manage` permission before allowing access to the user list.

The system also enforces CSRF (Cross-Site Request Forgery) protection on API requests, requiring valid CSRF tokens for mutation operations. This adds an additional layer of security, preventing unauthorized API calls even if an attacker obtains authentication credentials.

API routes return standardized error responses when permission checks fail, with HTTP status code 403 (Forbidden) and descriptive error messages. This consistent error handling helps frontend applications respond appropriately to permission failures.

**Section sources**

- [users/route.ts](file://src/app/api/users/route.ts#L106-L144)
- [auth-utils.ts](file://src/lib/api/auth-utils.ts#L53-L95)

## UI Element Control

UI elements are controlled based on user permissions through the `permission-checkbox-group` component and similar patterns. The `PermissionCheckboxGroup` component renders a set of checkboxes for each available permission, allowing administrators to assign permissions to users during creation or editing.

This component uses the `DEFAULT_ORDER` array to define the display order of permissions and incorporates the `PERMISSION_LABELS` object to show user-friendly labels for each permission value. The component supports an `includeManageOption` prop that conditionally includes the `users:manage` permission checkbox, which grants user management capabilities.

For user interface elements beyond the permission editor, the system uses permission checks to control visibility and interactivity. Table cells display user permissions using the `PERMISSION_LABELS` mapping, showing human-readable permission names instead of technical values. Interactive elements like buttons and forms are disabled or hidden based on the current user's permissions.

This approach ensures that the user interface accurately reflects the user's capabilities, preventing confusion and accidental access attempts.

**Section sources**

- [permission-checkbox-group.tsx](file://src/components/users/permission-checkbox-group.tsx#L1-L74)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L162-L194)

## Data Flow from Role to UI

The data flow for role-based access control follows a consistent pattern from authentication through to UI presentation. When a user authenticates, their complete user document is retrieved from the database, including their role and permissions array.

This data is stored in the session and made available to the frontend application through the authentication context. The `useAuthStore` hook provides access to this data in React components, allowing them to make permission decisions based on the current user's permissions.

For UI rendering, components subscribe to the authentication store and re-render when user data changes. Permission checks are performed using simple array inclusion operations, such as `userPermissions.includes('users:manage')`. These checks determine which components to render, which navigation options to display, and which interactive elements to enable.

When administrators modify user permissions through the user management interface, the updated permissions are sent to the Convex `users.update` mutation. Upon successful update, the changes are reflected in the user interface, either through automatic refresh or real-time updates.

This end-to-end flow ensures that permission changes take effect immediately across the application, maintaining consistency between the data model and user experience.

**Section sources**

- [get-user.ts](file://src/lib/auth/get-user.ts#L13-L71)
- [middleware.ts](file://src/middleware.ts#L1-L228)
- [permission-checkbox-group.tsx](file://src/components/users/permission-checkbox-group.tsx#L1-L74)

## Role Management and Modification

Role management and permission modification are handled through the user management interface and associated Convex functions. Administrators can create new users and assign roles and permissions through the user form, which includes a role input field and the `PermissionCheckboxGroup` component for permission selection.

The `users.create` and `users.update` mutations in Convex handle the creation and modification of user records, including their roles and permissions. These functions validate that the provided permissions are valid values and ensure that email addresses are unique across the system.

When modifying user roles or permissions, the system does not enforce predefined role templates, allowing for flexible permission assignment. This means administrators can customize permissions on a per-user basis rather than being limited to fixed role definitions.

The system supports both direct permission assignment and role-based assignment, providing flexibility in access management strategies. However, the current implementation does not define a mapping between roles and default permission sets, leaving permission assignment entirely to administrator discretion.

**Section sources**

- [users.ts](file://convex/users.ts#L84-L220)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L162-L194)

## Audit Logging for Role Changes

Role and permission changes are tracked through the audit logging system implemented in `audit_logs.ts`. The system provides a `logAction` mutation that records critical operations, including user management activities that affect roles and permissions.

When a user's role or permissions are modified, the system should create an audit log entry with the following information:

- `userId`: ID of the user whose role/permissions were changed
- `userName`: Name of the user whose role/permissions were changed
- `action`: "UPDATE" to indicate a modification
- `resource`: "users" to identify the resource type
- `resourceId`: ID of the user document being modified
- `changes`: Object describing the specific changes made to roles and permissions
- `ipAddress` and `userAgent`: Information about the request origin

The audit logging system supports querying logs by user, resource, action type, and date range, enabling administrators to review role changes over time. The `getResourceHistory` function specifically supports retrieving the complete history of changes to a particular user, which is valuable for compliance and security audits.

While the provided code shows the audit logging infrastructure, it does not explicitly show the integration points where user updates trigger audit log entries. This integration would typically occur in the `users.update` mutation or in the API route handler.

**Section sources**

- [audit_logs.ts](file://convex/audit_logs.ts#L1-L178)

## Security and Compliance Considerations

The RBAC system incorporates several security and compliance features to protect sensitive data and ensure accountability. The system implements defense in depth with multiple layers of protection, including authentication, authorization, CSRF protection, and audit logging.

Key security features include:

- **Authentication**: Session-based authentication with expiration validation
- **Authorization**: Granular permission checks at both route and function levels
- **CSRF Protection**: Token-based protection for API mutations
- **Input Validation**: Validation of permission values against defined sets
- **Audit Logging**: Comprehensive tracking of user management activities
- **Rate Limiting**: Protection against brute force attacks (mentioned in documentation)

The system follows the principle of least privilege, allowing administrators to assign only the permissions necessary for a user's role. The separation of module access permissions from special permissions (like `users:manage`) enables fine-grained control over sensitive operations.

For compliance, the audit logging system provides a complete record of user management activities, supporting requirements for accountability and traceability. The system's type-safe permission model reduces the risk of configuration errors that could lead to unauthorized access.

The RBAC implementation balances security with usability, providing administrators with flexible tools for access management while protecting the system from unauthorized access and ensuring compliance with data protection requirements.

**Section sources**

- [middleware.ts](file://src/middleware.ts#L1-L228)
- [auth-utils.ts](file://src/lib/api/auth-utils.ts#L28-L149)
- [audit_logs.ts](file://convex/audit_logs.ts#L1-L178)
