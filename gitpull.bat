@echo off
echo ========================================
echo IMASYS - Start Work
echo ========================================
echo.

echo Getting latest version from GitHub...
git pull origin develop

if %errorlevel% neq 0 (
    echo.
    echo Error occurred. Force update...
    git reset --hard origin/develop
    git pull origin develop
)

echo.
echo Clearing cache...
if exist .next (
    rmdir /s /q .next 2>nul
)

echo.
echo Updating dependencies...
npm install

echo.
echo ========================================
echo Starting development server...
echo Access: http://localhost:3000
echo Stop: Ctrl+C
echo ========================================
echo.

npm run dev