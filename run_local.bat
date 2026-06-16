@echo off
cd /d C:\Users\naoya\ai-blog-overseas
REM ANTHROPIC_API_KEY は .env.local から dotenv 経由で読み込む（バッチに直書きしない）
set SITE_ID=overseas-tools
set LOG=C:\Users\naoya\ai-blog-overseas\run_local.log

echo [%date% %time%] start >> %LOG%

"C:\Program Files\nodejs\node.exe" scripts/generate-posts.js >> %LOG% 2>&1
echo [%date% %time%] generate: %errorlevel% >> %LOG%

git stash >> %LOG% 2>&1
git pull origin main --rebase >> %LOG% 2>&1
git stash pop >> %LOG% 2>&1

git add posts\*.json >> %LOG% 2>&1
git diff --cached --quiet || git commit -m "feat: AI auto post" >> %LOG% 2>&1
echo [%date% %time%] commit: %errorlevel% >> %LOG%

git push origin main >> %LOG% 2>&1
echo [%date% %time%] push: %errorlevel% >> %LOG%

"C:\Program Files\nodejs\npx.cmd" vercel deploy --prod --yes >> %LOG% 2>&1
echo [%date% %time%] vercel: %errorlevel% >> %LOG%

echo [%date% %time%] done >> %LOG%
