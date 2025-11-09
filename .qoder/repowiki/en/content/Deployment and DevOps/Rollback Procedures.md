# Rollback Procedures

<cite>
**Referenced Files in This Document**   
- [rollback-vercel.sh](file://scripts/rollback-vercel.sh)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md)
- [DEPLOYMENT_SUMMARY.md](file://DEPLOYMENT_SUMMARY.md)
- [README.md](file://README.md)
</cite>

## Table of Contents

1. [Rollback Procedures](#rollback-procedures)
2. [Purpose and Usage of rollback-vercel.sh](#purpose-and-usage-of-rollback-vercelsh)
3. [Step-by-Step Rollback Process](#step-by-step-rollback-process)
4. [Safety Checks and Confirmation Prompts](#safety-checks-and-confirmation-prompts)
5. [Rollback Scenarios and Outputs](#rollback-scenarios-and-outputs)
6. [Manual Rollback via Vercel Dashboard](#manual-rollback-via-vercel-dashboard)
7. [Post-Rollback Verification](#post-rollback-verification)
8. [Maintaining Deployment Stability](#maintaining-deployment-stability)

## Purpose and Usage of rollback-vercel.sh

The `rollback-vercel.sh` script is designed to revert the PORTAL application to a previous stable deployment when issues arise in the production environment. This automated rollback mechanism ensures rapid recovery from deployment-related problems, minimizing downtime and service disruption. The script interacts with the Vercel CLI to promote a previously successful deployment to production, effectively undoing a problematic release. It is particularly useful when automated deployments through GitHub Actions result in unexpected behavior or errors in the live environment.

**Section sources**

- [rollback-vercel.sh](file://scripts/rollback-vercel.sh#L1-L75)
- [DEPLOYMENT_SUMMARY.md](file://DEPLOYMENT_SUMMARY.md#L22-L23)

## Step-by-Step Rollback Process

The rollback process begins with identifying a stable deployment URL from Vercel's deployment history. When the `rollback-vercel.sh` script executes, it first lists all recent deployments using the `vercel ls --prod` command, displaying both production and preview deployments. The user then selects a stable deployment URL from this list, typically one that was previously working correctly. After confirmation, the user inputs the chosen deployment URL when prompted by the script. The script validates that the URL is not empty and proceeds to execute the rollback command. This process ensures that only verified, stable deployments are promoted back to production, maintaining system reliability.

**Section sources**

- [rollback-vercel.sh](file://scripts/rollback-vercel.sh#L26-L50)

## Safety Checks and Confirmation Prompts

The `rollback-vercel.sh` script incorporates multiple safety checks to prevent accidental rollbacks. First, it verifies the presence of the Vercel CLI by checking if the `vercel` command is available in the system path. If the CLI is not installed, the script terminates with an error message and instructions for installation. Before proceeding with the rollback, the script displays a prominent warning message in yellow text, alerting the user about the irreversible nature of the operation. The script then requires explicit user confirmation through a yes/no prompt, accepting only 'y' or 'Y' as valid affirmative responses. Additionally, the script validates that the deployment URL input is not empty, preventing execution with invalid parameters. These layered safety measures ensure that rollbacks are intentional and well-considered actions.

**Section sources**

- [rollback-vercel.sh](file://scripts/rollback-vercel.sh#L19-L50)

## Rollback Scenarios and Outputs

When a rollback is successful, the script displays a green success message indicating that the operation completed without errors. It then provides clear next steps for the user, including checking the production URL, performing a health check via the API endpoint, and planning the fix for the original issue before redeploying. In the case of a failed rollback, the script outputs a red error message and provides detailed instructions for manual intervention. The failure could occur due to network issues, authentication problems, or invalid deployment URLs. The script's output in failure scenarios guides the user through the manual rollback process via the Vercel Dashboard, ensuring that recovery options remain available even when the automated script fails.

**Section sources**

- [rollback-vercel.sh](file://scripts/rollback-vercel.sh#L56-L74)

## Manual Rollback via Vercel Dashboard

When the `rollback-vercel.sh` script fails or is unavailable, manual rollback through the Vercel Dashboard provides an alternative recovery method. To perform a manual rollback, navigate to the Vercel Dashboard and select the PORTAL project. In the Deployments tab, locate a stable, previously successful deployment from the list. Click on the deployment to view its details, ensuring it has passed all checks and was functioning correctly. Then, access the deployment's action menu (represented by ellipsis "...") and select "Promote to Production." This action immediately makes the selected deployment the active production version. Manual rollback through the dashboard offers a visual interface for verifying deployment health and provides additional information about each deployment's build status and performance metrics.

**Section sources**

- [rollback-vercel.sh](file://scripts/rollback-vercel.sh#L68-L72)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L148-L155)

## Post-Rollback Verification

After executing a rollback, whether automated or manual, thorough verification is essential to confirm system stability. The first step is accessing the production URL in a web browser to ensure the application loads correctly without errors. Next, perform a health check by calling the `/api/health` endpoint, which should return a JSON response with a "healthy" status. Test critical functionality such as user login, data retrieval, and key application features to verify that the system operates as expected. Monitor application logs and error tracking systems like Sentry for any anomalies. Additionally, check external integrations such as Convex database connectivity and third-party services to ensure all components function properly. This comprehensive verification process confirms that the rollback successfully restored system stability.

**Section sources**

- [rollback-vercel.sh](file://scripts/rollback-vercel.sh#L60-L63)
- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L118-L140)

## Maintaining Deployment Stability

Maintaining deployment stability during rollback operations requires careful coordination and monitoring. Before initiating a rollback, ensure that all team members are informed about the operation to prevent conflicting deployments. The rollback process should be performed during periods of lower user activity when possible, minimizing impact on end users. After a successful rollback, immediately begin investigating the root cause of the original deployment issue to prevent recurrence. Document the incident, including the problematic deployment, the rollback process, and the resolution steps. Consider implementing additional pre-deployment checks or canary deployments in the future to catch issues before they reach production. Regularly review and test the rollback procedure to ensure it remains effective as the application evolves.

**Section sources**

- [DEPLOYMENT_QUICKSTART.md](file://DEPLOYMENT_QUICKSTART.md#L148-L200)
- [README.md](file://README.md#L168-L211)
