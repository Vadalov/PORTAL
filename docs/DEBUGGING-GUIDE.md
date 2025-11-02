# Debugging Guide

Comprehensive guide for debugging issues in the Dernek Yönetim Sistemi application.

## Table of Contents

1. [Browser Console Debugging](#browser-console-debugging)
2. [Network Tab Monitoring](#network-tab-monitoring)
3. [React DevTools](#react-devtools)
4. [Hydration Error Debugging](#hydration-error-debugging)
5. [Browser Extension Issues](#browser-extension-issues)
6. [Production Build Testing](#production-build-testing)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Debug Tools Reference](#debug-tools-reference)

---

## Browser Console Debugging

### Opening the Console

**Chrome / Edge:**

- Windows/Linux: `F12` or `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

**Firefox:**

- Windows/Linux: `F12` or `Ctrl+Shift+K`
- macOS: `Cmd+Option+K`

**Safari:**

- First enable Developer menu: Safari → Settings → Advanced → Show Develop menu
- macOS: `Cmd+Option+C`

### Console Tabs

1. **Console**: View logs, errors, and warnings
2. **Sources/Debugger**: Set breakpoints, step through code
3. **Network**: Monitor HTTP requests
4. **Application/Storage**: View localStorage, cookies, sessions

### Error Filtering

Click the filter dropdown in the console:

- **Errors only** (🔴): Show only error messages
- **Warnings** (🟡): Show warning messages
- **Info** (🔵): Show informational messages
- **Logs** (⚪): Show console.log messages

### Looking for Errors

Check for these critical error patterns:

```javascript
// Hydration errors
'Hydration failed';
'Text content does not match server-rendered HTML';
'There was an error while hydrating';

// Network errors
'Failed to fetch';
'NetworkError';
'CORS';

// Auth errors
'401 Unauthorized';
'403 Forbidden';
'CSRF token';

// React errors
'Uncaught Error';
'Unhandled Promise Rejection';
```

---

## Network Tab Monitoring

### Opening Network Tab

1. Open DevTools (F12)
2. Click "Network" tab
3. ✅ Check "Preserve log" to keep requests across page reloads

### Monitoring Requests

**Key Columns:**

- **Name**: Request URL/endpoint
- **Status**: HTTP status code (200, 404, 500, etc.)
- **Type**: Content type (document, xhr, fetch, js, css)
- **Size**: Response size
- **Time**: Request duration

### Failed Request Detection

Failed requests appear in red. Common status codes:

- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Permission denied
- **404 Not Found**: Endpoint doesn't exist
- **500 Internal Server Error**: Server error
- **0 (canceled)**: Request was canceled or CORS error

### Inspecting Requests

Click on a request to see:

**Headers Tab:**

- Request URL
- Request Method (GET, POST, etc.)
- Status Code
- Request Headers (cookies, CSRF token)
- Response Headers (Set-Cookie, Content-Type)

**Payload Tab:**

- Request body (for POST/PUT requests)
- Form data
- JSON payload

**Response Tab:**

- Response body
- JSON data
- Error messages

**Timing Tab:**

- DNS lookup time
- Connection time
- Server response time
- Download time

### CORS Error Detection

If you see:

```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

Check:

1. Server has correct CORS headers
2. Credentials are included if needed
3. Preflight OPTIONS request succeeds

### Cookie Inspection

1. Go to **Application** tab
2. Expand **Cookies** in sidebar
3. Check for:
   - Session cookies (httpOnly)
   - CSRF tokens
   - Expiration dates

---

## React DevTools

### Installation

Install React DevTools extension:

- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/)

### Using React DevTools

After installation, two new tabs appear in DevTools:

1. **⚛️ Components**: Component tree
2. **⚛️ Profiler**: Performance profiling

### Components Tab

**Features:**

- View component hierarchy
- Inspect props and state
- Edit props in real-time
- Search for components
- View source code location

**Inspecting a Component:**

1. Click on a component in the tree
2. Right panel shows:
   - Props
   - State
   - Hooks
   - Rendered by (parent)
   - Source code location

**Finding Issues:**

- Look for unexpected prop values
- Check if state is updating correctly
- Verify conditional rendering logic

### Profiler Tab

**Recording a Performance Profile:**

1. Click record button ⏺️
2. Interact with the app
3. Click stop button ⏹️
4. Analyze which components re-rendered

**Identifying Performance Issues:**

- Long render times (>16ms for 60fps)
- Unnecessary re-renders
- Component update cascades

---

## Hydration Error Debugging

### What is Hydration?

Hydration is the process of React attaching event listeners to server-rendered HTML. Mismatches between server and client HTML cause hydration errors.

### Common Causes

1. **Using `Date.now()` in render**

   ```jsx
   // ❌ BAD: Different value on server and client
   function Component() {
     return <div>{Date.now()}</div>;
   }

   // ✅ GOOD: Use useEffect for client-only values
   function Component() {
     const [time, setTime] = useState(null);
     useEffect(() => setTime(Date.now()), []);
     return <div>{time || 'Loading...'}</div>;
   }
   ```

2. **Using `Math.random()` in render**

   ```jsx
   // ❌ BAD
   function Component() {
     return <div>{Math.random()}</div>;
   }

   // ✅ GOOD
   function Component() {
     const [random] = useState(() => Math.random());
     return <div>{random}</div>;
   }
   ```

3. **Accessing `localStorage` in render**

   ```jsx
   // ❌ BAD: localStorage is undefined on server
   function Component() {
     const value = localStorage.getItem('key');
     return <div>{value}</div>;
   }

   // ✅ GOOD
   function Component() {
     const [value, setValue] = useState(null);
     useEffect(() => {
       setValue(localStorage.getItem('key'));
     }, []);
     return <div>{value || 'Loading...'}</div>;
   }
   ```

4. **Browser Extensions**
   - Grammarly adds `data-gr-ext` attribute
   - ColorZilla adds `cz-shortcut-listen` attribute
   - Loom adds `data-loom-ext` attribute

   These modify the DOM and cause mismatches.

### Detecting Hydration Errors

**Console Messages:**

```
Warning: Text content did not match. Server: "foo" Client: "bar"
Warning: Prop `className` did not match. Server: "a" Client: "a b"
Hydration failed because the initial UI does not match what was rendered on the server
```

**Error Details:**
React 19 shows a diff of the mismatch:

```
Expected server HTML to contain a matching <div> in <div>.
  + Client
  - Server

  <div>
-   <span>Server Text</span>
+   <span>Client Text</span>
  </div>
```

### Fixing Hydration Errors

**Method 1: Use `suppressHydrationWarning`**

```jsx
<div suppressHydrationWarning>{typeof window !== 'undefined' ? Date.now() : ''}</div>
```

**Method 2: Use `useEffect`**

```jsx
function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <div>{Date.now()}</div>;
}
```

**Method 3: Client-only rendering**

```jsx
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(() => import('./ClientOnlyComponent'), { ssr: false });
```

### Testing in Incognito Mode

1. Open incognito/private window
2. Navigate to your app
3. If it works in incognito but not in regular mode → browser extension issue
4. Disable extensions one by one to find the culprit

---

## Browser Extension Issues

### Common Problematic Extensions

| Extension  | Issue                      | Solution              |
| ---------- | -------------------------- | --------------------- |
| Grammarly  | Adds `data-gr-ext` to HTML | Disable for localhost |
| ColorZilla | Adds `cz-shortcut-listen`  | Disable for localhost |
| Loom       | Adds `data-loom-ext`       | Disable for localhost |
| LastPass   | Modifies form inputs       | Disable for localhost |
| Honey      | Modifies forms             | Disable for localhost |

### Detecting Extension Interference

**Check HTML attributes:**

```javascript
// In browser console
console.log(document.documentElement.attributes);

// Look for:
// data-gr-ext (Grammarly)
// cz-shortcut-listen (ColorZilla)
// data-loom-ext (Loom)
```

### Disabling Extensions for Localhost

**Chrome:**

1. Right-click extension icon
2. Click "Manage extension"
3. Scroll to "Site access"
4. Choose "On specific sites"
5. Don't add localhost

**Firefox:**

1. Click menu → Add-ons
2. Click extension
3. Click "Details"
4. Scroll to "Run on specific sites"
5. Don't add localhost

---

## Production Build Testing

### Why Test Production Build?

Development and production builds differ:

- Development: More verbose errors, slower
- Production: Optimized, minified, faster
- Some issues only appear in production

### Testing Process

**1. Create production build:**

```bash
npm run build
```

**2. Check build output:**

- Look for warnings
- Check bundle sizes
- Verify no errors

**3. Start production server:**

```bash
npm run start
```

**4. Test in browser:**

- Open http://localhost:3000
- Check console for errors
- Test all major features
- Check network tab

### Using the Test Script

Automated testing:

```bash
npm run test:prod
```

This script:

- Cleans previous builds
- Runs production build
- Starts server
- Performs health checks
- Generates report

### Common Production-Only Issues

1. **Environment variables not set**
   - Use `NEXT_PUBLIC_` prefix for client-side vars

2. **Import errors**
   - Check dynamic imports
   - Verify all dependencies installed

3. **API routes failing**
   - Check CORS settings
   - Verify cookies work correctly

4. **CSS not loading**
   - Check Tailwind config
   - Verify PostCSS setup

---

## Common Issues & Solutions

### Issue: Blank White Screen

**Possible Causes:**

1. JavaScript error preventing render
2. Hydration error
3. Auth redirect loop
4. Missing environment variables

**Solutions:**

```bash
# 1. Check console for errors
# Open DevTools and look for red errors

# 2. Clear storage
localStorage.clear();
sessionStorage.clear();
location.reload();

# 3. Test in incognito
# Open incognito window

# 4. Check env vars
# Verify .env.local exists and is complete
```

### Issue: "Failed to fetch" Errors

**Possible Causes:**

1. API server not running
2. Wrong API URL
3. CORS issue
4. Network issue

**Solutions:**

```javascript
// 1. Check API URL
console.log(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);

// 2. Test API directly
curl http://localhost:3000/api/csrf

// 3. Check CORS headers in Network tab

// 4. Verify cookies are sent
// Check Network → Headers → Request Headers → Cookie
```

### Issue: CSRF Token Errors

**Possible Causes:**

1. CSRF token not fetched
2. Cookie not set
3. SameSite cookie issue

**Solutions:**

```javascript
// 1. Check if token endpoint works
fetch('/api/csrf')
  .then((r) => r.json())
  .then(console.log);

// 2. Check cookies in Application tab
// Look for csrf token cookie

// 3. Verify SameSite setting
// Should be 'lax' or 'strict'
```

### Issue: Infinite Redirect Loop

**Possible Causes:**

1. Auth middleware misconfigured
2. Session check failing
3. Cookie not persisting

**Solutions:**

```javascript
// 1. Check auth state
window.__AUTH_STORE__.getState();

// 2. Check session
fetch('/api/auth/session')
  .then((r) => r.json())
  .then(console.log);

// 3. Clear cookies and retry
document.cookie.split(';').forEach((c) => {
  document.cookie = c.split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
});
location.reload();
```

---

## Debug Tools Reference

### Built-in Debug Utilities

Our app includes debug utilities (development only):

**1. Hydration Logger**

```javascript
// Access in console
window.__HYDRATION_LOGGER__;

// Get errors
__HYDRATION_LOGGER__.getErrors();

// Get report
__HYDRATION_LOGGER__.getHydrationReport();

// Clear errors
__HYDRATION_LOGGER__.clearErrors();
```

**2. Store Debugger**

```javascript
// Access in console
window.__STORE_DEBUGGER__;

// Log store state
__STORE_DEBUGGER__.logStoreState();

// Detect mismatches
__STORE_DEBUGGER__.detectStoreMismatch();

// Get report
__STORE_DEBUGGER__.getStoreReport();

// Test hydration
__STORE_DEBUGGER__.testHydration();

// Clear storage and reload
__STORE_DEBUGGER__.clearStorageAndReload();
```

**3. Network Monitor**

```javascript
// Access in console
window.__NETWORK_MONITOR__;

// Get all requests
__NETWORK_MONITOR__.getRequests();

// Get failed requests
__NETWORK_MONITOR__.getFailedRequests();

// Get network report
__NETWORK_MONITOR__.getNetworkReport();

// Print report
__NETWORK_MONITOR__.printReport();

// Export as JSON
console.log(__NETWORK_MONITOR__.exportReport());
```

**4. Auth Store**

```javascript
// Access in console
window.__AUTH_STORE__;

// Get current state
__AUTH_STORE__.getState();

// Check auth status
const { isAuthenticated, user, session } = __AUTH_STORE__.getState();
console.log({ isAuthenticated, user, session });

// Test login
__AUTH_STORE__.getState().login('email@example.com', 'password');
```

### Debug Scripts

**Hydration Debug Script:**

```bash
npm run debug:hydration
```

Checks environment, validates config, provides recommendations.

**Production Test Script:**

```bash
npm run test:prod
```

Builds and tests production bundle.

---

## Additional Resources

- [Next.js Debugging](https://nextjs.org/docs/app/building-your-application/debugging)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [TESTING-PROCEDURES.md](./TESTING-PROCEDURES.md)
- [CONSOLE-MONITORING-CHECKLIST.md](./CONSOLE-MONITORING-CHECKLIST.md)

---

**Need Help?**

If you're still stuck:

1. Check [Common Issues](#common-issues--solutions)
2. Review console errors carefully
3. Test in incognito mode
4. Check [TESTING-PROCEDURES.md](./TESTING-PROCEDURES.md)
5. Enable all debug logging
6. Create a minimal reproduction
