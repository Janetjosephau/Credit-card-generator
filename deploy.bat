@echo off
title Credit Card Generator - Deploy Script
color 0A

echo ============================================
echo   Credit Card Generator - Deploy to Server
echo ============================================
echo.

:: -----------------------------------------------
:: CONFIGURE THIS: Set your server's shared path
:: Example: \\192.168.1.50\wwwroot\creditcardgenerator
:: Or a mapped drive: Z:\creditcardgenerator
:: -----------------------------------------------
set SERVER_PATH=\\YOUR-SERVER-IP\wwwroot\creditcardgenerator

:: -----------------------------------------------
:: Step 1: Build the app
:: -----------------------------------------------
echo [1/3] Building the app...
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Fix errors above and try again.
    pause
    exit /b 1
)
echo [OK] Build complete.
echo.

:: -----------------------------------------------
:: Step 2: Copy dist to server
:: -----------------------------------------------
echo [2/3] Copying files to server: %SERVER_PATH%
if not exist "%SERVER_PATH%" (
    echo [ERROR] Cannot reach server path: %SERVER_PATH%
    echo         Make sure the server is reachable and the path is correct.
    echo         Edit this script and update the SERVER_PATH variable.
    pause
    exit /b 1
)

xcopy /E /Y /I "%~dp0frontend\dist\*" "%SERVER_PATH%\"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] File copy failed! Check permissions on the server folder.
    pause
    exit /b 1
)
echo [OK] Files copied successfully.
echo.

:: -----------------------------------------------
:: Step 3: Done
:: -----------------------------------------------
echo [3/3] Deploy complete!
echo.
echo ============================================
echo   App is live at: http://YOUR-SERVER-IP
echo   Users can refresh their browser now.
echo ============================================
echo.
pause
