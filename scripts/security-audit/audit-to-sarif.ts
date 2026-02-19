#!/usr/bin/env node

/**
 * Converts Yarn v1 audit JSON output to SARIF format for GitHub Code Scanning
 * SARIF Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */

import * as fs from 'fs';

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
    advisories?: Record<string, YarnV1AuditAdvisory>;
    resolution?: {
      id: number;
      path: string;
      dev: boolean;
      optional: boolean;
      bundled: boolean;
    };
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
      };
      region?: {
        startLine: number;
      };
    };
  }>;
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
  const resolutions: Map<number, string[]> = new Map();

  // Parse JSON lines from Yarn v1 audit output
  // Yarn v1 outputs newline-delimited JSON with different types
  for (const line of auditLines) {
    if (!line.trim()) continue;

    try {
      const parsed: YarnV1AuditLine = JSON.parse(line);

      // Yarn v1 uses 'auditAdvisory' type with advisory in data.advisory
      if (parsed.type === 'auditAdvisory' && parsed.data.advisory) {
        const advisory = parsed.data.advisory;
        advisories[advisory.id] = advisory;
      }

      // Track resolution paths
      if (parsed.type === 'auditResolution' && parsed.data.resolution) {
        const res = parsed.data.resolution;
        if (!resolutions.has(res.id)) {
          resolutions.set(res.id, []);
        }
        resolutions.get(res.id)!.push(res.path);
      }
    } catch (error) {
      // Skip invalid JSON lines
      continue;
    }
  }

  const rules: SarifRule[] = [];
  const results: SarifResult[] = [];

  // Convert each advisory to SARIF rule and result
  for (const [advisoryId, advisory] of Object.entries(advisories)) {
    const ruleId = `npm-audit/${advisory.id}`;
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
    // Instead of one result per dependency path, we create one result per unique advisory
    const findings = advisory.findings || [];
    if (findings.length > 0) {
      // Get all affected versions
      const versions = [...new Set(findings.map(f => f.version))];
      const versionText = versions.length === 1 ? versions[0] : `${versions.length} versions`;
      
      results.push({
        ruleId,
        level,
        message: {
          text: `${advisory.module_name}@${versionText} has a ${advisory.severity} severity vulnerability: ${advisory.title}`,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: 'package.json',
              },
              region: {
                startLine: 1,
              },
            },
          },
        ],
      });
    }

    // If no findings, create one result for the advisory
    if (!advisory.findings || advisory.findings.length === 0) {
      results.push({
        ruleId,
        level,
        message: {
          text: `${advisory.module_name} has a ${advisory.severity} severity vulnerability: ${advisory.title}`,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: 'package.json',
              },
              region: {
                startLine: 1,
              },
            },
          },
        ],
      });
    }
  }

  return {
    version: '2.1.0',
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'yarn audit',
            version: '1.0.0',
            informationUri: 'https://classic.yarnpkg.com/en/docs/cli/audit',
            rules,
          },
        },
        results,
      },
    ],
  };
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0];
  const outputFile = args[1] || 'audit-results.sarif';

  let auditOutput: string;

  if (inputFile && inputFile !== '-') {
    // Read from file
    auditOutput = fs.readFileSync(inputFile, 'utf-8');
  } else {
    // Read from stdin
    auditOutput = fs.readFileSync(0, 'utf-8');
  }

  const lines = auditOutput.split('\n');
  const sarif = convertToSarif(lines);

  // Write SARIF output
  fs.writeFileSync(outputFile, JSON.stringify(sarif, null, 2));

  console.log(`✅ SARIF report generated: ${outputFile}`);
  console.log(
    `   Found ${sarif.runs[0].results.length} vulnerabilities across ${sarif.runs[0].tool.driver.rules.length} unique advisories`
  );
}

if (require.main === module) {
  main();
}
