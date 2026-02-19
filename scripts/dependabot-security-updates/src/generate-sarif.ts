// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Generates a SARIF file from Dependabot CLI JSONL output by cross-referencing
 * dependencies against the GitHub Advisory Database.
 *
 * Usage: npx tsx generate-sarif.ts <result.jsonl> <output.sarif>
 * Env:   GH_TOKEN (required for GitHub API authentication)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { Octokit } from "@octokit/rest";
import { satisfies as semverSatisfies } from "semver";

// --- Types ---

interface Dependency {
  name: string;
  version: string;
}

interface DependabotEvent {
  type: string;
  data: {
    dependencies: Dependency[];
  };
}

interface Vulnerability {
  package: { name: string; ecosystem: string };
  vulnerable_version_range: string | null;
  first_patched_version: string | null;
}

interface Advisory {
  ghsa_id: string;
  cve_id: string | null;
  severity: string | null;
  summary: string | null;
  description: string | null;
  html_url: string;
  vulnerabilities: Vulnerability[];
}

interface SarifRule {
  id: string;
  shortDescription: { text: string };
  fullDescription: { text: string };
  helpUri: string;
  help: { text: string; markdown: string };
  properties: { tags: string[]; "security-severity": string };
}

interface SarifResult {
  ruleId: string;
  level: string;
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string; uriBaseId: string };
      region: { startLine: number; startColumn: number };
    };
  }>;
}

interface Sarif {
  $schema: string;
  version: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
        rules: SarifRule[];
      };
    };
    results: SarifResult[];
  }>;
}

// --- Constants ---

const SARIF_SCHEMA =
  "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json";
const TOOL_NAME = "dependabot-security-audit";
const TOOL_VERSION = "1.0.0";
const TOOL_URI = "https://github.com/dependabot/cli";
const BATCH_SIZE = 100;

// --- Helpers ---

function emptySarif(): Sarif {
  return {
    $schema: SARIF_SCHEMA,
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: TOOL_NAME,
            version: TOOL_VERSION,
            informationUri: TOOL_URI,
            rules: [],
          },
        },
        results: [],
      },
    ],
  };
}

function toSarifLevel(severity: string | null): string {
  if (severity === "critical" || severity === "high") return "error";
  if (severity === "medium") return "warning";
  return "note";
}

function toSecuritySeverity(severity: string | null): string {
  switch (severity) {
    case "critical": return "9.0";
    case "high": return "7.0";
    case "medium": return "4.0";
    case "low": return "2.0";
    default: return "0.0";
  }
}

/**
 * Convert a GitHub Advisory vulnerable_version_range (e.g. ">= 3.0.0, < 3.0.4")
 * into a semver range string that the `semver` package understands.
 * GitHub uses comma-separated constraints; semver uses space-separated for AND.
 */
function toSemverRange(range: string): string {
  return range.split(",").map((s) => s.trim()).join(" ");
}

function isVersionAffected(version: string, range: string | null): boolean {
  if (!range) return true;
  try {
    return semverSatisfies(version, toSemverRange(range), {
      includePrerelease: true,
    });
  } catch {
    // If the range is unparseable, assume affected to be safe
    return true;
  }
}

/** Extract unique dependencies from Dependabot CLI JSONL output. */
function extractDeps(jsonlPath: string): Dependency[] {
  const content = readFileSync(jsonlPath, "utf8");
  const deps = new Map<string, Dependency>();

  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    let event: DependabotEvent;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (event.type !== "update_dependency_list") continue;
    for (const dep of event.data.dependencies) {
      if (!dep.version) continue;
      deps.set(`${dep.name}@${dep.version}`, dep);
    }
  }
  return [...deps.values()];
}

