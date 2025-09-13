#!/bin/bash

echo "🔍 Validating Vercel Configuration..."

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required for validation. Please install jq."
    exit 1
fi

# Validate root vercel.json
echo "📋 Checking root vercel.json..."
if [ ! -f "vercel.json" ]; then
    echo "❌ Root vercel.json not found!"
    exit 1
fi

if jq . vercel.json > /dev/null 2>&1; then
    echo "✅ Root vercel.json is valid JSON"
else
    echo "❌ Root vercel.json has invalid JSON"
    exit 1
fi

# Check builds count
builds_count=$(jq '.builds | length' vercel.json)
echo "📦 Found $builds_count build configurations"

# Validate each service has vercel.json
services=("web" "api-gateway" "api-facturas" "api-tax-calculator" "auth-service" "invoice-service")
for service in "${services[@]}"; do
    service_path="apps/$service"
    if [ -d "$service_path" ]; then
        if [ -f "$service_path/vercel.json" ]; then
            echo "✅ $service: vercel.json found"
            if jq . "$service_path/vercel.json" > /dev/null 2>&1; then
                echo "✅ $service: vercel.json is valid JSON"
            else
                echo "❌ $service: vercel.json has invalid JSON"
                exit 1
            fi
        else
            echo "❌ $service: vercel.json missing"
            exit 1
        fi

        # Check if package.json exists
        if [ -f "$service_path/package.json" ]; then
            echo "✅ $service: package.json found"
        else
            echo "❌ $service: package.json missing"
            exit 1
        fi
    else
        echo "⚠️  $service: directory not found"
    fi
done

# Validate routes
routes_count=$(jq '.routes | length' vercel.json)
echo "🛣️  Found $routes_count route configurations"

echo ""
echo "🎉 All validations passed! Ready for deployment."
