@echo off
cd /d "%~dp0"
start "MDRRMO Binangonan Server" /b "%~dp0MDRRMO_Binangonan.exe"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8765/?v=20260827-clean-actions"