/** Query GitHub Advisory Database for advisories affecting our deps. */
async function fetchAdvisories(
  octokit: Octokit,
  deps: Dependency[]
): Promise<Advisory[]> {
  const advisoryMap = new Map<string, Advisory>();

  for (let offset = 0; offset < deps.length; offset += BATCH_SIZE) {
    const batch = deps.slice(offset, offset + BATCH_SIZE);
    const affects = batch.map((d) => `${d.name}@${d.version}`).join(",");
    console.log(
      `Querying advisories for deps ${offset}..${offset + batch.length} ...`
    );

    try {
      const advisories = await octokit.paginate(
        octokit.securityAdvisories.listGlobalAdvisories,
        { ecosystem: "npm", affects, per_page: 100 }
      ) as Advisory[];
      for (const a of advisories) {
        advisoryMap.set(a.ghsa_id, a);
      }
    } catch (err) {
      console.log(
        `  Warning: API request failed, skipping batch.`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return [...advisoryMap.values()];
}

/** Filter advisories to only include vulnerabilities that actually affect our versions. */
function filterAdvisories(
  advisories: Advisory[],
  deps: Dependency[]
): Advisory[] {
  const depVersions = new Map<string, string[]>();
  for (const d of deps) {
    const versions = depVersions.get(d.name) ?? [];
    versions.push(d.version);
    depVersions.set(d.name, versions);
  }

  return advisories
    .map((adv) => ({
      ...adv,
      vulnerabilities: adv.vulnerabilities.filter((v) => {
        if (v.package.ecosystem !== "npm") return false;
        const versions = depVersions.get(v.package.name);
        if (!versions) return false;
        return versions.some((ver) =>
          isVersionAffected(ver, v.vulnerable_version_range)
        );
      }),
    }))
    .filter((adv) => adv.vulnerabilities.length > 0);
}

/** Build SARIF from filtered advisories and our dependency list. */
function buildSarif(advisories: Advisory[], deps: Dependency[]): Sarif {
  const rules: SarifRule[] = [];
  const results: SarifResult[] = [];
  const ruleIds = new Set<string>();

  for (const adv of advisories) {
    const ruleId = adv.ghsa_id;
    const sev = adv.severity ?? "unknown";

    // Find affected deps for this advisory
    const affected: Array<{
      name: string;
      version: string;
      range: string;
      patched: string;
    }> = [];

    for (const vuln of adv.vulnerabilities) {
      if (vuln.package.ecosystem !== "npm") continue;
      for (const dep of deps) {
        if (dep.name !== vuln.package.name) continue;
        if (!isVersionAffected(dep.version, vuln.vulnerable_version_range))
          continue;
        affected.push({
          name: dep.name,
          version: dep.version,
          range: vuln.vulnerable_version_range ?? "unknown",
          patched: vuln.first_patched_version ?? "none",
        });
      }
    }

    if (affected.length === 0) continue;

    // Add rule
    if (!ruleIds.has(ruleId)) {
      ruleIds.add(ruleId);
      rules.push({
        id: ruleId,
        shortDescription: { text: adv.summary ?? "Security advisory" },
        fullDescription: {
          text: adv.description ?? adv.summary ?? "No description available",
        },
        helpUri: adv.html_url,
        help: {
          text: `Advisory: ${ruleId}\nSeverity: ${sev}\nMore info: ${adv.html_url}`,
          markdown: `**Advisory:** [${ruleId}](${adv.html_url})\n**Severity:** ${sev}\n**CVE:** ${adv.cve_id ?? "N/A"}`,
        },
        properties: {
          tags: ["security", "dependency", sev],
          "security-severity": toSecuritySeverity(adv.severity),
        },
      });
    }

    // Add results
    for (const dep of affected) {
      results.push({
        ruleId,
        level: toSarifLevel(adv.severity),
        message: {
          text: `${dep.name}@${dep.version} is affected by ${ruleId} (severity: ${sev}). Vulnerable range: ${dep.range}. Patched version: ${dep.patched}.`,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: "package.json",
                uriBaseId: "%SRCROOT%",
              },
              region: { startLine: 1, startColumn: 1 },
            },
          },
        ],
      });
    }
  }

  return {
    $schema: SARIF_SCHEMA,
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: TOOL_NAME,
            version: TOOL_VERSION,
            informationUri: TOOL_URI,
            rules,
          },
        },
        results,
      },
    ],
  };
}

// --- Main ---

async function main(): Promise<void> {
  const [inputPath, outputPath] = process.argv.slice(2);

  if (!inputPath || !outputPath) {
    console.error("Usage: npx tsx generate-sarif.ts <result.jsonl> <output.sarif>");
    process.exit(1);
  }

  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GH_TOKEN or GITHUB_TOKEN environment variable is required.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  // Extract deps
  let deps: Dependency[];
  try {
    deps = extractDeps(inputPath);
  } catch {
    console.log(`Result file not found or unreadable: ${inputPath}`);
    writeFileSync(outputPath, JSON.stringify(emptySarif(), null, 2));
    process.exit(0);
  }

  console.log(`Found ${deps.length} unique dependencies with versions.`);

  if (deps.length === 0) {
    console.log("No dependencies to check. Writing empty SARIF.");
    writeFileSync(outputPath, JSON.stringify(emptySarif(), null, 2));
    process.exit(0);
  }

  // Fetch advisories
  const rawAdvisories = await fetchAdvisories(octokit, deps);
  console.log(`Found ${rawAdvisories.length} unique advisories.`);

  if (rawAdvisories.length === 0) {
    console.log("No advisories found. Writing empty SARIF.");
    writeFileSync(outputPath, JSON.stringify(emptySarif(), null, 2));
    process.exit(0);
  }

  // Filter by semver
  const advisories = filterAdvisories(rawAdvisories, deps);
  console.log(
    `After semver filtering: ${advisories.length} advisories with matching versions.`
  );

  if (advisories.length === 0) {
    console.log("No advisories match actual dependency versions. Writing empty SARIF.");
    writeFileSync(outputPath, JSON.stringify(emptySarif(), null, 2));
    process.exit(0);
  }

  // Build and write SARIF
  const sarif = buildSarif(advisories, deps);
  writeFileSync(outputPath, JSON.stringify(sarif, null, 2));

  const ruleCount = sarif.runs[0].tool.driver.rules.length;
  const resultCount = sarif.runs[0].results.length;
  console.log(`SARIF written to ${outputPath}: ${ruleCount} rules, ${resultCount} results.`);
}

main();
