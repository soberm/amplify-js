#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Converts Yarn v1 audit JSON output to SARIF format for GitHub Code Scanning.
 *
 * Usage: npx ts-node audit-to-sarif.ts <lts-security-audit.json> [output.sarif]
 * SARIF Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */

import { readFileSync, writeFileSync } from 'node:fs';

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
  findings: Array<{
    version: string;
    paths: string[];
  }>;
}

interface YarnV1AuditLine {
  type: string;
  data: {
    advisory?: YarnV1AuditAdvisory;
  };
}

interface SarifLog {
  version: '2.1.0';
  $schema: string;
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: string;
      version: string;
      informationUri: string;
      rules: SarifRule[];
    };
  };
  results: SarifResult[];
}

interface SarifRule {
  id: string;
  name: string;
  shortDescription: {
    text: string;
  };
  fullDescription: {
    text: string;
  };
  helpUri: string;
  help: {
    text: string;
    markdown: string;
  };
  defaultConfiguration: {
    level: 'note' | 'warning' | 'error';
  };
  properties: {
    tags: string[];
    precision: string;
    'security-severity': string;
  };
}

interface SarifResult {
  ruleId: string;
  level: 'note' | 'warning' | 'error';
  message: {
    text: string;
  };
  locations: Array<{
    physicalLocation: {
      artifactLocation: {
        uri: string;
        uriBaseId: string;
      };
      region: {
        startLine: number;
        startColumn: number;
      };
    };
  }>;
}

// --- Constants ---

const SARIF_SCHEMA =
  'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json';
const TOOL_NAME = 'yarn audit';
const TOOL_VERSION = '1.0.0';
const TOOL_URI = 'https://classic.yarnpkg.com/en/docs/cli/audit';

/**
 * Returns an empty SARIF log (no findings).
 */
function emptySarif(): SarifLog {
  return {
    version: '2.1.0',
    $schema: SARIF_SCHEMA,
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

/**
 * Maps yarn audit severity to SARIF level
 */
function mapSeverityToLevel(
  severity: string
): 'note' | 'warning' | 'error' {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'error';
    case 'moderate':
      return 'warning';
    case 'low':
    case 'info':
    default:
      return 'note';
  }
}

/**
 * Maps yarn audit severity to numeric security severity for SARIF
 */
function mapSeverityToScore(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '9.0';
    case 'high':
      return '7.0';
    case 'moderate':
      return '5.0';
    case 'low':
      return '3.0';
    case 'info':
    default:
      return '1.0';
  }
}

/**
 * Converts Yarn v1 audit JSON to SARIF format
 */
function convertToSarif(auditLines: string[]): SarifLog {
  const advisories: Record<string, YarnV1AuditAdvisory> = {};

  // Parse newline-delimited JSON from Yarn v1 audit output
  for (const line of auditLines) {
    if (!line.trim()) continue;

    try {
      const parsed: YarnV1AuditLine = JSON.parse(line);

      if (parsed.type === 'auditAdvisory' && parsed.data.advisory) {
        const advisory = parsed.data.advisory;
        advisories[advisory.id] = advisory;
      }
    } catch {
      // Skip invalid JSON lines
      continue;
    }
  }

  const rules: SarifRule[] = [];
  const results: SarifResult[] = [];

  // Convert each advisory to SARIF rule and result
  for (const [, advisory] of Object.entries(advisories)) {
    const ruleId = `yarn-audit/${advisory.id}`;
    const level = mapSeverityToLevel(advisory.severity);
    const securitySeverity = mapSeverityToScore(advisory.severity);

    // Create SARIF rule
    rules.push({
      id: ruleId,
      name: advisory.title,
      shortDescription: {
        text: advisory.title,
      },
      fullDescription: {
        text: advisory.overview,
      },
      helpUri: advisory.url,
      help: {
        text: `${advisory.recommendation}\n\nVulnerable versions: ${advisory.vulnerable_versions}\nPatched versions: ${advisory.patched_versions}`,
        markdown: `## ${advisory.title}\n\n${advisory.overview}\n\n### Recommendation\n\n${advisory.recommendation}\n\n- **Vulnerable versions:** ${advisory.vulnerable_versions}\n- **Patched versions:** ${advisory.patched_versions}\n\n[More information](${advisory.url})`,
      },
      defaultConfiguration: {
        level,
      },
      properties: {
        tags: ['security', 'dependency', advisory.severity],
        precision: 'high',
        'security-severity': securitySeverity,
      },
    });

    // Create a single SARIF result per advisory (deduplicated)
    const findings = advisory.findings || [];
    const versions = [...new Set(findings.map(f => f.version))];
    const versionText = versions.length > 0
      ? `@${versions.length === 1 ? versions[0] : `${versions.length} versions`} `
      : ' ';

    results.push({
      ruleId,
      level,
      message: {
        text: `${advisory.module_name}${versionText}has a ${advisory.severity} severity vulnerability: ${advisory.title}`,
      },
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: 'package.json',
              uriBaseId: '%SRCROOT%',
            },
            region: {
              startLine: 1,
              startColumn: 1,
            },
          },
        },
      ],
    });
  }

  const sarif = emptySarif();
  sarif.runs[0].tool.driver.rules = rules;
  sarif.runs[0].results = results;
  return sarif;
}

/**
 * Main execution
 */
function main() {
  const [inputFile, outputFile = 'lts-security-audit.sarif'] = process.argv.slice(2);

  if (!inputFile) {
    console.error('Usage: npx ts-node audit-to-sarif.ts <lts-security-audit.json> [output.sarif]');
    process.exit(1);
  }

  let auditOutput: string;
  try {
    auditOutput = inputFile === '-'
      ? readFileSync(0, 'utf-8')
      : readFileSync(inputFile, 'utf-8');
  } catch {
    console.log(`Input file not found or unreadable: ${inputFile}`);
    writeFileSync(outputFile, JSON.stringify(emptySarif(), null, 2));
    process.exit(0);
  }

  const sarif = convertToSarif(auditOutput.split('\n'));
  writeFileSync(outputFile, JSON.stringify(sarif, null, 2));

  const ruleCount = sarif.runs[0].tool.driver.rules.length;
  const resultCount = sarif.runs[0].results.length;
  console.log(`SARIF written to ${outputFile}: ${ruleCount} rules, ${resultCount} results.`);
}

if (require.main === module) {
  main();
}
