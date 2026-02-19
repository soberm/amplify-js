// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Creates pull requests from Dependabot CLI output (JSONL).
 * Processes `create_pull_request` events and applies file changes via git.
 *
 * Usage: npx tsx create-prs.ts <result.jsonl>
 * Env:   GH_TOKEN, BASE_BRANCH, GIT_USER, GIT_EMAIL
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname } from "node:path";

// --- Types ---

interface UpdatedFile {
  name: string;
  directory: string;
  content: string;
  deleted: boolean;
}

interface CreatePrEvent {
  type: "create_pull_request";
  data: {
    "base-commit-sha": string;
    "pr-title": string;
    "pr-body": string;
    "commit-message": string;
    dependencies: Array<{ name: string }>;
    "updated-dependency-files": UpdatedFile[];
  };
}

// --- Helpers ---

function exec(cmd: string, opts?: { ignoreError?: boolean }): string {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (e) {
    if (opts?.ignoreError) return "";
    throw e;
  }
}

function buildPrBody(dependabotBody: string): string {
  return `#### Description of changes

Automated Dependabot security update.

${dependabotBody}

#### Issue #, if available

Security advisory from GitHub Advisory Database.

#### Description of how you validated changes

- Dependabot CLI generated the dependency update
- Lockfile changes should be reviewed before merging
- Run \`yarn test\` to validate

#### Checklist

- [x] PR description included
- [ ] \`yarn test\` passes
- [ ] Unit Tests are [changed or added](https://github.com/aws-amplify/amplify-js/blob/main/CONTRIBUTING.md#steps-towards-contributions)
- [ ] Relevant documentation is changed or added (and PR referenced)

By submitting this pull request, I confirm that my contribution is made under the terms of the Apache 2.0 license.`;
}

// --- Main ---

function main(): void {
  const [inputPath] = process.argv.slice(2);

  if (!inputPath) {
    console.error("Usage: npx tsx create-prs.ts <result.jsonl>");
    process.exit(1);
  }

  const baseBranch = process.env.BASE_BRANCH ?? "main";
  const gitUser = process.env.GIT_USER ?? "github-actions[bot]";
  const gitEmail =
    process.env.GIT_EMAIL ??
    "github-actions[bot]@users.noreply.github.com";

  if (!existsSync(inputPath)) {
    console.log(`Result file not found: ${inputPath}`);
    process.exit(0);
  }

  // Parse create_pull_request events
  const content = readFileSync(inputPath, "utf8");
  const events: CreatePrEvent[] = [];
  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === "create_pull_request") {
        events.push(parsed as CreatePrEvent);
      }
    } catch {
      continue;
    }
  }

  if (events.length === 0) {
    console.log("No create_pull_request events found. Nothing to do.");
    process.exit(0);
  }

  // Configure git
  exec(`git config --global user.name "${gitUser}"`);
  exec(`git config --global user.email "${gitEmail}"`);
  exec("git config --global advice.detachedHead false");

  let created = 0;

  for (const event of events) {
    const data = event.data;
    const baseSha = data["base-commit-sha"];
    const prTitle = data["pr-title"];
    const prBody = data["pr-body"];
    const commitMsg = data["commit-message"];
    const branchName =
      "dependabot/npm_and_yarn/" +
      data.dependencies
        .map((d) => d.name)
        .join("-")
        .replace(/[/@]/g, "-")
        .replace(/^-/, "")
        .slice(0, 60);

    console.log(`=== Processing: ${prTitle} ===`);
    console.log(`  Base SHA: ${baseSha}`);
    console.log(`  Branch:   ${branchName}`);

    // Check for existing PR
    const existingPr = exec(
      `gh pr list --head "${branchName}" --state open --json number --jq '.[0].number'`,
      { ignoreError: true }
    );
    if (existingPr) {
      console.log(`  PR #${existingPr} already open, skipping.`);
      continue;
    }

    // Create branch from base commit
    exec("git fetch origin");
    exec(`git checkout ${baseSha}`, { ignoreError: true });
    exec(`git checkout -b ${branchName}`);

    // Apply file changes
    for (const file of data["updated-dependency-files"]) {
      const filePath = (file.directory + "/" + file.name).replace(/^\//, "");

      if (file.deleted) {
        exec(`git rm -f "${filePath}"`, { ignoreError: true });
      } else {
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, file.content);
        exec(`git add "${filePath}"`);
      }
    }

    // Commit and push
    const commitResult = exec(`git commit -m "${commitMsg}"`, {
      ignoreError: true,
    });
    if (!commitResult || commitResult.includes("nothing to commit")) {
      console.log("  No changes to commit, skipping.");
      exec(`git checkout ${baseBranch}`, { ignoreError: true });
      continue;
    }

    exec(`git push -f origin ${branchName}`);

    // Create PR
    const bodyFile = `/tmp/pr-body-${Date.now()}.md`;
    writeFileSync(bodyFile, buildPrBody(prBody));

    const prUrl = exec(
      `gh pr create --title "${prTitle}" --body-file "${bodyFile}" ` +
        `--base "${baseBranch}" --head "${branchName}" --label "dependencies"`,
      { ignoreError: true }
    );

    exec(`rm -f "${bodyFile}"`, { ignoreError: true });

    if (prUrl) {
      console.log(`  PR created: ${prUrl}`);
      created++;
    } else {
      console.log("  Failed to create PR.");
    }

    exec(`git checkout ${baseBranch}`, { ignoreError: true });
  }

  console.log(`Done. Created ${created} PR(s).`);
}

main();
