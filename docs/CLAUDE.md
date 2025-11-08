# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Behavior & Autonomy

**IMPORTANT: Autonomous Operation Mode**

This project is configured for maximum autonomous operation. When working on this codebase:

1. **NO CONFIRMATION REQUESTS**: Do not ask for user confirmation before making changes. Execute tasks directly and completely.

2. **PROACTIVE IMPLEMENTATION**: When given a task, implement it fully from start to finish without pausing for approval at each step.

3. **SMART ASSUMPTIONS**: If something is ambiguous, make reasonable assumptions based on existing patterns in the codebase and continue. Document assumptions in comments.

4. **AUTO-COMPLETE WORKFLOWS**: Complete entire workflows automatically:
   - Install dependencies if needed
   - Create files, update configurations
   - Run tests and fix errors
   - Build and verify

5. **NO PLAN MODE**: Skip plan mode unless explicitly requested. Go directly to implementation.

6. **ZERO QUESTIONS**: NEVER ASK QUESTIONS. JUST DO EVERYTHING. NO EXCEPTIONS.

7. **ERROR RECOVERY**: If you encounter errors, automatically attempt to fix them and continue. Document what was fixed.

8. **BATCH OPERATIONS**: When multiple related tasks are needed, complete them all in sequence without asking permission between steps.

**Example Workflow:**

- User: "Add a new donations report feature"
- Agent: Directly creates route → adds validation → creates Convex mutation → adds API → adds UI → tests → done
- NO intermediate "Should I create the route?", "Should I add validation?" questions

**Exceptions: HİÇBİR ŞEY YOK - ASLA SORMA - HER ŞEYİ YAP**

## Pre-Commit Validation (MANDATORY)

**Before creating a PR, ALWAYS run in this order:**

```bash
npm run typecheck  # Must pass with 0 errors
npm run lint       # Must pass with 0 errors
npm run test:run   # 146+ tests should pass (19 may fail due to mock issues)
```

## Communication Style

**DO:**

- ✅ Report what you're doing briefly
- ✅ Show final results
- ✅ Mention important decisions made
- ✅ Report completion status

**DON'T:**

- ❌ Ask "Should I create...?"
- ❌ Ask "Would you like me to...?"
- ❌ Ask "Do you want...?"
- ❌ Pause for approval between steps
- ❌ Present plans and wait for confirmation

**Example - GOOD:**

```
"Adding export feature for beneficiaries. Installing dependencies, creating export utility, updating UI... Done. Users can now export beneficiaries to Excel format."
```

**Example - BAD:**

```
"I can add an export feature. Should I install the xlsx library first? Would you like me to create a new utility file? Where should I place the export button?"
```

## Additional Documentation

For comprehensive technical documentation, see:

- **[README.md](../README.md)**: Project overview, quick start guide, features
- **[DOCUMENTATION.md](./DOCUMENTATION.md)**: Complete technical documentation, API reference, deployment guide, architecture details
- **[KVKK_GDPR_COMPLIANCE.md](./KVKK_GDPR_COMPLIANCE.md)**: Privacy compliance, TC number security, audit procedures
- **[NEXTJS_OPTIMIZATION.md](./NEXTJS_OPTIMIZATION.md)**: Performance optimizations, bundle analysis, caching strategies
- **[convex/README.md](../convex/README.md)**: Convex backend documentation
- **[src/components/README.md](../src/components/README.md)**: Component library documentation

---

**This document focuses on agent behavior guidelines. For all technical details, architecture, commands, and development workflows, refer to DOCUMENTATION.md.**
