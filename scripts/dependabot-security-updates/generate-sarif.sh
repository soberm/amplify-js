#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Generates a SARIF file from Dependabot CLI JSONL output by cross-referencing
# dependencies against the GitHub Advisory Database.
#
# Usage: generate-sarif.sh <result.jsonl> <output.sarif>
# Env:   GH_TOKEN (required for GitHub API authentication)

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <result.jsonl> <output.sarif>"
  exit 1
fi

INPUT="$1"
OUTPUT="$2"

if [ ! -f "$INPUT" ]; then
  echo "Result file not found: $INPUT"
  jq -n '{
    "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: { driver: { name: "dependabot-security-audit", version: "1.0.0", informationUri: "https://github.com/dependabot/cli", rules: [] } },
      results: []
    }]
  }' > "$OUTPUT"
  exit 0
fi

# Extract dependencies from update_dependency_list events.
# Each event has .data.dependencies[] with {name, version}.
DEPS=$(jq -s '
  [.[] | select(.type == "update_dependency_list") | .data.dependencies[]
   | select(.version != null and .version != "")
   | {name, version}]
  | unique_by(.name + "@" + .version)
' "$INPUT" 2>/dev/null || echo "[]")

DEP_COUNT=$(echo "$DEPS" | jq 'length')
echo "Found $DEP_COUNT unique dependencies with versions."

if [ "$DEP_COUNT" -eq 0 ]; then
  echo "No dependencies to check. Writing empty SARIF."
  jq -n '{
    "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: {
        driver: {
          name: "dependabot-security-audit",
          version: "1.0.0",
          informationUri: "https://github.com/dependabot/cli",
          rules: []
        }
      },
      results: []
    }]
  }' > "$OUTPUT"
  exit 0
fi

# Build affects query strings in batches of 100 (API limit is 1000, but
# URL length is the real constraint — ~100 packages keeps us safe).
BATCH_SIZE=100
ALL_ADVISORIES="[]"
OFFSET=0

while [ "$OFFSET" -lt "$DEP_COUNT" ]; do
  AFFECTS=$(echo "$DEPS" | jq -r --argjson off "$OFFSET" --argjson bs "$BATCH_SIZE" '
    .[$off:$off+$bs] | map(.name + "@" + .version) | join(",")
  ')

  echo "Querying advisories for deps $OFFSET..$((OFFSET + BATCH_SIZE)) ..."

  # Paginate through results for this batch
  PAGE=1
  while true; do
    RESPONSE=$(gh api --method GET "/advisories" \
      -f ecosystem=npm \
      -f "affects=${AFFECTS}" \
      -F per_page=100 \
      -F "page=${PAGE}" \
      --header "X-GitHub-Api-Version: 2022-11-28" 2>/dev/null || echo "[]")

    # Validate response is an array (API errors return objects)
    if ! echo "$RESPONSE" | jq -e 'type == "array"' >/dev/null 2>&1; then
      echo "  Warning: unexpected API response, skipping batch."
      break
    fi

    COUNT=$(echo "$RESPONSE" | jq 'length')
    if [ "$COUNT" -eq 0 ]; then
      break
    fi

    ALL_ADVISORIES=$(echo "$ALL_ADVISORIES" "$RESPONSE" | jq -s '.[0] + .[1]')
    if [ "$COUNT" -lt 100 ]; then
      break
    fi
    PAGE=$((PAGE + 1))
  done

  OFFSET=$((OFFSET + BATCH_SIZE))
done

# Deduplicate advisories by ghsa_id
ALL_ADVISORIES=$(echo "$ALL_ADVISORIES" | jq 'unique_by(.ghsa_id)')
ADVISORY_COUNT=$(echo "$ALL_ADVISORIES" | jq 'length')
echo "Found $ADVISORY_COUNT unique advisories."

if [ "$ADVISORY_COUNT" -eq 0 ]; then
  echo "No advisories found. Writing empty SARIF."
  jq -n '{
    "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: {
        driver: {
          name: "dependabot-security-audit",
          version: "1.0.0",
          informationUri: "https://github.com/dependabot/cli",
          rules: []
        }
      },
      results: []
    }]
  }' > "$OUTPUT"
  exit 0
