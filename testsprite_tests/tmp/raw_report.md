
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** PORTAL
- **Date:** 2025-10-29
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** Authentication: Successful Login with Valid Credentials
- **Test Code:** [TC001_Authentication_Successful_Login_with_Valid_Credentials.py](./TC001_Authentication_Successful_Login_with_Valid_Credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/fa316c5b-b782-40e1-8163-78d27ed24ff0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** Authentication: Failed Login with Invalid Credentials
- **Test Code:** [TC002_Authentication_Failed_Login_with_Invalid_Credentials.py](./TC002_Authentication_Failed_Login_with_Invalid_Credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/6759ddaf-72c5-467a-9826-5138cabb8555
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Authentication: Session Management and Logout
- **Test Code:** [TC003_Authentication_Session_Management_and_Logout.py](./TC003_Authentication_Session_Management_and_Logout.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/16fea9d3-c9aa-401f-b888-9ddcf23d2cee
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** User Management: Role-Based Access Control Enforcement
- **Test Code:** [TC004_User_Management_Role_Based_Access_Control_Enforcement.py](./TC004_User_Management_Role_Based_Access_Control_Enforcement.py)
- **Test Error:** Testing stopped due to manager user login failure. Admin user access verified successfully. Manager login failure prevents further role-based access control verification. Please fix login issue to continue testing.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/api/auth/login:0:0)
[ERROR] URL: /api/auth/login (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Method: POST (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Status: 401 (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Duration: 148.80ms (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Response Body: {error: Geçersiz kullanıcı bilgileri} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] 💡 Debugging Suggestions: (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check if user is authenticated (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Verify session token is valid (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check if cookies are being sent (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] ❌ Login failed (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/f61d74ac-0f9d-432e-857c-d979f4c14f0e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Beneficiary Management: CRUD Operations
- **Test Code:** [TC005_Beneficiary_Management_CRUD_Operations.py](./TC005_Beneficiary_Management_CRUD_Operations.py)
- **Test Error:** Tested the full CRUD workflow for beneficiary records. The create step failed because the quick-add modal closes without saving when attempting to save a new beneficiary. Other CRUD operations could not be tested fully. Please fix the save functionality in the quick-add modal. Stopping the test here.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Select is changing from uncontrolled to controlled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Select is changing from uncontrolled to controlled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Select is changing from uncontrolled to controlled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Select is changing from controlled to uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Select is changing from controlled to uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Select is changing from controlled to uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/6ee6a67c-9ce6-42cb-9456-649071ee4bc1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Beneficiary Management: Input Validation and Sanitization
- **Test Code:** [TC006_Beneficiary_Management_Input_Validation_and_Sanitization.py](./TC006_Beneficiary_Management_Input_Validation_and_Sanitization.py)
- **Test Error:** Tested beneficiary form input validation with malicious and edge case data. The form closes on submission without showing validation errors or sanitization feedback, indicating lack of proper input validation or user feedback. This is a critical issue for security and data integrity. Test stopped.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/0cefbce6-ace4-4a1d-9f11-3c22948ee441
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Donations Management: Tracking, Receipt, and Reporting
- **Test Code:** [TC007_Donations_Management_Tracking_Receipt_and_Reporting.py](./TC007_Donations_Management_Tracking_Receipt_and_Reporting.py)
- **Test Error:** Tested donation entry submission twice with valid data. Both times, the new donation did not appear in the donation list, indicating a possible issue with saving or displaying donations. Receipt generation and report verification steps could not be performed due to this. The piggy bank feature was not tested. Task is partially complete with failure to verify donation entries and related functionalities.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] `DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] `DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] Select is changing from uncontrolled to controlled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] `DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] `DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/2f0c0435-48ef-4a14-8bf9-ffc19b848029
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Aid Application Processing and Approval Workflow
- **Test Code:** [TC008_Aid_Application_Processing_and_Approval_Workflow.py](./TC008_Aid_Application_Processing_and_Approval_Workflow.py)
- **Test Error:** Testing stopped due to critical error blocking access to aid application list and form. Reported the issue for developer attention. Cannot proceed with aid application workflow testing until fixed.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] %c%s%c Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.%s background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server   
  <... title=... description=... icon={{$$typeof: ..., render: ...}} estimatedDate=... features=...>
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileText}
                          ^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileText}
                          ^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at ScholarshipApplicati…nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileText}
                          ^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileText}
                          ^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at ScholarshipApplicati…nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/f441cc41-9547-4f56-943a-d03a9a209eff
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Tasks Management: Kanban Board Operations and Drag-and-Drop
- **Test Code:** [TC009_Tasks_Management_Kanban_Board_Operations_and_Drag_and_Drop.py](./TC009_Tasks_Management_Kanban_Board_Operations_and_Drag_and_Drop.py)
- **Test Error:** The Kanban board page is currently not functional due to a backend 'Failed to fetch' error preventing loading of tasks and interaction with the board. This blocks verification of task creation, editing, assignment, status updates, and drag-and-drop reordering as requested. The issue has been reported. Please resolve the backend issue to proceed with testing.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:8080/v1/databases/mock-database-id/collections/users/documents?queries%5B0%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B100%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D:0:0)
[ERROR] URL: http://localhost:8080/v1/databases/mock-database-id/collections/users/documents?queries%5B0%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B100%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Method: GET (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Status: N/A (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Duration: 1075.90ms (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Error: Failed to fetch (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] 💡 Debugging Suggestions: (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check network connection (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Verify API is running (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check for CORS issues (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Appwrite Error: TypeError: Failed to fetch
    at window.fetch (http://localhost:3000/_next/static/chunks/src_d51167a2._.js:1044:45)
    at Client.<anonymous> (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:933:36)
    at Generator.next (<anonymous>)
    at http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:97:71
    at new Promise (<anonymous>)
    at __awaiter (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:79:12)
    at Client.call (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:930:16)
    at Databases.listDocuments (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:2857:28)
    at http://localhost:3000/_next/static/chunks/src_418604fb._.js:2283:197
    at handleAppwriteError (http://localhost:3000/_next/static/chunks/src_418604fb._.js:761:22)
    at Object.getUsers (http://localhost:3000/_next/static/chunks/src_418604fb._.js:2272:197)
    at TasksPage.useQuery (http://localhost:3000/_next/static/chunks/src_418604fb._.js:7542:196)
    at Object.fetchFn [as fn] (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1343:20)
    at run (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1007:55)
    at Object.start (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1049:17)
    at Query.fetch (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1401:46)
    at #executeFetch (http://localhost:3000/_next/static/chunks/node_modules_5954fca8._.js:167:42)
    at QueryObserver.onSubscribe (http://localhost:3000/_next/static/chunks/node_modules_5954fca8._.js:59:35)
    at QueryObserver.subscribe (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:697:14)
    at useBaseQuery.useSyncExternalStore.useCallback (http://localhost:3000/_next/static/chunks/node_modules_5954fca8._.js:752:60)
    at subscribeToStore (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:5012:16)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14797:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:960:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7209:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7244:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8622:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8683:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8683:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8626:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8626:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17) (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/a9634d2a-d331-4367-939e-fa761cff88a7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Meetings Management: Scheduling and Calendar Visualization
- **Test Code:** [TC010_Meetings_Management_Scheduling_and_Calendar_Visualization.py](./TC010_Meetings_Management_Scheduling_and_Calendar_Visualization.py)
- **Test Error:** Meeting creation failed due to persistent validation error and inability to save meeting. Meeting form remains open with error message. Further testing on meeting creation, editing, and calendar view rendering cannot proceed. Issue reported for developer investigation.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:8080/v1/databases/mock-database-id/collections/meetings/documents?queries%5B0%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B1%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D&queries%5B2%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22meeting_date%22%7D&queries%5B3%5D=%7B%22method%22%3A%22equal%22%2C%22attribute%22%3A%22status%22%2C%22values%22%3A%5B%22scheduled%22%5D%7D:0:0)
[ERROR] URL: http://localhost:8080/v1/databases/mock-database-id/collections/meetings/documents?queries%5B0%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B1%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D&queries%5B2%5D=%7B%22method%22%3A%22orderDesc%22%2C%22attribute%22%3A%22meeting_date%22%7D&queries%5B3%5D=%7B%22method%22%3A%22equal%22%2C%22attribute%22%3A%22status%22%2C%22values%22%3A%5B%22scheduled%22%5D%7D (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Method: GET (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Status: N/A (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Duration: 1017.50ms (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Error: Failed to fetch (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] 💡 Debugging Suggestions: (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check network connection (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Verify API is running (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check for CORS issues (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Appwrite Error: TypeError: Failed to fetch
    at window.fetch (http://localhost:3000/_next/static/chunks/src_d51167a2._.js:1044:45)
    at Client.<anonymous> (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:933:36)
    at Generator.next (<anonymous>)
    at http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:97:71
    at new Promise (<anonymous>)
    at __awaiter (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:79:12)
    at Client.call (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:930:16)
    at Databases.listDocuments (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:2857:28)
    at http://localhost:3000/_next/static/chunks/src_ce02e5e3._.js:3689:197
    at handleAppwriteError (http://localhost:3000/_next/static/chunks/src_ce02e5e3._.js:1702:22)
    at Object.getMeetings (http://localhost:3000/_next/static/chunks/src_ce02e5e3._.js:3665:197)
    at MeetingsPage.useQuery (http://localhost:3000/_next/static/chunks/src_ce02e5e3._.js:8030:181)
    at Object.fetchFn [as fn] (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1343:20)
    at run (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1007:55)
    at Object.start (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1049:17)
    at Query.fetch (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1401:46)
    at #executeFetch (http://localhost:3000/_next/static/chunks/node_modules_4316a343._.js:167:42)
    at QueryObserver.onSubscribe (http://localhost:3000/_next/static/chunks/node_modules_4316a343._.js:59:35)
    at QueryObserver.subscribe (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:697:14)
    at useBaseQuery.useSyncExternalStore.useCallback (http://localhost:3000/_next/static/chunks/node_modules_4316a343._.js:752:60)
    at subscribeToStore (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:5012:16)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14797:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:960:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7209:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7244:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8622:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8683:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8683:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8626:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8626:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17) (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/5354740d-5514-4696-9533-ffeacf8fb0e2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Internal Messaging: Template and Bulk Message Sending
- **Test Code:** [TC011_Internal_Messaging_Template_and_Bulk_Message_Sending.py](./TC011_Internal_Messaging_Template_and_Bulk_Message_Sending.py)
- **Test Error:** Tested internal messaging system for selecting message templates, selecting recipients individually and in bulk, composing message, and sending. Message sending did not log messages in sent messages tab. Also, no validation error appeared when sending with no recipients. These are critical issues to address.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:8080/v1/databases/mock-database-id/collections/users/documents?queries%5B0%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B100%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D:0:0)
[ERROR] URL: http://localhost:8080/v1/databases/mock-database-id/collections/users/documents?queries%5B0%5D=%7B%22method%22%3A%22limit%22%2C%22values%22%3A%5B100%5D%7D&queries%5B1%5D=%7B%22method%22%3A%22offset%22%2C%22values%22%3A%5B0%5D%7D (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Method: GET (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Status: N/A (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Duration: 799.50ms (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] Error: Failed to fetch (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[WARNING] 💡 Debugging Suggestions: (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check network connection (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Verify API is running (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING]   - Check for CORS issues (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Appwrite Error: TypeError: Failed to fetch
    at window.fetch (http://localhost:3000/_next/static/chunks/src_d51167a2._.js:1044:45)
    at Client.<anonymous> (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:933:36)
    at Generator.next (<anonymous>)
    at http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:97:71
    at new Promise (<anonymous>)
    at __awaiter (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:79:12)
    at Client.call (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:930:16)
    at Databases.listDocuments (http://localhost:3000/_next/static/chunks/node_modules_appwrite_dist_esm_sdk_4d714a28.js:2857:28)
    at http://localhost:3000/_next/static/chunks/src_129260cc._.js:2283:197
    at handleAppwriteError (http://localhost:3000/_next/static/chunks/src_129260cc._.js:761:22)
    at Object.getUsers (http://localhost:3000/_next/static/chunks/src_129260cc._.js:2272:197)
    at InternalMessagingPage.useQuery (http://localhost:3000/_next/static/chunks/src_129260cc._.js:7135:208)
    at Object.fetchFn [as fn] (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1343:20)
    at run (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1007:55)
    at Object.start (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1049:17)
    at Query.fetch (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:1401:46)
    at #executeFetch (http://localhost:3000/_next/static/chunks/node_modules_3d6bed1f._.js:167:42)
    at QueryObserver.onSubscribe (http://localhost:3000/_next/static/chunks/node_modules_3d6bed1f._.js:59:35)
    at QueryObserver.subscribe (http://localhost:3000/_next/static/chunks/node_modules_eb12c09c._.js:697:14)
    at useBaseQuery.useSyncExternalStore.useCallback (http://localhost:3000/_next/static/chunks/node_modules_3d6bed1f._.js:752:60)
    at subscribeToStore (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:5012:16)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14797:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:960:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7209:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7244:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8622:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8683:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8683:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8626:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8626:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8609:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8621:17) (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/aff515f8-d1c5-414d-85b7-10ad08f1db0a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Dashboard: Data Accuracy and Key Metrics Display
- **Test Code:** [TC012_Dashboard_Data_Accuracy_and_Key_Metrics_Display.py](./TC012_Dashboard_Data_Accuracy_and_Key_Metrics_Display.py)
- **Test Error:** Dashboard verification completed with partial success. Key statistics cards and recent activities are accurate. Quick access links for 'İhtiyaç Sahipleri' and 'Bağışlar' navigate correctly. However, the 'Raporlar' quick access link triggers a critical error preventing access to the reports module. Please address this issue to ensure full dashboard functionality.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] %c%s%c Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.%s background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server   
  <... title=... description=... icon={{$$typeof: ..., render: ...}} estimatedDate=... features=...>
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileChartColumnIncreasing}
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileChartColumnIncreasing}
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at DonationReportsPage …nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileChartColumnIncreasing}
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function FileChartColumnIncreasing}
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at DonationReportsPage …nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/ebf86894-4718-4468-a9e4-aedcc7e1ce6f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Financial Dashboard: Income and Expense Tracking with Reporting
- **Test Code:** [TC013_Financial_Dashboard_Income_and_Expense_Tracking_with_Reporting.py](./TC013_Financial_Dashboard_Income_and_Expense_Tracking_with_Reporting.py)
- **Test Error:** Testing stopped due to critical error on income/expense monitoring page preventing verification of financial data and report generation. Detailed error reported to development team.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] %c%s%c Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.%s background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server   
  <... title=... description=... icon={{$$typeof: ..., render: ...}} estimatedDate=... features=...>
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function Receipt}
                          ^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function Receipt}
                          ^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at IncomeExpensePage (a…nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function Receipt}
                          ^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function Receipt}
                          ^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at IncomeExpensePage (a…nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/edcd0832-8f2c-4460-afc7-4c8c6249e7a7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Scholarship Management: Student and Application Handling
- **Test Code:** [TC014_Scholarship_Management_Student_and_Application_Handling.py](./TC014_Scholarship_Management_Student_and_Application_Handling.py)
- **Test Error:** Testing stopped due to critical error on student records page preventing further progress. Issue reported for developer investigation and fix.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] %c%s%c Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.%s background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px  Server   
  <... title=... description=... icon={{$$typeof: ..., render: ...}} estimatedDate=... features=...>
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function GraduationCap}
                          ^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function GraduationCap}
                          ^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at StudentsPage (about:…nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
[ERROR] %o

%s Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function GraduationCap}
                          ^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) The above error occurred in the <Unknown> component. It was handled by the <ErrorBoundary> error boundary. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_a38d7d69._.js:1295:24)
[ERROR] [ErrorBoundary:unnamed] caught error Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function GraduationCap}
                          ^^^^^^^^^^^^^^^^^^^^^^
    at stringify (<anonymous>:1:18)
    at stringify (<anonymous>:1:18)
    at resolveErrorDev (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:1849:148)
    at processFullStringRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2357:29)
    at processFullBinaryRow (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2316:9)
    at processBinaryChunk (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2426:98)
    at progress (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-server-dom-turbopack_9212ccad._.js:2595:13) {componentStack: 
    at  (<anonymous>)
    at StudentsPage (about:…nks/node_modules_next_dist_4b2403f5._.js:3559:39)} (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:3125:31)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/0b5f1e61-3fbd-4ab9-b5c8-bfd1e95f902e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** Settings Management: Configuration Update and Validation
- **Test Code:** [TC015_Settings_Management_Configuration_Update_and_Validation.py](./TC015_Settings_Management_Configuration_Update_and_Validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/255c9531-3884-4830-80de-54ea3f8264df
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** Data Table Component: Search, Filter, Pagination, Sorting, Export
- **Test Code:** [TC016_Data_Table_Component_Search_Filter_Pagination_Sorting_Export.py](./TC016_Data_Table_Component_Search_Filter_Pagination_Sorting_Export.py)
- **Test Error:** Testing stopped due to inability to navigate to other modules and lack of data in the donations list view. Reusable data table features could not be fully verified.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/d20e0883-dccb-4c91-88a7-6a9c908c605a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017
- **Test Name:** Security: CSRF Token Validation and API Rate Limiting
- **Test Code:** [TC017_Security_CSRF_Token_Validation_and_API_Rate_Limiting.py](./TC017_Security_CSRF_Token_Validation_and_API_Rate_Limiting.py)
- **Test Error:** CSRF token validation is partially verified: API requests with valid CSRF token can be triggered via the 'Yeni Bağış Ekle' form, but form validation errors prevented full submission. Requests with missing or invalid CSRF tokens and rate limiting enforcement were not fully tested due to form submission issues. Further testing with complete form data and direct API calls is recommended to fully verify CSRF and rate limiting enforcement.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/api/csrf-token:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/genel:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/bagis/liste:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] 💡 Check project ID in Appwrite console - it should be 20 characters (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ APPWRITE_API_KEY is not defined. Server-side operations may not work properly. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ Server SDK used in browser. Use client SDK instead. (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/api/bagis/liste:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/bagis/liste:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID should be 20-24 characters long (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/bd36f258-ac74-4e35-88e4-4cc2659a4b6d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018
- **Test Name:** Error Handling: User-Friendly Error Messages and Sentry Logging
- **Test Code:** [TC018_Error_Handling_User_Friendly_Error_Messages_and_Sentry_Logging.py](./TC018_Error_Handling_User_Friendly_Error_Messages_and_Sentry_Logging.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/5542d231-1d3d-4efc-b9a9-701d95333f2b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019
- **Test Name:** Performance: Verify Core Web Vitals and Bundle Size
- **Test Code:** [TC019_Performance_Verify_Core_Web_Vitals_and_Bundle_Size.py](./TC019_Performance_Verify_Core_Web_Vitals_and_Bundle_Size.py)
- **Test Error:** Performance metrics FCP, LCP, CLS, TTI and bundle size could not be verified from the application UI as no such data is visible or accessible. Recommend using browser developer tools or external tools like Lighthouse to measure these metrics. Task stopped as per instruction.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/login?from=%2F:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[WARNING] ⚠️ No Set-Cookie header in response (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/genel:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) (at http://localhost:3000/:0:0)
[WARNING] ⚠️ No data in localStorage (at http://localhost:3000/_next/static/chunks/node_modules_next_dist_4b2403f5._.js:2295:27)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/6e403d00-5588-4422-8d6c-2c61c61989c7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020
- **Test Name:** Accessibility: WCAG 2.1 AA Compliance Across UI Components and Pages
- **Test Code:** [TC020_Accessibility_WCAG_2.1_AA_Compliance_Across_UI_Components_and_Pages.py](./TC020_Accessibility_WCAG_2.1_AA_Compliance_Across_UI_Components_and_Pages.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/a5f814fa-c371-4b6a-92c6-b170f08dad03/f12538c0-86a2-4e37-bc79-569340b0bcfc
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **30.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---