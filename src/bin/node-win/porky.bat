@echo off
echo.
SET thisPath=%~dp0
"node.exe" "%thisPath:~0,-1%/../porky-data-source-access.js"
pause