# LTS Security Monitoring

This directory contains tools for monitoring security vulnerabilities in LTS (Long-Term Support) branches of amplify-js.

## Problem

GitHub's Dependabot only scans the default branch for security vulnerabilities. However, amplify-js maintains multiple LTS versions on separate branches (e.g., `v5-stable`, `v4-stable`) that also need security monitoring.

## Solution

An automated GitHub Actions workflow that:
1. Runs `yarn audit` on each LTS branch daily
2. Converts audit results to SARIF format
3. Uploads results to GitHub Code Scanning
4. Makes vulnerabilities visible in the Security tab

## Components

### 1. `audit-to-sarif.ts`

TypeScript script that converts Yarn v1 audit JSON output to SARIF (Static Analysis Results Interchange Format) for GitHub Code Scanning.

**Usage:**
```bash
# From stdin
yarn audit --json 2>/dev/null | yarn --cwd scripts/security-audit ts-node audit-to-sarif.ts - output.sarif

# From file
yarn audit --json > audit.json 2>&1
yarn --cwd scripts/security-audit ts-node audit-to-sarif.ts audit.json output.sarif
```

**Features:**
- Parses Yarn v1 newline-delimited JSON format
- Maps severity levels (critical/high/moderate/low) to SARIF levels
- Creates proper SARIF rules and results
- Includes vulnerability metadata (CVE links, recommendations, versions)

### 2. `.github/workflows/lts-security-audit.yml`

GitHub Actions workflow that runs security audits on LTS branches.

**Schedule:**
- Runs daily at 2 AM UTC
- Can be manually triggered via workflow_dispatch

**Matrix Strategy:**
- Audits multiple branches in parallel
- Currently configured for: `v5-stable`, `v4-stable`

**Outputs:**
- SARIF reports uploaded to GitHub Code Scanning
- Audit artifacts retained for 30 days
- Results visible in Security > Code scanning alerts

## Viewing Results

1. Navigate to the repository's **Security** tab
2. Click **Code scanning alerts**
3. Filter by category: `security-audit-v5-stable` or `security-audit-v4-stable`
4. View detailed vulnerability information including:
   - Severity level
   - Affected package and version
   - CVE details and links
   - Remediation recommendations

## Manual Execution

### Run audit locally:
```bash
# Checkout LTS branch
git checkout v5-stable

# Run audit
yarn audit --json > audit-output.json 2>&1

# Convert to SARIF
cd scripts/security-audit
yarn install
yarn ts-node audit-to-sarif.ts ../../audit-output.json ../../audit-results.sarif
```

### Trigger workflow manually:
1. Go to Actions tab
2. Select "LTS Security Audit" workflow
3. Click "Run workflow"
4. Select branch to audit
5. Click "Run workflow"

## Adding New LTS Branches

To monitor additional LTS branches, edit `.github/workflows/lts-security-audit.yml`:

```yaml
matrix:
  branch:
    - v5-stable
    - v4-stable
    - v6-stable  # Add new branch here
```

## Severity Mapping

| Yarn Audit | SARIF Level | Security Score |
|------------|-------------|----------------|
| critical   | error       | 9.0            |
| high       | error       | 7.0            |
| moderate   | warning     | 5.0            |
| low        | note        | 3.0            |
| info       | note        | 1.0            |

## Troubleshooting

### No vulnerabilities showing in Security tab
- Check workflow run logs for errors
- Verify SARIF file was generated and uploaded
- Ensure `security-events: write` permission is set

### Audit fails with dependency errors
- The workflow uses `continue-on-error: true` to handle installation issues
- Check if the branch's dependencies are still installable
- Review artifact uploads for raw audit output

### TypeScript compilation errors
- Ensure Node.js 18+ is used
- Check that `@types/node` and `typescript` are installed
- Verify `audit-to-sarif.ts` syntax is valid

## References

- [SARIF Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
- [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [Yarn Audit Documentation](https://classic.yarnpkg.com/en/docs/cli/audit)
