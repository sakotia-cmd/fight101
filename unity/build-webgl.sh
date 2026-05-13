#!/usr/bin/env bash
# build-webgl.sh — one-command WebGL build for Fight 101.
#
# Run from the unity/ folder. Reads UNITY_PATH from the environment, or falls
# back to the most recent Unity 6 LTS install in the default macOS Hub location.
#
# Output: unity/Build/WebGL/   (open Build/WebGL/index.html or serve with
# `python3 -m http.server 8000` from that folder).

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Pick Unity binary. Override with `UNITY_PATH=/path/to/Unity ./build-webgl.sh`.
if [[ -z "${UNITY_PATH:-}" ]]; then
  # Default: newest Unity 6.x install in the Hub default location.
  # Unity 6 LTS installs as 6000.x.x; older Unity 6 betas used 6.0.x naming.
  UNITY_PATH="$(ls -d "/Applications/Unity/Hub/Editor/"6*/Unity.app/Contents/MacOS/Unity 2>/dev/null | sort -V | tail -1 || true)"
fi

if [[ -z "${UNITY_PATH:-}" || ! -x "$UNITY_PATH" ]]; then
  echo "build-webgl.sh: could not find Unity executable." >&2
  echo "  Set UNITY_PATH=/path/to/Unity.app/Contents/MacOS/Unity and re-run." >&2
  exit 1
fi

LOG_FILE="$PROJECT_DIR/Build/build.log"
mkdir -p "$PROJECT_DIR/Build"

echo "build-webgl.sh: using Unity at $UNITY_PATH"
echo "build-webgl.sh: project $PROJECT_DIR"
echo "build-webgl.sh: log $LOG_FILE"

"$UNITY_PATH" \
  -batchmode \
  -quit \
  -nographics \
  -projectPath "$PROJECT_DIR" \
  -executeMethod Builder.BuildWebGL \
  -logFile "$LOG_FILE"

echo "build-webgl.sh: done. Output in $PROJECT_DIR/Build/WebGL/"
echo "  Serve locally: (cd '$PROJECT_DIR/Build/WebGL' && python3 -m http.server 8000)"
