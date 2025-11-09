# Feature Modules

<cite>
**Referenced Files in This Document**   
- [users.ts](file://convex/users.ts)
- [beneficiaries.ts](file://convex/beneficiaries.ts)
- [donations.ts](file://convex/donations.ts)
- [scholarships.ts](file://convex/scholarships.ts)
- [tasks.ts](file://convex/tasks.ts)
- [meetings.ts](file://convex/meetings.ts)
- [finance_records.ts](file://convex/finance_records.ts)
- [user-form.tsx](file://src/components/forms/user-form.tsx)
- [users-table.tsx](file://src/components/tables/users-table.tsx)
- [KanbanBoard.tsx](file://src/components/tasks/KanbanBoard.tsx)
- [CalendarView.tsx](file://src/components/meetings/CalendarView.tsx)
- [page.tsx](file://src/app/(dashboard)/kullanici/page.tsx)
- [page.tsx](file://src/app/(dashboard)/yardim/ihtiyac-sahipleri/page.tsx)
- [page.tsx](file://src/app/(dashboard)/bagis/liste/page.tsx)
- [page.tsx](file://src/app/(dashboard)/burs/basvurular/page.tsx)
- [page.tsx](file://src/app/(dashboard)/is/gorevler/page.tsx)
- [page.tsx](file://src/app/(dashboard)/is/toplantilar/page.tsx)
- [page.tsx](file://src/app/(dashboard)/fon/gelir-gider/page.tsx)
- [route.ts](file://src/app/api/users/route.ts)
- [route.ts](file://src/app/api/beneficiaries/route.ts)
- [route.ts](file://src/app/api/donations/route.ts)
- [route.ts](file://src/app/api/tasks/route.ts)
- [route.ts](file://src/app/api/meetings/route.ts)
- [route.ts](file://src/app/api/finance_records/route.ts)
</cite>

## Table of Contents

1. [User Management](#user-management)
2. [Beneficiary Management](#beneficiary-management)
3. [Donation System](#donation-system)
4. [Scholarship Management](#scholarship-management)
5. [Task Management](#task-management)
6. [Meeting Management](#meeting-management)
7. [Financial Management](#financial-management)

## User Management

The User Management module provides comprehensive functionality for managing organizational users, including role-based access control and permission management. This module enables administrators to create, update, and deactivate user accounts while maintaining security and access control throughout the PORTAL system.

The implementation includes a robust permission system with different user roles such as "Dernek Başkanı" (Association President), "Yönetici" (Manager), "Üye" (Member), and "Görüntüleyici" (Viewer), each with specific permissions that determine access to various system features. The module supports user creation, profile management, role assignment, and status control (active/inactive).

Key Convex functions include `list`, `get`, `create`, `update`, and `remove` operations in the `users.ts` file, which handle all user-related data operations. These functions are accessed through API routes at `/api/users` and `/api/users/[id]`, providing standard CRUD operations with proper authentication and authorization checks.

The UI components for user management include a user table component (`users-table.tsx`) that displays user information such as name, email, role, and status, and a user form component (`user-form.tsx`) for creating and editing user profiles. The main user management page is located at `/kullanici` in the dashboard, providing a comprehensive interface for user administration.

Common operations include creating a new user with specific permissions, updating a user's role or contact information, and deactivating user accounts. The system validates email addresses and prevents duplicate email registrations during user creation.

Integration points include linking users to other modules such as tasks (as assignees or creators), meetings (as participants), and financial records (as creators or approvers). User permissions directly control access to all other modules in the system, making this module foundational to the overall security model.

To extend or customize this module, developers can modify the permission structure in the session management code, add new user profile fields in the user schema, or implement additional user verification processes. Custom user roles with specific permission combinations can be created to meet organizational needs.

**Section sources**

- [users.ts](file://convex/users.ts)
- [route.ts](file://src/app/api/users/route.ts)
- [page.tsx](<file://src/app/(dashboard)/kullanici/page.tsx>)
- [users-table.tsx](file://src/components/tables/users-table.tsx)
- [user-form.tsx](file://src/components/forms/user-form.tsx)

## Beneficiary Management

The Beneficiary Management module handles the registration, tracking, and support of individuals or families receiving assistance. This module serves as the central repository for beneficiary information, including personal details, family composition, financial situation, health status, and support history.

Core functionality includes creating new beneficiary records with comprehensive personal and socioeconomic data, searching and filtering beneficiaries by various criteria (status, city, name), and updating beneficiary information as their circumstances change. Each beneficiary record includes fields for name, TC identification number, contact information, address, family size, income level, health conditions, and support priority.

The implementation uses Convex functions in `beneficiaries.ts` including `list`, `get`, `getByTcNo`, `create`, `update`, and `remove`. These functions are accessed through API routes at `/api/beneficiaries` and `/api/beneficiaries/[id]`, with validation rules ensuring data integrity (e.g., 11-digit TC numbers, valid email formats, minimum address length).

The UI for beneficiary management is accessible at `/yardim/ihtiyac-sahipleri` and includes a comprehensive form for data entry and a table view for browsing beneficiaries. The system validates TC numbers for uniqueness during creation and update operations, preventing duplicate registrations.

Common operations include registering a new beneficiary with their personal and family information, updating a beneficiary's status (e.g., from "AKTIF" to "PASIF"), and searching for beneficiaries by TC number or name. The module integrates with the Donation System by linking donations to specific beneficiaries and with the Scholarship Management module for student beneficiaries.

To extend this module, developers could add custom fields for specific organizational needs, implement automated eligibility assessments based on beneficiary data, or create specialized reporting views. Integration with external verification services for TC numbers or address validation could also be implemented.

**Section sources**

- [beneficiaries.ts](file://convex/beneficiaries.ts)
- [route.ts](file://src/app/api/beneficiaries/route.ts)
- [page.tsx](<file://src/app/(dashboard)/yardim/ihtiyac-sahipleri/page.tsx>)

## Donation System

The Donation System module manages all aspects of donation processing, from individual contributions to collection campaigns like "kumbara" (piggy bank) collections. This module tracks donation details, donor information, payment methods, and donation purposes, providing comprehensive financial tracking for incoming funds.

Core functionality includes recording donations with details such as donor name, contact information, amount, currency, payment method, donation purpose, and receipt information. The system supports both one-time donations and recurring collection campaigns, with special fields for kumbara-specific data like collection location, route details, and institution information.

The implementation uses Convex functions in `donations.ts` including `list`, `get`, `getByReceiptNumber`, `create`, `update`, and `remove`. These are accessed through API routes at `/api/donations` and `/api/donations/[id]`, with validation ensuring positive donation amounts and proper status values (pending, completed, cancelled).

The UI for donation management is located at `/bagis/liste` and provides a view of all donations. The system supports filtering donations by status, donor email, and whether they are kumbara collections. Donations are linked to financial records in the Financial Management module, ensuring proper accounting.

Common operations include recording a new donation with receipt information, updating a donation's status from "pending" to "completed" when payment is confirmed, and searching for donations by receipt number. The module integrates with the Beneficiary Management system by optionally linking donations to specific beneficiaries receiving support.

To extend this module, developers could implement automated receipt generation, integrate with payment gateways for online donations, or add donor recognition features. Custom donation types or automated matching gift programs could also be implemented.

**Section sources**

- [donations.ts](file://convex/donations.ts)
- [route.ts](file://src/app/api/donations/route.ts)
- [page.tsx](<file://src/app/(dashboard)/bagis/liste/page.tsx>)

## Scholarship Management

The Scholarship Management module handles the complete lifecycle of scholarship programs, from application to payment. This module supports various scholarship types including academic, need-based, orphan, and special needs scholarships, with configurable eligibility criteria and application processes.

Core functionality includes managing scholarship programs with details like funding amount, duration, eligibility requirements, and application deadlines; processing scholarship applications with student information, academic records, and financial need assessments; and managing scholarship payments with tracking of disbursement status. The system calculates a priority score for applications based on factors like GPA, family income, and special circumstances (orphan status, disabilities).

The implementation uses Convex functions in `scholarships.ts` organized into three main categories: scholarship programs (`list`, `get`, `create`, `update`, `remove`), scholarship applications (`listApplications`, `getApplication`, `createApplication`, `updateApplication`, `submitApplication`), and scholarship payments (`listPayments`, `createPayment`, `updatePayment`). These are accessed through corresponding API routes.

The UI for scholarship management is accessible at `/burs/basvurular` and includes forms for scholarship applications and views for managing applications. The system supports searching applications by applicant TC number (with appropriate access controls) and tracking application status through various stages (draft, submitted, under review, approved, rejected).

Common operations include creating a new scholarship program for a specific academic year, submitting a scholarship application with supporting documents, and processing a scholarship payment. The module integrates with the Beneficiary Management system for student information and with the Financial Management module for payment processing.

To extend this module, developers could implement automated eligibility screening, add recommendation letter collection features, or create analytics dashboards for scholarship impact assessment. Integration with educational institutions for transcript verification could also be added.

**Section sources**

- [scholarships.ts](file://convex/scholarships.ts)
- [page.tsx](<file://src/app/(dashboard)/burs/basvurular/page.tsx>)

## Task Management

The Task Management module provides a workflow system for tracking organizational tasks and assignments. This module helps teams manage their workload with features for task creation, assignment, prioritization, and status tracking, supporting efficient workflow management.

Core functionality includes creating tasks with titles, descriptions, due dates, priority levels (low, normal, high, urgent), and category tags; assigning tasks to specific users; tracking task status (pending, in_progress, completed, cancelled); and viewing tasks in various organizational views. The system automatically sets the completion timestamp when a task status is updated to "completed".

The implementation uses Convex functions in `tasks.ts` including `list`, `get`, `create`, `update`, and `remove`. These are accessed through API routes at `/api/tasks` and `/api/tasks/[id]`, with validation rules ensuring minimum title length and valid status/priority values.

The UI for task management features a Kanban board interface (`KanbanBoard.tsx`) accessible at `/is/gorevler`, allowing users to visualize tasks across different status columns. Tasks can be filtered by assignee, creator, or status, and the interface displays key information including priority level (with color coding) and assigned users.

Common operations include creating a new task and assigning it to a team member, updating a task's status as work progresses, and searching for all tasks assigned to a particular user. The module integrates closely with the Meeting Management system, as meeting action items often translate into tasks, and with the User Management module for assignment and notification purposes.

To extend this module, developers could implement task dependencies, add time tracking functionality, or create automated task assignment rules based on workload or expertise. Integration with external calendar systems or notification services could also be added.

**Section sources**

- [tasks.ts](file://convex/tasks.ts)
- [route.ts](file://src/app/api/tasks/route.ts)
- [page.tsx](<file://src/app/(dashboard)/is/gorevler/page.tsx>)
- [KanbanBoard.tsx](file://src/components/tasks/KanbanBoard.tsx)

## Meeting Management

The Meeting Management module facilitates the organization and documentation of organizational meetings. This module supports scheduling meetings, managing participant lists, recording agendas and notes, and tracking meeting decisions and action items.

Core functionality includes creating meetings with titles, dates, locations, agendas, and participant lists; tracking meeting status (scheduled, ongoing, completed, cancelled); recording meeting notes and decisions; and linking action items to the Task Management module. Meetings can be categorized by type (general, committee, board, other) to support different organizational needs.

The implementation uses Convex functions in `meetings.ts` including `list`, `get`, `create`, `update`, and `remove`. These are accessed through API routes at `/api/meetings` and `/api/meetings/[id]`, with validation ensuring minimum title length and valid status values. Additional functions in `meeting_decisions.ts` and `meeting_action_items.ts` handle meeting outcomes.

The UI for meeting management includes a calendar view (`CalendarView.tsx`) accessible at `/is/toplantilar`, allowing users to visualize meetings chronologically. The interface supports filtering meetings by organizer or status and provides easy access to meeting details and documentation.

Common operations include scheduling a new meeting with invited participants, updating a meeting's status to "completed" after it occurs, and adding decisions or action items from the meeting. The module integrates with the Task Management system by converting meeting action items into trackable tasks, and with the User Management module for participant management.

To extend this module, developers could implement automated meeting reminders, add video conferencing integration, or create templates for recurring meeting types. Integration with document collaboration tools for real-time agenda editing could also be valuable.

**Section sources**

- [meetings.ts](file://convex/meetings.ts)
- [route.ts](file://src/app/api/meetings/route.ts)
- [page.tsx](<file://src/app/(dashboard)/is/toplantilar/page.tsx>)
- [CalendarView.tsx](file://src/components/meetings/CalendarView.tsx)

## Financial Management

The Financial Management module provides comprehensive tracking of the organization's financial transactions. This module handles both income and expense records, supporting proper accounting practices and financial reporting for the organization.

Core functionality includes recording financial transactions with details such as amount, currency, category, description, transaction date, and payment method; categorizing transactions as income (donations, membership fees, sponsorships) or expenses (administrative, program expenses, scholarships); tracking transaction status (pending, approved, rejected); and linking transactions to supporting documentation like receipts. The system supports multiple currencies (TRY, USD, EUR) and includes fields for bank account information and transaction references.

The implementation uses Convex functions in `finance_records.ts` including `list`, `get`, `create`, `update`, and `remove`. These are accessed through API routes at `/api/finance_records` and `/api/finance_records/[id]`, with validation ensuring proper transaction types and status values.

The UI for financial management is accessible at `/fon/gelir-gider` and provides a comprehensive view of financial transactions. The system supports filtering records by type (income/expense), status, or creator, and can be integrated with the Donation System to automatically create income records for donations and with the Scholarship Management module to create expense records for scholarship payments.

Common operations include recording a new expense for program activities, approving a pending financial record, and generating financial reports by category or time period. The module integrates with the Document Management system for storing and linking receipt images and with the User Management module for tracking who created or approved transactions.

To extend this module, developers could implement budget tracking against actual expenditures, add financial forecasting capabilities, or create automated bank reconciliation features. Integration with external accounting software or banking APIs could also be implemented for enhanced functionality.

**Section sources**

- [finance_records.ts](file://convex/finance_records.ts)
- [route.ts](file://src/app/api/finance_records/route.ts)
- [page.tsx](<file://src/app/(dashboard)/fon/gelir-gider/page.tsx>)
