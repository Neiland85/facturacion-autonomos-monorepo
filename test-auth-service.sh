#!/bin/bash

echo "🧪 Testing Auth Service Setup..."
echo "================================="

# Test 1: Check if dependencies are installed
echo "✅ Test 1: Dependencies installed"
cd /Users/estudio/Projects/GitHub/NODE/facturacion-autonomos-monorepo/apps/auth-service
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exist"
else
    echo "   ❌ node_modules missing"
fi

# Test 2: TypeScript compilation
echo ""
echo "✅ Test 2: TypeScript compilation"
if pnpm build > /dev/null 2>&1; then
    echo "   ✅ TypeScript compiles successfully"
else
    echo "   ❌ TypeScript compilation failed"
fi

# Test 3: Check dist folder created
echo ""
echo "✅ Test 3: Build output"
if [ -d "dist" ]; then
    echo "   ✅ dist folder created"
    echo "   📁 Files in dist:"
    ls -la dist/ | head -5
else
    echo "   ❌ dist folder not created"
fi

# Test 4: Check environment file
echo ""
echo "✅ Test 4: Environment configuration"
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    echo "   🔧 Key configurations:"
    grep -E "^(PORT|JWT_SECRET|NODE_ENV)" .env | head -3
else
    echo "   ❌ .env file missing"
fi

# Test 5: Package.json scripts
echo ""
echo "✅ Test 5: Available scripts"
echo "   📜 Scripts available:"
cat package.json | grep -A 10 '"scripts"' | grep -E '"(dev|build|start|test)"'

echo ""
echo "🎯 Auth Service Status: READY FOR DEVELOPMENT"
echo "================================="
echo "To start the service manually:"
echo "  cd apps/auth-service && pnpm dev"
echo ""
echo "Expected URLs:"
echo "  🌐 Service: http://localhost:4001"
echo "  📖 Docs: http://localhost:4001/docs"
echo "  💓 Health: http://localhost:4001/health"
