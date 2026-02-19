#!/usr/bin/env node

/**
 * Parses yarn audit output and creates per-package PRs for patchable vulnerabilities.
 * Replaces create-patch-prs.sh with a portable TypeScript implementation.
 *
 * Required env: GH_TOKEN, BASE_BRANCH
 * Optional env: GITHUB_USER, GITHUB_EMAIL
 */

import * as fs from 'fs';
import { execSync } from 'child_process';

interface YarnV1AuditAdvisory {
  id: number;
  title: string;
  module_name: string;
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  url: string;
  overview: string;
  recommendation: string;
  vulnerable_versions: string;
  patched_versions: string;
  findings: Array<{ version: string; paths: string[] }>;
}

interface YarnV1AuditLine {
  type: string;
  data: {
    advisory?: YarnV1AuditAdvisory;
  };
}

interface PackageInfo {
  patchedVersion: string;
  vulns: string[];
}

function run(cmd: string, opts?: { cwd?: string; ignoreError?: boolean }): string {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: opts?.cwd,
    }).trim();
  } catch (err: any) {
    if (opts?.ignoreError) return err.stdout?.trim() ?? '';
    throw err;
  }
}

/**
 * Parse NDJSON audit output, extract patchable advisories, group by package.
 */
function parsePatchableVulnerabilities(auditFile: string): Map<string, PackageInfo> {
  const raw = fs.readFileSync(auditFile, 'utf-8');
  const packages = new Map<string, PackageInfo>();

  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;

    let parsed: YarnV1AuditLine;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue; // skip non-JSON lines (yarn v1 can mix stderr)
    }

    if (parsed.type !== 'auditAdvisory' || !parsed.data.advisory) continue;

    const adv = parsed.data.advisory;
    if (
      adv.patched_versions === '<0.0.0' ||
      adv.patched_versions === 'No patch available'
    ) {
      continue;
    }

    const pkg = adv.module_name;
    const existing = packages.get(pkg);

    const vulnLine = `- **${adv.severity}**: ${adv.title}`;

    if (!existing) {
      packages.set(pkg, {
        patchedVersion: adv.patched_versions,
        vulns: [vulnLine],
      });
    } else {
      // Keep highest patched version (simple string compare works for semver ranges)
      if (adv.patched_versions > existing.patchedVersion) {
        existing.patchedVersion = adv.patched_versions;
      }
      // Dedupe identical vuln lines but keep different ones
      if (!existing.vulns.includes(vulnLine)) {
        existing.vulns.push(vulnLine);
      }
    }
  }

  return packages;
}

/**
 * Extract a concrete version number from a patched_versions range like ">=7.5.8"
 */
