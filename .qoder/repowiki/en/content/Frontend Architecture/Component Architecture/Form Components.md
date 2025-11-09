# Form Components

<cite>
**Referenced Files in This Document**   
- [user-form.tsx](file://src/components/forms/user-form.tsx)
- [ParameterSelect.tsx](file://src/components/forms/ParameterSelect.tsx)
- [bank-accounts/BankAccountsManager.tsx](file://src/components/bank-accounts/BankAccountsManager.tsx)
- [documents/DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx)
- [ui/form.tsx](file://src/components/ui/form.tsx)
- [validations/aid-application.ts](file://src/lib/validations/aid-application.ts)
- [useFormMutation.ts](file://src/hooks/useFormMutation.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Core Form Architecture](#core-form-architecture)
3. [User Form Implementation](#user-form-implementation)
4. [Dynamic Parameter Selection](#dynamic-parameter-selection)
5. [Complex Form Compositions](#complex-form-compositions)
6. [Validation and Error Handling](#validation-and-error-handling)
7. [Form Submission and State Management](#form-submission-and-state-management)
8. [Accessibility and Responsive Design](#accessibility-and-responsive-design)
9. [Usage Examples](#usage-examples)
10. [Best Practices for New Forms](#best-practices-for-new-forms)

## Introduction

This document provides comprehensive documentation for the form components in PORTAL, focusing on the implementation of user forms, dynamic parameter selection, and complex nested data management. The documentation covers the integration of Zod validation with React Hook Form, reusable components for dynamic form fields, and complex form compositions for managing bank accounts and documents. It also details the form architecture including error handling, submission states, and real-time validation, with examples of form usage in user creation and beneficiary registration workflows.

## Core Form Architecture

The form architecture in PORTAL is built on React Hook Form for efficient form state management and Zod for robust validation. The integration is facilitated through the `@hookform/resolvers/zod` resolver, providing type-safe form validation with real-time feedback. The architecture follows a component-based approach with reusable form elements and standardized error handling patterns.

```mermaid
graph TD
A[React Hook Form] --> B[Zod Validation]
A --> C[Form State Management]
B --> D[Runtime Validation]
C --> E[Controlled Components]
D --> F[Error Messages]
E --> G[UI Components]
F --> G
G --> H[Form Submission]
```

**Diagram sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L1-L258)
- [ui/form.tsx](file://src/components/ui/form.tsx#L1-L179)

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L1-L258)
- [ui/form.tsx](file://src/components/ui/form.tsx#L1-L179)

## User Form Implementation

The UserForm component implements a comprehensive user management form with integrated Zod validation and React Hook Form. It handles user creation and editing workflows with support for permissions management, password generation, and account status control. The form includes real-time validation, error messaging, and accessibility features.

```mermaid
classDiagram
class UserForm {
+defaultValues : Partial<UserFormValues>
+onSubmit : (values : UserFormValues) => void
+onCancel? : () => void
+className? : string
+loading? : boolean
+requirePassword? : boolean
+includeManageOption? : boolean
-form : UseFormReturn<UserFormValues>
-handleGeneratePassword() : void
-handleSubmit(values : UserFormValues) : void
}
class UserFormValues {
+name : string
+email : string
+phone : string | undefined
+role : string
+permissions : PermissionValue[]
+isActive : boolean
+password : string | undefined
}
UserForm --> UserFormValues : "uses"
UserForm --> PermissionCheckboxGroup : "includes"
```

**Diagram sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L53-L255)

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L1-L258)
- [users.ts](file://convex/users.ts#L84-L174)

## Dynamic Parameter Selection

The ParameterSelect component provides a reusable solution for dynamic form fields that load options from the backend. It uses React Query for data fetching with caching, enabling efficient parameter selection across different form contexts. The component supports loading states, error handling, and accessibility features.

```mermaid
sequenceDiagram
participant ParameterSelect
participant ReactQuery
participant BackendAPI
ParameterSelect->>ReactQuery : useQuery(['parameters', category])
ReactQuery->>BackendAPI : GET /api/parameters?category=category
BackendAPI-->>ReactQuery : Return parameters
ReactQuery-->>ParameterSelect : Update state
ParameterSelect->>UI : Render select options
```

**Diagram sources**

- [ParameterSelect.tsx](file://src/components/forms/ParameterSelect.tsx#L25-L73)

**Section sources**

- [ParameterSelect.tsx](file://src/components/forms/ParameterSelect.tsx#L1-L75)
- [api.ts](file://src/lib/api/index.ts)

## Complex Form Compositions

PORTAL includes specialized form components for managing complex nested data structures. The BankAccountsManager and DocumentsManager components provide comprehensive interfaces for handling financial and document data with support for CRUD operations, file uploads, and real-time updates.

### Bank Accounts Management

The BankAccountsManager component handles bank account information for beneficiaries with support for multiple accounts, currency selection, and status management. It uses React Query for data synchronization and provides a modal interface for account creation.

```mermaid
flowchart TD
A[BankAccountsManager] --> B[Add Account]
A --> C[View Accounts]
A --> D[Delete Account]
B --> E[Modal Form]
E --> F[Bank Name]
E --> G[Account Holder]
E --> H[IBAN]
E --> I[Currency]
E --> J[Status]
C --> K[Card List]
D --> L[Confirmation]
```

**Diagram sources**

- [BankAccountsManager.tsx](file://src/components/bank-accounts/BankAccountsManager.tsx#L35-L267)

### Documents Management

The DocumentsManager component provides a file upload and management interface for beneficiary documents. It supports drag-and-drop uploads, file type detection, download functionality, and deletion with confirmation.

```mermaid
flowchart TD
A[DocumentsManager] --> B[Upload Document]
A --> C[View Documents]
A --> D[Download Document]
A --> E[Delete Document]
B --> F[Drag & Drop]
B --> G[File Input]
C --> H[Card List]
H --> I[File Icon]
H --> J[File Info]
H --> K[Actions]
```

**Diagram sources**

- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L27-L278)

**Section sources**

- [BankAccountsManager.tsx](file://src/components/bank-accounts/BankAccountsManager.tsx#L1-L267)
- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L1-L278)

## Validation and Error Handling

The form validation system in PORTAL combines Zod schemas with React Hook Form for comprehensive client-side validation. The system includes real-time validation, error messaging, and server-side validation alignment. Error handling follows a standardized pattern across all forms with consistent user feedback.

```mermaid
graph TD
A[Form Input] --> B[Zod Validation]
B --> C{Valid?}
C --> |Yes| D[Submit]
C --> |No| E[Display Error]
E --> F[Highlight Field]
F --> G[Show Message]
G --> H[Accessibility]
D --> I[Server Validation]
I --> J{Valid?}
J --> |Yes| K[Success]
J --> |No| L[Show Server Errors]
```

**Diagram sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L27-L41)
- [aid-application.ts](file://src/lib/validations/aid-application.ts#L8-L45)

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L27-L41)
- [aid-application.ts](file://src/lib/validations/aid-application.ts#L1-L70)

## Form Submission and State Management

Form submission in PORTAL is managed through a standardized pattern using React Query mutations and the useFormMutation hook. This approach provides consistent loading states, error handling, and success notifications across all forms. The system handles form submission states including idle, loading, success, and error states.

```mermaid
stateDiagram-v2
[*] --> Idle
Idle --> Loading : Submit
Loading --> Success : Success
Loading --> Error : Failure
Success --> Idle : Reset
Error --> Idle : Dismiss
```

**Diagram sources**

- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L1-L58)

**Section sources**

- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L1-L140)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L92-L113)

## Accessibility and Responsive Design

The form components in PORTAL follow accessibility best practices with proper labeling, keyboard navigation, and screen reader support. The design is responsive across different screen sizes with adaptive layouts for mobile, tablet, and desktop views. All form elements include proper ARIA attributes and error messaging.

```mermaid
graph TD
A[Accessible Form] --> B[Proper Labels]
A --> C[Keyboard Navigation]
A --> D[Screen Reader Support]
A --> E[ARIA Attributes]
A --> F[Error Messaging]
B --> G[FormLabel]
C --> H[Tab Order]
D --> I[Role Attributes]
E --> J[aria-invalid]
F --> K[FormMessage]
```

**Diagram sources**

- [ui/form.tsx](file://src/components/ui/form.tsx#L89-L167)
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L1-L225)

**Section sources**

- [ui/form.tsx](file://src/components/ui/form.tsx#L1-L179)
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L1-L225)

## Usage Examples

The form components are used throughout PORTAL in various workflows including user creation, beneficiary registration, and settings management. The UserForm is used in user management pages, while the ParameterSelect component is used in forms requiring dynamic parameter selection.

### User Creation Workflow

The user creation workflow uses the UserForm component with required password input and permission selection. The form is integrated with the user management API for creating new users with proper validation and error handling.

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L63-L255)
- [page.tsx](<file://src/app/(dashboard)/kullanici/yeni/page.tsx>)

### Beneficiary Registration

Beneficiary registration uses complex form compositions including the BankAccountsManager and DocumentsManager components. These components allow for comprehensive beneficiary information collection with support for financial and document data.

**Section sources**

- [BankAccountsManager.tsx](file://src/components/bank-accounts/BankAccountsManager.tsx#L35-L267)
- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L27-L278)

## Best Practices for New Forms

When creating new forms in PORTAL, follow these best practices to maintain consistency with existing patterns:

1. Use React Hook Form with Zod validation for all new forms
2. Implement reusable components for common form elements
3. Follow the standardized error handling pattern
4. Ensure accessibility compliance with proper labeling and ARIA attributes
5. Implement responsive design for all screen sizes
6. Use React Query for data fetching and mutation
7. Include loading states and user feedback
8. Validate both client-side and server-side
9. Use consistent styling and layout patterns
10. Document form usage and validation rules

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L1-L258)
- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L1-L140)
- [ui/form.tsx](file://src/components/ui/form.tsx#L1-L179)
