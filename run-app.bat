@echo off

:: Menjalankan Backend di jendela CMD baru
start "Backend Server" cmd /k "cd backend && node server"

:: Menjalankan Frontend di jendela CMD baru
start "Frontend Server" cmd /k "cd frontend && npm run dev"