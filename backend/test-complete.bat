@echo off
echo ================================================================
echo DAMINI MART - COMPLETE FLOW TEST WITH SEEDING
echo ================================================================
echo.

echo Step 1: Seeding database with test data...
call npm run seed
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seeding failed!
    exit /b 1
)

echo.
echo Step 2: Waiting for database to be ready...
timeout /t 3 /nobreak >nul

echo.
echo Step 3: Running complete flow test...
call node test-flow.js

echo.
echo ================================================================
echo TEST COMPLETE
echo ================================================================
