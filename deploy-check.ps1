# Deployment verification script for Windows
Write-Host "🚀 Verifying deployment readiness..." -ForegroundColor Green

# Check if required files exist
Write-Host "📁 Checking required files..." -ForegroundColor Yellow
$files = @("package.json", "tsconfig.json", "vercel.json", ".env", "src/index.ts")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        exit 1
    }
}

# Check if build works
Write-Host "🔨 Testing build process..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Check if built files exist
Write-Host "📦 Checking built files..." -ForegroundColor Yellow
if (Test-Path "dist/index.js") {
    Write-Host "✅ dist/index.js exists" -ForegroundColor Green
} else {
    Write-Host "❌ dist/index.js missing" -ForegroundColor Red
    exit 1
}

# Start server in background for testing
Write-Host "🖥️  Starting server for testing..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow
Start-Sleep -Seconds 3

# Test health endpoint
Write-Host "🏥 Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    if ($response.status -eq "healthy") {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Health check failed" -ForegroundColor Red
        Stop-Process -Id $serverProcess.Id -Force
        exit 1
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    exit 1
}

# Stop server
Stop-Process -Id $serverProcess.Id -Force

Write-Host "🎉 All deployment checks passed!" -ForegroundColor Green
Write-Host "📤 Ready for deployment to Vercel, Heroku, or any other platform." -ForegroundColor Cyan
