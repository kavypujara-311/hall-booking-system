@echo off
echo ========================================
echo Hall Booking System - Starting...
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

:wait_backend
echo Waiting for Backend (http://localhost:5000/api/health)...
curl --silent --head http://localhost:5000/api/health | find "200" >nul
if errorlevel 1 (
  timeout /t 1 /nobreak >nul
  goto wait_backend
)
echo Backend is ready.

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

:wait_frontend
echo Waiting for Frontend (http://localhost:5173)...
curl --silent --head http://localhost:5173 | find "200" >nul
if errorlevel 1 (
  timeout /t 1 /nobreak >nul
  goto wait_frontend
)
echo Frontend is ready.

echo.
echo ========================================
echo ✅ Both Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo 📱 To use Phone OTP:
echo 1. Open http://localhost:5173 in browser
echo 2. Click Login → Phone tab
echo 3. Enter phone: +919876543210
echo 4. Click Send OTP
echo 5. Check "Backend Server" window for OTP
echo 6. Enter OTP and login!
echo.
echo Opening http://localhost:5173 ...
start http://localhost:5173

echo.
echo ✅ Website opened in browser!
echo.
echo Keep both terminal windows open!
echo OTP will appear in "Backend Server" window.
echo.
