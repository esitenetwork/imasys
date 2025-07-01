@echo off
echo ========================================
echo イマシス - 作業開始
echo ========================================
echo.

echo 最新版を取得しています...
git pull

if %errorlevel% neq 0 (
    echo.
    echo エラーが発生しました。強制更新を実行します...
    git reset --hard origin/main
    git pull
)

echo.
echo キャッシュをクリアしています...
if exist .next (
    rmdir /s /q .next 2>nul
)

echo.
echo 依存関係を更新しています...
npm install

echo.
echo ========================================
echo 開発サーバーを起動します...
echo アクセス: http://localhost:3000
echo 停止: Ctrl+C
echo ========================================
echo.

npm run dev