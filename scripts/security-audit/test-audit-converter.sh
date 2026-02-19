#!/bin/bash

# Test script for audit-to-sarif converter
# This creates a sample Yarn v1 audit output and tests the conversion

set -e

echo "🧪 Testing audit-to-sarif converter..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create test directory
TEST_DIR=$(mktemp -d)

# Create sample Yarn v1 audit JSON output
cat > "$TEST_DIR/test-audit.json" << 'EOF'
{"type":"auditAdvisory","data":{"resolution":{"id":1234,"path":"lodash","dev":false,"optional":false,"bundled":false},"advisory":{"findings":[{"version":"4.17.15","paths":["lodash"]}],"id":1234,"created":"2021-02-15T00:00:00.000Z","updated":"2021-02-15T00:00:00.000Z","deleted":null,"title":"Prototype Pollution","found_by":{"link":"","name":"Security Researcher","email":""},"reported_by":{"link":"","name":"Security Researcher","email":""},"module_name":"lodash","cves":["CVE-2020-8203"],"vulnerable_versions":"<4.17.21","patched_versions":">=4.17.21","overview":"Versions of lodash prior to 4.17.21 are vulnerable to Prototype Pollution.","recommendation":"Update to version 4.17.21 or later","references":"- [GitHub Issue](https://github.com/lodash/lodash/issues/4874)","access":"public","severity":"high","cwe":"CWE-1321","metadata":{"module_type":"","exploitability":3,"affected_components":""},"url":"https://npmjs.com/advisories/1234"}}}
{"type":"auditAdvisory","data":{"resolution":{"id":5678,"path":"minimist","dev":true,"optional":false,"bundled":false},"advisory":{"findings":[{"version":"1.2.5","paths":["minimist"]}],"id":5678,"created":"2020-03-10T00:00:00.000Z","updated":"2020-03-10T00:00:00.000Z","deleted":null,"title":"Prototype Pollution in minimist","found_by":{"link":"","name":"Security Team","email":""},"reported_by":{"link":"","name":"Security Team","email":""},"module_name":"minimist","cves":["CVE-2021-44906"],"vulnerable_versions":"<1.2.6","patched_versions":">=1.2.6","overview":"minimist is vulnerable to prototype pollution.","recommendation":"Upgrade to version 1.2.6 or later","references":"","access":"public","severity":"moderate","cwe":"CWE-1321","metadata":{"module_type":"","exploitability":5,"affected_components":""},"url":"https://npmjs.com/advisories/5678"}}}
{"type":"auditSummary","data":{"vulnerabilities":{"info":0,"low":0,"moderate":1,"high":1,"critical":0},"dependencies":1234,"devDependencies":567,"optionalDependencies":0,"totalDependencies":1801}}
EOF

echo "📝 Created test audit output"

# Run the converter
echo "🔄 Converting to SARIF..."
cd "$SCRIPT_DIR"
yarn ts-node audit-to-sarif.ts "$TEST_DIR/test-audit.json" "$TEST_DIR/output.sarif"

# Validate SARIF output
echo "✅ Validating SARIF output..."

if [ ! -f "$TEST_DIR/output.sarif" ]; then
    echo "❌ SARIF file not created"
    exit 1
fi

# Check if valid JSON
if ! jq empty "$TEST_DIR/output.sarif" 2>/dev/null; then
    echo "❌ Invalid JSON in SARIF output"
    exit 1
fi

# Check SARIF structure
SARIF_VERSION=$(jq -r '.version' "$TEST_DIR/output.sarif")
if [ "$SARIF_VERSION" != "2.1.0" ]; then
    echo "❌ Invalid SARIF version: $SARIF_VERSION"
    exit 1
fi

RULES_COUNT=$(jq '.runs[0].tool.driver.rules | length' "$TEST_DIR/output.sarif")
RESULTS_COUNT=$(jq '.runs[0].results | length' "$TEST_DIR/output.sarif")

echo "📊 SARIF Statistics:"
echo "   - Rules: $RULES_COUNT"
echo "   - Results: $RESULTS_COUNT"

if [ "$RULES_COUNT" -lt 2 ]; then
    echo "❌ Expected at least 2 rules, got $RULES_COUNT"
    exit 1
fi

if [ "$RESULTS_COUNT" -lt 2 ]; then
    echo "❌ Expected at least 2 results, got $RESULTS_COUNT"
    exit 1
fi

# Check for required fields
REQUIRED_FIELDS=(
    '.runs[0].tool.driver.name'
    '.runs[0].tool.driver.rules[0].id'
    '.runs[0].tool.driver.rules[0].properties."security-severity"'
    '.runs[0].results[0].ruleId'
    '.runs[0].results[0].level'
    '.runs[0].results[0].message.text'
)

for field in "${REQUIRED_FIELDS[@]}"; do
    VALUE=$(jq -r "$field" "$TEST_DIR/output.sarif" 2>/dev/null)
    if [ -z "$VALUE" ] || [ "$VALUE" = "null" ]; then
        echo "❌ Missing required field: $field"
        exit 1
    fi
done

echo "✅ All validations passed!"
echo ""
echo "📄 Sample SARIF output:"
jq '.runs[0].tool.driver.rules[0] | {id, name, severity: .properties."security-severity"}' "$TEST_DIR/output.sarif"

# Cleanup
rm -rf "$TEST_DIR"

echo ""
echo "🎉 Test completed successfully!"
