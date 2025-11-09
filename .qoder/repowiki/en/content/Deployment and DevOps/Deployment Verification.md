# Deployment Verification

<cite>
**Referenced Files in This Document**   
- [health/route.ts](file://src/app/api/health/route.ts)
- [login/route.ts](file://src/app/api/auth/login/route.ts)
- [auth.ts](file://convex/auth.ts)
- [validate-deploy.sh](file://scripts/validate-deploy.sh)
</cite>

## Table of Contents

1. [Health Check Endpoint](#health-check-endpoint)
2. [Verification Steps](#verification-steps)
3. [Troubleshooting Guidance](#troubleshooting-guidance)
4. [Monitoring Integration](#monitoring-integration)

## Health Check Endpoint

The PORTAL application provides a health check endpoint at `/api/health` to verify deployment status and system integrity. This endpoint returns a JSON response containing status information, timestamp, and version details. The basic response includes core health indicators such as service status, backend provider, Convex configuration status, and readiness for production.

When accessed with the `detailed=true` query parameter, the endpoint performs comprehensive connectivity tests with the Convex backend, returning additional information about system validation, connectivity status, and recommendations for improvement. The health check results are cached for 30 seconds to prevent excessive backend queries during monitoring.

The response structure includes a base response with essential health indicators and optional detailed sections when requested. The endpoint returns HTTP status code 200 for healthy systems and 503 for systems with critical failures, making it suitable for automated monitoring and deployment validation.

**Section sources**

- [health/route.ts](file://src/app/api/health/route.ts#L1-L173)

## Verification Steps

### Health Check API Call

To verify deployment success, start by calling the health check endpoint using curl or a web browser. For basic verification, access `https://your-deployment-url/api/health`. For detailed diagnostics, use `https://your-deployment-url/api/health?detailed=true`.

Example curl command:

```bash
curl https://your-portal-app.vercel.app/api/health
```

Expected basic response:

```json
{
  "ok": true,
  "provider": "convex",
  "convex": {
    "url": true,
    "configured": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "readyForProduction": true
}
```

Expected detailed response when all systems are operational:

```json
{
  "ok": true,
  "provider": "convex",
  "convex": {
    "url": true,
    "configured": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "readyForProduction": true,
  "validation": {
    "summary": {
      "errors": 0,
      "warnings": 0
    },
    "errors": [],
    "warnings": []
  },
  "connectivity": {
    "summary": {
      "overallHealth": 100,
      "passedTests": 1,
      "failedTests": 0
    },
    "tests": [
      {
        "name": "Convex Connection",
        "passed": true,
        "responseTime": 150,
        "message": "Connected in 150ms"
      }
    ],
    "recommendations": []
  },
  "recommendations": []
}
```

### Login Functionality Test

After confirming the health check endpoint is working, test the login functionality by accessing the login page and attempting to authenticate with valid credentials. This verifies that authentication flows, session management, and user data retrieval are functioning correctly.

The login process should:

1. Accept valid email and password credentials
2. Create appropriate session cookies (auth-session and csrf-token)
3. Redirect to the dashboard upon successful authentication
4. Return appropriate error messages for invalid credentials

### Convex Backend Connectivity Validation

The final verification step confirms connectivity between the frontend application and the Convex backend. This is automatically tested in the detailed health check, but can be manually verified by attempting to access application features that require data retrieval from Convex, such as viewing user lists or accessing beneficiary information.

The system validates Convex connectivity by attempting to query the users collection. Successful connectivity is indicated by response times under 1000ms (rated as 100% health), while response times between 1000-3000ms are considered acceptable (75% health), and response times over 3000ms or connection failures indicate critical issues.

**Section sources**

- [health/route.ts](file://src/app/api/health/route.ts#L50-L172)
- [login/route.ts](file://src/app/api/auth/login/route.ts#L1-L178)
- [auth.ts](file://convex/auth.ts#L1-L82)

## Troubleshooting Guidance

When verification fails, follow these troubleshooting steps:

1. **Check Console Errors**: Examine browser developer tools for JavaScript errors, network request failures, or console warnings that may indicate configuration issues.

2. **Verify Network Requests**: Use the browser's Network tab to inspect the health check request and response. Look for:
   - HTTP status codes (200 for success, 503 for service unavailable)
   - Response payload content and structure
   - Request timing and potential timeouts

3. **Environment Configuration**: Ensure required environment variables are properly set, particularly `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_BACKEND_PROVIDER`. Missing or incorrect values will cause health check failures.

4. **Common Issues and Solutions**:
   - **Convex connection failed**: Verify the `NEXT_PUBLIC_CONVEX_URL` environment variable is correctly configured with a valid Convex deployment URL.
   - **Service unavailable (503)**: Indicates critical backend connectivity issues. Check Convex service status and network connectivity.
   - **Slow response times**: Response times over 3000ms suggest network latency or backend performance issues that require investigation.
   - **Invalid credentials error**: Verify test credentials are correct and the user account is active.

5. **Pre-deployment Validation**: Run the `validate-deploy.sh` script before deployment to catch configuration issues early. This script performs comprehensive checks including Node.js version, dependencies, TypeScript types, ESLint rules, tests, environment variables, build process, and security audit.

**Section sources**

- [health/route.ts](file://src/app/api/health/route.ts#L87-L109)
- [login/route.ts](file://src/app/api/auth/login/route.ts#L36-L43)
- [validate-deploy.sh](file://scripts/validate-deploy.sh#L1-L155)

## Monitoring Integration

The health check endpoint integrates seamlessly with monitoring systems and automated deployment pipelines. Its structured JSON response enables parsing of specific health metrics for alerting and reporting purposes. Monitoring systems can track key indicators such as response time, overall health score, and error counts over time to identify trends and potential issues.

In automated deployment pipelines, the health check serves as a validation gate to confirm successful deployments. After deployment, CI/CD systems can automatically call the health check endpoint and parse the response to verify that:

1. The application is responsive (HTTP 200 status)
2. Required services are properly configured
3. Backend connectivity is established
4. No critical errors are present

The endpoint's caching mechanism ensures that monitoring systems can poll frequently without overloading the backend, while still providing timely information about system health. The differentiation between HTTP 200 (healthy) and 503 (unavailable) status codes allows automated systems to make reliable decisions about deployment success and rollback requirements.

**Section sources**

- [health/route.ts](file://src/app/api/health/route.ts#L143-L150)
- [validate-deploy.sh](file://scripts/validate-deploy.sh#L106-L110)
