# Donation System

<cite>
**Referenced Files in This Document**   
- [donations.ts](file://convex/donations.ts)
- [finance_records.ts](file://convex/finance_records.ts)
- [route.ts](file://src/app/api/donations/route.ts)
- [stats/route.ts](file://src/app/api/donations/stats/route.ts)
- [page.tsx](file://src/app/(dashboard)/bagis/liste/page.tsx)
- [page.tsx](file://src/app/(dashboard)/bagis/kumbara/page.tsx)
- [KumbaraStats.tsx](file://src/components/kumbara/KumbaraStats.tsx)
- [financial.ts](file://src/types/financial.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Core Components](#core-components)
3. [Data Model](#data-model)
4. [Standard Donation Processing](#standard-donation-processing)
5. [Kumbara Collection System](#kumbara-collection-system)
6. [API Integration](#api-integration)
7. [Donation History and Receipts](#donation-history-and-receipts)
8. [Statistical Reporting](#statistical-reporting)
9. [Integration with Financial Reporting](#integration-with-financial-reporting)
10. [Donation Form Customization](#donation-form-customization)
11. [Extending Payment Gateways](#extending-payment-gateways)

## Introduction

The Donation System module provides comprehensive functionality for managing both standard donations and Kumbara (money box) collections. The system integrates with financial records, supports multiple payment methods, and offers detailed reporting capabilities. This documentation covers the implementation details, data models, API integrations, and extension points for the donation system.

## Core Components

The Donation System consists of several core components that work together to process, track, and report on donations. The system is built around Convex database functions, Next.js API routes, and React components that provide the user interface.

**Section sources**

- [donations.ts](file://convex/donations.ts#L1-L149)
- [finance_records.ts](file://convex/finance_records.ts#L1-L132)
- [route.ts](file://src/app/api/donations/route.ts#L1-L148)

## Data Model

The donation system uses a structured data model to capture all relevant information about donations, including donor details, financial information, and status tracking.

```mermaid
erDiagram
DONATIONS {
string donor_name
string donor_phone
string donor_email
number amount
string currency
string donation_type
string payment_method
string donation_purpose
string notes
string receipt_number
string receipt_file_id
string status
boolean is_kumbara
string kumbara_location
string collection_date
string kumbara_institution
object location_coordinates
string location_address
array route_points
number route_distance
number route_duration
}
FINANCE_RECORDS {
string record_type
string category
number amount
string currency
string description
string transaction_date
string payment_method
string receipt_number
string receipt_file_id
string related_to
string created_by
string status
string approved_by
}
DONATIONS ||--o{ FINANCE_RECORDS : "generates"
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L77-L105)
- [finance_records.ts](file://convex/finance_records.ts#L55-L73)
- [financial.ts](file://src/types/financial.ts#L5-L29)

## Standard Donation Processing

The standard donation processing flow allows users to create, view, and manage individual donations through a web interface. The system validates donation data, creates records in the database, and generates receipts.

```mermaid
sequenceDiagram
participant User as "Donor/User"
participant UI as "Donation Form"
participant API as "API Route"
participant Convex as "Convex Database"
User->>UI : Fill donation form
UI->>API : Submit donation data
API->>API : Validate donation payload
API->>Convex : Create donation record
Convex-->>API : Return donation ID
API-->>UI : Confirm donation creation
UI-->>User : Display success message and receipt
```

**Diagram sources**

- [route.ts](file://src/app/api/donations/route.ts#L89-L147)
- [donations.ts](file://convex/donations.ts#L76-L109)
- [page.tsx](<file://src/app/(dashboard)/bagis/liste/page.tsx#L14-L17>)

## Kumbara Collection System

The Kumbara (money box) collection system is a specialized feature for tracking physical donation boxes placed in various locations. This system captures location data, collection schedules, and route information for efficient collection management.

```mermaid
classDiagram
class KumbaraDonation {
+string kumbara_location
+string collection_date
+string kumbara_institution
+object location_coordinates
+string location_address
+array route_points
+number route_distance
+number route_duration
}
class Donation {
+string donor_name
+string donor_phone
+string donor_email
+number amount
+string currency
+string donation_type
+string payment_method
+string donation_purpose
+string notes
+string receipt_number
+string receipt_file_id
+string status
}
KumbaraDonation --> Donation : "extends"
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L95-L105)
- [page.tsx](<file://src/app/(dashboard)/bagis/kumbara/page.tsx#L1-L50>)
- [KumbaraStats.tsx](file://src/components/kumbara/KumbaraStats.tsx#L8-L16)

## API Integration

The donation system provides a comprehensive API for creating, retrieving, and managing donations. The API endpoints are integrated with the Convex database functions and include proper validation and error handling.

```mermaid
flowchart TD
A["Client Request"] --> B{API Endpoint}
B --> C["/api/donations"]
B --> D["/api/donations/stats"]
B --> E["/api/kumbara/[id]"]
C --> F["Validate CSRF Token"]
F --> G["Check Module Access"]
G --> H["Validate Donation Data"]
H --> I["Call Convex Donation Creation"]
I --> J["Return Response"]
D --> K["Fetch All Donations"]
K --> L["Calculate Statistics"]
L --> M["Return Stats Data"]
J --> N["Success: 201 Created"]
J --> O["Error: 400/500"]
M --> P["Success: 200 OK"]
M --> Q["Error: 500"]
```

**Diagram sources**

- [route.ts](file://src/app/api/donations/route.ts#L54-L148)
- [stats/route.ts](file://src/app/api/donations/stats/route.ts#L22-L73)
- [donations.ts](file://convex/donations.ts#L5-L147)

## Donation History and Receipts

Users can view their donation history through the donation list interface, which displays all donations with filtering and search capabilities. The system generates receipts for each donation, which can be accessed through the receipt number.

```mermaid
flowchart LR
A["Donation List Page"] --> B["Search and Filter"]
B --> C["Virtualized Data Table"]
C --> D["Donation Records"]
D --> E["Donor Information"]
D --> F["Amount and Currency"]
D --> G["Payment Method"]
D --> H["Donation Type"]
D --> I["Date and Time"]
D --> J["Receipt Number"]
D --> K["Status"]
A --> L["Total Statistics"]
L --> M["Total Donations"]
L --> N["Total Amount"]
L --> O["This Month Amount"]
```

**Diagram sources**

- [page.tsx](<file://src/app/(dashboard)/bagis/liste/page.tsx#L19-L225>)
- [donations.ts](file://convex/donations.ts#L5-L53)
- [route.ts](file://src/app/api/donations/route.ts#L54-L83)

## Statistical Reporting

The statistical reporting system provides insights into donation trends, status distribution, and payment method usage. The reports are available through the stats API endpoint and displayed in the Kumbara dashboard.

```mermaid
graph TB
A["Stats API"] --> B["Overview Stats"]
A --> C["Monthly Stats"]
A --> D["Status Stats"]
A --> E["Payment Stats"]
B --> F["Total Donations"]
B --> G["Total Amount"]
B --> H["This Month Amount"]
B --> I["Monthly Growth"]
B --> J["Pending Donations"]
B --> K["Completed Donations"]
B --> L["Cancelled Donations"]
C --> M["Last 6 Months Data"]
C --> N["Monthly Amount"]
C --> O["Monthly Count"]
D --> P["Status Breakdown"]
D --> Q["Amount by Status"]
D --> R["Count by Status"]
E --> S["Payment Method Breakdown"]
E --> T["Value by Method"]
E --> U["Count by Method"]
```

**Diagram sources**

- [stats/route.ts](file://src/app/api/donations/stats/route.ts#L22-L198)
- [KumbaraStats.tsx](file://src/components/kumbara/KumbaraStats.tsx#L18-L172)
- [page.tsx](<file://src/app/(dashboard)/bagis/kumbara/page.tsx#L1-L50>)

## Integration with Financial Reporting

The donation system integrates with the financial reporting module by creating corresponding finance records for each donation. This ensures that all donations are properly accounted for in the organization's financial statements.

```mermaid
sequenceDiagram
participant Donation as "Donation System"
participant Finance as "Finance Records"
participant Report as "Financial Reports"
Donation->>Finance : Create income record
Finance->>Finance : Set category to "donation"
Finance->>Finance : Link to donation ID
Finance->>Report : Include in financial reports
Report->>Report : Aggregate donation data
Report-->>Donation : Provide financial insights
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L76-L109)
- [finance_records.ts](file://convex/finance_records.ts#L55-L76)
- [financial.ts](file://src/types/financial.ts#L5-L29)

## Donation Form Customization

The donation form can be customized to collect additional information based on the organization's needs. The form validation and data structure can be extended to support new fields and validation rules.

```mermaid
flowchart TD
A["Base Donation Form"] --> B["Add Custom Fields"]
B --> C["Donor Occupation"]
B --> D["Preferred Contact Method"]
B --> E["Donation Frequency"]
B --> F["Campaign Source"]
A --> G["Custom Validation"]
G --> H["Email Format"]
G --> I["Phone Number"]
G --> J["Amount Range"]
G --> K["Required Fields"]
A --> L["Conditional Logic"]
L --> M["Show fields based on donation type"]
L --> N["Hide fields for anonymous donations"]
L --> O["Display additional info for corporate donors"]
```

**Section sources**

- [route.ts](file://src/app/api/donations/route.ts#L14-L48)
- [page.tsx](<file://src/app/(dashboard)/bagis/liste/page.tsx#L14-L17>)
- [financial.ts](file://src/types/financial.ts#L253-L263)

## Extending Payment Gateways

The system can be extended to support additional payment gateways by implementing new payment methods and integrating with external payment processing services.

```mermaid
flowchart LR
A["Donation System"] --> B["Payment Method Selection"]
B --> C["Credit Card"]
B --> D["Bank Transfer"]
B --> E["Mobile Payment"]
B --> F["New Gateway"]
F --> G["Gateway Integration"]
G --> H["API Configuration"]
H --> I["Authentication"]
I --> J["Transaction Processing"]
J --> K["Webhook Handling"]
K --> L["Status Updates"]
L --> M["Receipt Generation"]
```

**Section sources**

- [donations.ts](file://convex/donations.ts#L85-L86)
- [route.ts](file://src/app/api/donations/route.ts#L100-L120)
- [financial.ts](file://src/types/financial.ts#L253-L263)
