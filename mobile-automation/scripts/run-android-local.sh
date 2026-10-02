#!/usr/bin/env bash
# ==============================================================================
# BuggyBooks Mobile Automation - Local Android Runner (macOS / Linux)
# ==============================================================================
# Usage:
#   ./scripts/run-android-local.sh
#   ./scripts/run-android-local.sh --all
#   ./scripts/run-android-local.sh --spec src/specs/catalog.e2e.spec.ts
#   ./scripts/run-android-local.sh --device pixel_6
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${MOBILE_DIR}"

SPEC="src/specs/auth.e2e.spec.ts"
ALL_SPECS=false
DEVICE_NAME=""
SKIP_PROBE=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --spec)
      SPEC="$2"
      shift 2
      ;;
    --all)
      ALL_SPECS=true
      shift
      ;;
    --device)
      DEVICE_NAME="$2"
      shift 2
      ;;
    --skip-probe)
      SKIP_PROBE=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./run-android-local.sh [options]"
      echo "Options:"
      echo "  --spec <path>    Run specific spec file (default: src/specs/auth.e2e.spec.ts)"
      echo "  --all            Run all mobile specs"
      echo "  --device <name>  Override ANDROID_DEVICE_NAME"
      echo "  --skip-probe     Skip Render staging pre-flight warm-up"
      echo "  -h, --help       Display this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "\033[0;36m==========================================================\033[0m"
echo -e "\033[0;36m 📱 BuggyBooks Mobile Automation - Local Android Runner   \033[0m"
echo -e "\033[0;36m==========================================================\033[0m"

# 1. Check Working Directory
echo -e "\033[0;90m[1/5] Working directory set to: ${MOBILE_DIR}\033[0m"

# 2. Check Prerequisites
echo -e "\033[0;33m[2/5] Checking prerequisites...\033[0m"

# Node.js
if command -v node >/dev/null 2>&1; then
  echo -e "\033[0;32m  ✔ Node.js: $(node -v)\033[0m"
else
  echo -e "\033[0;31m  ✖ Node.js is not installed or not in PATH.\033[0m"
  exit 1
fi

# ADB
if command -v adb >/dev/null 2>&1; then
  echo -e "\033[0;32m  ✔ ADB: $(adb version | head -n 1)\033[0m"
elif [[ -n "${ANDROID_HOME}" && -x "${ANDROID_HOME}/platform-tools/adb" ]]; then
  export PATH="${PATH}:${ANDROID_HOME}/platform-tools"
  echo -e "\033[0;32m  ✔ ADB (from ANDROID_HOME): $(adb version | head -n 1)\033[0m"
else
  echo -e "\033[0;33m  ⚠ ADB command not found in PATH or ANDROID_HOME.\033[0m"
fi

# Appium CLI
if npx appium --version >/dev/null 2>&1; then
  echo -e "\033[0;32m  ✔ Appium CLI: v$(npx appium --version 2>/dev/null)\033[0m"
else
  echo -e "\033[0;33m  ⚠ Appium CLI check via npx encountered an error.\033[0m"
fi

# 3. Check Connected ADB Devices
echo -e "\033[0;33m[3/5] Verifying connected Android devices or emulators...\033[0m"
if command -v adb >/dev/null 2>&1; then
  ACTIVE_DEVICES=$(adb devices 2>/dev/null | grep -v "List of devices" | grep "device$" || true)
  if [[ -n "${ACTIVE_DEVICES}" ]]; then
    echo -e "\033[0;32m  ✔ Detected active Android device(s)/emulator(s):\033[0m"
    echo "${ACTIVE_DEVICES}" | while read -r line; do
      echo -e "\033[0;32m    - ${line}\033[0m"
    done
  else
    echo -e "\033[0;31m  ⚠ No online Android devices or emulators detected.\033[0m"
    echo -e "\033[0;33m    To launch an emulator, run:\033[0m"
    echo -e "\033[0;90m      emulator -list-avds\033[0m"
    echo -e "\033[0;90m      emulator -avd <Your_AVD_Name> -no-snapshot-load\033[0m"
    echo -e "\033[0;33m    Or start an Android Virtual Device via Android Studio.\033[0m"
  fi
fi

# 4. Staging Warm-Up Probe
if [[ "${SKIP_PROBE}" = false ]]; then
  echo -e "\033[0;33m[4/5] Executing Render staging warm-up probe...\033[0m"
  curl -s -o /dev/null https://buggy-books.onrender.com/api/books || true
  curl -s -o /dev/null https://buggy-books-fe.onrender.com/ || true
  npx wait-on -t 90000 https://buggy-books.onrender.com/api/books https://buggy-books-fe.onrender.com/
  echo -e "\033[0;32m  ✔ BuggyBooks staging is online and ready.\033[0m"
else
  echo -e "\033[0;90m[4/5] Skipping staging warm-up probe (--skip-probe specified).\033[0m"
fi

# 5. Launch WebdriverIO
echo -e "\033[0;33m[5/5] Launching WebdriverIO test runner...\033[0m"

if [[ -n "${DEVICE_NAME}" ]]; then
  export ANDROID_DEVICE_NAME="${DEVICE_NAME}"
  echo -e "\033[0;36m  Target Device Name: ${DEVICE_NAME}\033[0m"
fi

WDIO_CMD=(npx wdio run src/config/wdio.android.conf.ts)
if [[ "${ALL_SPECS}" = false ]]; then
  WDIO_CMD+=(--spec "${SPEC}")
  echo -e "\033[0;36m  Target Spec: ${SPEC}\033[0m"
else
  echo -e "\033[0;36m  Target Specs: All (*.spec.ts)\033[0m"
fi

echo -e "\033[0;90m  Command: ${WDIO_CMD[*]}\033[0m"
echo -e "\033[0;90m----------------------------------------------------------\033[0m"

"${WDIO_CMD[@]}"
EXIT_CODE=$?

echo -e "\033[0;90m----------------------------------------------------------\033[0m"
if [[ ${EXIT_CODE} -eq 0 ]]; then
  echo -e "\033[0;32m✔ Mobile test execution finished successfully!\033[0m"
else
  echo -e "\033[0;31m✖ Mobile test execution failed with exit code: ${EXIT_CODE}\033[0m"
fi

exit ${EXIT_CODE}
