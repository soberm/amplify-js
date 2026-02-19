#!/bin/bash
set -euo pipefail

# Required env vars: GH_TOKEN, BASE_BRANCH
# Optional env vars: GITHUB_USER, GITHUB_EMAIL

BASE_BRANCH="${BASE_BRANCH:-main}"
RUN_NUMBER="${RUN_NUMBER:-0}"

echo "=== Security Patch PR Creator ==="
echo "Base branch: $BASE_BRANCH"

# --- Step 1: Extract patchable vulnerabilities ---

echo ""
echo "Analyzing vulnerabilities with available patches..."

# Debug: show file stats
echo "  audit-output.json: $(wc -l < audit-output.json 2>/dev/null || echo 'missing') lines"
echo "  auditAdvisory entries: $(grep -c 'auditAdvisory' audit-output.json 2>/dev/null || echo '0')"

# Extract advisories where patched versions exist
# Pre-filter with grep to only feed valid auditAdvisory lines to jq
grep '"auditAdvisory"' audit-output.json 2>/dev/null | jq -r '
  .data.advisory |
  select(.patched_versions != "<0.0.0") |
  select(.patched_versions != "No patch available") |
  "\(.module_name)|\(.patched_versions)|\(.severity)|\(.title)"
' 2>/dev/null | sort -u > patchable-vulnerabilities.txt

echo "  Patchable vulnerabilities found: $(wc -l < patchable-vulnerabilities.txt 2>/dev/null || echo '0')"

if [ ! -s patchable-vulnerabilities.txt ]; then
  echo "No patchable vulnerabilities found."
  exit 0
fi

# --- Step 2: Group vulnerabilities by package ---

declare -A pkg_versions  # package -> highest patched version
declare -A pkg_vulns     # package -> vulnerability descriptions

while IFS='|' read -r package patched_version severity title; do
  # Track the highest patched version per package
  if [ -z "${pkg_versions[$package]+x}" ]; then
    pkg_versions["$package"]="$patched_version"
  else
    # Keep the higher version requirement
    existing="${pkg_versions[$package]}"
    if [[ "$patched_version" > "$existing" ]]; then
      pkg_versions["$package"]="$patched_version"
    fi
  fi

  # Accumulate vulnerability descriptions
  if [ -z "${pkg_vulns[$package]+x}" ]; then
    pkg_vulns["$package"]="- **$severity**: $title"
  else
    pkg_vulns["$package"]="${pkg_vulns[$package]}
- **$severity**: $title"
  fi
done < patchable-vulnerabilities.txt

echo "Found ${#pkg_versions[@]} packages with available patches:"
for pkg in "${!pkg_versions[@]}"; do
  echo "  - $pkg (needs ${pkg_versions[$pkg]})"
done

# --- Step 3: Configure git ---

git config user.name "${GITHUB_USER:-github-actions[bot]}"
git config user.email "${GITHUB_EMAIL:-github-actions[bot]@users.noreply.github.com}"

# --- Step 4: Create a PR per package ---

created_prs=0

for package in "${!pkg_versions[@]}"; do
  patched_version="${pkg_versions[$package]}"
  vulns="${pkg_vulns[$package]}"
  safe_name=$(echo "$package" | tr '/@' '-' | sed 's/^-//')

  echo ""
  echo "--- Processing $package ---"

  # Check if an open PR already exists for this package
  existing_pr=$(gh pr list --search "chore(deps): patch $package security" --state open --json number --jq '.[0].number' 2>/dev/null || echo "")
  if [ -n "$existing_pr" ]; then
    echo "  Open PR #$existing_pr already exists for $package, skipping."
    continue
  fi

  # Reset to base branch
  git checkout "$BASE_BRANCH" -- yarn.lock package.json
  git checkout -- . 2>/dev/null || true

  # Try 1: Direct semver-compatible upgrade (no --latest)
  echo "  Attempting yarn upgrade $package..."
  yarn upgrade "$package" 2>/dev/null || true

  # Check if yarn.lock changed
  if git diff --quiet yarn.lock; then
    # Try 2: Add a resolution in package.json for transitive deps
    echo "  Direct upgrade had no effect, adding resolution..."

    # Extract the version number from patched_versions (e.g., ">=7.5.8" -> "7.5.8")
    resolved_version=$(echo "$patched_version" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)

    if [ -z "$resolved_version" ]; then
      echo "  Could not parse version from $patched_version, skipping."
      continue
    fi

    # Add resolution to package.json
    jq --arg pkg "$package" --arg ver "$resolved_version" \
      '.resolutions[$pkg] = $ver' package.json > package.json.tmp \
      && mv package.json.tmp package.json

    # Reinstall to apply resolution
    yarn install 2>/dev/null || true
  fi

  # Check if anything changed
  if git diff --quiet yarn.lock package.json; then
    echo "  No changes for $package, skipping."
    continue
  fi

  # Create branch and PR (no run number so re-runs reuse the same branch)
  BRANCH_NAME="security-patch/${safe_name}"

  # Check if branch already exists remotely
  if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
    echo "  Branch $BRANCH_NAME already exists, skipping."
    git checkout -- . 2>/dev/null || true
    continue
  fi

  git checkout -b "$BRANCH_NAME"
  git add yarn.lock package.json
  git commit -m "chore(deps): patch $package to fix security vulnerabilities"
  git push origin "$BRANCH_NAME"

  # Build PR body
  cat > pr-body.md << PREOF
#### Description of changes

Automated security patch for \`$package\` to address known vulnerabilities.

**Patched version:** \`$patched_version\`

**Vulnerabilities fixed:**
$vulns

#### Issue #, if available

Security audit findings in $BASE_BRANCH

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
PREOF

  gh pr create \
    --title "chore(deps): patch $package security vulnerabilities" \
    --body-file pr-body.md \
    --label "dependencies,security" \
    --base "$BASE_BRANCH" || echo "  Failed to create PR for $package"

  created_prs=$((created_prs + 1))

  # Return to base branch for next package
  git checkout "$BASE_BRANCH"
done

# --- Step 5: Summary ---

echo ""
echo "=== Summary ==="
echo "Packages analyzed: ${#pkg_versions[@]}"
echo "PRs created: $created_prs"
