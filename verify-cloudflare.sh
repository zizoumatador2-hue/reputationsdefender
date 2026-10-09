#!/bin/bash
# Diagnostic script to verify Cloudflare API token and account configuration

set -e

echo "=== Cloudflare API Token Verification ==="
echo ""

# Read token and account ID from environment or prompt
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "Enter your Cloudflare API Token (will not be displayed):"
  read -s CLOUDFLARE_API_TOKEN
  echo ""
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "Enter your Cloudflare Account ID:"
  read CLOUDFLARE_ACCOUNT_ID
  echo ""
fi

# Verify inputs
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "ERROR: Token and Account ID are required"
  exit 1
fi

echo "Testing with:"
echo "  Token length: ${#CLOUDFLARE_API_TOKEN} characters"
echo "  Account ID length: ${#CLOUDFLARE_ACCOUNT_ID} characters"
echo ""

# Test 1: Verify token
echo "Test 1: Verifying token..."
response=$(curl -s -w "\n%{http_code}" https://api.cloudflare.com/client/v4/user/tokens/verify \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo "✓ Token is valid"
  echo "  Response: $(echo "$body" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(json.dumps({k:d.get(k) for k in ["success","result","errors"]}, indent=2))' 2>/dev/null || echo "$body")"
else
  echo "✗ Token verification failed (HTTP $http_code)"
  echo "  Response: $body"
  exit 1
fi

echo ""

# Test 2: List Pages projects
echo "Test 2: Listing Pages projects..."
response=$(curl -s -w "\n%{http_code}" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo "✓ Can access Pages projects"
  project_count=$(echo "$body" | python3 -c 'import sys,json; print(len(json.load(sys.stdin).get("result",[])))' 2>/dev/null || echo "?")
  echo "  Found $project_count projects"
  echo "  Projects: $(echo "$body" | python3 -c 'import sys,json; r=json.load(sys.stdin).get("result",[]); print(", ".join([p["name"] for p in r]) or "none")' 2>/dev/null)"
else
  echo "✗ Cannot access Pages projects (HTTP $http_code)"
  echo "  Response: $body"
  exit 1
fi

echo ""

# Test 3: Check zone access
echo "Test 3: Checking zone access for reputationsdefender.com..."
response=$(curl -s -w "\n%{http_code}" \
  "https://api.cloudflare.com/client/v4/zones?name=reputationsdefender.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  zone_id=$(echo "$body" | python3 -c 'import sys,json; r=json.load(sys.stdin).get("result",[]); print(r[0]["id"] if r else "")' 2>/dev/null)
  if [ -n "$zone_id" ]; then
    echo "✓ Zone found"
    echo "  Zone ID: $zone_id"
  else
    echo "✗ Zone not found (reputationsdefender.com not in account)"
    exit 1
  fi
else
  echo "✗ Cannot query zones (HTTP $http_code)"
  echo "  Response: $body"
  exit 1
fi

echo ""
echo "=== All tests passed! ==="
echo ""
echo "Your Cloudflare setup is working. The GitHub Actions workflow"
echo "should be able to deploy to Cloudflare Pages successfully."
