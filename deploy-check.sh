#!/bin/bash

# Deployment verification script
echo "🚀 Verifying deployment readiness..."

# Check if required files exist
echo "📁 Checking required files..."
files=("package.json" "tsconfig.json" "vercel.json" ".env" "src/index.ts")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check if build works
echo "🔨 Testing build process..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check if built files exist
echo "📦 Checking built files..."
if [ -f "dist/index.js" ]; then
    echo "✅ dist/index.js exists"
else
    echo "❌ dist/index.js missing"
    exit 1
fi

# Start server in background for testing
echo "🖥️  Starting server for testing..."
npm start &
SERVER_PID=$!
sleep 3

# Test health endpoint
echo "🏥 Testing health endpoint..."
response=$(curl -s http://localhost:3000/health)
if [[ $response == *"healthy"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    kill $SERVER_PID
    exit 1
fi

# Stop server
kill $SERVER_PID

echo "🎉 All deployment checks passed!"
echo "📤 Ready for deployment to Vercel, Heroku, or any other platform."
