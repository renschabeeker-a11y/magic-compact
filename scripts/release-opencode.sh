#!/bin/sh

set -eu

version=${1:-}

if [ -z "$version" ]; then
  printf '%s\n' 'Usage: npm run release-opencode -- <version>' >&2
  exit 1
fi

case "$version" in
  v*) tag="$version" ;;
  *) tag="v$version" ;;
esac

cd packages/opencode-plugin
npm version "$tag" --git-tag-version
git push origin main --follow-tags
