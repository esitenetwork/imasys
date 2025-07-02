@echo off
echo ========================================
echo IMASYS - Deploy to Vercel
echo ========================================
echo.

echo Step 1: Push to GitHub
git add .
git commit -m "Deploy: %date% %time%"
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo Error occurred. Stopping process.
    pause
    exit /b 1
)

echo.
echo ========================================
echo GitHub push completed!
echo Vercel will start deployment automatically.
echo.
echo Vercel Dashboard: https://vercel.com/dashboard
echo ========================================
echo.
pause