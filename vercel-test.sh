#!/bin/bash

echo "🚀 Testing Vercel deployment readiness..."

# Test TypeScript compilation
echo "📦 Testing TypeScript compilation..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi
echo "✅ TypeScript compilation successful"

# Check if dist files exist
echo "📁 Checking compiled files..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js not found"
    exit 1
fi
echo "✅ dist/index.js exists"

# Check if API entry point exists
echo "🔌 Checking API entry point..."
if [ ! -f "api/index.js" ]; then
    echo "❌ api/index.js not found"
    exit 1
fi
echo "✅ api/index.js exists"

# Check if vercel.json exists
echo "⚙️ Checking Vercel configuration..."
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found"
    exit 1
fi
echo "✅ vercel.json exists"

echo "🎉 All checks passed! Ready for Vercel deployment."
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Fix TypeScript compilation for Vercel'"
echo "3. git push"
echo ""
echo "The deployment should now work without the 'public directory' error!"
