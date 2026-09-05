#!/usr/bin/env bash
# Builds one macOS architecture (arm64 or amd64) into a DMG. Both run natively on an Apple silicon agent.
source "$(dirname "$0")/lib.sh"
arch="${1:-arm64}"
label="intel"; [[ "$arch" == "arm64" ]] && label="apple-silicon"

log "macOS $arch"
rm -rf bin frontend/.svelte-kit # start clean: a half-finished SvelteKit build breaks the next one; svelte-kit sync recreates the folder
keep_icons
wails3 task darwin:build ARCH="$arch"
restore_icons
wails3 task darwin:create:app:bundle
wails3 task darwin:create:dmg

mkdir -p "$DIST"
mv "bin/$APP.dmg" "$DIST/$APP-$VERSION-macOS-$label.dmg"
ls -la "$DIST"
