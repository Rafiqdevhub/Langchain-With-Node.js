Write-Host "🚀 Testing Vercel deployment readiness..." -ForegroundColor Green

# Test TypeScript compilation
Write-Host "📦 Testing TypeScript compilation..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green

# Check if dist files exist
Write-Host "📁 Checking compiled files..." -ForegroundColor Yellow
if (!(Test-Path "dist/index.js")) {
    Write-Host "❌ dist/index.js not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ dist/index.js exists" -ForegroundColor Green

# Check if API entry point exists
Write-Host "🔌 Checking API entry point..." -ForegroundColor Yellow
if (!(Test-Path "api/index.js")) {
    Write-Host "❌ api/index.js not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ api/index.js exists" -ForegroundColor Green

# Check if vercel.json exists
Write-Host "⚙️ Checking Vercel configuration..." -ForegroundColor Yellow
if (!(Test-Path "vercel.json")) {
    Write-Host "❌ vercel.json not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ vercel.json exists" -ForegroundColor Green

Write-Host "🎉 All checks passed! Ready for Vercel deployment." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Fix TypeScript compilation for Vercel'" -ForegroundColor White
Write-Host "3. git push" -ForegroundColor White
Write-Host ""
Write-Host "The deployment should now work without the 'public directory' error!" -ForegroundColor Green
