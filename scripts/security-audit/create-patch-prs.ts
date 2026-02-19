#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Parses yarn audit output and creates per-package PRs for patchable vulnerabilities.
 *
 * Required env: GH_TOKEN (set by GitHub Actions)
 * Optional env: BASE_BRANCH, GITHUB_USER, GITHUB_EMAIL, GITHUB_WORKSPACE
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ── types ────────────────────────────────────────────────────────────────────

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
	findings: { version: string; paths: string[] }[];
}

interface YarnV1AuditLine {
	type: string;
	data: {
		advisory?: YarnV1AuditAdvisory;
	};
}

interface PackageInfo {
	patchedVersion: string;
	vulns: { severity: string; title: string; url: string }[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');

const repoRoot =
	process.env.GITHUB_WORKSPACE || path.resolve(__dirname, '..', '..');

function run(cmd: string, opts?: { ignoreError?: boolean }): string {
	console.log(`  $ ${cmd}`);
	if (DRY_RUN) {
		console.log('    [dry-run] skipped');

		return '';
	}
	try {
		return execSync(cmd, {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe'],
			cwd: repoRoot,
		}).trim();
	} catch (err: any) {
		if (opts?.ignoreError) {
			// gh cli writes URLs to stdout, status messages to stderr
			const out = (err.stdout?.trim() || err.stderr?.trim()) ?? '';

			return out;
		}
		throw err;
	}
}

/**
 * Extract a concrete version from a patched_versions range like ">=7.5.8"
 * Falls back to the raw range if no version can be extracted.
 */
function resolveVersion(patchedVersions: string): string {
	const match = patchedVersions.match(/(\d+\.\d+\.\d+)/);

	return match ? match[1] : patchedVersions;
}

/** Detect owner/repo from GITHUB_REPOSITORY or git remote */
function detectRepo(): string {
	if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
	try {
		const url = execSync('git remote get-url origin', {
			encoding: 'utf-8',
			cwd: repoRoot,
		}).trim();
		// ssh: git@github.com:owner/repo.git  or  https://github.com/owner/repo.git
		const match = url.match(/github\.com[:/](.+?)(?:\.git)?$/);

		return match ? match[1] : '';
	} catch {
		return '';
	}
}

// ── parse audit output ──────────────────────────────────────────────────────

function parsePatchableVulnerabilities(
	auditFile: string,
): Map<string, PackageInfo> {
	const raw = fs.readFileSync(auditFile, 'utf-8');
	const packages = new Map<string, PackageInfo>();

	for (const line of raw.split('\n')) {
		if (!line.trim()) continue;

		let parsed: YarnV1AuditLine;
		try {
			parsed = JSON.parse(line);
		} catch {
			continue;
		}

		if (parsed.type !== 'auditAdvisory' || !parsed.data.advisory) continue;

		const adv = parsed.data.advisory;
		if (
			!adv.patched_versions ||
			adv.patched_versions === '<0.0.0' ||
			/no\s+patch/i.test(adv.patched_versions)
		) {
			continue;
		}

		const vuln = { severity: adv.severity, title: adv.title, url: adv.url };
		const existing = packages.get(adv.module_name);

		if (!existing) {
			packages.set(adv.module_name, {
				patchedVersion: adv.patched_versions,
				vulns: [vuln],
			});
		} else {
			if (adv.patched_versions > existing.patchedVersion) {
				existing.patchedVersion = adv.patched_versions;
			}
			const key = `${vuln.severity}:${vuln.title}`;
			if (!existing.vulns.some(v => `${v.severity}:${v.title}` === key)) {
				existing.vulns.push(vuln);
			}
		}
	}

	return packages;
}

// ── PR body ─────────────────────────────────────────────────────────────────

function buildPrBody(
	pkg: string,
	info: PackageInfo,
	baseBranch: string,
): string {
	const rows = info.vulns
		.map(
			v =>
				`| ${v.severity} | ${v.title} | \`${info.patchedVersion}\` | ${v.url} |`,
		)
		.join('\n');

	return `#### Description of changes

Automated security patch for \`${pkg}\` to address known vulnerabilities.

### Vulnerabilities addressed

| Severity | Title | Patched | Advisory |
|----------|-------|---------|----------|
${rows}

#### Issue #, if available

Security audit findings on \`${baseBranch}\`

#### Description of how you validated changes

- Semver-compatible upgrade attempted first via \`yarn upgrade\`
- Falls back to \`resolutions\` for transitive dependencies
- Lockfile diff should be reviewed before merging

#### Checklist

- [x] PR description included
- [ ] \`yarn test\` passes
- [ ] Unit Tests are [changed or added](https://github.com/aws-amplify/amplify-js/blob/main/CONTRIBUTING.md#steps-towards-contributions)
- [ ] Relevant documentation is changed or added (and PR referenced)

By submitting this pull request, I confirm that my contribution is made under the terms of the Apache 2.0 license.
`;
}

// ── branch name helper ──────────────────────────────────────────────────────

function safeBranchName(baseBranch: string, pkg: string): string {
	const safePkg = pkg.replace(/[/@]/g, '-').replace(/^-/, '');

	return `security-patch/${baseBranch}/${safePkg}`;
}

// ── main ────────────────────────────────────────────────────────────────────

function main(): void {
	const baseBranch = process.env.BASE_BRANCH || 'main';
	const gitUser = process.env.GITHUB_USER || 'github-actions[bot]';
	const gitEmail =
		process.env.GITHUB_EMAIL || 'github-actions[bot]@users.noreply.github.com';

	const ghRepo = detectRepo();

	console.log('=== Security Patch PR Creator ===');
	console.log(`Repo root:    ${repoRoot}`);
	console.log(`Base branch:  ${baseBranch}`);
	console.log(`GitHub repo:  ${ghRepo || '(auto-detect)'}`);
	if (DRY_RUN) console.log('Mode:         DRY RUN');
	console.log();

	const auditFile = path.join(repoRoot, 'audit-output.json');
	if (!fs.existsSync(auditFile)) {
		console.log(`audit-output.json not found at ${auditFile}. Nothing to do.`);

		return;
	}

	const packages = parsePatchableVulnerabilities(auditFile);
	if (packages.size === 0) {
		console.log('No patchable vulnerabilities found.');

		return;
	}

	console.log(`Found ${packages.size} package(s) with available patches:`);
	for (const [pkg, info] of packages) {
		console.log(
			`  - ${pkg} → ${info.patchedVersion} (${info.vulns.length} vuln(s))`,
		);
	}
	console.log();

	if (!DRY_RUN) {
		run(`git config user.name "${gitUser}"`);
		run(`git config user.email "${gitEmail}"`);
	}

	let created = 0;

	const repoFlag = ghRepo ? ` --repo ${ghRepo}` : '';

	for (const [pkg, info] of packages) {
		const branchName = safeBranchName(baseBranch, pkg);
		console.log(`--- ${pkg} ---`);

		// Skip if an open PR already exists
		const existingPr = run(
			`gh pr list --head "${branchName}" --state open --json number --jq ".[0].number"${repoFlag}`,
			{ ignoreError: true },
		);
		if (existingPr) {
			console.log(`  PR #${existingPr} already open, skipping.\n`);
			continue;
		}

		// Ensure we start from a clean base
		run(`git checkout ${baseBranch}`, { ignoreError: true });
		run(`git checkout -B ${branchName}`);

		// Attempt 1: direct upgrade
		console.log(`  Trying yarn upgrade ${pkg}...`);
		run(`yarn upgrade ${pkg}`, { ignoreError: true });

		const lockChanged = run('git diff --name-only yarn.lock', {
			ignoreError: true,
		});

		if (!lockChanged && !DRY_RUN) {
			// Attempt 2: add a resolution entry
			console.log('  Direct upgrade had no effect, adding resolution...');
			const pkgJsonPath = path.join(repoRoot, 'package.json');
			const rawPkgJson = fs.readFileSync(pkgJsonPath, 'utf-8');
			const indent = rawPkgJson.match(/^(\t| +)/m)?.[1] ?? '\t';
			const pkgJson = JSON.parse(rawPkgJson);
			pkgJson.resolutions = pkgJson.resolutions || {};
			pkgJson.resolutions[pkg] = resolveVersion(info.patchedVersion);
			fs.writeFileSync(
				pkgJsonPath,
				JSON.stringify(pkgJson, null, indent) + '\n',
			);
			run('yarn install', { ignoreError: true });
		}

		// Check if anything actually changed
		const changes = run('git diff --name-only', { ignoreError: true });
		if (!DRY_RUN && !changes) {
			console.log(`  No changes produced for ${pkg}, skipping.\n`);
			run(`git checkout ${baseBranch}`, { ignoreError: true });
			continue;
		}

		// Commit and push
		run('git add package.json yarn.lock');
		run(`git commit -m "chore(deps): patch ${pkg} security vulnerabilities"`, {
			ignoreError: true,
		});
		run(`git push origin ${branchName} --force`, { ignoreError: true });

		// Create PR using a temp file for the body (avoids shell escaping issues)
		const body = buildPrBody(pkg, info, baseBranch);
		const title = `chore(deps): patch ${pkg} security vulnerabilities (${baseBranch})`;

		if (DRY_RUN) {
			console.log(`  Would create PR: ${title}`);
			console.log(`  Branch: ${branchName} → ${baseBranch}\n`);
		} else {
			const bodyFile = path.join(repoRoot, '.pr-body-tmp.md');
			fs.writeFileSync(bodyFile, body);
			const prUrl = run(
				`gh pr create --title "${title}" --body-file .pr-body-tmp.md --base ${baseBranch} --head ${branchName}${repoFlag}`,
				{ ignoreError: true },
			);
			fs.unlinkSync(bodyFile);
			if (prUrl) {
				console.log(`  PR created: ${prUrl}\n`);
				created++;
			} else {
				console.log(`  Failed to create PR for ${pkg}.\n`);
			}
		}

		// Return to base for next iteration
		run(`git checkout ${baseBranch}`, { ignoreError: true });
	}

	console.log(`Done. Created ${created} PR(s).`);
}

main();
