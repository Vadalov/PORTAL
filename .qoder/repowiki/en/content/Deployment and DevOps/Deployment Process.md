# Deployment Process

<cite>
**Referenced Files in This Document**   
- [scripts/deploy-vercel.sh](file://scripts/deploy-vercel.sh)
- [vercel.json](file://vercel.json)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md)
- [GITHUB_SECRETS_SETUP.md](file://GITHUB_SECRETS_SETUP.md)
- [package.json](file://package.json)
- [README.md](file://README.md)
</cite>

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Automated Deployment Process](#automated-deployment-process)
3. [Manual Deployment Process](#manual-deployment-process)
4. [Deployment Script Workflow](#deployment-script-workflow)
5. [Vercel Configuration Relationship](#vercel-configuration-relationship)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Common Deployment Pitfalls](#common-deployment-pitfalls)

## Prerequisites

Before deploying PORTAL to Vercel with Convex backend integration, ensure the following prerequisites are met:

1. **Convex CLI Installation**: The Convex Command Line Interface must be installed globally to manage Convex backend operations. Install it using:

   ```bash
   npm install -g convex
   ```

2. **Vercel CLI Installation**: The Vercel Command Line Interface is required for deployment operations. Install it using:

   ```bash
   npm install -g vercel
   ```

3. **GitHub Repository Access**: The repository must be accessible from your Vercel account. Ensure you have the necessary permissions to import the repository at `Vadalov/PORTAL`.

4. **GitHub Secrets Configuration**: For CI/CD automation, configure the following GitHub secrets in your repository settings:
   - `VERCEL_TOKEN`: Vercel deployment token with appropriate permissions
   - `VERCEL_PROJECT_ID`: Unique identifier for your Vercel project
   - `VERCEL_ORG_ID`: Your Vercel organization or personal account ID

These prerequisites ensure a smooth deployment process and enable both automated and manual deployment methods.

**Section sources**

- [README.md](file://README.md#L20-L35)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L1-L80)
- [GITHUB_SECRETS_SETUP.md](file://GITHUB_SECRETS_SETUP.md#L1-L66)

## Automated Deployment Process

The automated deployment process for PORTAL utilizes the `deploy-vercel.sh` script, which streamlines the entire deployment workflow into a single command execution. This process is initiated by running:

```bash
npm run deploy:vercel
```

This command executes the deployment script located in `scripts/deploy-vercel.sh`, which automates the following sequence of operations:

1. **Prerequisite Checks**: The script first verifies the presence of required CLI tools (Convex and Vercel). If not found, it automatically installs them using npm.

2. **Convex Authentication**: The script prompts for Convex account authentication through a browser-based login process using `npx convex login`.

3. **Convex Production Deployment**: The script deploys the Convex backend to production using `npx convex deploy --prod`, capturing the generated production URL.

4. **Security Secret Generation**: Random cryptographic secrets are generated for CSRF protection and session management using Node.js crypto module.

5. **Environment Variable Preparation**: The script compiles all necessary environment variables and displays them for manual configuration or automatic deployment.

The automated process significantly reduces deployment complexity and minimizes human error by handling the entire sequence programmatically.

**Section sources**

- [scripts/deploy-vercel.sh](file://scripts/deploy-vercel.sh#L1-L133)
- [package.json](file://package.json#L29)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L1-L80)

## Manual Deployment Process

For users who prefer manual control over the deployment process, PORTAL provides a step-by-step manual deployment method. This approach offers greater visibility into each deployment stage and is useful for troubleshooting or custom configurations.

### Step 1: Convex Backend Deployment

Deploy the Convex backend to production by executing:

```bash
npx convex deploy --prod
```

This command deploys the Convex functions and database schema to the production environment. After successful deployment, note the production URL returned by the command, which typically follows the format `https://[project-name].convex.cloud`.

### Step 2: Security Secret Generation

Generate cryptographic secrets for application security using Node.js:

```bash
# Generate CSRF Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ensure both secrets are 32+ characters long and store them securely. These secrets must be different from each other to maintain security integrity.

### Step 3: Vercel Frontend Deployment

Deploy the frontend application to Vercel by first installing the Vercel CLI (if not already installed):

```bash
npm install -g vercel
```

Then initiate the production deployment:

```bash
vercel --prod
```

During or after deployment, configure the environment variables in the Vercel Dashboard under Settings → Environment Variables.

**Section sources**

- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L41-L80)
- [README.md](file://README.md#L184-L196)

## Deployment Script Workflow

The `deploy-vercel.sh` script follows a structured six-step workflow to ensure a reliable and consistent deployment process. Each step is designed to handle specific aspects of the deployment with appropriate error handling and user feedback.

### Step 1: Convex CLI Verification

The script first checks for the presence of the Convex CLI. If not found, it automatically installs it globally using `npm install -g convex`. This ensures that all subsequent Convex operations can be performed.

### Step 2: Convex Authentication

The script initiates the authentication process with `npx convex login`, which opens a browser window for user authentication. This step establishes the necessary credentials for deploying to the Convex backend.

### Step 3: Convex Production Deployment

The script executes `npx convex deploy --prod` to deploy the backend to production. It captures the output and extracts the production URL using regex pattern matching. If the deployment fails or no URL is returned, the script terminates with an error message.

### Step 4: Vercel CLI Verification

Similar to the Convex CLI check, the script verifies the presence of the Vercel CLI and installs it if necessary using `npm install -g vercel`.

### Step 5: Security Secret Generation

The script generates two cryptographic secrets:

- **CSRF_SECRET**: Used for Cross-Site Request Forgery protection
- **SESSION_SECRET**: Used for session management and authentication

These secrets are generated using Node.js crypto module with 32 bytes of random data converted to hexadecimal format.

### Step 6: Environment Variable Configuration

The script compiles all required environment variables and presents them to the user. It also saves these variables to a `.env.vercel` file for reference. The user is then prompted to choose between manual or automatic Vercel deployment.

The script's output includes color-coded status messages (green for success, blue for information, yellow for warnings, and red for errors) to provide clear visual feedback throughout the process.

**Section sources**

- [scripts/deploy-vercel.sh](file://scripts/deploy-vercel.sh#L1-L133)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L1-L80)

## Vercel Configuration Relationship

The `vercel.json` configuration file plays a crucial role in defining the deployment behavior and environment variable management for PORTAL. This configuration file establishes the relationship between the deployment script and Vercel's deployment infrastructure.

### Build and Development Configuration

The configuration specifies essential build parameters:

- **buildCommand**: `npm run build` - Defines the command to build the application
- **devCommand**: `npm run dev` - Specifies the development server command
- **installCommand**: `npm install` - Determines the package installation process
- **framework**: `nextjs` - Identifies the framework for optimized deployment
- **regions**: `["fra1"]` - Specifies the deployment region (Frankfurt)

### Environment Variable Management

The configuration file defines environment variables in two contexts:

1. **Runtime Environment Variables** (under `env`):
   - `NEXT_PUBLIC_CONVEX_URL`: References the Convex production URL
   - `BACKEND_PROVIDER`: Specifies the backend provider as "convex"
   - `NEXT_PUBLIC_BACKEND_PROVIDER`: Public-facing backend identifier
   - `CSRF_SECRET`: CSRF protection secret
   - `SESSION_SECRET`: Session management secret

2. **Build-time Environment Variables** (under `build.env`):
   - Includes `NEXT_PUBLIC_CONVEX_URL`, `BACKEND_PROVIDER`, and `NEXT_PUBLIC_BACKEND_PROVIDER`
   - These variables are available during the build process

The configuration uses variable references (prefixed with `@`) which are resolved during deployment, ensuring that sensitive information is not hardcoded in the configuration file.

**Section sources**

- [vercel.json](file://vercel.json#L1-L22)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L82-L93)

## Post-Deployment Verification

After completing the deployment process, it is essential to verify that the application is functioning correctly. The following verification steps should be performed to ensure a successful deployment.

### Health Check

Perform a health check by accessing the health endpoint:

```bash
curl https://your-project.vercel.app/api/health?detailed=true
```

A successful deployment will return a JSON response indicating the application's health status:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T12:00:00Z",
  "version": "1.0.0"
}
```

This endpoint verifies that the application server is running and responsive.

### Login Functionality Test

Test the application's authentication system by:

1. Navigating to the login page at `https://your-project.vercel.app/login`
2. Attempting to log in with valid credentials
3. Verifying that no errors appear in the browser console
4. Confirming successful authentication and redirection to the dashboard

### Convex Backend Connectivity

Verify the connection between the frontend and Convex backend by testing the Convex system endpoint:

```bash
curl https://your-project.convex.cloud/_system/ping
```

A successful response indicates that the Convex backend is operational and accessible.

### Dashboard Monitoring

Monitor the deployment status through the Vercel dashboard:

1. Navigate to the Deployments section
2. Verify that the latest deployment shows a "Production" status
3. Check the deployment logs for any warnings or errors
4. Confirm that the deployment URL is active and accessible

These verification steps ensure that both the frontend and backend components are properly deployed and communicating correctly.

**Section sources**

- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L118-L147)
- [scripts/deploy-vercel.sh](file://scripts/deploy-vercel.sh#L128-L130)

## Common Deployment Pitfalls

Several common issues may arise during the deployment process. Understanding these pitfalls and their solutions can help ensure a smooth deployment experience.

### Build Errors: "Failed to fetch fonts"

This error occurs when Next.js font optimization encounters issues during the build process. To resolve this issue, disable font optimization in the Next.js configuration:

```typescript
const nextConfig = {
  optimizeFonts: false,
  // ...
};
```

Disabling font optimization prevents the build process from attempting to download and optimize fonts, which can fail in certain deployment environments.

### Convex Connection Errors

Common causes and solutions for Convex connection issues include:

- **Incorrect NEXT_PUBLIC_CONVEX_URL**: Verify that the Convex production URL is correctly set in the environment variables
- **Missing Convex Deployment**: Ensure that `npx convex deploy --prod` has been successfully executed
- **Schema Issues**: Verify that the Convex schema is properly defined and deployed in the Convex dashboard

### CSRF Token Errors

CSRF token issues typically stem from missing or incorrect secret configuration:

- Ensure both `CSRF_SECRET` and `SESSION_SECRET` are properly set in the environment variables
- Verify that the secrets are 32+ characters long and randomly generated
- Confirm that the secrets are correctly configured in the Vercel dashboard

### GitHub Actions Permissions

When using CI/CD automation, ensure proper GitHub Actions permissions:

- Navigate to Repository Settings → Actions → General
- Set "Workflow permissions" to "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

### Invalid Token or Project Not Found

For Vercel token or project ID issues:

- Verify the `VERCEL_TOKEN` in Vercel Dashboard → Settings → Tokens
- Check the `VERCEL_PROJECT_ID` in Vercel Dashboard → Settings → General
- Ensure the `VERCEL_ORG_ID` matches your Vercel team or personal account ID

Addressing these common pitfalls promptly can prevent deployment failures and ensure application stability.

**Section sources**

- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L174-L200)
- [GITHUB_SECRETS_SETUP.md](file://GITHUB_SECRETS_SETUP.md#L103-L123)
