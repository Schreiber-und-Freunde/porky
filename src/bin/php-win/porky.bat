@echo off
echo.
SET thisPath=%~dp0
"%thisPath:~0,-1%/php.exe" "%thisPath:~0,-1%/../porky-data-source-access.php"