function extractVersion(patchedVersions: string): string | null {
  const match = patchedVersions.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

function safeBranchName(pkg: string): string {
  return pkg.replace(/[\/@]/g, '-').replace(/^-/, '');
}

function buildPrBody(pkg: string, patchedVersion: string, vulns: string[], baseBranch: string): string {
  return `#### Description of changes

Automated security patch for \`${pkg}\` to address known vulnerabilities.

**Patched version:** \`${patchedVersion}\`

**Vulnerabilities fixed:**
${vulns.join('\n')}

#### Issue #, if available

Security audit findings in ${baseBranch}

#### Description of how you validated changes

- Semver-compatible upgrade attempted first via \`yarn upgrade\`
- Falls back to \`resolutions\` for transitive dependencies
- Only the targeted package is changed per PR

#### Checklist

- [x] PR description included
- [ ] \`yarn test\` passes
- [ ] Unit Tests are [changed or added](https://github.com/aws-amplify/amplify-js/blob/main/CONTRIBUTING.md#steps-towards-contributions)
- [ ] Relevant documentation is changed or added (and PR referenced)

By submitting this pull request, I confirm that my contribution is made under the terms of the Apache 2.0 license.
`;
}

function main() {
  const baseBranch = process.env.BASE_BRANCH || 'main';
  const gitUser = process.env.GITHUB_USER || 'github-actions[bot]';
  const gitEmail = process.env.GITHUB_EMAIL || 'github-actions[bot]@users.noreply.github.com';

  console.log('=== Security Patch PR Creator ===');
  console.log(`Base branch: ${baseBranch}`);
  console.log('');
  console.log('Analyzing vulnerabilities with available patches...');

  const auditFile = 'audit-output.json';
  if (!fs.existsSync(auditFile)) {
    console.log('audit-output.json not found.');
    process.exit(0);
  }

  const packages = parsePatchableVulnerabilities(auditFile);

  if (packages.size === 0) {
    console.log('No patchable vulnerabilities found.');
    process.exit(0);
  }

  console.log(`Found ${packages.size} packages with available patches:`);
  for (const [pkg, info] of packages) {
    console.log(`  - ${pkg} (needs ${info.patchedVersion})`);
  }

  // Configure git
  run(`git config user.name "${gitUser}"`);
  run(`git config user.email "${gitEmail}"`);

  let createdPrs = 0;

  for (const [pkg, info] of packages) {
    const safeName = safeBranchName(pkg);
    const branchName = `security-patch/${safeName}`;

    console.log('');
    console.log(`--- Processing ${pkg} ---`);

    // Check for existing open PR
    const existingPr = run(
      `gh pr list --search "chore(deps): patch ${pkg} security" --state open --json number --jq ".[0].number"`,
      { ignoreError: true }
    );
    if (existingPr) {
      console.log(`  Open PR #${existingPr} already exists for ${pkg}, skipping.`);
      continue;
    }

    // Check if remote branch already exists
    const remoteBranch = run(
      `git ls-remote --heads origin ${branchName}`,
      { ignoreError: true }
    );
    if (remoteBranch.includes(branchName)) {
      console.log(`  Branch ${branchName} already exists remotely, skipping.`);
      continue;
    }

    // Reset working tree to base branch state
    run(`git checkout ${baseBranch} -- yarn.lock package.json`, { ignoreError: true });
    run('git checkout -- .', { ignoreError: true });

    // Try 1: yarn upgrade
    console.log(`  Attempting yarn upgrade ${pkg}...`);
    run(`yarn upgrade ${pkg}`, { ignoreError: true });

    // Check if yarn.lock changed
    const yarnLockChanged = run('git diff --name-only yarn.lock', { ignoreError: true });

    if (!yarnLockChanged) {
      // Try 2: Add resolution in package.json
      console.log('  Direct upgrade had no effect, adding resolution...');
      const resolvedVersion = extractVersion(info.patchedVersion);
      if (!resolvedVersion) {
        console.log(`  Could not parse version from ${info.patchedVersion}, skipping.`);
        continue;
      }

      const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      pkgJson.resolutions = pkgJson.resolutions || {};
      pkgJson.resolutions[pkg] = resolvedVersion;
      fs.writeFileSync('package.json', JSON.stringify(pkgJson, null, 2) + '\n');

      run('yarn install', { ignoreError: true });
    }

    // Check if anything changed
    const changes = run('git diff --name-only yarn.lock package.json', { ignoreError: true });
    if (!changes) {
      console.log(`  No changes for ${pkg}, skipping.`);
      continue;
    }

    // Create branch, commit, push
    run(`git checkout -b ${branchName}`);
    run('git add yarn.lock package.json');
    run(`git commit -m "chore(deps): patch ${pkg} to fix security vulnerabilities"`);
    run(`git push origin ${branchName}`);

    // Create PR
    const prBody = buildPrBody(pkg, info.patchedVersion, info.vulns, baseBranch);
    const prBodyFile = 'pr-body.md';
    fs.writeFileSync(prBodyFile, prBody);

    const prResult = run(
      `gh pr create --title "chore(deps): patch ${pkg} security vulnerabilities" --body-file ${prBodyFile} --label "dependencies,security" --base ${baseBranch}`,
      { ignoreError: true }
    );
    if (prResult) {
      console.log(`  ✅ PR created: ${prResult}`);
      createdPrs++;
    } else {
      console.log(`  Failed to create PR for ${pkg}`);
    }

    // Return to base branch for next package
    run(`git checkout ${baseBranch}`);
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Packages analyzed: ${packages.size}`);
  console.log(`PRs created: ${createdPrs}`);
}

main();
