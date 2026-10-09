#!/bin/bash

# Check deployment status

CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
PROJECT_NAME="reputationsdefender"

if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID not set"
  echo "⚠️  Please set these environment variables:"
  echo "   export CLOUDFLARE_API_TOKEN='your-token'"
  echo "   export CLOUDFLARE_ACCOUNT_ID='your-account-id'"
  exit 1
fi

echo "✅ Credentials found"
echo ""

# Clean tokens
TOKEN=$(printf '%s' "$CLOUDFLARE_API_TOKEN" | tr -d '\n\r')
ACCOUNT_ID=$(printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | tr -d '\n\r')

echo "=== Checking project deployments ==="
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool | head -50

echo ""
echo "=== Checking linked domains ==="
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo ""
echo "=== Attempting to link domain ==="
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"reputationsdefender.com"}' | python3 -m json.tool

