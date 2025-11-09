# Donation Processing

<cite>
**Referenced Files in This Document**   
- [donations.ts](file://convex/donations.ts)
- [finance_records.ts](file://convex/finance_records.ts)
- [kumbara.ts](file://src/lib/validations/kumbara.ts)
- [database.ts](file://src/types/database.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Donation Data Model](#donation-data-model)
3. [Kumbara vs Standard Donations](#kumbara-vs-standard-donations)
4. [Financial Record Integration](#financial-record-integration)
5. [Data Validation and Mutation Workflow](#data-validation-and-mutation-workflow)
6. [Indexing and Query Strategy](#indexing-and-query-strategy)
7. [Business Rules and Validation](#business-rules-and-validation)
8. [Performance Considerations](#performance-considerations)

## Introduction

The Donation Processing system manages both standard donations and Kumbara (money box) donations, providing comprehensive tracking of donor information, payment details, and receipt management. The system integrates with financial records for accounting purposes and supports high-volume donation processing with robust validation and reconciliation capabilities.

**Section sources**

- [donations.ts](file://convex/donations.ts#L1-L149)

## Donation Data Model

The donation collection schema captures comprehensive information about each donation, including donor details, financial information, and transaction metadata.

```mermaid
erDiagram
DONATIONS {
string donor_name PK
string donor_phone
string donor_email
number amount
string currency
string donation_type
string payment_method
string donation_purpose
string notes
string receipt_number UK
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
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L76-L108)
- [database.ts](file://src/types/database.ts#L148-L171)

**Section sources**

- [donations.ts](file://convex/donations.ts#L76-L108)
- [database.ts](file://src/types/database.ts#L148-L171)

## Kumbara vs Standard Donations

The system distinguishes between standard donations and Kumbara donations through the `is_kumbara` field, with additional location and route data captured for Kumbara collections.

```mermaid
classDiagram
class DonationDocument {
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
class KumbaraDonation {
+boolean is_kumbara
+string kumbara_location
+string collection_date
+string kumbara_institution
+object location_coordinates
+string location_address
+array route_points
+number route_distance
+number route_duration
}
DonationDocument <|-- KumbaraDonation
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L96-L104)
- [kumbara.ts](file://src/lib/validations/kumbara.ts#L57-L91)

**Section sources**

- [donations.ts](file://convex/donations.ts#L96-L104)
- [kumbara.ts](file://src/lib/validations/kumbara.ts#L57-L91)

## Financial Record Integration

Donations are linked to financial records for accounting purposes, ensuring proper reconciliation and financial reporting.

```mermaid
erDiagram
DONATIONS ||--o{ FINANCE_RECORDS : "generates"
DONATIONS {
string receipt_number
number amount
string currency
string payment_method
}
FINANCE_RECORDS {
string receipt_number UK
number amount
string currency
string payment_method
string record_type
string category
string status
string created_by
}
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L88-L89)
- [finance_records.ts](file://convex/finance_records.ts#L64-L65)

**Section sources**

- [donations.ts](file://convex/donations.ts#L88-L89)
- [finance_records.ts](file://convex/finance_records.ts#L54-L76)

## Data Validation and Mutation Workflow

The system implements a comprehensive validation and mutation workflow to ensure data integrity and proper financial record creation.

```mermaid
sequenceDiagram
participant Client
participant API
participant Donations
participant FinanceRecords
Client->>API : Create Donation Request
API->>Donations : validateKumbaraCreate()
Donations-->>API : Validation Result
API->>Donations : create() mutation
Donations->>Donations : Insert donation record
Donations-->>API : Created donation
API->>FinanceRecords : create() mutation
FinanceRecords->>FinanceRecords : Insert finance record
FinanceRecords-->>API : Created finance record
API-->>Client : Success Response
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L76-L108)
- [finance_records.ts](file://convex/finance_records.ts#L54-L76)
- [kumbara.ts](file://src/lib/validations/kumbara.ts#L197-L216)

**Section sources**

- [donations.ts](file://convex/donations.ts#L76-L108)
- [finance_records.ts](file://convex/finance_records.ts#L54-L76)
- [kumbara.ts](file://src/lib/validations/kumbara.ts#L197-L216)

## Indexing and Query Strategy

The system implements targeted indexing to optimize query performance for common access patterns.

```mermaid
flowchart TD
Start([Query Request]) --> CheckIndex{"Index Available?"}
CheckIndex --> |Yes| UseIndex["Use Appropriate Index"]
CheckIndex --> |No| FullScan["Full Collection Scan"]
UseIndex --> FilterByStatus["by_status Index"]
UseIndex --> FilterByEmail["by_donor_email Index"]
UseIndex --> FilterByKumbara["by_is_kumbara Index"]
UseIndex --> FilterByReceipt["by_receipt_number Index"]
FilterByStatus --> ExecuteQuery
FilterByEmail --> ExecuteQuery
FilterByKumbara --> ExecuteQuery
FilterByReceipt --> ExecuteQuery
ExecuteQuery --> ApplyAdditionalFilters["Apply Additional Filters"]
ApplyAdditionalFilters --> PaginateResults["Paginate Results"]
PaginateResults --> ReturnResults["Return Results"]
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L17-L41)
- [donations.ts](file://convex/donations.ts#L63-L73)

**Section sources**

- [donations.ts](file://convex/donations.ts#L17-L41)
- [donations.ts](file://convex/donations.ts#L63-L73)

## Business Rules and Validation

The system enforces comprehensive business rules for donation validation, receipt generation, and financial reconciliation.

```mermaid
flowchart TD
Start([Donation Creation]) --> ValidateDonor["Validate Donor Info"]
ValidateDonor --> ValidateAmount["Validate Amount > 0"]
ValidateAmount --> ValidateCurrency["Validate Currency (TRY/USD/EUR)"]
ValidateCurrency --> ValidateReceipt["Validate Receipt Number"]
ValidateReceipt --> CheckKumbara{"Is Kumbara?"}
CheckKumbara --> |Yes| ValidateKumbara["Validate Kumbara Fields"]
CheckKumbara --> |No| GenerateReceipt["Generate Receipt Number"]
ValidateKumbara --> GenerateReceipt
GenerateReceipt --> CreateFinance["Create Finance Record"]
CreateFinance --> CompleteDonation["Complete Donation"]
CompleteDonation --> End([Success])
```

**Diagram sources**

- [kumbara.ts](file://src/lib/validations/kumbara.ts#L6-L51)
- [donations.ts](file://convex/donations.ts#L88-L89)

**Section sources**

- [kumbara.ts](file://src/lib/validations/kumbara.ts#L6-L51)
- [donations.ts](file://convex/donations.ts#L88-L89)

## Performance Considerations

The system is designed to handle high-volume donation processing and reporting with optimized data access patterns.

```mermaid
graph TB
subgraph "Performance Optimization"
A[Batch Processing] --> B[Indexed Queries]
B --> C[Efficient Pagination]
C --> D[Asynchronous Operations]
D --> E[Caching Strategy]
end
subgraph "Scalability"
F[Horizontal Scaling] --> G[Database Optimization]
G --> H[Load Balancing]
H --> I[Monitoring]
end
subgraph "Reporting"
J[Aggregation Queries] --> K[Pre-calculated Stats]
K --> L[Background Processing]
L --> M[Cache Results]
end
```

**Diagram sources**

- [donations.ts](file://convex/donations.ts#L44-L47)
- [donations.ts](file://convex/donations.ts#L1-L42)

**Section sources**

- [donations.ts](file://convex/donations.ts#L44-L47)
- [donations.ts](file://convex/donations.ts#L1-L42)
