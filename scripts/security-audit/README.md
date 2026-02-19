# Amplify JS Security Audit Tools

Security audit tools for monitoring vulnerabilities in amplify-js LTS branches.

## Quick Start

The LTS Security Monitoring system automatically scans LTS branches for vulnerabilities:

1. **Automated Daily Scans**: Runs at 2 AM UTC via GitHub Actions
2. **SARIF Reports**: Uploads results to GitHub Code Scanning
3. **View Results**: Check the Security tab → Code scanning alerts

## Manual Testing

Test the audit converter locally:

```bash
# Install dependencies
cd scripts/security-audit
yarn install

# Run test suite
yarn test
```

## Run Audit on Current Branch

```bash
# Run audit and convert to SARIF
yarn audit --json > audit-output.json 2>&1
yarn --cwd scripts/security-audit ts-node scripts/security-audit/audit-to-sarif.ts audit-output.json audit-results.sarif

# View SARIF output
cat audit-results.sarif | jq '.runs[0].results[] | {severity: .level, message: .message.text}'
```

## Create Security Issues

For HIGH/CRITICAL vulnerabilities, you can create GitHub issues:

```bash
# Set GitHub token
export GITHUB_TOKEN=your_token

# Create issues for current branch
./scripts/security-audit/create-security-issues.sh v5-stable
```

## Files

- `audit-to-sarif.ts` - Converts Yarn v1 audit JSON to SARIF format
- `test-audit-converter.sh` - Test suite for the converter
- `create-security-issues.sh` - Creates GitHub issues for critical vulnerabilities
- `SECURITY_MONITORING.md` - Comprehensive documentation
- `package.json` - Dependencies for TypeScript scripts
- `tsconfig.json` - TypeScript configuration

## Documentation

See [SECURITY_MONITORING.md](./SECURITY_MONITORING.md) for complete documentation.
