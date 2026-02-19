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
import { Octokit } from "@octokit/rest";

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

function git(cmd: string, opts?: { ignoreError?: boolean }): string {
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

function parseRepo(): { owner: string; repo: string } {
  const url = git("git remote get-url origin");
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!match) throw new Error(`Cannot parse repo from remote: ${url}`);
  return { owner: match[1], repo: match[2] };
}

// --- Main ---

async function main(): Promise<void> {
  const [inputPath] = process.argv.slice(2);

  if (!inputPath) {
    console.error("Usage: npx tsx create-prs.ts <result.jsonl>");
    process.exit(1);
  }

  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GH_TOKEN or GITHUB_TOKEN environment variable is required.");
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

  const octokit = new Octokit({ auth: token });
  const { owner, repo } = parseRepo();

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
  git(`git config --global user.name "${gitUser}"`);
  git(`git config --global user.email "${gitEmail}"`);
  git("git config --global advice.detachedHead false");

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

    // Check for existing open PR
    try {
      const { data: prs } = await octokit.pulls.list({
        owner,
        repo,
        head: `${owner}:${branchName}`,
        state: "open",
        per_page: 1,
      });
      if (prs.length > 0) {
        console.log(`  PR #${prs[0].number} already open, skipping.`);
        continue;
      }
    } catch (err) {
      console.log(
        `  Warning: failed to check existing PRs.`,
        err instanceof Error ? err.message : err
      );
    }

    // Create branch from base commit
    git("git fetch origin");
    git(`git checkout ${baseSha}`, { ignoreError: true });
    git(`git checkout -b ${branchName}`);

    // Apply file changes
    for (const file of data["updated-dependency-files"]) {
      const filePath = (file.directory + "/" + file.name).replace(/^\//, "");

      if (file.deleted) {
        git(`git rm -f "${filePath}"`, { ignoreError: true });
      } else {
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, file.content);
        git(`git add "${filePath}"`);
      }
    }

    // Commit and push
    const commitResult = git(`git commit -m "${commitMsg}"`, {
      ignoreError: true,
    });
    if (!commitResult || commitResult.includes("nothing to commit")) {
      console.log("  No changes to commit, skipping.");
      git(`git checkout ${baseBranch}`, { ignoreError: true });
      continue;
    }

    git(`git push -f origin ${branchName}`);

    // Create PR via octokit
    try {
      const { data: pr } = await octokit.pulls.create({
        owner,
        repo,
        title: prTitle,
        body: buildPrBody(prBody),
        head: branchName,
        base: baseBranch,
      });

      // Add label
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: pr.number,
        labels: ["dependencies"],
      });

      console.log(`  PR created: ${pr.html_url}`);
      created++;
    } catch (err) {
      console.log(
        `  Failed to create PR.`,
        err instanceof Error ? err.message : err
      );
    }

    git(`git checkout ${baseBranch}`, { ignoreError: true });
  }

  console.log(`Done. Created ${created} PR(s).`);
}

main();
