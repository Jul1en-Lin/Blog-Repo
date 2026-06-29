#!/usr/bin/env bash
set -euo pipefail

fail() {
    printf 'FAIL: %s\n' "$1" >&2
    exit 1
}

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

hugo -D --destination "$tmp_dir/public" --cleanDestinationDir --printI18nWarnings --printPathWarnings >/tmp/hugo-no-navigation-overlay.log

pattern='route''-transition|Route''Transition|init''RouteTransitionDemo'
if rg -q "$pattern" assets layouts "$tmp_dir/public" docs/project_status.md; then
    fail 'Navigation overlay code must be fully removed'
fi

printf 'PASS: navigation overlay code is absent\n'
