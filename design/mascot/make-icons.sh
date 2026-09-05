#!/bin/zsh
# Rebuilds every app-icon artefact from design/mascot/*.svg. macOS only.
#   ./design/mascot/make-icons.sh
# Wails' own generator only puts 16/32/128/256 into icons.icns, so we run it
# first (for Assets.car and icon.ico) and then rebuild the .icns ourselves with
# every rung rendered straight from the vector.
set -e
cd "$(dirname "$0")/../.."
M=design/mascot
BIN=$(mktemp -d)/svgshot
trap 'rm -rf "$(dirname "$BIN")"' EXIT
swiftc -O "$M/svgshot.swift" -o "$BIN"

# 1. source PNG + Icon Composer layer
"$BIN" "$M/icon-1024.svg" build/appicon.png 1024
cp "$M/icon-layer.svg" build/appicon.icon/Assets/bo-mark.svg

# 2. Assets.car (macOS 13+) and the Windows .ico
(cd build && wails3 generate icons -input appicon.png \
  -macfilename darwin/icons.icns -windowsfilename windows/icon.ico \
  -iconcomposerinput appicon.icon -macassetdir darwin)

# 3. full-resolution .icns; 16 and 32 use the reduced cut of the mark
SET=$(mktemp -d)/icons.iconset
mkdir -p "$SET"
for spec in 16:16x16 32:16x16@2x 32:32x32; do
  "$BIN" "$M/icon-micro.svg" "$SET/icon_${spec#*:}.png" "${spec%%:*}"
done
for spec in 64:32x32@2x 128:128x128 256:128x128@2x 256:256x256 512:256x256@2x 512:512x512 1024:512x512@2x; do
  "$BIN" "$M/icon-1024.svg" "$SET/icon_${spec#*:}.png" "${spec%%:*}"
done
iconutil -c icns "$SET" -o build/darwin/icons.icns

# 4. the icon shown for the .app inside the DMG window
iconutil -c icns "$SET" -o build/darwin/dmg-file-icon.icns
rm -rf "$(dirname "$SET")"
"$BIN" "$M/icon-1024.svg" build/darwin/dmg-file-icon.png 1254
echo "icons rebuilt: build/appicon.png, build/darwin/{icons.icns,Assets.car,dmg-file-icon.icns,dmg-file-icon.png}, build/windows/icon.ico"
