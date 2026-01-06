@echo off
setlocal

set ROOT=%~dp0
set APPDIR=%~dp0backend
set ROOT_ESC=%ROOT:\=/%

where go >nul 2>&1
if errorlevel 1 (
  echo Go is required but not installed.
  echo See: https://go.dev/doc/install
  echo Then install wails with:
  echo go install github.com/wailsapp/wails/v2/cmd/wails@latest
  exit /b 1
)

where wails >nul 2>&1
if errorlevel 1 (
  echo Error: wails is not installed.
  echo Install with:
  echo   go install github.com/wailsapp/wails/v2/cmd/wails@latest
  exit /b 1
)

wails %* -appargs="--app-dir=\"%ROOT_ESC%\""
