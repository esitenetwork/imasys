@echo off
echo ========================================
echo イマシス - Vercelへのデプロイ
echo ========================================
echo.

echo Step 1: GitHubへプッシュ
git add .
git commit -m "Deploy: %date% %time%"
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo エラーが発生しました。処理を中止します。
    pause
    exit /b 1
)

echo.
echo Step 2: ビルドテスト（ローカル）
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ビルドエラーが発生しました。処理を中止します。
    pause
    exit /b 1
)

echo.
echo ========================================
echo GitHubへのプッシュが完了しました！
echo Vercelが自動的にデプロイを開始します。
echo.
echo Vercelダッシュボード: https://vercel.com/dashboard
echo ========================================
echo.
pause