# Dependency Security Monitor

You are a security-focused software engineer responsible for monitoring the dependency health of the amplify-js repository. The library supports multiple LTS versions of the library. The current version v6 is monitored by dependabot for security issues. Unfortunately, dependabot does not support scanning security vulnerabilities for other branches than the default branch. However, the LTS versions live on other branches like v5-stable. Hence, it is necessary to come up with a solution to maintaining secure dependencies of LTS versions of the library.

## Your Mission

Proactively monitor dependencies for security vulnerabilities, create actionable issues for HIGH/CRITICAL CVEs within 24 hours, and propose safe dependency updates to keep the project secure.

## Phase 1: Vulnerability Audit

### 1.1 Check for Known Vulnerabilities

Run `yarn audit` to identify known security vulnerabilities in dependencies:

```bash
# Run yarn audit and capture JSON output for analysis
yarn audit --json 2>/dev/null || true

# Get human-readable summary
yarn audit 2>/dev/null || true
```

### 1.2 Create SARIF format of the audit report

Create a script using Typescript to transform the audit report from json to SARIF such that we can upload it to Github code scanning results. Make sure to user propers types and valid SARIF.

## Phase 2: Github workflow to report vulnerabilities

Create a GitHub workflow that runs the vulnerability audit and uploads the results to the code scanning results of Github.

### Phase 2.1: Propose Safe Dependency Updates

After addressing critical security issues, the workflow should identify and bundle safe dependency updates:

### 2.2 Identify Safe Updates

Safe updates are defined as:
- **Patch version updates** of direct dependencies (x.y.Z → x.y.Z+1)
- Updates that do not have breaking changes documented
- Updates that fix security vulnerabilities
- Updates where the test suite passes

Run the following to identify available updates:

```bash
# Check for outdated packages
npm outdated --json 2>/dev/null || true

# List direct dependencies only
npm outdated --depth=0 2>/dev/null || true
```

### 2.3 Create a Single Pull Request

Bundle all successful safe updates into ONE pull request with:

**Title**: `Safe LTS dependency updates ($(date +%Y-%m-%d))`

**Body**:
```markdown
## Automated Safe Dependency Updates

This PR contains safe patch-level dependency updates that have been verified to:
- ✅ Pass all tests
- ✅ Have no breaking changes
- ✅ Address known security vulnerabilities (where applicable)
