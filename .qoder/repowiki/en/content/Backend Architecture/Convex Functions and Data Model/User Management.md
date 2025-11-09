# User Management

<cite>
**Referenced Files in This Document**   
- [schema.ts](file://convex/schema.ts)
- [users.ts](file://convex/users.ts)
- [user-form.tsx](file://src/components/forms/user-form.tsx)
- [users-table.tsx](file://src/components/tables/users-table.tsx)
- [route.ts](file://src/app/api/users/route.ts)
- [audit_logs.ts](file://convex/audit_logs.ts)
- [tasks.ts](file://convex/tasks.ts)
- [meetings.ts](file://convex/meetings.ts)
- [messages.ts](file://convex/messages.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [User Entity Schema](#user-entity-schema)
3. [Indexing Strategy](#indexing-strategy)
4. [User Management Operations](#user-management-operations)
5. [Security Implementation](#security-implementation)
6. [Integration with Other Entities](#integration-with-other-entities)
7. [Performance Optimization](#performance-optimization)
8. [User Interface Components](#user-interface-components)
9. [Conclusion](#conclusion)

## Introduction

The User entity serves as the foundation for authentication, authorization, and user management within the Convex backend system. This documentation provides a comprehensive overview of the user data model, business logic, security considerations, and integration points with other system components. The User entity enables role-based access control, secure authentication, and comprehensive audit capabilities across the application.

**Section sources**

- [schema.ts](file://convex/schema.ts#L9-L39)

## User Entity Schema

The User entity schema defines the structure and validation rules for user records in the system. Each user record contains essential information for identification, authentication, and authorization purposes.

### Field Definitions

The User entity includes the following fields with their respective data types and validation rules:

```mermaid
erDiagram
USER {
string name PK
string email UK
string role
string[] permissions
string phone
string avatar
boolean isActive
string[] labels
string createdAt
string lastLogin
string passwordHash
}
```

**Diagram sources**

- [schema.ts](file://convex/schema.ts#L9-L32)

#### Core Fields

- **name**: String field representing the user's full name (required)
- **email**: String field storing the user's unique email address used for login and communication (required, unique)
- **role**: String field indicating the user's role within the system (e.g., 'admin', 'staff', 'volunteer') (required)
- **permissions**: Optional array of strings representing specific permissions granted to the user
- **phone**: Optional string field for the user's phone number
- **avatar**: Optional string field containing the URL of the user's avatar image
- **isActive**: Boolean flag indicating whether the user account is active or disabled
- **labels**: Optional array of strings used for categorizing or tagging users
- **createdAt**: Optional ISO 8601 timestamp indicating when the user account was created
- **lastLogin**: Optional ISO 8601 timestamp recording the user's last login time
- **passwordHash**: Optional string field storing the hashed password for the user account

**Section sources**

- [schema.ts](file://convex/schema.ts#L10-L31)

## Indexing Strategy

The User entity employs a comprehensive indexing strategy to optimize query performance for common access patterns and enable efficient user discovery.

### Database Indexes

The following indexes are defined on the User collection to support efficient querying:

```mermaid
graph TD
A[User Collection] --> B[by_email Index]
A --> C[by_role Index]
A --> D[by_is_active Index]
A --> E[by_search Index]
B --> F[Email-based lookups]
C --> G[Role-based filtering]
D --> H[Status-based filtering]
E --> I[Full-text search]
```

**Diagram sources**

- [schema.ts](file://convex/schema.ts#L33-L39)

#### Index Purposes

- **by_email**: Enables efficient lookups by email address, critical for authentication and user retrieval operations
- **by_role**: Facilitates filtering users by their assigned role, supporting role-based access control and reporting
- **by_is_active**: Allows quick filtering of active versus inactive users, essential for access control and user management
- **by_search**: Implements a search index that enables full-text search on the user's name field, with filtering capabilities on email and phone fields for enhanced user discovery

**Section sources**

- [schema.ts](file://convex/schema.ts#L33-L39)

## User Management Operations

The system provides comprehensive CRUD operations for user management through well-defined mutation and query functions in the backend.

### User Creation Process

The user creation process involves validation, email normalization, duplicate checking, and secure password storage:

```mermaid
sequenceDiagram
participant Client
participant API
participant Backend
participant Database
Client->>API : POST /api/users with user data
API->>Backend : Validate input and permissions
Backend->>Backend : Normalize email (lowercase, trim)
Backend->>Database : Check for existing user by email
alt User exists
Database-->>Backend : Return existing user
Backend-->>API : Throw "email already in use" error
API-->>Client : Return 409 Conflict
else User doesn't exist
Database-->>Backend : No existing user found
Backend->>Backend : Hash password securely
Backend->>Database : Insert new user record
Database-->>Backend : Return inserted user
Backend-->>API : Return success
API-->>Client : Return 201 Created
end
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L84-L121)
- [route.ts](file://src/app/api/users/route.ts#L154-L225)

### User Update Process

The user update process includes validation, email conflict detection, and partial updates while preserving existing data:

```mermaid
sequenceDiagram
participant Client
participant API
participant Backend
participant Database
Client->>API : PATCH /api/users/ : id with update data
API->>Backend : Validate input and permissions
Backend->>Database : Retrieve existing user
alt User not found
Database-->>Backend : Return null
Backend-->>API : Throw "user not found" error
API-->>Client : Return 404 Not Found
else User found
Database-->>Backend : Return user data
Backend->>Backend : Process field updates
Backend->>Backend : Check for email conflicts
alt Email changed and conflicts
Backend-->>API : Throw "email already in use" error
API-->>Client : Return 409 Conflict
else No conflicts
Backend->>Database : Apply patch to user record
Database-->>Backend : Confirm update
Backend->>Database : Retrieve updated user
Database-->>Backend : Return updated user
Backend-->>API : Return success
API-->>Client : Return 200 OK
end
end
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L124-L206)
- [route.ts](file://src/app/api/users/route.ts#L154-L225)

### User Query Operations

The system supports flexible querying of user records with multiple filtering options:

```mermaid
flowchart TD
Start([Query Users]) --> SearchCheck{Search parameter?}
SearchCheck --> |Yes| SearchQuery[Use by_search index on name]
SearchCheck --> |No| RoleCheck{Role filter?}
RoleCheck --> |Yes| RoleQuery[Use by_role index]
RoleCheck --> |No| StatusCheck{Status filter?}
StatusCheck --> |Yes| StatusQuery[Use by_is_active index]
StatusCheck --> |No| AllQuery[Retrieve all users]
SearchQuery --> FilterProcessing
RoleQuery --> FilterProcessing
StatusQuery --> FilterProcessing
AllQuery --> FilterProcessing
FilterProcessing[Apply additional filters] --> Pagination[Apply pagination]
Pagination --> ReturnResults[Return results with cursor]
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L6-L63)

**Section sources**

- [users.ts](file://convex/users.ts#L6-L63)
- [route.ts](file://src/app/api/users/route.ts#L106-L151)

## Security Implementation

The system implements robust security measures for user authentication, password management, and access control.

### Password Security

The password management system follows industry best practices for secure password storage:

```mermaid
flowchart LR
PasswordInput[User Password] --> StrengthCheck{Meets strength requirements?}
StrengthCheck --> |No| Reject[Reject with error]
StrengthCheck --> |Yes| GenerateHash[Generate secure hash]
GenerateHash --> StoreHash[Store hash in database]
StoreHash --> ClearText[Never store clear text]
LoginAttempt[Login Attempt] --> RetrieveHash[Retrieve stored hash]
RetrieveHash --> VerifyPassword[Verify against input]
VerifyPassword --> |Match| GrantAccess[Grant access]
VerifyPassword --> |No Match| DenyAccess[Deny access]
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L84-L121)
- [route.ts](file://src/app/api/users/route.ts#L175-L183)

The password security implementation includes:

- Password strength validation requiring minimum length and complexity
- Secure password hashing using industry-standard algorithms
- Protection against email enumeration attacks
- Account status validation during login
- Comprehensive error logging for security monitoring

**Section sources**

- [users.ts](file://convex/users.ts#L84-L121)
- [route.ts](file://src/app/api/users/route.ts#L175-L183)

### Access Control

The system implements role-based access control with granular permissions:

```mermaid
classDiagram
class User {
+string name
+string email
+string role
+string[] permissions
+boolean isActive
}
class Role {
+string name
+string[] defaultPermissions
}
class Permission {
+string value
+string description
}
User "1" --> "1" Role : has
User "1" --> "*" Permission : granted
Role "1" --> "*" Permission : includes
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L84-L121)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L18-L19)

Access control is enforced through:

- Role-based permissions with predefined role templates
- Granular module-level access control
- Active/inactive status enforcement
- CSRF protection for all mutating operations
- Authentication requirement for all user management operations

**Section sources**

- [users.ts](file://convex/users.ts#L84-L121)
- [route.ts](file://src/app/api/users/route.ts#L108-L113)

## Integration with Other Entities

The User entity serves as a central hub that integrates with various other system components through references and audit trails.

### Relationship with Other Entities

The User entity maintains relationships with multiple system components:

```mermaid
erDiagram
USER ||--o{ TASK : "assigned_to/created_by"
USER ||--o{ MEETING : "organizer/participants"
USER ||--o{ MESSAGE : "sender/recipients"
USER ||--o{ AUDIT_LOG : "userId"
USER ||--o{ WORKFLOW_NOTIFICATION : "recipient/triggered_by"
USER ||--o{ FINANCE_RECORD : "created_by/approved_by"
USER ||--o{ AID_APPLICATION : "processed_by/approved_by"
USER {
string _id PK
string name
string email
string role
string[] permissions
boolean isActive
}
TASK {
string _id PK
string title
Id<'users'> assigned_to FK
Id<'users'> created_by FK
}
MEETING {
string _id PK
string title
Id<'users'> organizer FK
Id<'users'>[] participants FK
}
MESSAGE {
string _id PK
string content
Id<'users'> sender FK
Id<'users'>[] recipients FK
}
AUDIT_LOG {
string _id PK
Id<'users'> userId FK
string action
string resource
string resourceId
}
WORKFLOW_NOTIFICATION {
string _id PK
Id<'users'> recipient FK
Id<'users'> triggered_by FK
}
FINANCE_RECORD {
string _id PK
Id<'users'> created_by FK
Id<'users'> approved_by FK
}
AID_APPLICATION {
string _id PK
Id<'users'> processed_by FK
Id<'users'> approved_by FK
}
```

**Diagram sources**

- [schema.ts](file://convex/schema.ts#L9-L39)
- [tasks.ts](file://convex/tasks.ts#L226-L228)
- [meetings.ts](file://convex/meetings.ts#L272-L274)
- [messages.ts](file://convex/messages.ts#L435-L437)
- [audit_logs.ts](file://convex/audit_logs.ts#L4-L5)
- [workflow_notifications.ts](file://convex/workflow_notifications.ts#L387-L389)
- [finance_records.ts](file://convex/finance_records.ts#L567-L569)
- [aid_applications.ts](file://convex/aid_applications.ts#L527-L531)

The User entity is referenced by:

- Tasks: Users can be assigned to tasks or create tasks
- Meetings: Users can organize meetings or participate in them
- Messages: Users can send messages to other users
- Audit Logs: User actions are tracked for compliance
- Workflow Notifications: Users receive system notifications
- Financial Records: Users create or approve financial transactions
- Aid Applications: Users process or approve aid applications

**Section sources**

- [schema.ts](file://convex/schema.ts#L9-L39)
- [tasks.ts](file://convex/tasks.ts#L226-L228)
- [meetings.ts](file://convex/meetings.ts#L272-L274)
- [messages.ts](file://convex/messages.ts#L435-L437)
- [audit_logs.ts](file://convex/audit_logs.ts#L4-L5)
- [workflow_notifications.ts](file://convex/workflow_notifications.ts#L387-L389)
- [finance_records.ts](file://convex/finance_records.ts#L567-L569)
- [aid_applications.ts](file://convex/aid_applications.ts#L527-L531)

## Performance Optimization

The system implements several performance optimizations for efficient user management operations.

### Query Optimization

The user query system employs multiple optimization techniques:

```mermaid
flowchart TD
QueryStart[Query Request] --> IndexSelection{Select appropriate index}
IndexSelection --> |Search| SearchIndex[Use by_search index]
IndexSelection --> |Role Filter| RoleIndex[Use by_role index]
IndexSelection --> |Status Filter| StatusIndex[Use by_is_active index]
IndexSelection --> |No Filters| FullScan[Scan all users]
SearchIndex --> PostFilter[Apply additional filters]
RoleIndex --> PostFilter
StatusIndex --> PostFilter
FullScan --> PostFilter
PostFilter --> Pagination[Apply cursor-based pagination]
Pagination --> Result[Return paginated results]
style SearchIndex fill:#f9f,stroke:#333
style RoleIndex fill:#f9f,stroke:#333
style StatusIndex fill:#f9f,stroke:#333
style FullScan fill:#f96,stroke:#333
```

**Diagram sources**

- [users.ts](file://convex/users.ts#L14-L55)

Key performance optimizations include:

- Index-based filtering to minimize database scans
- Cursor-based pagination to support efficient large dataset handling
- Client-side filtering for combined search and filter operations
- Caching of frequently accessed user data
- Batch operations for improved throughput

**Section sources**

- [users.ts](file://convex/users.ts#L14-L55)

## User Interface Components

The system provides user-friendly interface components for managing user records.

### User Form Component

The user form component provides a comprehensive interface for creating and editing user records:

```mermaid
flowchart TD
FormStart[User Form] --> PersonalInfo[Personal Information]
FormStart --> ContactInfo[Contact Information]
FormStart --> RoleInfo[Role and Permissions]
FormStart --> AccountInfo[Account Settings]
PersonalInfo --> NameField[Name Field]
PersonalInfo --> RoleField[Role Field]
ContactInfo --> EmailField[Email Field]
ContactInfo --> PhoneField[Phone Field]
RoleInfo --> Permissions[Permission Checkboxes]
RoleInfo --> Labels[Label Tags]
AccountInfo --> StatusSwitch[Active/Inactive Switch]
AccountInfo --> PasswordField[Password Field]
AccountInfo --> GeneratePassword[Generate Password Button]
GeneratePassword --> AutoFill[Auto-fill strong password]
style NameField fill:#e6f3ff,stroke:#333
style EmailField fill:#e6f3ff,stroke:#333
style RoleField fill:#e6f3ff,stroke:#333
style Permissions fill:#e6f3ff,stroke:#333
style StatusSwitch fill:#e6f3ff,stroke:#333
style PasswordField fill:#e6f3ff,stroke:#333
```

**Diagram sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L63-L255)

### Users Table Component

The users table component displays user records in a tabular format with filtering and action capabilities:

```mermaid
flowchart TD
TableStart[Users Table] --> Header[Table Header]
TableStart --> Body[Table Body]
Header --> NameCol[Name Column]
Header --> EmailCol[Email Column]
Header --> RoleCol[Role Column]
Header --> StatusCol[Status Column]
Header --> PhoneCol[Phone Column]
Header --> CreatedCol[Created Column]
Header --> ActionsCol[Actions Column]
Body --> DataRow[User Data Row]
DataRow --> NameCell[Name and Permissions]
DataRow --> EmailCell[Email Address]
DataRow --> RoleCell[Role Title]
DataRow --> StatusCell[Status Badge]
DataRow --> PhoneCell[Phone Number]
DataRow --> CreatedCell[Creation Date]
DataRow --> ActionsCell[Action Buttons]
ActionsCell --> ToggleStatus[Toggle Active/Inactive]
ActionsCell --> EditUser[Edit User]
ActionsCell --> DeleteUser[Delete User]
style NameCol fill:#e6f3ff,stroke:#333
style EmailCol fill:#e6f3ff,stroke:#333
style RoleCol fill:#e6f3ff,stroke:#333
style StatusCol fill:#e6f3ff,stroke:#333
style ActionsCol fill:#e6f3ff,stroke:#333
```

**Diagram sources**

- [users-table.tsx](file://src/components/tables/users-table.tsx#L47-L151)

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L63-L255)
- [users-table.tsx](file://src/components/tables/users-table.tsx#L47-L151)

## Conclusion

The User entity in the Convex backend provides a robust foundation for user management, authentication, and authorization. The comprehensive schema design, efficient indexing strategy, and secure implementation ensure reliable and performant user operations. The integration with audit logs and other system components enables comprehensive tracking and access control. The user interface components provide an intuitive experience for managing user records, while the backend operations ensure data integrity and security. This implementation supports the organization's needs for secure, scalable, and auditable user management.
