# UI Primitive Components

<cite>
**Referenced Files in This Document**   
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx)
- [form-field-group.tsx](file://src/components/ui/form-field-group.tsx)
- [button.tsx](file://src/components/ui/button.tsx)
- [dialog.tsx](file://src/components/ui/dialog.tsx)
- [tabs.tsx](file://src/components/ui/tabs.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
- [user-form.tsx](file://src/components/forms/user-form.tsx)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx)
- [design-tokens.ts](file://src/config/design-tokens.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Core Form Components](#core-form-components)
3. [Interactive Elements](#interactive-elements)
4. [Form Composition and Workflow Integration](#form-composition-and-workflow-integration)
5. [Accessibility and ARIA Compliance](#accessibility-and-aria-compliance)
6. [Styling and Theming](#styling-and-theming)
7. [Component Composition Guidelines](#component-composition-guidelines)

## Introduction

This documentation provides comprehensive guidance on the UI primitive components within PORTAL's design system, following a shadcn/ui-inspired pattern. The components are designed to ensure accessibility, consistency, and seamless integration with React Hook Form for robust form handling. This document details the implementation of accessible form controls, interactive elements, and their usage across key workflows such as user management and donation processing. The design system leverages Tailwind CSS and a structured design tokens system to maintain visual harmony and support theming.

## Core Form Components

The foundation of PORTAL's form system consists of accessible, composable components that ensure proper labeling, error handling, and user feedback. These components are built with accessibility in mind, providing appropriate ARIA attributes and keyboard navigation support.

### Accessible Form Field

The `AccessibleFormField` component serves as a wrapper for form inputs, ensuring proper association between labels, inputs, hints, and error messages. It manages the accessibility tree by generating unique IDs and setting appropriate ARIA attributes.

```mermaid
flowchart TD
Start([AccessibleFormField]) --> Label["Render label with htmlFor"]
Label --> CheckRequired["Check if required"]
CheckRequired --> |Yes| AddAsterisk["Add * with aria-label"]
CheckRequired --> |No| Continue
Continue --> Group["Create role='group' div"]
Group --> SetAria["Set aria-describedby, aria-invalid, aria-disabled"]
SetAria --> RenderChildren["Render children (input/select)"]
RenderChildren --> CheckHint["Check for hint and no error"]
CheckHint --> |Yes| RenderHint["Render hint paragraph"]
CheckHint --> |No| CheckError["Check for error"]
CheckError --> |Yes| RenderError["Render error paragraph with role='alert'"]
CheckError --> |No| End([Complete])
```

**Diagram sources**

- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L20-L87)

**Section sources**

- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L5-L14)
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L20-L87)

### Form Field Group

The `FormFieldGroup` component organizes related form fields into logical sections with optional icons and visual separators. It supports multiple presentation variants including default, bordered, and card layouts.

```mermaid
classDiagram
class FormFieldGroup {
+title : string
+description? : string
+icon? : LucideIcon
+variant : 'default' | 'bordered' | 'card'
+children : ReactNode
+className? : string
}
FormFieldGroup --> Card : "used when variant='card'"
FormFieldGroup --> Separator : "used in header"
FormFieldGroup --> CardContent : "used when variant='card'"
```

**Diagram sources**

- [form-field-group.tsx](file://src/components/ui/form-field-group.tsx#L7-L14)
- [form-field-group.tsx](file://src/components/ui/form-field-group.tsx#L16-L63)

**Section sources**

- [form-field-group.tsx](file://src/components/ui/form-field-group.tsx#L7-L14)
- [form-field-group.tsx](file://src/components/ui/form-field-group.tsx#L16-L63)

### Form Integration with React Hook Form

PORTAL's form components are designed to work seamlessly with React Hook Form, providing a structured approach to form state management, validation, and submission. The `form.tsx` file exports a suite of components that integrate with React Hook Form's context.

```mermaid
sequenceDiagram
participant Form as FormProvider
participant Field as FormField
participant Controller as Controller
participant Input as FormControl
participant Label as FormLabel
participant Message as FormMessage
Form->>Field : Provide form context
Field->>Controller : Wrap with Controller
Controller->>Input : Register field
Input->>Label : Share formItemId
Input->>Message : Share formMessageId
Label->>Input : htmlFor=formItemId
Input->>Message : aria-describedby=formMessageId when error
```

**Diagram sources**

- [form.tsx](file://src/components/ui/form.tsx#L1-L179)

**Section sources**

- [form.tsx](file://src/components/ui/form.tsx#L1-L179)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L3-L43)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L27-L40)

## Interactive Elements

### Button Component

The Button component is a versatile primitive that supports multiple variants and sizes, designed to provide consistent styling and interaction patterns across the application.

```mermaid
classDiagram
class Button {
+className? : string
+variant : 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
+size : 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
+asChild? : boolean
}
Button --> buttonVariants : "uses for styling"
Button --> Slot : "used when asChild=true"
```

**Diagram sources**

- [button.tsx](file://src/components/ui/button.tsx#L6-L34)
- [button.tsx](file://src/components/ui/button.tsx#L36-L55)

**Section sources**

- [button.tsx](file://src/components/ui/button.tsx#L6-L34)
- [button.tsx](file://src/components/ui/button.tsx#L36-L55)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L223-L232)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L498-L519)

### Dialog Component

The Dialog component provides a modal interface for user interactions, with proper accessibility features including focus trapping and ARIA attributes.

```mermaid
classDiagram
class Dialog {
+children : ReactNode
}
class DialogTrigger {
+children : ReactNode
}
class DialogPortal {
+children : ReactNode
}
class DialogOverlay {
+className? : string
}
class DialogContent {
+className? : string
+children : ReactNode
+showCloseButton? : boolean
}
class DialogHeader {
+className? : string
+children : ReactNode
}
class DialogFooter {
+className? : string
+children : ReactNode
}
class DialogTitle {
+className? : string
+children : ReactNode
}
class DialogDescription {
+className? : string
+children : ReactNode
}
Dialog --> DialogTrigger : "contains"
Dialog --> DialogPortal : "contains"
DialogPortal --> DialogOverlay : "contains"
DialogPortal --> DialogContent : "contains"
DialogContent --> DialogHeader : "contains"
DialogContent --> DialogFooter : "contains"
DialogContent --> DialogTitle : "contains"
DialogContent --> DialogDescription : "contains"
```

**Diagram sources**

- [dialog.tsx](file://src/components/ui/dialog.tsx#L8-L10)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L20-L22)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L48-L91)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L24-L46)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L16-L18)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L12-L14)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L93-L101)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L123-L134)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L103-L111)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L113-L121)

**Section sources**

- [dialog.tsx](file://src/components/ui/dialog.tsx#L8-L10)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L20-L22)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L48-L91)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L24-L46)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L16-L18)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L12-L14)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L93-L101)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L123-L134)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L103-L111)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L113-L121)

### Tabs Component

The Tabs component enables content organization through tabbed interfaces, supporting keyboard navigation and proper ARIA roles for accessibility.

```mermaid
classDiagram
class Tabs {
+className? : string
}
class TabsList {
+className? : string
}
class TabsTrigger {
+className? : string
}
class TabsContent {
+className? : string
}
Tabs --> TabsList : "contains"
TabsList --> TabsTrigger : "contains"
Tabs --> TabsContent : "contains"
```

**Diagram sources**

- [tabs.tsx](file://src/components/ui/tabs.tsx#L7-L15)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L18-L28)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L31-L41)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L44-L51)

**Section sources**

- [tabs.tsx](file://src/components/ui/tabs.tsx#L7-L15)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L18-L28)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L31-L41)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L44-L51)

## Form Composition and Workflow Integration

### User Form Implementation

The user form demonstrates the composition of primitive components into a complex form for user management. It integrates with React Hook Form for validation and state management, using zod for schema validation.

```mermaid
flowchart TD
UserFormStart([UserForm]) --> UseForm["useForm with zodResolver"]
UseForm --> Schema["Define validation schema with zod"]
Schema --> DefaultValues["Set default values"]
DefaultValues --> RenderForm["Render form with Form component"]
RenderForm --> Grid["Create responsive grid layout"]
Grid --> NameField["FormField for name with Input"]
Grid --> EmailField["FormField for email with Input"]
Grid --> PhoneField["FormField for phone with Input"]
Grid --> RoleField["FormField for role with Input"]
RenderForm --> PermissionsField["FormField for permissions with PermissionCheckboxGroup"]
RenderForm --> StatusField["FormField for isActive with Switch"]
RenderForm --> PasswordField["FormField for password with Input and generate button"]
PasswordField --> Generate["Handle password generation"]
RenderForm --> Submit["Render submit and cancel buttons"]
Submit --> HandleSubmit["Handle form submission with validation"]
HandleSubmit --> Payload["Create sanitized payload"]
Payload --> OnSubmit["Call onSubmit callback"]
```

**Diagram sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L27-L40)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L73-L84)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L116-L253)

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx#L27-L40)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L73-L84)
- [user-form.tsx](file://src/components/forms/user-form.tsx#L116-L253)

### Donation Form Implementation

The donation form showcases a more complex workflow with real-time field validation, file upload capabilities, and integration with React Query for data mutation.

```mermaid
flowchart TD
DonationFormStart([DonationForm]) --> State["Manage local state for submission, files, validation"]
State --> UseForm["useForm with zodResolver"]
UseForm --> Schema["Define donation schema with zod"]
Schema --> Mutation["useMutation for createDonation"]
Mutation --> QueryClient["Invalidate queries on success"]
Mutation --> Toast["Show success/error toast"]
DonationFormStart --> RenderCard["Render Card with header and content"]
RenderCard --> Loading["Show loading overlay when submitting"]
RenderCard --> Form["Render form with onSubmit handler"]
Form --> DonorSection["Donor information section with FieldWithValidation"]
Form --> DonationSection["Donation information section with FieldWithValidation"]
Form --> NotesSection["Notes and file upload section"]
Form --> Actions["Submit and cancel buttons"]
DonorSection --> RealTime["Implement real-time validation on input change"]
DonationSection --> RealTime
NotesSection --> FileUpload["Integrate FileUpload component"]
Actions --> SubmitHandler["Handle form submission with file upload"]
SubmitHandler --> Upload["Upload receipt file to storage"]
Upload --> Create["Create donation with file reference"]
Create --> Success["Handle success with toast and query invalidation"]
```

**Diagram sources**

- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L27-L40)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L125-L132)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L134-L146)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L188-L523)

**Section sources**

- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L27-L40)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L125-L132)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L134-L146)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L188-L523)

## Accessibility and ARIA Compliance

PORTAL's UI components adhere to WCAG 2.1 guidelines, ensuring accessibility for all users. The components implement proper ARIA attributes, keyboard navigation, and screen reader support.

### Keyboard Navigation

All interactive components support keyboard navigation:

- Buttons and links are focusable and activatable with Enter/Space
- Form fields are navigable with Tab/Shift+Tab
- Dialogs trap focus and can be closed with Escape
- Tabs support arrow key navigation between tabs

### ARIA Attributes Implementation

The components use ARIA attributes to enhance accessibility:

- `aria-label` and `aria-labelledby` for labeling elements
- `aria-describedby` to associate hints and error messages
- `aria-invalid` to indicate invalid form fields
- `aria-disabled` for disabled elements
- `role="alert"` for error messages
- `role="group"` for grouping related form elements

```mermaid
flowchart TD
AccessibilityStart([Accessibility Features]) --> ARIA["ARIA Attributes"]
ARIA --> Labeling["aria-label, aria-labelledby"]
ARIA --> DescribedBy["aria-describedby for hints/errors"]
ARIA --> Invalid["aria-invalid for form validation"]
ARIA --> Disabled["aria-disabled for interactive elements"]
ARIA --> Role["role attributes for semantic meaning"]
AccessibilityStart --> Keyboard["Keyboard Navigation"]
Keyboard --> Focus["Focus management"]
Keyboard --> TabOrder["Logical tab order"]
Keyboard --> Shortcuts["Access keys and shortcuts"]
AccessibilityStart --> ScreenReader["Screen Reader Support"]
ScreenReader --> Announcements["Live regions and announcements"]
ScreenReader --> Landmarks["ARIA landmarks"]
ScreenReader --> Status["Dynamic status updates"]
```

**Section sources**

- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L37-L38)
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L66-L70)
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L81-L83)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L80-L87)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L36-L37)

## Styling and Theming

### Design Tokens System

PORTAL uses a comprehensive design tokens system to maintain consistency across the UI. The tokens are organized into logical categories and exported for use throughout the application.

```mermaid
classDiagram
class designTokens {
+colors
+typography
+spacing
+shadows
+transitions
+zIndex
+borderRadius
+breakpoints
+components
+layout
+colorSchemes
}
designTokens --> colors : "contains"
designTokens --> typography : "contains"
designTokens --> spacing : "contains"
designTokens --> shadows : "contains"
designTokens --> transitions : "contains"
designTokens --> zIndex : "contains"
designTokens --> borderRadius : "contains"
designTokens --> breakpoints : "contains"
designTokens --> components : "contains"
designTokens --> layout : "contains"
designTokens --> colorSchemes : "contains"
```

**Diagram sources**

- [design-tokens.ts](file://src/config/design-tokens.ts#L8-L106)
- [design-tokens.ts](file://src/config/design-tokens.ts#L110-L157)
- [design-tokens.ts](file://src/config/design-tokens.ts#L161-L178)
- [design-tokens.ts](file://src/config/design-tokens.ts#L182-L189)
- [design-tokens.ts](file://src/config/design-tokens.ts#L193-L197)
- [design-tokens.ts](file://src/config/design-tokens.ts#L201-L209)
- [design-tokens.ts](file://src/config/design-tokens.ts#L213-L220)
- [design-tokens.ts](file://src/config/design-tokens.ts#L224-L231)
- [design-tokens.ts](file://src/config/design-tokens.ts#L235-L293)
- [design-tokens.ts](file://src/config/design-tokens.ts#L301-L347)
- [design-tokens.ts](file://src/config/design-tokens.ts#L351-L370)

**Section sources**

- [design-tokens.ts](file://src/config/design-tokens.ts#L8-L106)
- [design-tokens.ts](file://src/config/design-tokens.ts#L110-L157)
- [design-tokens.ts](file://src/config/design-tokens.ts#L161-L178)
- [design-tokens.ts](file://src/config/design-tokens.ts#L182-L189)
- [design-tokens.ts](file://src/config/design-tokens.ts#L193-L197)
- [design-tokens.ts](file://src/config/design-tokens.ts#L201-L209)
- [design-tokens.ts](file://src/config/design-tokens.ts#L213-L220)
- [design-tokens.ts](file://src/config/design-tokens.ts#L224-L231)
- [design-tokens.ts](file://src/config/design-tokens.ts#L235-L293)
- [design-tokens.ts](file://src/config/design-tokens.ts#L301-L347)
- [design-tokens.ts](file://src/config/design-tokens.ts#L351-L370)

### Tailwind CSS Integration

The components leverage Tailwind CSS utility classes for styling, with a focus on responsive design and consistent spacing. The `cn` utility function is used to conditionally apply classes.

```mermaid
flowchart TD
TailwindStart([Tailwind CSS Usage]) --> Utilities["Utility-First Approach"]
Utilities --> Layout["Layout utilities (flex, grid, space)"]
Utilities --> Spacing["Spacing utilities (p, m, gap)"]
Utilities --> Typography["Typography utilities (text, font, leading)"]
Utilities --> Borders["Border utilities (border, rounded)"]
Utilities --> Effects["Effect utilities (shadow, ring)"]
TailwindStart --> Responsive["Responsive Design"]
Responsive --> Breakpoints["Breakpoint prefixes (sm:, md:, lg:)"]
Responsive --> Adaptive["Adaptive layouts"]
TailwindStart --> Conditional["Conditional Class Composition"]
Conditional --> cn["cn utility function"]
cn --> Merge["Merge static and dynamic classes"]
cn --> Conditionals["Apply classes based on props/state"]
```

**Section sources**

- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L42-L43)
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx#L120-L129)
- [form-field-group.tsx](file://src/components/ui/form-field-group.tsx#L40-L41)
- [button.tsx](file://src/components/ui/button.tsx#L52-L53)
- [dialog.tsx](file://src/components/ui/dialog.tsx#L62-L71)
- [tabs.tsx](file://src/components/ui/tabs.tsx#L22-L25)

## Component Composition Guidelines

When composing components in PORTAL's design system, follow these guidelines to ensure consistency and maintainability:

1. **Use Primitive Components**: Always use the primitive components (AccessibleFormField, Button, Dialog, etc.) rather than building custom implementations.
2. **Follow Accessibility Patterns**: Ensure all forms use proper labeling, error handling, and ARIA attributes.
3. **Leverage Design Tokens**: Use the design tokens system for colors, spacing, typography, and other visual properties.
4. **Integrate with React Hook Form**: For forms, use the Form, FormField, FormItem, FormLabel, FormControl, and FormMessage components with React Hook Form.
5. **Handle Loading States**: Implement loading states for async operations using appropriate visual feedback.
6. **Provide Error Feedback**: Use consistent error messaging patterns with appropriate ARIA roles.
7. **Support Keyboard Navigation**: Ensure all interactive elements are keyboard accessible.
8. **Use Responsive Layouts**: Design components to work across different screen sizes using Tailwind's responsive utilities.

**Section sources**

- [user-form.tsx](file://src/components/forms/user-form.tsx)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx)
- [accessible-form-field.tsx](file://src/components/ui/accessible-form-field.tsx)
- [form-field-group.tsx](file://src/components/ui/form-field-group.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
