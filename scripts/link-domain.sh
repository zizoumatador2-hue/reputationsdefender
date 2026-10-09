#!/bin/bash

# Get credentials from environment
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"
PROJECT="reputationsdefender"
DOMAIN="reputationsdefender.com"

if [ -z "$ACCOUNT_ID" ] || [ -z "$API_TOKEN" ]; then
  echo "❌ Error: Missing CLOUDFLARE credentials"
  exit 1
fi

echo "🔗 Linking domain: $DOMAIN"
echo "   Project: $PROJECT"

# Function to add custom domain
add_custom_domain() {
  local domain=$1
  
  echo "📝 Adding custom domain: $domain"
  
  curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/domains" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$domain\"}" \
    -s | python3 -m json.tool
}

# Add root domain
add_custom_domain "$DOMAIN"
echo ""

# Add www subdomain
add_custom_domain "www.$DOMAIN"
echo ""

echo "✅ Domain linking setup complete"
echo ""
echo "Next steps:"
echo "1. Wait 5-10 minutes for DNS propagation"
echo "2. Verify at: https://$DOMAIN"
