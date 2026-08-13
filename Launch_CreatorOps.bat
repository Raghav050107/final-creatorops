@echo off
title CreatorOps Agency Workspace
echo ========================================================
echo   Starting CreatorOps Agency Workspace Dev Server...
echo ========================================================
echo.
cd /d "%~dp0"
set "PATH=C:\Users\ragha\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\ragha\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin;%PATH%"

echo Launching application at http://127.0.0.1:5173/
start http://127.0.0.1:5173/

echo.
echo Running local development server... (Keep this window open)
call pnpm dev --host 127.0.0.1 --port 5173
pause
