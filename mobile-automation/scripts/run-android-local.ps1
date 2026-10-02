<#
.SYNOPSIS
    Local Android Appium & WebdriverIO Execution Script for BuggyBooks (Windows).
.DESCRIPTION
    Verifies development prerequisites (Node, ADB, Appium, Staging connectivity),
    checks for active Android devices or emulators, and launches WebdriverIO tests.
.PARAMETER Spec
    Relative path to target spec file. Default: 'src/specs/auth.e2e.spec.ts'.
.PARAMETER All
    Execute all mobile test specs instead of just the smoke spec.
.PARAMETER DeviceName
    Optional device name override (e.g. 'pixel_6' or 'emulator-5554').
.PARAMETER SkipProbe
    Skip the Render staging pre-flight warm-up probe.
.EXAMPLE
    .\run-android-local.ps1
    .\run-android-local.ps1 -All
    .\run-android-local.ps1 -Spec src/specs/catalog.e2e.spec.ts
#>

[CmdletBinding()]
param (
    [string]$Spec = 'src/specs/auth.e2e.spec.ts',
    [switch]$All,
    [string]$DeviceName = '',
    [switch]$SkipProbe
)

Write-Host '==========================================================' -ForegroundColor Cyan
Write-Host ' BuggyBooks Mobile Automation - Local Android Runner      ' -ForegroundColor Cyan
Write-Host '==========================================================' -ForegroundColor Cyan

# 1. Resolve Script & Workspace Directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MobileDir = Split-Path -Parent $ScriptDir
$RootDir = Split-Path -Parent $MobileDir

Set-Location $MobileDir
Write-Host "[1/5] Working directory set to: $MobileDir" -ForegroundColor Gray

# 2. Verify Prerequisites
Write-Host '[2/5] Checking prerequisites...' -ForegroundColor Yellow

# Node.js
$nodeCmd = Get-Command 'node' -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeVersion = node -v
    Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host '  [FAIL] Node.js is not installed or not in PATH. Please install Node.js (v20+).' -ForegroundColor Red
    exit 1
}

# ADB (Android Debug Bridge)
$adbCmd = Get-Command 'adb' -ErrorAction SilentlyContinue
if (-not $adbCmd -and $env:ANDROID_HOME) {
    $candidate = Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe'
    if (Test-Path $candidate) {
        $env:PATH = $env:PATH + ';' + (Join-Path $env:ANDROID_HOME 'platform-tools')
        $adbCmd = Get-Command 'adb' -ErrorAction SilentlyContinue
    }
}

if (-not $adbCmd) {
    Write-Host '  [WARN] ADB command not found in PATH or ANDROID_HOME.' -ForegroundColor Yellow
    Write-Host '         Make sure Android SDK Platform-Tools are installed and added to PATH.' -ForegroundColor Yellow
} else {
    $adbVersion = (adb version | Select-Object -First 1)
    Write-Host "  [OK] $adbVersion" -ForegroundColor Green
}

# Appium CLI
$appiumVer = npx appium --version 2>$null
if ($appiumVer) {
    Write-Host "  [OK] Appium CLI: v$appiumVer" -ForegroundColor Green
} else {
    Write-Host '  [WARN] Appium CLI check via npx encountered an error or is not installed.' -ForegroundColor Yellow
}

# 3. Check ADB Connected Devices
Write-Host '[3/5] Verifying connected Android devices or emulators...' -ForegroundColor Yellow
if ($adbCmd) {
    $devicesOutput = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match '\S+' }
    $activeDevices = $devicesOutput | Where-Object { $_ -match '\tdevice$' }

    if ($activeDevices) {
        Write-Host '  [OK] Detected active Android device(s)/emulator(s):' -ForegroundColor Green
        foreach ($dev in $activeDevices) {
            Write-Host "       - $dev" -ForegroundColor Green
        }
    } else {
        Write-Host '  [WARN] No online Android devices or emulators detected.' -ForegroundColor Yellow
        Write-Host '         To launch an emulator, run:' -ForegroundColor Gray
        Write-Host '           emulator -list-avds' -ForegroundColor Gray
        Write-Host '           emulator -avd <Your_AVD_Name> -no-snapshot-load' -ForegroundColor Gray
        Write-Host '         Or start an Android Virtual Device via Android Studio Device Manager.' -ForegroundColor Gray
        Write-Host '         Tests will proceed assuming WebdriverIO Appium service will attempt connection.' -ForegroundColor DarkGray
    }
}

# 4. Render Staging Pre-Flight Warm-Up Probe
if (-not $SkipProbe) {
    Write-Host '[4/5] Executing Render staging warm-up probe...' -ForegroundColor Yellow
    $probeUrl = 'https://buggy-books.onrender.com/api/books'
    try {
        $response = Invoke-WebRequest -Uri $probeUrl -UseBasicParsing -TimeoutSec 15 -ErrorAction SilentlyContinue
        if ($response -and $response.StatusCode -eq 200) {
            Write-Host '  [OK] BuggyBooks staging is online and responsive.' -ForegroundColor Green
        } else {
            Write-Host '  [INFO] BuggyBooks staging responding. Warming up...' -ForegroundColor Yellow
            npx wait-on -t 60000 https://buggy-books.onrender.com/api/books
            Write-Host '  [OK] BuggyBooks staging is ready.' -ForegroundColor Green
        }
    } catch {
        Write-Host '  [INFO] Staging may be waking from idle sleep. Running wait-on probe (up to 90s)...' -ForegroundColor Yellow
        npx wait-on -t 90000 https://buggy-books.onrender.com/api/books https://buggy-books-fe.onrender.com/
        Write-Host '  [OK] BuggyBooks staging awakened successfully.' -ForegroundColor Green
    }
} else {
    Write-Host '[4/5] Skipping staging warm-up probe (-SkipProbe specified).' -ForegroundColor Gray
}

# 5. Launch WebdriverIO Test Execution
Write-Host '[5/5] Launching WebdriverIO test runner...' -ForegroundColor Yellow

if ($DeviceName) {
    $env:ANDROID_DEVICE_NAME = $DeviceName
    Write-Host "  Target Device Name: $DeviceName" -ForegroundColor Cyan
}

$wdioArgs = @('run', 'src/config/wdio.android.conf.ts')
if (-not $All) {
    $wdioArgs += @('--spec', $Spec)
    Write-Host "  Target Spec: $Spec" -ForegroundColor Cyan
} else {
    Write-Host '  Target Specs: All (*.spec.ts)' -ForegroundColor Cyan
}

Write-Host "  Command: npx wdio $($wdioArgs -join ' ')" -ForegroundColor DarkGray
Write-Host '----------------------------------------------------------' -ForegroundColor Gray

& npx wdio @wdioArgs
$exitCode = $LASTEXITCODE

Write-Host '----------------------------------------------------------' -ForegroundColor Gray
if ($exitCode -eq 0) {
    Write-Host '[OK] Mobile test execution finished successfully!' -ForegroundColor Green
} else {
    Write-Host "[FAIL] Mobile test execution failed with exit code: $exitCode" -ForegroundColor Red
}

exit $exitCode
