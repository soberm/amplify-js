#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Creates pull requests from Dependabot CLI output (JSONL).
# Processes `create_pull_request` events and applies file changes via git.
#
# Usage: create-prs.sh <result.jsonl>
# Env:   GH_TOKEN, BASE_BRANCH, GIT_USER, GIT_EMAIL

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <result.jsonl>"
  exit 1
fi

INPUT="$1"
BASE_BRANCH="${BASE_BRANCH:-main}"
GIT_USER="${GIT_USER:-github-actions[bot]}"
GIT_EMAIL="${GIT_EMAIL:-github-actions[bot]@users.noreply.github.com}"

if [ ! -f "$INPUT" ]; then
  echo "Result file not found: $INPUT"
  exit 0
fi

if ! grep -q '"type":"create_pull_request"' "$INPUT" 2>/dev/null; then
  echo "No create_pull_request events found. Nothing to do."
  exit 0
fi

git config --global user.name "$GIT_USER"
git config --global user.email "$GIT_EMAIL"
git config --global advice.detachedHead false

CREATED=0

jq -c 'select(.type == "create_pull_request")' "$INPUT" | while read -r event; do
  BASE_SHA=$(echo "$event" | jq -r '.data."base-commit-sha"')
  PR_TITLE=$(echo "$event" | jq -r '.data."pr-title"')
  PR_BODY=$(echo "$event" | jq -r '.data."pr-body"')
  COMMIT_MSG=$(echo "$event" | jq -r '.data."commit-message"')
  BRANCH_NAME="dependabot/npm_and_yarn/$(echo "$event" | jq -r '[.data.dependencies[].name] | join("-")' | tr '/@' '-' | sed 's/^-//' | head -c 60)"

  echo "=== Processing: $PR_TITLE ==="
  echo "  Base SHA: $BASE_SHA"
  echo "  Branch:   $BRANCH_NAME"

  # Check if a PR already exists for this branch
  EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --state open --json number --jq '.[0].number' 2>/dev/null || true)
  if [ -n "$EXISTING_PR" ]; then
    echo "  PR #$EXISTING_PR already open, skipping."
    continue
  fi

  # Create branch from base commit
  git fetch origin
  git checkout "$BASE_SHA" 2>/dev/null
  git checkout -b "$BRANCH_NAME"

  # Apply file changes from the dependabot output
  echo "$event" | jq -c '.data."updated-dependency-files"[]' | while read -r file; do
    FILE_PATH=$(echo "$file" | jq -r '.directory + "/" + .name' | sed 's#^/##')
    DELETED=$(echo "$file" | jq -r '.deleted')

    if [ "$DELETED" = "true" ]; then
      git rm -f "$FILE_PATH" 2>/dev/null || true
    else
      mkdir -p "$(dirname "$FILE_PATH")"
      echo "$file" | jq -r '.content' > "$FILE_PATH"
      git add "$FILE_PATH"
    fi
  done

  # Commit and push
  git commit -m "$COMMIT_MSG" || { echo "  No changes to commit, skipping."; git checkout "$BASE_BRANCH"; continue; }
  git push -f origin "$BRANCH_NAME"

  # Build PR body with the amplify-js template wrapper
  BODY_FILE=$(mktemp)
  cat > "$BODY_FILE" << PRBODY
#### Description of changes

Automated Dependabot security update.

${PR_BODY}

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

By submitting this pull request, I confirm that my contribution is made under the terms of the Apache 2.0 license.
PRBODY

  PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body-file "$BODY_FILE" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH_NAME" \
    --label "dependencies" 2>/dev/null || true)

  rm -f "$BODY_FILE"

  if [ -n "$PR_URL" ]; then
    echo "  PR created: $PR_URL"
    CREATED=$((CREATED + 1))
  else
    echo "  Failed to create PR."
  fi

  # Return to base for next iteration
  git checkout "$BASE_BRANCH" 2>/dev/null
done

echo "Done. Created $CREATED PR(s)."
