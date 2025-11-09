# User Management

<cite>
**Referenced Files in This Document**   
- [users.ts](file://convex/users.ts)
- [auth.ts](file://convex/auth.ts)
- [user-form.tsx](file://src/components/forms/user-form.tsx)
- [users-table.tsx](file://src/components/tables/users-table.tsx)
- [permissions.ts](file://src/types/permissions.ts)
- [page.tsx](file://src/app/(dashboard)/kullanici/yeni/page.tsx)
- [route.ts](file://src/app/api/users/route.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Data Model](#data-model)
3. [Role-Based Access Control](#role-based-access-control)
4. [User CRUD Operations](#user-crud-operations)
5. [Profile Management](#profile-management)
6. [Frontend Integration](#frontend-integration)
7. [Security Considerations](#security-considerations)
8. [Extensibility Guidelines](#extensibility-guidelines)

## Introduction

The User Management module provides comprehensive functionality for managing organizational users with role-based access control (RBAC). It enables administrators to create, read, update, and delete user accounts while managing permissions across six distinct modules. The system integrates Convex backend functions with React frontend components to provide a seamless administrative interface for user management tasks.

**Section sources**

- [users.ts](file://convex/users.ts#L1-L220)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L1-L258)

## Data Model

The user data model includes comprehensive fields for personal information, role assignments, and status tracking. Each user record contains essential attributes that support both operational functionality and security requirements.

### User Schema

```mermaid
erDiagram
USER {
string _id PK
string name
string email UK
string role
string[] permissions
boolean isActive
string phone
string avatar
string[] labels
timestamp createdAt
timestamp lastLogin
string passwordHash
}
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L84-L121)
- [route.ts](file://src/app/api/users/route.ts#L15-L25)

**Section sources**

- [users.ts](file://convex/users.ts#L84-L121)
- [route.ts](file://src/app/api/users/route.ts#L15-L25)

## Role-Based Access Control

The RBAC system implements a flexible permission model with six distinct roles that control access to various application modules. Permissions are managed through a combination of module-level access and special administrative capabilities.

### Permission Structure

```mermaid
classDiagram
class PermissionConstants {
+string BENEFICIARIES : 'beneficiaries : access'
+string DONATIONS : 'donations : access'
+string AID_APPLICATIONS : 'aid_applications : access'
+string SCHOLARSHIPS : 'scholarships : access'
+string MESSAGES : 'messages : access'
+string FINANCE : 'finance : access'
+string REPORTS : 'reports : access'
+string SETTINGS : 'settings : access'
+string WORKFLOW : 'workflow : access'
+string PARTNERS : 'partners : access'
+string USERS_MANAGE : 'users : manage'
}
class PermissionLabels {
+Record~string, string~ PERMISSION_LABELS
}
PermissionConstants --> PermissionLabels : "defines"
```

**Diagram sources**

- [permissions.ts](file://src/types/permissions.ts#L1-L39)

**Section sources**

- [permissions.ts](file://src/types/permissions.ts#L1-L39)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L19)

## User CRUD Operations

The system provides complete CRUD (Create, Read, Update, Delete) operations for user management through Convex functions that are exposed via Next.js API routes. These operations follow a secure pattern with proper validation and error handling.

### CRUD Workflow

```mermaid
sequenceDiagram
participant Frontend as "User Interface"
participant API as "Next.js API Route"
participant Convex as "Convex Backend"
Frontend->>API : POST /api/users (Create User)
API->>API : Validate CSRF & Authentication
API->>API : Normalize & Validate Payload
API->>API : Hash Password
API->>Convex : Call users.create()
Convex->>Convex : Check Email Uniqueness
Convex->>Convex : Insert User Record
Convex-->>API : Return User ID
API-->>Frontend : 201 Created Response
Frontend->>API : GET /api/users (List Users)
API->>API : Verify Authentication
API->>Convex : Call users.list()
Convex-->>API : Return Paginated Results
API-->>Frontend : JSON Response with Users
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L6-L64)
- [route.ts](file://src/app/api/users/route.ts#L106-L152)

**Section sources**

- [users.ts](file://convex/users.ts#L6-L219)
- [route.ts](file://src/app/api/users/route.ts#L106-L230)

## Profile Management

User profile management is facilitated through a dedicated form component that handles both creation and editing workflows. The interface provides intuitive controls for managing user information, permissions, and account status.

### Form Validation Rules

```mermaid
flowchart TD
Start([Form Submission]) --> ValidateName["Validate Name (min 2 chars)"]
ValidateName --> ValidateEmail["Validate Email Format"]
ValidateEmail --> ValidatePhone["Validate Phone Number (optional)"]
ValidatePhone --> ValidateRole["Validate Role (min 2 chars)"]
ValidateRole --> ValidatePermissions["Validate Permissions (min 1 selected)"]
ValidatePermissions --> ValidatePassword["Validate Password (if required, min 8 chars)"]
ValidatePassword --> ProcessForm["Process Form Submission"]
ProcessForm --> End([Success or Error])
ValidateName --> |Invalid| ReturnError["Return Error Message"]
ValidateEmail --> |Invalid| ReturnError
ValidatePhone --> |Invalid| ReturnError
ValidateRole --> |Invalid| ReturnError
ValidatePermissions --> |Invalid| ReturnError
ValidatePassword --> |Invalid| ReturnError
ReturnError --> End
```

**Diagram sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L27-L40)

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L27-L113)
- [users-table.tsx](file://src/components/tables/users-table.tsx#L19-L28)

## Frontend Integration

The frontend components integrate seamlessly with the backend Convex functions through a well-defined API layer. The user interface provides both table-based listing and form-based editing capabilities that follow consistent design patterns.

### Component Integration

```mermaid
graph TB
subgraph "Frontend Components"
UserForm[user-form.tsx]
UsersTable[users-table.tsx]
CreateUserPage[CreateUserPage]
end
subgraph "Backend Services"
ConvexUsers[convex/users.ts]
Auth[convex/auth.ts]
end
subgraph "API Layer"
UsersRoute[src/app/api/users/route.ts]
end
CreateUserPage --> UserForm
UserForm --> UsersRoute
UsersTable --> UsersRoute
UsersRoute --> ConvexUsers
UsersRoute --> Auth
CreateUserPage --> Auth["Auth Store"]
```

**Diagram sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L1-L258)
- [users-table.tsx](file://src/components/tables/users-table.tsx#L1-L156)
- [page.tsx](<file://src/app/(dashboard)/kullanici/yeni/page.tsx#L1-L81>)

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L1-L258)
- [users-table.tsx](file://src/components/tables/users-table.tsx#L1-L156)
- [page.tsx](<file://src/app/(dashboard)/kullanici/yeni/page.tsx#L1-L81>)

## Security Considerations

The user management system implements multiple security layers to protect sensitive user data and prevent unauthorized access. These measures include password hashing, session management, and comprehensive permission validation.

### Security Architecture

```mermaid
flowchart TD
A[User Creation] --> B[Password Input]
B --> C[Password Strength Validation]
C --> D[Password Hashing with bcrypt]
D --> E[Secure Storage in Convex]
F[User Login] --> G[Password Verification in Next.js]
G --> H[Session Creation with Secure Cookies]
H --> I[Token-Based Authentication]
J[API Request] --> K[CSRF Token Validation]
K --> L[Authentication Check]
L --> M[Permission Validation]
M --> N[Authorized Access]
M --> O[403 Forbidden]
P[Password Reset] --> Q[Secure Token Generation]
Q --> R[Time-Limited Expiry]
R --> S[One-Time Use]
```

**Diagram sources**

- [auth.ts](file://convex/auth.ts#L1-L82)
- [route.ts](file://src/app/api/users/route.ts#L4-L9)
- [password.ts](file://src/lib/auth/password.ts)

**Section sources**

- [auth.ts](file://convex/auth.ts#L1-L82)
- [route.ts](file://src/app/api/users/route.ts#L4-L9)

## Extensibility Guidelines

The user management system is designed to be extensible, allowing for modifications to the user model and role permissions without requiring major architectural changes.

### Extension Points

```mermaid
classDiagram
class UsersModule {
+list()
+get()
+getByEmail()
+create()
+update()
+remove()
}
class AuthModule {
+getCurrentUser()
+getUserByEmail()
+updateLastLogin()
+logout()
}
class Permissions {
+MODULE_PERMISSIONS
+SPECIAL_PERMISSIONS
+ALL_PERMISSIONS
+PERMISSION_LABELS
}
UsersModule --> Permissions : "uses for validation"
AuthModule --> UsersModule : "retrieves user data"
Permissions <|-- NewPermissions : "can extend"
UsersModule <|-- ExtendedUsers : "can add methods"
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L6-L219)
- [permissions.ts](file://src/types/permissions.ts#L1-L39)
- [auth.ts](file://convex/auth.ts#L9-L82)

**Section sources**

- [users.ts](file://convex/users.ts#L6-L219)
- [permissions.ts](file://src/types/permissions.ts#L1-L39)
- [auth.ts](file://convex/auth.ts#L9-L82)