fi

# Write deps to a temp file to avoid shell argument length limits
DEPS_FILE=$(mktemp)
echo "$DEPS" > "$DEPS_FILE"
trap 'rm -f "$DEPS_FILE"' EXIT

# Convert advisories to SARIF 2.1.0 format.
# Each advisory becomes a rule + one result per affected package.
echo "$ALL_ADVISORIES" | jq --slurpfile dep_list "$DEPS_FILE" '
  # Map severity to SARIF level
  def to_sarif_level:
    if . == "critical" or . == "high" then "error"
    elif . == "medium" then "warning"
    else "note"
    end;

  # Map severity to SARIF security-severity score
  def to_security_severity:
    if . == "critical" then "9.0"
    elif . == "high" then "7.0"
    elif . == "medium" then "4.0"
    elif . == "low" then "2.0"
    else "0.0"
    end;

  $dep_list[0] as $dep_list |

  # Build a lookup of our deps: { "pkg@ver": true }
  ($dep_list | map({ key: (.name + "@" + .version), value: true }) | from_entries) as $our_deps |

  # Collect rules and results
  reduce .[] as $adv (
    { rules: [], results: [], rule_ids: {} };

    $adv.ghsa_id as $rule_id |
    $adv.severity as $sev |

    # Find which of our deps are affected by this advisory
    [
      $adv.vulnerabilities[]
      | select(.package.ecosystem == "npm")
      | . as $vuln
      | $dep_list[]
      | select(.name == $vuln.package.name)
      | { name: .name, version: .version, vulnerable_range: $vuln.vulnerable_version_range,
          patched: ($vuln.first_patched_version // "none") }
    ] as $affected |

    if ($affected | length) == 0 then .
    else
      # Add rule if not already present
      (if .rule_ids[$rule_id] then .
       else
         .rules += [{
           id: $rule_id,
           shortDescription: { text: ($adv.summary // "Security advisory") },
           fullDescription: { text: ($adv.description // $adv.summary // "No description available") },
           helpUri: $adv.html_url,
           help: {
             text: ("Advisory: " + $rule_id + "\nSeverity: " + ($sev // "unknown") + "\nMore info: " + $adv.html_url),
             markdown: ("**Advisory:** [" + $rule_id + "](" + $adv.html_url + ")\n**Severity:** " + ($sev // "unknown") + "\n**CVE:** " + ($adv.cve_id // "N/A"))
           },
           properties: {
             tags: ["security", "dependency", ($sev // "unknown")],
             "security-severity": ($sev | to_security_severity)
           }
         }] |
         .rule_ids[$rule_id] = true
       end) |

      # Add one result per affected dep
      reduce $affected[] as $dep (.;
        .results += [{
          ruleId: $rule_id,
          level: ($sev | to_sarif_level),
          message: {
            text: ($dep.name + "@" + $dep.version + " is affected by " + $rule_id + " (severity: " + ($sev // "unknown") + "). Vulnerable range: " + $dep.vulnerable_range + ". Patched version: " + $dep.patched + ".")
          },
          locations: [{
            physicalLocation: {
              artifactLocation: {
                uri: "package.json",
                uriBaseId: "%SRCROOT%"
              },
              region: { startLine: 1, startColumn: 1 }
            }
          }]
        }]
      )
    end
  ) |

  # Assemble final SARIF
  {
    "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: {
        driver: {
          name: "dependabot-security-audit",
          version: "1.0.0",
          informationUri: "https://github.com/dependabot/cli",
          rules: .rules
        }
      },
      results: .results
    }]
  }
' > "$OUTPUT"

RESULT_COUNT=$(jq '.runs[0].results | length' "$OUTPUT")
RULE_COUNT=$(jq '.runs[0].tool.driver.rules | length' "$OUTPUT")
echo "SARIF written to $OUTPUT: $RULE_COUNT rules, $RESULT_COUNT results."
