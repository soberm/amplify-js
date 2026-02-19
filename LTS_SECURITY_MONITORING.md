# LTS Security Monitoring System

This document provides an overview of the automated security monitoring system for amplify-js LTS branches.

## Problem Statement

GitHub's Dependabot only monitors the default branch for security vulnerabilities. However, amplify-js maintains multiple Long-Term Support (LTS) versions on separate branches (`v5-stable`, `v4-stable`) that also require security monitoring to ensure users on older versions are aware of vulnerabilities.

## Solution Overview

An automated system that:
1. Runs daily security audits on all LTS branches
2. Converts audit results to SARIF format
3. Uploads findings to GitHub Code Scanning
4. Makes vulnerabilities visible in the Security tab

## Components

### 1. GitHub Actions Workflow
**Location:** `.github/workflows/lts-security-audit.yml`

- Runs daily at 2 AM UTC
- Audits multiple LTS branches in parallel
- Can be manually triggered for specific branches
- Uploads SARIF reports to GitHub Code Scanning

### 2. Audit Converter
**Location:** `scripts/security-audit/audit-to-sarif.ts`

TypeScript tool that converts Yarn v1 audit JSON output to SARIF format compatible with GitHub Code Scanning.

### 3. Issue Creator (Optional)
**Location:** `scripts/security-audit/create-security-issues.sh`

Bash script to automatically create GitHub issues for HIGH/CRITICAL vulnerabilities.

### 4. Test Suite
**Location:** `scripts/security-audit/test-audit-converter.sh`

Validates the audit-to-sarif converter with sample data.

## Usage

### View Security Alerts

1. Navigate to the repository's **Security** tab
2. Click **Code scanning alerts**
3. Filter by category:
   - `security-audit-v5-stable`
   - `security-audit-v4-stable`

### Manual Workflow Trigger

1. Go to **Actions** tab
2. Select "LTS Security Audit" workflow
3. Click "Run workflow"
4. Select branch to audit
5. Click "Run workflow"

### Local Testing

```bash
# Install dependencies
cd scripts/security-audit
yarn install

# Run tests
yarn test

# Run audit on current branch
yarn audit --json > audit-output.json 2>&1
yarn ts-node audit-to-sarif.ts audit-output.json audit-results.sarif
```

## Adding New LTS Branches

To monitor additional LTS branches, edit `.github/workflows/lts-security-audit.yml`:

```yaml
matrix:
  branch:
    - v5-stable
    - v4-stable
    - v6-stable  # Add new branch here
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
│                  (Daily at 2 AM UTC)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Checkout LTS Branch          │
         │  (v5-stable, v4-stable, etc.) │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Run yarn audit --json        │
         │  (Yarn v1 format)             │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Convert to SARIF             │
         │  (audit-to-sarif.ts)          │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Upload to GitHub             │
         │  Code Scanning                │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  Visible in Security Tab      │
         │  (Code scanning alerts)       │
         └───────────────────────────────┘
```

## Severity Mapping

| Yarn Audit | SARIF Level | Security Score | GitHub Display |
|------------|-------------|----------------|----------------|
| critical   | error       | 9.0            | Critical       |
| high       | error       | 7.0            | High           |
| moderate   | warning     | 5.0            | Medium         |
| low        | note        | 3.0            | Low            |
| info       | note        | 1.0            | Note           |

## Maintenance

### Updating Dependencies

```bash
cd scripts/security-audit
yarn upgrade
```

### Testing Changes

```bash
cd scripts/security-audit
yarn test
```

### Debugging Workflow

Check workflow runs in the Actions tab. Artifacts are retained for 30 days and include:
- `audit-output.json` - Raw Yarn audit output
- `audit-results.sarif` - Converted SARIF report
- `audit-summary.txt` - Human-readable summary

## Documentation

For detailed documentation, see:
- [scripts/security-audit/SECURITY_MONITORING.md](scripts/security-audit/SECURITY_MONITORING.md) - Complete technical documentation
- [scripts/security-audit/README.md](scripts/security-audit/README.md) - Quick start guide

## Benefits

1. **Proactive Security**: Automatically detects vulnerabilities in LTS branches
2. **Centralized Visibility**: All security findings in one place (Security tab)
3. **Compliance**: Maintains security posture across all supported versions
4. **Automation**: No manual intervention required for daily scans
5. **Actionable**: Direct links to CVEs and remediation guidance

## Future Enhancements

Potential improvements:
- Automatic PR creation for safe dependency updates
- Slack/email notifications for HIGH/CRITICAL findings
- Integration with vulnerability databases beyond npm
- Automated backporting of security fixes
